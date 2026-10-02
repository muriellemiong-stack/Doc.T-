import React, { useState } from 'react';
import { X, Check, ShieldCheck, Zap, Sparkles, CreditCard, Smartphone, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Currency, UserQuota } from '../types';
import { formatPrice } from '../utils/currency';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  quota: UserQuota;
  onUpgradeSuccess: (plan: 'monthly' | 'yearly') => void;
  onDowngradeToFree: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  currency,
  setCurrency,
  quota,
  onUpgradeSuccess,
  onDowngradeToFree,
}) => {
  const [selectedBilling, setSelectedBilling] = useState<'monthly' | 'yearly'>('yearly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'orange_money' | 'mtn_momo' | 'wave'>('card');
  const [phoneOrCard, setPhoneOrCard] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'checkout' | 'success'>('select');

  if (!isOpen) return null;

  const handleCheckoutStart = (plan: 'monthly' | 'yearly') => {
    setSelectedBilling(plan);
    setStep('checkout');
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      setStep('success');
      onUpgradeSuccess(selectedBilling);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4f46e5', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch (err) {
        // ignore if window not available
      }
    }, 1200);
  };

  const priceMonthly = 5; // 5 €
  const priceYearly = 12; // 12 €

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Forfaits & Abonnements DocuTraducteur AI
            </h2>
            <p className="text-xs text-slate-500">
              Profitez d'une traduction certifiée par IA sans limites et à grande vitesse.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Currency selector inside modal */}
            <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCurrency('EUR')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currency === 'EUR' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                € EUR
              </button>
              <button
                type="button"
                onClick={() => setCurrency('CFA')}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  currency === 'CFA' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
                }`}
              >
                FCFA (XOF/XAF)
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 md:p-8">
          {step === 'select' && (
            <div>
              {/* Status info if already Pro */}
              {quota.isPro && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-emerald-900">
                        Votre abonnement Pro ({quota.planType === 'yearly' ? 'Annuel' : 'Mensuel'}) est actif
                      </h4>
                      <p className="text-xs text-emerald-700">
                        Vous bénéficiez des traductions illimitées et de toutes les fonctionnalités avancées.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Voulez-vous repasser au plan Gratuit (5 documents/jour) ?')) {
                        onDowngradeToFree();
                      }
                    }}
                    className="text-xs text-emerald-800 hover:text-red-700 underline font-medium cursor-pointer"
                  >
                    Résilier le forfait Pro
                  </button>
                </div>
              )}

              {/* Plans Grid: 3 columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
                {/* 1. Free Tier */}
                <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 relative">
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Gratuit Quotidien
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">Découverte</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Idéal pour les besoins ponctuels et étudiants.
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatPrice(0, currency)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ toujours</span>
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">5 documents par jour gratuits</strong> (jusqu'à <strong>250 pages</strong> par document)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Modèle IA Gemini 3.8 haute précision</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Extraction de texte (.txt, .md, .docx, .pdf)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Historique conservé 7 jours</span>
                    </li>
                  </ul>

                  <button
                    disabled={!quota.isPro}
                    onClick={onDowngradeToFree}
                    className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      !quota.isPro
                        ? 'bg-slate-100 text-slate-500 cursor-default'
                        : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {!quota.isPro ? 'Plan actuel' : 'Revenir au Gratuit'}
                  </button>
                </div>

                {/* 2. Pro Monthly: 5€ / 3 280 FCFA */}
                <div className="flex flex-col rounded-xl border border-indigo-200 bg-indigo-50/30 p-6 relative">
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Mensuel Flexible
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">Pro Mensuel</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Pour les professionnels et indépendants.
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-slate-900 font-mono tabular-nums">
                      {formatPrice(priceMonthly, currency)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ mois</span>
                    {currency === 'CFA' && (
                      <p className="text-2xs text-indigo-700 font-medium mt-0.5">
                        Soit exactement 5 € / mois
                      </p>
                    )}
                    {currency === 'EUR' && (
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Équivalent à environ 3 280 FCFA
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Documents et pages illimités</strong> (sans plafond de 250 pages)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Gros volumes (livres entiers, mémoires, manuels complets)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>OCR avancé pour documents scannés & photos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Glossaires d'entreprise & export PDF propre</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Sans engagement, résiliable à tout moment</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleCheckoutStart('monthly')}
                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-colors cursor-pointer"
                  >
                    Choisir l'offre Mensuelle
                  </button>
                </div>

                {/* 3. Pro Annual: 12€ / 7 870 FCFA - BEST VALUE */}
                <div className="flex flex-col rounded-xl border-2 border-indigo-600 bg-white p-6 relative shadow-lg">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-2xs font-bold uppercase tracking-wider py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    Offre Recommandée (-80%)
                  </div>

                  <div className="mb-4 mt-2">
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      Annuel Tout Compris
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-1">Pro Annuel</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      L'expérience ultime au tarif le plus bas du marché.
                    </p>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-extrabold text-indigo-600 font-mono tabular-nums">
                      {formatPrice(priceYearly, currency)}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">/ an</span>
                    <p className="text-2xs text-emerald-600 font-semibold mt-0.5">
                      Seulement {formatPrice(1, currency)} / mois ! Économisez 48 €
                    </p>
                    {currency === 'CFA' && (
                      <p className="text-2xs text-slate-500 mt-0.5">
                        Environ 656 FCFA / mois (soit 7 870 FCFA par an)
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs text-slate-600 mb-6 flex-1">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-slate-900">Tout le forfait Pro illimité</strong> (documents et pages illimités sans restriction de 250p)
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Priorité maximale sur les serveurs de calcul IA</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Sauvegarde illimitée de l'historique & export batch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                      <span>Support prioritaire par email & chat</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => handleCheckoutStart('yearly')}
                    className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Prendre l'offre Annuelle (12 €)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 'checkout' && (
            <div className="max-w-md mx-auto">
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                  Étape finale · Paiement sécurisé
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Souscription au Forfait {selectedBilling === 'yearly' ? 'Pro Annuel' : 'Pro Mensuel'}
                </h3>
                <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-sm font-bold text-slate-900 font-mono">
                  <span>Montant :</span>
                  <span className="text-indigo-600">
                    {formatPrice(selectedBilling === 'yearly' ? priceYearly : priceMonthly, currency)}
                  </span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({selectedBilling === 'yearly' ? '12 € / an' : '5 € / mois'})
                  </span>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-5">
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Choisissez votre mode de paiement :
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'card'
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Carte Visa / Mastercard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('orange_money')}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'orange_money'
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Orange Money (CFA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('mtn_momo')}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'mtn_momo'
                        ? 'border-yellow-500 bg-yellow-50/50 text-yellow-900 font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-yellow-600 shrink-0" />
                    <span>MTN MoMo (CFA)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wave')}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-left cursor-pointer transition-colors ${
                      paymentMethod === 'wave'
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 font-medium'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Wave Mobile Money</span>
                  </button>
                </div>
              </div>

              {/* Form details */}
              <form onSubmit={handleConfirmPayment} className="space-y-4">
                {paymentMethod === 'card' ? (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Numéro de carte bancaire
                    </label>
                    <input
                      type="text"
                      placeholder="4970 •••• •••• 4242"
                      value={phoneOrCard}
                      onChange={(e) => setPhoneOrCard(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-2xs font-medium text-slate-600 mb-1">
                          Expiration (MM/AA)
                        </label>
                        <input
                          type="text"
                          placeholder="12/28"
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-2xs font-medium text-slate-600 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={4}
                          className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg font-mono"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Numéro de téléphone ({paymentMethod === 'orange_money' ? 'Orange Money' : paymentMethod === 'mtn_momo' ? 'MTN' : 'Wave'})
                    </label>
                    <input
                      type="tel"
                      placeholder="+225 07 •• •• •• ou +221 77 •• ••"
                      value={phoneOrCard}
                      onChange={(e) => setPhoneOrCard(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-mono"
                      required
                    />
                    <p className="text-2xs text-slate-500 mt-1">
                      Une invite de validation de paiement s'affichera directement sur votre téléphone.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('select')}
                    className="flex-1 py-2 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Retour aux forfaits
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Validation en cours...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Confirmer le paiement</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {step === 'success' && (
            <div className="max-w-md mx-auto text-center py-6">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Félicitations !</h3>
              <p className="text-sm text-slate-600 mt-2">
                Votre compte a été activé en <strong>DocuTraducteur Pro ({selectedBilling === 'yearly' ? 'Annuel' : 'Mensuel'})</strong>.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Vous avez désormais accès à un volume illimité de traductions et à la vitesse maximale.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                Accéder au Traducteur Pro
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
