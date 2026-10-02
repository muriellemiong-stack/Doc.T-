export interface KeyTerm {
  term: string;
  translation: string;
  category?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  originalContent: string;
  translatedContent: string;
  summary?: string;
  keyTerms?: KeyTerm[];
  qualityNotes?: string;
  domain: string;
  tone: string;
  date: string;
  wordCountSource: number;
  wordCountTarget: number;
  pageCount?: number;
  isFavorite: boolean;
  fileType?: string;
}

export interface UserQuota {
  usedToday: number;
  maxDaily: number;
  maxPagesPerDoc: number;
  dateString: string;
  isPro: boolean;
  planType: 'free' | 'monthly' | 'yearly';
  subscriptionExpires?: string;
}

export type Currency = 'EUR' | 'CFA';

export interface GlossaryEntry {
  id: string;
  term: string;
  translation: string;
  domain?: string;
}

export interface Language {
  code: string;
  name: string;
  flag: string;
  native: string;
}

export interface TranslationDomain {
  id: string;
  label: string;
  description: string;
  iconName: string;
}

export interface TranslationTone {
  id: string;
  label: string;
  description: string;
}
