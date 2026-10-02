import React, { useState } from 'react';
import { X, Plus, Trash2, BookOpen, Check } from 'lucide-react';
import { GlossaryEntry } from '../types';

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  glossary: GlossaryEntry[];
  setGlossary: React.Dispatch<React.SetStateAction<GlossaryEntry[]>>;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  glossary,
  setGlossary,
}) => {
  const [term, setTerm] = useState('');
  const [translation, setTranslation] = useState('');
  const [domain, setDomain] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!term.trim() || !translation.trim()) return;

    const newEntry: GlossaryEntry = {
      id: `glossary-${Date.now()}`,
      term: term.trim(),
      translation: translation.trim(),
      domain: domain.trim() || undefined,
    };

    setGlossary((prev) => [newEntry, ...prev]);
    setTerm('');
    setTranslation('');
    setDomain('');
  };

  const handleDelete = (id: string) => {
    setGlossary((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Glossaire Terminologique Personnalisé
              </h2>
              <p className="text-xs text-slate-500">
                Forcez l'IA à utiliser vos termes métier spécifiques dans chaque traduction.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Form */}
          <form onSubmit={handleAdd} className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="text-xs font-semibold text-slate-700 mb-3">
              Ajouter une correspondance obligatoire
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-2xs font-medium text-slate-500 mb-1">
                  Terme source
                </label>
                <input
                  type="text"
                  placeholder="ex: Chief Executive Officer"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-slate-500 mb-1">
                  Traduction imposée
                </label>
                <input
                  type="text"
                  placeholder="ex: Directeur Général"
                  value={translation}
                  onChange={(e) => setTranslation(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-2xs font-medium text-slate-500 mb-1">
                  Domaine (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="ex: Juridique / Finance"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter la règle</span>
              </button>
            </div>
          </form>

          {/* List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-slate-700">
                Termes actifs ({glossary.length})
              </h4>
            </div>

            {glossary.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                Aucun terme personnalisé défini. Ajoutez vos acronymes ou termes d'entreprise ci-dessus.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                {glossary.map((item) => (
                  <div key={item.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-slate-900">{item.term}</span>
                      <span className="text-slate-400">→</span>
                      <span className="font-semibold text-indigo-700">{item.translation}</span>
                      {item.domain && (
                        <span className="text-2xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {item.domain}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
