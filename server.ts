import 'dotenv/config';
import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to execute Gemini calls with automatic model fallback and retries on transient errors
const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

async function generateWithFallback(buildRequest: (modelName: string) => Promise<any>): Promise<any> {
  let lastError: any = null;
  for (const model of CANDIDATE_MODELS) {
    try {
      return await buildRequest(model);
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      const isTransient =
        errMsg.includes('503') ||
        errMsg.includes('429') ||
        errMsg.includes('UNAVAILABLE') ||
        errMsg.includes('high demand');
      if (isTransient) {
        console.warn(`Modèle ${model} temporairement indisponible, essai du modèle de secours...`);
        // short wait before next model
        await new Promise((r) => setTimeout(r, 800));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Translation API Route
app.post('/api/translate', async (req: Request, res: Response) => {
  try {
    const {
      content,
      sourceLang = 'auto',
      targetLang = 'fr',
      domain = 'general',
      tone = 'formal',
      glossary = [],
      formattingPreservation = true,
      fileType = 'text',
      imageParts = [],
    } = req.body;

    if (!content && (!imageParts || imageParts.length === 0)) {
      return res.status(400).json({ error: 'Aucun contenu ou document fourni pour la traduction.' });
    }

    const glossaryInstruction =
      glossary && glossary.length > 0
        ? `\n\nGLOSSAIRE OBLIGATOIRE (respecter impérativement ces correspondances de termes) :\n` +
          glossary.map((g: { term: string; translation: string }) => `- "${g.term}" -> "${g.translation}"`).join('\n')
        : '';

    const systemInstruction = `Tu es un expert mondial en traduction de documents et en ingénierie linguistique (niveau PhD Traductologie et Localisation professionnelle).
Tu garantis une précision chirurgicale, un respect absolu du sens, des subtilités culturelles, de la terminologie métier et du style contextuel.

Directives absolues :
1. Domaine d'expertise : ${domain} (adapte le vocabulaire technique, juridique, médical, commercial ou académique selon les standards des praticiens de la langue cible).
2. Tonalité : ${tone} (adopte le niveau de formalité et le registre approprié).
3. Langue source : ${sourceLang === 'auto' ? 'Détection automatique ultra-précise' : sourceLang}.
4. Langue cible : ${targetLang}.
5. Conservation du formatage : ${formattingPreservation ? 'OUI. Préserve impérativement la structure : titres Markdown (#, ##), listes à puces, tableaux, sauts de ligne, balises de code, citations et balises de substitution type {{variable}}.' : 'NON'}.
${glossaryInstruction}

Tu dois renvoyer une réponse structurée au format JSON strict respectant le schéma demandé. Ne renvoie aucun markdown en dehors du JSON.`;

    // Prepare contents
    const contents: any[] = [];
    if (imageParts && imageParts.length > 0) {
      for (const img of imageParts) {
        contents.push({
          inlineData: {
            mimeType: img.mimeType || 'image/png',
            data: img.data,
          },
        });
      }
    }

    const promptText = `Traduis avec la plus haute fidélité le document suivant :
Type de document d'origine : ${fileType}
Texte à traduire :
"""
${content || '(Veuillez extraire et traduire le document visible dans l\'image ci-jointe)'}
"""`;

    contents.push({ text: promptText });

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: { parts: contents },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              translatedText: {
                type: Type.STRING,
                description: 'Le document intégralement traduit dans la langue cible, avec formatage préservé.',
              },
              detectedSourceLang: {
                type: Type.STRING,
                description: 'La langue source détectée avec précision (ex: Français, Anglais, Espagnol, Allemand, Chinois, Arabe, etc.).',
              },
              summary: {
                type: Type.STRING,
                description: 'Une synthèse exécutive de 2-3 phrases résumant le contenu du document dans la langue cible.',
              },
              keyTerms: {
                type: Type.ARRAY,
                description: 'Liste de 3 à 6 termes clés ou acronymes techniques avec leur traduction contextuelle.',
                items: {
                  type: Type.OBJECT,
                  properties: {
                    term: { type: Type.STRING },
                    translation: { type: Type.STRING },
                    category: { type: Type.STRING, description: 'ex: Juridique, Technique, Économique' },
                  },
                  required: ['term', 'translation'],
                },
              },
              qualityNotes: {
                type: Type.STRING,
                description: 'Notes du traducteur expert sur les choix stylistiques ou nuances culturelles préservées.',
              },
              estimatedWords: {
                type: Type.OBJECT,
                properties: {
                  source: { type: Type.INTEGER },
                  target: { type: Type.INTEGER },
                },
                required: ['source', 'target'],
              },
            },
            required: ['translatedText', 'detectedSourceLang', 'summary'],
          },
        },
      })
    );

    const rawText = response.text || '{}';
    const parsedData = JSON.parse(rawText);

    return res.json({
      success: true,
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Erreur lors de la traduction Gemini:', error);
    let userFriendlyError = 'Une erreur est survenue lors de la traduction du document.';
    const rawMsg = error?.message || '';

    if (rawMsg.includes('503') || rawMsg.includes('UNAVAILABLE') || rawMsg.includes('high demand')) {
      userFriendlyError = 'Le serveur de traduction IA est temporairement très sollicité. Veuillez patienter quelques secondes et relancer la traduction.';
    } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'Limite de requêtes atteinte. Veuillez patienter un instant.';
    }

    return res.status(500).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// Refinement API Route (Formalize, Simplify, Summarize, Proofread)
app.post('/api/refine', async (req: Request, res: Response) => {
  try {
    const { text, action, targetLang = 'fr' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Texte requis pour l\'affinage.' });
    }

    let instruction = '';
    switch (action) {
      case 'formal':
        instruction = 'Rends ce texte plus formel, diplomatique et institutionnel, tout en conservant scrupuleusement le sens et les données.';
        break;
      case 'simplify':
        instruction = 'Rends ce texte plus clair, accessible et fluide pour un lecteur non-spécialiste (vulgarisation élégante).';
        break;
      case 'executive_summary':
        instruction = 'Génère un résumé pour dirigeants (Executive Summary) structuré avec puces et points clés d\'action.';
        break;
      case 'bullet_points':
        instruction = 'Reformule ce document sous forme de points clés ordonnés et percutants.';
        break;
      case 'proofread':
      default:
        instruction = 'Corrige minutieusement la grammaire, la syntaxe, la ponctuation et le style avec un niveau de perfection absolue.';
        break;
    }

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: `Action demandée : ${instruction}
Langue cible : ${targetLang}

Texte source :
"""
${text}
"""

Renvoie uniquement le texte révisé, parfaitement formaté, sans commentaire introductif.`,
      })
    );

    return res.json({
      success: true,
      refinedText: response.text?.trim() || text,
    });
  } catch (error: any) {
    console.error('Erreur lors du raffinement:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'affinage du document.',
    });
  }
});

// OCR Document Text Extractor
app.post('/api/extract-text', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Image requise pour extraction.' });
    }

    const response = await generateWithFallback((model) =>
      ai.models.generateContent({
        model,
        contents: {
          parts: [
            {
              inlineData: {
                mimeType,
                data: imageBase64,
              },
            },
            {
              text: 'Extrais fidèlement l\'intégralité du texte contenu dans cette image de document. Conserve la mise en page, les paragraphes, les listes et les tableaux sous forme Markdown propre. Ne rajoute aucun commentaire introductif ou conclusif.',
            },
          ],
        },
      })
    );

    return res.json({
      success: true,
      extractedText: response.text?.trim() || '',
    });
  } catch (error: any) {
    console.error('Erreur OCR:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'extraction du document.',
    });
  }
});

// Server status
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur DocuTraducteur démarré sur http://localhost:${PORT}`);
  });
}

startServer();
