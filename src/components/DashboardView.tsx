import React from 'react';
import {
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Download,
  ArrowRight,
  Languages,
  Calendar,
  Layers,
  Settings,
  Zap,
} from 'lucide-react';
import { Currency, DocumentItem, UserQuota } from '../types';
import { formatPrice } from '../utils/currency';
import avatarImg from '../assets/images/dashboard_user_avatar_1790929226384.jpg';
import { exportDocumentToPdf } from '../utils/pdfExport';

interface DashboardViewProps {
  quota: UserQuota;
  documents: DocumentItem[];
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenPricing: () => void;
  onOpenTranslator: () => void;
  onSelectDocument: (doc: DocumentItem) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  quota,
  documents,
  currency,
  setCurrency,
  onOpenPricing,
  onOpenTranslator,
  onSelectDocument,
}) => {
  const remainingToday = Math.max(0, quota.maxDaily - quota.usedToday);
  const percentUsed = Math.min(100, Math.round((quota.usedToday / quota.maxDaily) * 100));

  // Compute stats
  const totalWords = documents.reduce((acc, d) => acc + (d.wordCountTarget || 0), 0);
  const totalDocs = documents.length;

  // Language pairs count
  const langPairs = documents.reduce((acc: Record<string, number>, d) => {
    const pair = `${d.sourceLang.toUpperCase()} → ${d.targetLang.toUpperCase()}`;
    acc[pair] = (acc[pair] || 0) + 1;
    return acc;
  }, {});

  const recentDocs = documents.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Welcome Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={avatarImg}
            alt="Profil utilisateur"
            className="w-16 h-16 rounded-full object-cover ring-2 ring-indigo-500/20 shadow-xs"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                Espace Personnel & Tableau de Bord
              </h1>
              {quota.isPro ? (
                <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Pro ({quota.planType === 'yearly' ? 'Annuel' : 'Mensuel'})
                </span>
              ) : (
                <span className="text-2xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full">
                  Formule Gratuite
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gérez vos quotas journaliers, vos historiques de traduction et vos exports certifiés.
            </p>
          </div>
        </div>

        {/* Quick Action */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={onOpenTranslator}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Traduire un nouveau document</span>
          </button>

          {!quota.isPro ? (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              <span>Passer à l'illimité</span>
            </button>
          ) : (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Gérer le forfait</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Quota Tracker & Subscription Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Quota Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quota Journalier
            </span>
            <span className="text-2xs text-slate-400 font-medium">Réinitialisation à minuit</span>
          </div>

          {quota.isPro ? (
            <div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-2xl font-extrabold text-emerald-600">Illimité</span>
                <span className="text-xs text-slate-500">/ jour</span>
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Vous avez traduit <strong className="text-slate-900 font-mono">{quota.usedToday}</strong> document(s) aujourd'hui sans aucune restriction.
              </p>
              <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                    {remainingToday}
                  </span>
                  <span className="text-xs text-slate-500 ml-1">/ {quota.maxDaily} restants</span>
                </div>
                <span className="text-xs font-semibold text-indigo-600">
                  {quota.usedToday} utilisé(s)
                </span>
              </div>

              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-indigo-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${percentUsed}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-2xs text-slate-500">
                <span>5 docs/jour (max 250 pages/doc)</span>
                <button
                  onClick={onOpenPricing}
                  className="text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer underline"
                >
                  Débloquer l'illimité
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total Documents & Words */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Activité Globale
            </span>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <span className="text-2xs text-slate-500 block">Total documents</span>
                <span className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {totalDocs}
                </span>
              </div>
              <div>
                <span className="text-2xs text-slate-500 block">Total mots traduits</span>
                <span className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums">
                  {totalWords.toLocaleString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-500">
            <span>Vitesse moyenne IA : ~1.6 sec/page</span>
            <span className="text-emerald-600 font-semibold">99.8% précision</span>
          </div>
        </div>

        {/* Pricing & Currency Overview Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tarification DocuTraducteur
              </span>
              <div className="flex items-center bg-slate-100 p-0.5 rounded text-2xs font-semibold">
                <button
                  type="button"
                  onClick={() => setCurrency('EUR')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    currency === 'EUR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  €
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('CFA')}
                  className={`px-1.5 py-0.5 rounded cursor-pointer ${
                    currency === 'CFA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
                  }`}
                >
                  CFA
                </button>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Gratuit Quotidien :</span>
                <strong className="text-slate-900 font-mono">5 docs/j (max 250p)</strong>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span>Forfait Mensuel :</span>
                <strong className="text-indigo-600 font-mono">
                  {formatPrice(5, currency)} / mois
                </strong>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Forfait Annuel :</span>
                <strong className="text-emerald-700 font-mono">
                  {formatPrice(12, currency)} / an
                </strong>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenPricing}
            className="w-full mt-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg border border-indigo-100 transition-colors cursor-pointer text-center"
          >
            Voir les options de paiement (Carte & Mobile Money)
          </button>
        </div>
      </div>

      {/* 3. Recent Documents & Language Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Documents Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Derniers documents traduits
            </h3>
            <span className="text-2xs text-slate-400">
              {documents.length} document(s) au total
            </span>
          </div>

          {recentDocs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-200 mb-2" />
              <p>Aucun document traduit pour le moment.</p>
              <button
                onClick={onOpenTranslator}
                className="mt-3 text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                Démarrer une première traduction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-slate-900 truncate">{doc.title}</h4>
                    <div className="flex items-center gap-3 text-2xs text-slate-500 mt-1">
                      <span className="font-medium text-indigo-700">
                        {doc.sourceLang.toUpperCase()} → {doc.targetLang.toUpperCase()}
                      </span>
                      <span>·</span>
                      <span>{doc.wordCountTarget} mots</span>
                      <span>·</span>
                      <span>{doc.date}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => exportDocumentToPdf(doc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title="Télécharger en PDF"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onSelectDocument(doc)}
                      className="px-2.5 py-1 text-2xs font-semibold bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Ouvrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Language Pairs & Domain Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
              Combinaisons de langues
            </h3>

            {Object.keys(langPairs).length === 0 ? (
              <p className="text-xs text-slate-400">Aucune statistique disponible.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(langPairs).map(([pair, count]) => {
                  const percent = Math.round((count / totalDocs) * 100);
                  return (
                    <div key={pair} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-700">{pair}</span>
                        <span className="text-slate-500 font-mono">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Fonctionnalités Expertes
            </h3>
            <ul className="text-xs text-slate-600 space-y-1.5">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Conservation absolue de la syntaxe Markdown</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Reconnaissance optique de documents (OCR)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Exportation PDF officielle prête à imprimer</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Synthèse vocale multilingue intégrée</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
