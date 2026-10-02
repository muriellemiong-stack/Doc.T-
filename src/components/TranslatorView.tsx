import React, { useState, useRef } from 'react';
import {
  ArrowLeftRight,
  UploadCloud,
  FileText,
  Copy,
  Check,
  Download,
  Volume2,
  VolumeX,
  Sparkles,
  Settings,
  BookOpen,
  Split,
  Eye,
  RefreshCw,
  AlertCircle,
  FileDown,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { DocumentItem, GlossaryEntry, Language, UserQuota } from '../types';
import { SUPPORTED_LANGUAGES, TRANSLATION_DOMAINS, TRANSLATION_TONES } from '../data/languages';
import { SAMPLE_DOCUMENTS } from '../data/sampleDocuments';
import { exportDocumentToPdf } from '../utils/pdfExport';

interface TranslatorViewProps {
  quota: UserQuota;
  onConsumeQuota: () => boolean;
  onOpenPricing: () => void;
  onSaveDocument: (doc: DocumentItem) => void;
  glossary: GlossaryEntry[];
  onOpenGlossary: () => void;
  initialDocument?: DocumentItem | null;
  onClearInitialDocument?: () => void;
}

export const TranslatorView: React.FC<TranslatorViewProps> = ({
  quota,
  onConsumeQuota,
  onOpenPricing,
  onSaveDocument,
  glossary,
  onOpenGlossary,
  initialDocument,
  onClearInitialDocument,
}) => {
  // Translation parameters
  const [sourceLang, setSourceLang] = useState<string>('auto');
  const [targetLang, setTargetLang] = useState<string>('fr');
  const [domain, setDomain] = useState<string>('general');
  const [tone, setTone] = useState<string>('formal');
  const [preserveFormat, setPreserveFormat] = useState<boolean>(true);

  // Content state
  const [sourceText, setSourceText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('Nouveau document');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [detectedLang, setDetectedLang] = useState<string>('');
  const [summary, setSummary] = useState<string>('');
  const [keyTerms, setKeyTerms] = useState<{ term: string; translation: string; category?: string }[]>([]);
  const [qualityNotes, setQualityNotes] = useState<string>('');

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'split' | 'target' | 'source'>('target');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);
  const [refinementAction, setRefinementAction] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load initialDocument when provided (from dashboard or history)
  React.useEffect(() => {
    if (initialDocument) {
      setDocumentTitle(initialDocument.title);
      setSourceLang(initialDocument.sourceLang);
      setTargetLang(initialDocument.targetLang);
      setDomain(initialDocument.domain || 'general');
      setTone(initialDocument.tone || 'formal');
      setSourceText(initialDocument.originalContent || '');
      setTranslatedText(initialDocument.translatedContent || '');
      setSummary(initialDocument.summary || '');
      setKeyTerms(initialDocument.keyTerms || []);
      setQualityNotes(initialDocument.qualityNotes || '');
      setErrorMessage(null);
      if (onClearInitialDocument) {
        onClearInitialDocument();
      }
    }
  }, [initialDocument, onClearInitialDocument]);

  // Swap Languages
  const handleSwapLanguages = () => {
    if (sourceLang === 'auto') return;
    const prevSource = sourceLang;
    const prevTarget = targetLang;
    setSourceLang(prevTarget);
    setTargetLang(prevSource);

    // Also swap contents if available
    if (translatedText) {
      const prevSourceText = sourceText;
      setSourceText(translatedText);
      setTranslatedText(prevSourceText);
    }
  };

  // Load a sample document
  const handleSelectSample = (sampleId: string) => {
    const found = SAMPLE_DOCUMENTS.find((s) => s.id === sampleId);
    if (!found) return;
    setDocumentTitle(found.title);
    setSourceLang(found.sourceLang);
    setTargetLang(found.targetLang);
    setDomain(found.domain);
    setTone(found.tone);
    setSourceText(found.content);
    setTranslatedText('');
    setSummary('');
    setKeyTerms([]);
    setQualityNotes('');
    setErrorMessage(null);
  };

  // Handle file upload (txt, md, json, csv, html, images)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocumentTitle(file.name.replace(/\.[^/.]+$/, ''));
    setErrorMessage(null);

    // If image file -> send for OCR
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = (reader.result as string).split(',')[1];
        setIsLoading(true);
        setLoadingStep('Extraction du texte de l\'image (OCR haute précision)...');
        try {
          const res = await fetch('/api/extract-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type,
            }),
          });
          const data = await res.json();
          if (data.success && data.extractedText) {
            setSourceText(data.extractedText);
          } else {
            setErrorMessage('Impossible d\'extraire le texte de cette image.');
          }
        } catch (err: any) {
          setErrorMessage('Erreur lors de la lecture du fichier image.');
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
      return;
    }

    // Text file reading
    const textReader = new FileReader();
    textReader.onload = () => {
      setSourceText(textReader.result as string);
    };
    textReader.readAsText(file);
  };

  // Page and Word counts calculation (standard 1 page = ~250 words)
  const wordCountSource = sourceText.trim() ? sourceText.trim().split(/\s+/).length : 0;
  const wordCountTarget = translatedText.trim() ? translatedText.trim().split(/\s+/).length : 0;
  const estimatedPages = sourceText.trim() ? Math.max(1, Math.ceil(wordCountSource / 250)) : 0;
  const maxPages = quota.isPro ? 999999 : (quota.maxPagesPerDoc || 250);
  const isPageLimitExceeded = !quota.isPro && estimatedPages > maxPages;

  // Execute Main Translation
  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      setErrorMessage('Veuillez saisir du texte ou importer un document à traduire.');
      return;
    }

    // Check page limit for free tier (max 250 pages per document)
    if (isPageLimitExceeded) {
      setErrorMessage(
        `Ce document contient environ ${estimatedPages} pages. La version gratuite est limitée à ${maxPages} pages maximum par document. Veuillez souscrire à la formule Pro pour traduire sans limite de pages ou scinder votre document.`
      );
      return;
    }

    // Check quota
    const canProceed = onConsumeQuota();
    if (!canProceed) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setLoadingStep('Analyse linguistique & détection de structure...');

    try {
      setTimeout(() => setLoadingStep('Traduction sémantique par Gemini 3.8 Flash...'), 600);
      setTimeout(() => setLoadingStep('Préservation des tableaux & du formatage...'), 1400);

      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: sourceText,
          sourceLang,
          targetLang,
          domain,
          tone,
          glossary,
          formattingPreservation: preserveFormat,
          fileType: 'document',
        }),
      });

      const result = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Erreur lors de la traduction.');
      }

      const resData = result.data;
      setTranslatedText(resData.translatedText || '');
      setDetectedLang(resData.detectedSourceLang || '');
      setSummary(resData.summary || '');
      setKeyTerms(resData.keyTerms || []);
      setQualityNotes(resData.qualityNotes || '');

      // Create history document
      const newDoc: DocumentItem = {
        id: `doc-${Date.now()}`,
        title: documentTitle || 'Document sans titre',
        sourceLang: resData.detectedSourceLang || sourceLang,
        targetLang,
        originalContent: sourceText,
        translatedContent: resData.translatedText || '',
        summary: resData.summary,
        keyTerms: resData.keyTerms,
        qualityNotes: resData.qualityNotes,
        domain,
        tone,
        date: new Date().toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        wordCountSource: sourceText.trim().split(/\s+/).length,
        wordCountTarget: (resData.translatedText || '').trim().split(/\s+/).length,
        pageCount: estimatedPages,
        isFavorite: false,
      };

      onSaveDocument(newDoc);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Une erreur est survenue pendant la traduction.');
    } finally {
      setIsLoading(false);
    }
  };

  // Refine translated document (formal, simplify, summary, etc.)
  const handleRefine = async (action: string) => {
    if (!translatedText.trim()) return;

    setIsRefining(true);
    setRefinementAction(action);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: translatedText,
          action,
          targetLang,
        }),
      });

      const data = await res.json();
      if (data.success && data.refinedText) {
        setTranslatedText(data.refinedText);
      } else {
        throw new Error(data.error || 'Erreur de raffinement.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Impossible d\'affiner le texte.');
    } finally {
      setIsRefining(false);
      setRefinementAction(null);
    }
  };

  // Copy to clipboard
  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download raw TXT
  const handleDownloadTxt = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle}_${targetLang}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download Markdown
  const handleDownloadMd = () => {
    if (!translatedText) return;
    const blob = new Blob([translatedText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${documentTitle}_${targetLang}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download PDF
  const handleDownloadPdf = () => {
    if (!translatedText) return;
    exportDocumentToPdf({
      title: documentTitle,
      sourceLang,
      targetLang,
      translatedContent: translatedText,
      domain,
    });
  };

  // Web Speech TTS playback
  const handleToggleSpeak = () => {
    if (!('speechSynthesis' in window)) {
      alert('La lecture vocale n\'est pas supportée sur ce navigateur.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (!translatedText) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    utterance.rate = 1.0;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Controls Bar: Document Title, Sample Loader, Glossary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2 flex-1">
          <FileText className="w-5 h-5 text-indigo-600 shrink-0" />
          <input
            type="text"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            className="w-full text-sm font-bold text-slate-900 border-b border-transparent hover:border-slate-300 focus:border-indigo-600 focus:outline-hidden transition-colors"
            placeholder="Nom du document..."
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Sample docs selector */}
          <select
            onChange={(e) => handleSelectSample(e.target.value)}
            defaultValue=""
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <option value="" disabled>
              📄 Charger un exemple...
            </option>
            {SAMPLE_DOCUMENTS.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.title}
              </option>
            ))}
          </select>

          {/* Custom Glossary button */}
          <button
            onClick={onOpenGlossary}
            className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
            title="Gérer les termes métier imposés"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
            <span>Glossaire ({glossary.length})</span>
          </button>
        </div>
      </div>

      {/* Main Parameters Bar: Languages, Domain, Tone */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Source Language */}
          <div className="md:col-span-4">
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Langue Source
            </label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-900 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="auto">✨ Détection Automatique de la Langue</option>
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>

          {/* Swap Button */}
          <div className="md:col-span-1 flex justify-center pt-3 md:pt-4">
            <button
              type="button"
              onClick={handleSwapLanguages}
              disabled={sourceLang === 'auto'}
              className={`p-2 rounded-lg border border-slate-200 transition-colors cursor-pointer ${
                sourceLang === 'auto'
                  ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
              title="Inverser les langues"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Target Language */}
          <div className="md:col-span-4">
            <label className="block text-2xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Langue Cible (Traduction)
            </label>
            <select
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
              className="w-full text-xs font-semibold bg-slate-50 border border-indigo-200 rounded-lg px-3 py-2 text-indigo-950 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>

          {/* Domain & Tone Settings */}
          <div className="md:col-span-3 flex items-center gap-2 pt-3 md:pt-4">
            <select
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="w-1/2 text-2xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 cursor-pointer"
              title="Domaine d'expertise"
            >
              {TRANSLATION_DOMAINS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>

            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-1/2 text-2xs font-medium bg-slate-50 border border-slate-200 rounded-lg px-2 py-2 text-slate-700 cursor-pointer"
              title="Tonalité & Registre"
            >
              {TRANSLATION_TONES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Secondary options: preserve format, etc */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-2xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={preserveFormat}
              onChange={(e) => setPreserveFormat(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700">
              Préserver fidèlement la mise en page (tableaux Markdown, puces, balises de code, titres)
            </span>
          </label>

          <div className="flex items-center gap-4">
            {detectedLang && (
              <span className="text-indigo-700 font-semibold">
                Langue détectée : {detectedLang}
              </span>
            )}
            <span>
              Mode expert : <strong className="text-slate-800">Gemini 3.8 Flash</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Editor & Translation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* LEFT: Source Document Input */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-[480px]">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-800">Document Source</span>
              <span className="text-2xs text-slate-500">
                ({wordCountSource} mots · ~{estimatedPages} {estimatedPages > 1 ? 'pages' : 'page'})
              </span>
              {quota.isPro ? (
                <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                  Pages illimitées
                </span>
              ) : (
                <span
                  className={`text-2xs font-semibold px-2 py-0.5 rounded ${
                    isPageLimitExceeded
                      ? 'bg-red-100 text-red-800 font-bold border border-red-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Max 250 pages / doc (Gratuit)
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-2xs font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                title="Importer un fichier (TXT, MD, PDF, Image OCR...)"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Importer fichier</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.markdown,.json,.csv,.html,image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              {sourceText && (
                <button
                  type="button"
                  onClick={() => setSourceText('')}
                  className="text-2xs text-slate-400 hover:text-red-600 px-1.5 py-1"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* Page Limit Warning if > 250 pages on Free plan */}
          {isPageLimitExceeded && (
            <div className="mx-4 mt-3 p-3 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Limite de 250 pages par document atteinte :</span> Ce document fait environ <strong className="font-mono">{estimatedPages} pages</strong>. En formule gratuite, chaque document doit comporter au maximum 250 pages pour être traduit.
                </div>
              </div>
              <button
                onClick={onOpenPricing}
                className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-xs font-semibold cursor-pointer shrink-0 transition-colors"
              >
                Débloquer avec Pro
              </button>
            </div>
          )}

          {/* Text Area */}
          <div className="flex-1 p-4 flex flex-col">
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Collez ici le texte de votre document, rédigez directement en Markdown, ou glissez-déposez un fichier (.txt, .md, .docx, photo/scan)..."
              className="w-full flex-1 resize-none border-0 focus:outline-hidden text-sm text-slate-800 leading-relaxed font-sans placeholder:text-slate-400 min-h-[360px]"
            />
          </div>

          {/* Bottom Bar: Action Translate Button */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <div className="text-2xs text-slate-500">
              {quota.isPro ? (
                <span className="text-emerald-700 font-semibold">Volume et pages illimités actifs</span>
              ) : (
                <span>
                  Gratuit : <strong className="text-slate-900 font-mono">{quota.usedToday}/{quota.maxDaily} docs</strong> (max 250 pages/doc)
                </span>
              )}
            </div>

            <button
              onClick={handleTranslate}
              disabled={isLoading || !sourceText.trim() || isPageLimitExceeded}
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs cursor-pointer ${
                isLoading || !sourceText.trim() || isPageLimitExceeded
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98'
              }`}
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Traduction en cours...</span>
                </>
              ) : isPageLimitExceeded ? (
                <span>Dépasse 250 pages</span>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Traduire le document</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RIGHT: Translated Document Output */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col min-h-[480px] relative">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Document Traduit</span>
              <span className="text-2xs text-slate-500">({wordCountTarget} mots)</span>
              {detectedLang && (
                <span className="text-2xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded font-medium">
                  {targetLang.toUpperCase()}
                </span>
              )}
            </div>

            {/* Actions: Copy, Listen, Export */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleToggleSpeak}
                disabled={!translatedText}
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
                title={isSpeaking ? 'Arrêter la lecture' : 'Écouter la traduction (Synthèse vocale)'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-4 h-4 text-indigo-600 animate-pulse" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>

              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-1.5 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-40 cursor-pointer"
                title="Copier le document traduit"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>

              {/* Export dropdown */}
              <div className="relative group">
                <button
                  type="button"
                  disabled={!translatedText}
                  className="flex items-center gap-1 text-2xs font-semibold px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white rounded-lg shadow-lg border border-slate-200 py-1 w-40 z-20 text-xs">
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileDown className="w-3.5 h-3.5 text-red-500" />
                    <span>Format PDF (.pdf)</span>
                  </button>
                  <button
                    onClick={handleDownloadTxt}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>Format Texte (.txt)</span>
                  </button>
                  <button
                    onClick={handleDownloadMd}
                    className="w-full text-left px-3 py-1.5 hover:bg-slate-50 text-slate-800 flex items-center gap-2 cursor-pointer"
                  >
                    <Layers className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Markdown (.md)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Refine Tools Bar */}
          {translatedText && (
            <div className="px-4 py-2 bg-indigo-50/40 border-b border-indigo-100/60 flex flex-wrap items-center gap-2 text-2xs">
              <span className="font-semibold text-indigo-900 shrink-0">Affinage IA :</span>
              <button
                type="button"
                onClick={() => handleRefine('formal')}
                disabled={isRefining}
                className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRefining && refinementAction === 'formal' ? '...' : '🏛️ Rendre plus formel'}
              </button>
              <button
                type="button"
                onClick={() => handleRefine('simplify')}
                disabled={isRefining}
                className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRefining && refinementAction === 'simplify' ? '...' : '💡 Simplifier'}
              </button>
              <button
                type="button"
                onClick={() => handleRefine('executive_summary')}
                disabled={isRefining}
                className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRefining && refinementAction === 'executive_summary' ? '...' : '📊 Résumé exécutif'}
              </button>
              <button
                type="button"
                onClick={() => handleRefine('proofread')}
                disabled={isRefining}
                className="px-2 py-0.5 rounded-md bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {isRefining && refinementAction === 'proofread' ? '...' : '✨ Correction minutieuse'}
              </button>
            </div>
          )}

          {/* Main output display */}
          <div className="flex-1 p-4 relative overflow-y-auto max-h-[500px]">
            {isLoading ? (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-10 h-10 border-3 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin mb-4" />
                <h4 className="text-sm font-bold text-slate-900 mb-1">
                  Traitement IA en cours
                </h4>
                <p className="text-xs text-indigo-700 font-medium animate-pulse">
                  {loadingStep}
                </p>
                <p className="text-2xs text-slate-400 mt-3">
                  Garantie de précision sémantique et préservation structurelle
                </p>
              </div>
            ) : translatedText ? (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none text-slate-800 leading-relaxed font-sans whitespace-pre-wrap select-text">
                  {translatedText}
                </div>

                {/* Executive Summary Card */}
                {summary && (
                  <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block mb-1">
                      📌 Synthèse exécutive du document :
                    </span>
                    <p className="text-slate-600 leading-relaxed">{summary}</p>
                  </div>
                )}

                {/* Key Terms Table */}
                {keyTerms && keyTerms.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-900 block mb-2">
                      📚 Lexique & Termes techniques identifiés :
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {keyTerms.map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white p-2 rounded-lg border border-slate-200 flex items-center justify-between"
                        >
                          <span className="font-medium text-slate-700">{item.term}</span>
                          <span className="text-slate-400 mx-1">→</span>
                          <span className="font-semibold text-indigo-700">{item.translation}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 min-h-[300px]">
                <FileText className="w-12 h-12 text-slate-200 mb-3" />
                <p className="text-xs font-medium text-slate-500">
                  Le document traduit s'affichera ici avec mise en page conservée.
                </p>
                <p className="text-2xs text-slate-400 mt-1 max-w-xs">
                  Modèle Gemini 3.8 Flash avec conservation des balises, puces et tableaux.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
