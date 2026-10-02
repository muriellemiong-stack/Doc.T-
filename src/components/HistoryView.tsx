import React, { useState } from 'react';
import {
  Search,
  FileText,
  Star,
  Trash2,
  Download,
  ArrowRight,
  Filter,
  Copy,
  Check,
  Eye,
  X,
  FileDown,
} from 'lucide-react';
import { DocumentItem } from '../types';
import { exportDocumentToPdf } from '../utils/pdfExport';

interface HistoryViewProps {
  documents: DocumentItem[];
  onSelectDocument: (doc: DocumentItem) => void;
  onDeleteDocument: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenTranslator: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onToggleFavorite,
  onOpenTranslator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.translatedContent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalContent.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = domainFilter === 'all' || doc.domain === domainFilter;
    return matchesSearch && matchesDomain;
  });

  const handleCopyPreview = () => {
    if (!previewDoc) return;
    navigator.clipboard.writeText(previewDoc.translatedContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Historique des Traductions
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Consultez, réutilisez et téléchargez vos documents traduits précédents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500 w-56 sm:w-64"
            />
          </div>

          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 cursor-pointer"
          >
            <option value="all">Tous les domaines</option>
            <option value="general">Général</option>
            <option value="legal">Juridique</option>
            <option value="tech">Technique</option>
            <option value="business">Affaires</option>
            <option value="medical">Médical</option>
            <option value="academic">Académique</option>
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {filteredDocs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">
              Aucun document ne correspond à votre recherche.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Vos traductions sauvegardées apparaîtront automatiquement ici.
            </p>
            <button
              onClick={onOpenTranslator}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Nouvelle traduction
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-4 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleFavorite(doc.id)}
                    className="mt-0.5 text-slate-300 hover:text-amber-500 transition-colors cursor-pointer"
                    title={doc.isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <Star
                      className={`w-4 h-4 ${doc.isFavorite ? 'text-amber-500 fill-amber-500' : ''}`}
                    />
                  </button>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {doc.title}
                      </h3>
                      <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {doc.sourceLang.toUpperCase()} → {doc.targetLang.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-sans">
                      {doc.translatedContent}
                    </p>

                    <div className="flex items-center gap-3 text-2xs text-slate-400 mt-2">
                      <span>{doc.date}</span>
                      <span>·</span>
                      <span>{doc.wordCountTarget} mots</span>
                      <span>·</span>
                      <span className="capitalize">{doc.domain}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-1.5 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Aperçu rapide"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportDocumentToPdf(doc)}
                    className="p-1.5 text-slate-500 hover:text-slate-900 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                    title="Exporter en PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onSelectDocument(doc)}
                    className="px-2.5 py-1 text-2xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>Ouvrir</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[85vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewDoc.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {previewDoc.sourceLang.toUpperCase()} → {previewDoc.targetLang.toUpperCase()} · {previewDoc.date}
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs text-slate-800 leading-relaxed font-sans whitespace-pre-wrap">
              {previewDoc.translatedContent}
            </div>

            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyPreview}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copié' : 'Copier'}</span>
                </button>
                <button
                  onClick={() => exportDocumentToPdf(previewDoc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <FileDown className="w-3.5 h-3.5 text-red-500" />
                  <span>PDF</span>
                </button>
              </div>

              <button
                onClick={() => {
                  onSelectDocument(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-4 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                Éditer dans le traducteur
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
