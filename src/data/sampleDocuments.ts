export interface SampleDocument {
  id: string;
  title: string;
  sourceLang: string;
  targetLang: string;
  domain: string;
  tone: string;
  content: string;
}

export const SAMPLE_DOCUMENTS: SampleDocument[] = [
  {
    id: 'sample-legal',
    title: 'Accord de Confidentialité & Non-Divulgation (NDA)',
    sourceLang: 'fr',
    targetLang: 'en',
    domain: 'legal',
    tone: 'formal',
    content: `# ACCORD DE CONFIDENTIALITÉ MUTUELLE ET DE NON-DIVULGATION

Entre les soussignés :
1. **TechNova Solutions SAS**, société immatriculée au RCS de Paris sous le n° 849 203 112, représentée par M. Alexandre Diallo en qualité de Directeur Général ;
2. **Global Partners Ltd**, société de droit britannique sise à Londres, représentée par Mme Sarah Jenkins.

### Article 1 : Définition des Informations Confidentielles
Les termes "Informations Confidentielles" désignent l'ensemble des données commerciales, techniques, financières, logicielles et stratégiques communiquées sous quelque forme que ce soit (écrite, orale ou électronique) dans le cadre du projet conjoint de plateforme web.

### Article 2 : Engagements des Parties
Chaque partie s'engage à :
- Conserver la plus stricte confidentialité sur les données reçues ;
- Ne divulguer aucune information sans accord préalable exprès et écrit ;
- Appliquer un niveau de protection au moins équivalent à celui appliqué à ses propres secrets d'affaires.

### Article 3 : Durée et Droit Applicable
Le présent accord prend effet à sa signature pour une durée de trois (3) ans. Tout litige relèvera de la compétence exclusive du tribunal de commerce de Paris.`,
  },
  {
    id: 'sample-tech',
    title: 'Spécifications Techniques - API Microservices Cloud',
    sourceLang: 'en',
    targetLang: 'fr',
    domain: 'tech',
    tone: 'professional',
    content: `# Technical Architecture & API Specifications v2.4

## 1. Overview
The platform exposes a fault-tolerant REST and gRPC API designed to handle up to 25,000 asynchronous document translations per minute. All incoming payloads must be cryptographically verified using HMAC-SHA256 signatures.

### 2. Core Service Endpoints
| Endpoint | Method | Rate Limit | Description |
| :--- | :--- | :--- | :--- |
| \`/v1/documents/translate\` | POST | 100 req/min | Submits text or multipart PDF for neural translation |
| \`/v1/documents/{id}/status\` | GET | 300 req/min | Retrieves async translation execution pipeline status |
| \`/v1/glossary/sync\` | PUT | 50 req/min | Syncs enterprise terminology dictionary |

### 3. Failover & Resilience
- **Timeout threshold**: 4,500ms before triggering circuit-breaker fallback.
- **Data retention**: Ephemeral storage encrypted with AES-GCM-256 with auto-shredding after 24 hours.`,
  },
  {
    id: 'sample-business',
    title: 'Rapport Trimestriel de Croissance & Expansion Afrique de l\'Ouest',
    sourceLang: 'fr',
    targetLang: 'es',
    domain: 'business',
    tone: 'formal',
    content: `# RAPPORT STRATÉGIQUE T3 - EXPANSION COMMERCIALE UEMOA

### 1. Synthèse Exécutive
Le troisième trimestre a été marqué par une accélération sans précédent des adoptions d'outils numériques dans l'espace UEMOA (Sénégal, Côte d'Ivoire, Bénin, Togo). La conversion des devises locales (FCFA) associée aux modes de paiement mobiles (Mobile Money, Wave) a catalysé une croissance nette de +42% de nos souscriptions actives.

### 2. Indicateurs Clés de Performance (KPI)
- **Chiffre d'Affaires Récurrent Mensuel (MRR)** : 45 200 000 FCFA (~68 900 €)
- **Taux de Rétention Utilisateurs** : 94.6%
- **Volume de documents traduits** : 380 000 pages certifiées
- **Délai moyen de traitement IA** : 1.8 seconde par page

### 3. Perspectives pour le T4
Déploiement de l'infrastructure de traitement distribué pour réduire les temps de latence et finalisation des partenariats universitaires à Dakar et Abidjan.`,
  },
];
