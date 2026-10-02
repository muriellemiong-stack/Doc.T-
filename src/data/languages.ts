import { Language, TranslationDomain, TranslationTone } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'en', name: 'Anglais', flag: '🇬🇧', native: 'English' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸', native: 'Español' },
  { code: 'de', name: 'Allemand', flag: '🇩🇪', native: 'Deutsch' },
  { code: 'it', name: 'Italien', flag: '🇮🇹', native: 'Italiano' },
  { code: 'pt', name: 'Portugais', flag: '🇵🇹', native: 'Português' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦', native: 'العربية' },
  { code: 'zh', name: 'Chinois', flag: '🇨🇳', native: '中文' },
  { code: 'ja', name: 'Japonais', flag: '🇯🇵', native: '日本語' },
  { code: 'ru', name: 'Russe', flag: '🇷🇺', native: 'Русский' },
  { code: 'nl', name: 'Néerlandais', flag: '🇳🇱', native: 'Nederlands' },
  { code: 'tr', name: 'Turc', flag: '🇹🇷', native: 'Türkçe' },
  { code: 'ko', name: 'Coréen', flag: '🇰🇷', native: '한국어' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳', native: 'हिन्दी' },
  { code: 'sw', name: 'Swahili', flag: '🇰🇪', native: 'Kiswahili' },
  { code: 'wo', name: 'Wolof', flag: '🇸🇳', native: 'Wolof' },
  { code: 'ha', name: 'Haoussa', flag: '🇳🇬', native: 'Hausa' },
  { code: 'pl', name: 'Polonais', flag: '🇵🇱', native: 'Polski' },
];

export const TRANSLATION_DOMAINS: TranslationDomain[] = [
  {
    id: 'general',
    label: 'Général & Polyvalent',
    description: 'Traduction équilibrée pour documents quotidiens, courriers et articles.',
    iconName: 'Globe',
  },
  {
    id: 'legal',
    label: 'Juridique & Réglementaire',
    description: 'Contrats, CGV, statuts, clauses de confidentialité, conformité.',
    iconName: 'Scale',
  },
  {
    id: 'tech',
    label: 'Technique & Ingénierie Web',
    description: 'Spécifications logicielles, documentation API, notices, schémas.',
    iconName: 'Code',
  },
  {
    id: 'business',
    label: 'Affaires & Finance',
    description: 'Rapports d\'audit, business plans, bilans, propositions commerciales.',
    iconName: 'TrendingUp',
  },
  {
    id: 'medical',
    label: 'Médical & Sciences',
    description: 'Essais cliniques, posologies, fiches de données de sécurité.',
    iconName: 'Activity',
  },
  {
    id: 'academic',
    label: 'Académique & Recherche',
    description: 'Thèses, publications scientifiques, revues de littérature.',
    iconName: 'GraduationCap',
  },
];

export const TRANSLATION_TONES: TranslationTone[] = [
  {
    id: 'formal',
    label: 'Formel & Protocolaire',
    description: 'Idéal pour contrats, administrations et relations officielles.',
  },
  {
    id: 'professional',
    label: 'Professionnel & Fluide',
    description: 'Ton standard pour les communications B2B et documents de travail.',
  },
  {
    id: 'pedagogical',
    label: 'Pédagogique & Simple',
    description: 'Clarté maximale, vulgarisation sans jargon obscur.',
  },
  {
    id: 'diplomatic',
    label: 'Diplomatique & Nuancé',
    description: 'Prudence verbale, respect strict des convenances et tact.',
  },
];
