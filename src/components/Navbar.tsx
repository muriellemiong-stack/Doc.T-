import React from 'react';
import { Languages, ShieldCheck, Sparkles, User, Coins } from 'lucide-react';
import { Currency, UserQuota } from '../types';
import avatarImg from '../assets/images/dashboard_user_avatar_1790929226384.jpg';

interface NavbarProps {
  activeTab: 'translator' | 'dashboard' | 'history' | 'pricing';
  setActiveTab: (tab: 'translator' | 'dashboard' | 'history' | 'pricing') => void;
  quota: UserQuota;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  onOpenPricing: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  quota,
  currency,
  setCurrency,
  onOpenPricing,
}) => {
  const remainingToday = Math.max(0, quota.maxDaily - quota.usedToday);

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('translator')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm group-hover:bg-slate-800 transition-colors">
              <Languages className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                DocuTraducteur <span className="text-indigo-600 font-semibold text-sm">AI</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('translator')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'translator'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Traducteur
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tableau de bord
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'history'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Historique
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-slate-100 text-slate-900 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Tarifs & Forfaits
          </button>
        </nav>

        {/* Zone 3: Actions, Quota & Profile */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => setCurrency('EUR')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currency === 'EUR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Afficher en Euros (€)"
            >
              € EUR
            </button>
            <button
              onClick={() => setCurrency('CFA')}
              className={`px-2 py-1 text-xs font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                currency === 'CFA'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Afficher en Francs CFA (XOF / XAF)"
            >
              FCFA
            </button>
          </div>

          {/* Daily Quota Counter */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-xs">
            {quota.isPro ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                Pro Illimité
              </span>
            ) : (
              <span className="text-slate-600">
                Quota du jour :{' '}
                <strong className="text-slate-900 font-mono tabular-nums">
                  {remainingToday}/{quota.maxDaily}
                </strong>{' '}
                restants
              </span>
            )}
          </div>

          {/* Upgrade Button */}
          {!quota.isPro && (
            <button
              onClick={onOpenPricing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors whitespace-nowrap cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Passer Pro</span>
            </button>
          )}

          {/* User Profile Avatar */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer group"
            title="Mon profil & tableau de bord"
          >
            <img
              src={avatarImg}
              alt="Profil utilisateur"
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 group-hover:ring-indigo-500 transition-all"
              onError={(e) => {
                // Fallback if image load fails
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold -ml-10 group-has-[:not([style*='display: none'])]:hidden">
              <User className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 px-2 py-1.5 bg-slate-50/80 text-xs font-medium">
        <button
          onClick={() => setActiveTab('translator')}
          className={`px-2.5 py-1 rounded ${activeTab === 'translator' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'}`}
        >
          Traducteur
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2.5 py-1 rounded ${activeTab === 'dashboard' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'}`}
        >
          Tableau de bord
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-2.5 py-1 rounded ${activeTab === 'history' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'}`}
        >
          Historique
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-2.5 py-1 rounded ${activeTab === 'pricing' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'text-slate-600'}`}
        >
          Tarifs
        </button>
      </div>
    </header>
  );
};
