import React, { useState, useEffect } from 'react';
import { Currency, DocumentItem, GlossaryEntry, UserQuota } from './types';
import { Navbar } from './components/Navbar';
import { TranslatorView } from './components/TranslatorView';
import { DashboardView } from './components/DashboardView';
import { HistoryView } from './components/HistoryView';
import { PricingModal } from './components/PricingModal';
import { GlossaryModal } from './components/GlossaryModal';

// Initial preloaded translated documents for a rich dashboard experience
const INITIAL_DOCS: DocumentItem[] = [
  {
    id: 'doc-init-1',
    title: 'Contrat de Prestation Numérique & Développement Web',
    sourceLang: 'fr',
    targetLang: 'en',
    originalContent: 'Le présent contrat a pour objet de définir les conditions techniques et financières selon lesquelles le Prestataire s\'engage à concevoir, développer et déployer la solution web pour le compte du Client.',
    translatedContent: 'The purpose of this agreement is to define the technical and financial conditions under which the Service Provider agrees to design, develop, and deploy the web solution on behalf of the Client.',
    summary: 'Contrat de développement logiciel établissant les obligations de livraison et les modalités financières.',
    keyTerms: [
      { term: 'Prestataire', translation: 'Service Provider', category: 'Juridique' },
      { term: 'Déployer', translation: 'Deploy', category: 'Technique' },
    ],
    qualityNotes: 'Terminologie juridique anglo-saxonne conforme au standard B2B.',
    domain: 'legal',
    tone: 'formal',
    date: '28 Sept 2026',
    wordCountSource: 185,
    wordCountTarget: 178,
    isFavorite: true,
  },
  {
    id: 'doc-init-2',
    title: 'Rapport d\'Audit Financier et Rentabilité Cloud',
    sourceLang: 'fr',
    targetLang: 'es',
    originalContent: 'L\'optimisation des coûts d\'hébergement et l\'adoption de microservices ont permis de réduire l\'empreinte budgétaire de 28% sur l\'exercice clos au 30 juin.',
    translatedContent: 'La optimización de los costos de alojamiento y la adopción de microservicios permitieron reducir la huella presupuestaria en un 28% en el ejercicio cerrado al 30 de junio.',
    summary: 'Synthèse des économies d\'infrastructure générées par la transition vers le cloud distribué.',
    domain: 'business',
    tone: 'professional',
    date: '25 Sept 2026',
    wordCountSource: 210,
    wordCountTarget: 216,
    isFavorite: false,
  },
  {
    id: 'doc-init-3',
    title: 'Documentation API Microservices & Sécurité JWT',
    sourceLang: 'en',
    targetLang: 'fr',
    originalContent: 'All incoming HTTP requests must include a valid Bearer token within the Authorization header. Expired tokens yield an immediate 401 Unauthorized status.',
    translatedContent: 'Toutes les requêtes HTTP entrantes doivent inclure un jeton Bearer valide dans l\'en-tête Authorization. Les jetons expirés renvoient immédiatement un statut 401 Non Autorisé.',
    summary: 'Règles de sécurité et spécifications d\'authentification par jeton Bearer pour les endpoints d\'API.',
    domain: 'tech',
    tone: 'professional',
    date: '21 Sept 2026',
    wordCountSource: 145,
    wordCountTarget: 152,
    isFavorite: true,
  },
];

const INITIAL_GLOSSARY: GlossaryEntry[] = [
  { id: 'g-1', term: 'Cloud Run', translation: 'Cloud Run', domain: 'Technique' },
  { id: 'g-2', term: 'Non-Disclosure Agreement', translation: 'Accord de Non-Divulgation', domain: 'Juridique' },
  { id: 'g-3', term: 'Operating Cash Flow', translation: 'Flux de trésorerie opérationnel', domain: 'Finance' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'translator' | 'dashboard' | 'history' | 'pricing'>('translator');
  const [currency, setCurrency] = useState<Currency>('CFA'); // Default to CFA for easy local understanding as requested, with instant EUR switch
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);

  // Today's date string for quota reset
  const todayDateString = new Date().toISOString().split('T')[0];

  // User Quota state with localStorage persistence
  const [quota, setQuota] = useState<UserQuota>(() => {
    const saved = localStorage.getItem('docutraducteur_quota');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Reset if date has changed
        if (parsed.dateString !== todayDateString) {
          return {
            ...parsed,
            usedToday: 0,
            dateString: todayDateString,
            maxPagesPerDoc: parsed.isPro ? 999999 : 250,
          };
        }
        return {
          ...parsed,
          maxPagesPerDoc: parsed.isPro ? 999999 : 250,
        };
      } catch (e) {
        // fallback
      }
    }
    return {
      usedToday: 1, // Pre-seeded 1/5 used
      maxDaily: 5,  // 5 documents per day free
      maxPagesPerDoc: 250, // 250 pages max per document in free tier
      dateString: todayDateString,
      isPro: false,
      planType: 'free',
    };
  });

  // Stored documents
  const [documents, setDocuments] = useState<DocumentItem[]>(() => {
    const saved = localStorage.getItem('docutraducteur_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_DOCS;
  });

  // Glossary
  const [glossary, setGlossary] = useState<GlossaryEntry[]>(() => {
    const saved = localStorage.getItem('docutraducteur_glossary');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return INITIAL_GLOSSARY;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('docutraducteur_quota', JSON.stringify(quota));
  }, [quota]);

  useEffect(() => {
    localStorage.setItem('docutraducteur_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('docutraducteur_glossary', JSON.stringify(glossary));
  }, [glossary]);

  // Quota consumption handler
  const handleConsumeQuota = (): boolean => {
    if (quota.isPro) {
      setQuota((prev) => ({ ...prev, usedToday: prev.usedToday + 1 }));
      return true;
    }

    if (quota.usedToday >= quota.maxDaily) {
      setIsPricingModalOpen(true);
      return false;
    }

    setQuota((prev) => ({ ...prev, usedToday: prev.usedToday + 1 }));
    return true;
  };

  // Upgrade handler
  const handleUpgradeSuccess = (plan: 'monthly' | 'yearly') => {
    setQuota((prev) => ({
      ...prev,
      isPro: true,
      planType: plan,
      maxDaily: 999999, // unlimited
      maxPagesPerDoc: 999999, // unlimited pages per document
      subscriptionExpires: new Date(
        Date.now() + (plan === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  };

  // Downgrade handler
  const handleDowngradeToFree = () => {
    setQuota((prev) => ({
      ...prev,
      isPro: false,
      planType: 'free',
      maxDaily: 5,
      maxPagesPerDoc: 250,
    }));
  };

  // Add new document to history
  const handleSaveDocument = (doc: DocumentItem) => {
    setDocuments((prev) => [doc, ...prev]);
  };

  // Delete document
  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setDocuments((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isFavorite: !d.isFavorite } : d))
    );
  };

  const [selectedDocToLoad, setSelectedDocToLoad] = useState<DocumentItem | null>(null);

  // Select document to view/edit in translator
  const handleSelectDocument = (doc: DocumentItem) => {
    setSelectedDocToLoad(doc);
    setActiveTab('translator');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'pricing') {
            setIsPricingModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        quota={quota}
        currency={currency}
        setCurrency={setCurrency}
        onOpenPricing={() => setIsPricingModalOpen(true)}
      />

      {/* Main View Port */}
      <main className="flex-1">
        {activeTab === 'translator' && (
          <TranslatorView
            quota={quota}
            onConsumeQuota={handleConsumeQuota}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            onSaveDocument={handleSaveDocument}
            glossary={glossary}
            onOpenGlossary={() => setIsGlossaryModalOpen(true)}
            initialDocument={selectedDocToLoad}
            onClearInitialDocument={() => setSelectedDocToLoad(null)}
          />
        )}

        {activeTab === 'dashboard' && (
          <DashboardView
            quota={quota}
            documents={documents}
            currency={currency}
            setCurrency={setCurrency}
            onOpenPricing={() => setIsPricingModalOpen(true)}
            onOpenTranslator={() => setActiveTab('translator')}
            onSelectDocument={handleSelectDocument}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            documents={documents}
            onSelectDocument={handleSelectDocument}
            onDeleteDocument={handleDeleteDocument}
            onToggleFavorite={handleToggleFavorite}
            onOpenTranslator={() => setActiveTab('translator')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">DocuTraducteur AI</span>
            <span>·</span>
            <span>Moteur neuronal Gemini 3.8 certifié</span>
          </div>

          <div className="flex items-center gap-4 text-2xs">
            <span>5 documents/jour gratuits</span>
            <span>·</span>
            <span>5 € (3 280 FCFA) / mois</span>
            <span>·</span>
            <span>12 € (7 870 FCFA) / an</span>
            <span>·</span>
            <button
              onClick={() => setIsPricingModalOpen(true)}
              className="text-indigo-600 hover:underline font-semibold cursor-pointer"
            >
              Voir les forfaits
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currency={currency}
        setCurrency={setCurrency}
        quota={quota}
        onUpgradeSuccess={handleUpgradeSuccess}
        onDowngradeToFree={handleDowngradeToFree}
      />

      <GlossaryModal
        isOpen={isGlossaryModalOpen}
        onClose={() => setIsGlossaryModalOpen(false)}
        glossary={glossary}
        setGlossary={setGlossary}
      />
    </div>
  );
}
