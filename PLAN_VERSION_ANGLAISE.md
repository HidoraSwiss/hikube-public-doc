# Plan de création de la version anglaise (version-2.0)

## 📋 Vue d'ensemble

**Objectif** : Créer la traduction complète de la documentation version-2.0 en anglais dans `i18n/en/docusaurus-plugin-content-docs/version-2.0/`

**Fichiers à traduire** : 36 fichiers markdown
**Structure à créer** : Arborescence complète identique à la version française

---

## 📁 Structure de dossiers à créer

```
i18n/en/docusaurus-plugin-content-docs/version-2.0/
├── get-started.md
├── getting-started/
│   ├── introduction.md
│   ├── concepts.md
│   └── quick-start.md
├── resources/
│   ├── faq.md
│   ├── glossary.md
│   └── troubleshooting.md
├── services/
│   ├── compute/
│   │   ├── api-reference.md
│   │   ├── overview.md
│   │   └── quick-start.md
│   ├── databases/
│   │   ├── clickhouse/
│   │   │   ├── api-reference.md
│   │   │   ├── overview.md
│   │   │   └── quick-start.md
│   │   ├── mysql/
│   │   │   ├── api-reference.md
│   │   │   ├── overview.md
│   │   │   └── quick-start.md
│   │   ├── postgresql/
│   │   │   ├── api-reference.md
│   │   │   ├── overview.md
│   │   │   └── quick-start.md
│   │   └── redis/
│   │       ├── api-reference.md
│   │       ├── overview.md
│   │       └── quick-start.md
│   ├── gpu/
│   │   ├── api-reference.md
│   │   ├── overview.md
│   │   └── quick-start.md
│   ├── kubernetes/
│   │   ├── api-reference.md
│   │   ├── overview.md
│   │   └── quick-start.md
│   ├── messaging/
│   │   ├── kafka/
│   │   │   ├── overview.md
│   │   │   └── quick-start.md
│   │   └── rabbitmq/
│   │       ├── overview.md
│   │       └── quick-start.md
│   └── storage/
│       └── buckets/
│           ├── api-reference.md
│           ├── overview.md
│           └── quick-start.md
└── tools/
    └── terraform.md
```

**Note** : Le dossier `api/` existe déjà dans `i18n/en/docusaurus-plugin-content-docs/version-2.0/` et peut être conservé tel quel.

---

## 🎯 Plan de travail par phases

### Phase 1 : Structure de base (Priorité HAUTE)
**Objectif** : Créer les fichiers essentiels pour la navigation

#### 1.1 Page d'accueil
- [ ] `get-started.md` - Page principale d'introduction
  - **Fichier source** : `versioned_docs/version-2.0/get-started.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 30 min

#### 1.2 Section Getting Started
- [ ] `getting-started/introduction.md` - Introduction à Hikube
  - **Fichier source** : `versioned_docs/version-2.0/getting-started/introduction.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 45 min

- [ ] `getting-started/concepts.md` - Concepts clés
  - **Fichier source** : `versioned_docs/version-2.0/getting-started/concepts.md`
  - **Complexité** : Élevée (contenu technique + diagrammes Mermaid)
  - **Temps estimé** : 1h30

- [ ] `getting-started/quick-start.md` - Démarrage rapide
  - **Fichier source** : `versioned_docs/version-2.0/getting-started/quick-start.md`
  - **Complexité** : Élevée (guide pas à pas avec exemples de code)
  - **Temps estimé** : 2h

**Total Phase 1** : ~4h45

---

### Phase 2 : Services principaux (Priorité HAUTE)
**Objectif** : Traduire les services les plus utilisés

#### 2.1 Kubernetes (Service principal)
- [ ] `services/kubernetes/overview.md`
  - **Complexité** : Élevée (architecture, diagrammes)
  - **Temps estimé** : 1h30

- [ ] `services/kubernetes/quick-start.md`
  - **Complexité** : Très élevée (guide complet avec exemples)
  - **Temps estimé** : 2h30

- [ ] `services/kubernetes/api-reference.md`
  - **Complexité** : Moyenne (documentation API technique)
  - **Temps estimé** : 2h

#### 2.2 Compute (Machines virtuelles)
- [ ] `services/compute/overview.md`
  - **Complexité** : Élevée (architecture, types d'instances)
  - **Temps estimé** : 1h30

- [ ] `services/compute/quick-start.md`
  - **Complexité** : Élevée (guide pratique)
  - **Temps estimé** : 1h30

- [ ] `services/compute/api-reference.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 1h30

#### 2.3 Storage (Buckets S3)
- [ ] `services/storage/buckets/overview.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 1h

- [ ] `services/storage/buckets/quick-start.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 1h

- [ ] `services/storage/buckets/api-reference.md`
  - **Complexité** : Moyenne
  - **Temps estimé** : 1h

**Total Phase 2** : ~14h

---

### Phase 3 : Bases de données (Priorité MOYENNE)
**Objectif** : Traduire les 4 services de bases de données

#### 3.1 PostgreSQL
- [ ] `services/databases/postgresql/overview.md` (1h)
- [ ] `services/databases/postgresql/quick-start.md` (1h30)
- [ ] `services/databases/postgresql/api-reference.md` (1h30)

#### 3.2 MySQL
- [ ] `services/databases/mysql/overview.md` (1h)
- [ ] `services/databases/mysql/quick-start.md` (1h30)
- [ ] `services/databases/mysql/api-reference.md` (1h30)

#### 3.3 Redis
- [ ] `services/databases/redis/overview.md` (1h)
- [ ] `services/databases/redis/quick-start.md` (1h30)
- [ ] `services/databases/redis/api-reference.md` (1h30)

#### 3.4 ClickHouse
- [ ] `services/databases/clickhouse/overview.md` (1h)
- [ ] `services/databases/clickhouse/quick-start.md` (1h30)
- [ ] `services/databases/clickhouse/api-reference.md` (1h30)

**Total Phase 3** : ~18h

---

### Phase 4 : Services avancés (Priorité MOYENNE)
**Objectif** : GPU et Messaging

#### 4.1 GPU
- [ ] `services/gpu/overview.md` (1h30)
- [ ] `services/gpu/quick-start.md` (2h)
- [ ] `services/gpu/api-reference.md` (1h30)

#### 4.2 Messaging - Kafka
- [ ] `services/messaging/kafka/overview.md` (1h)
- [ ] `services/messaging/kafka/quick-start.md` (1h30)

#### 4.3 Messaging - RabbitMQ
- [ ] `services/messaging/rabbitmq/overview.md` (1h)
- [ ] `services/messaging/rabbitmq/quick-start.md` (1h30)

**Total Phase 4** : ~10h

---

### Phase 5 : Ressources et outils (Priorité BASSE)
**Objectif** : Compléter la documentation

#### 5.1 Resources
- [ ] `resources/faq.md` (1h30)
- [ ] `resources/glossary.md` (1h)
- [ ] `resources/troubleshooting.md` (2h)

#### 5.2 Tools
- [ ] `tools/terraform.md` (2h)

**Total Phase 5** : ~6h30

---

## 📊 Résumé des estimations

| Phase | Fichiers | Temps estimé | Priorité |
|-------|----------|--------------|----------|
| Phase 1 | 4 | ~4h45 | HAUTE |
| Phase 2 | 9 | ~14h | HAUTE |
| Phase 3 | 12 | ~18h | MOYENNE |
| Phase 4 | 7 | ~10h | MOYENNE |
| Phase 5 | 4 | ~6h30 | BASSE |
| **TOTAL** | **36** | **~53h15** | |

---

## 🔧 Consignes de traduction

### 1. Structure des fichiers
- **Conserver** la structure frontmatter YAML (sidebar_position, title, etc.)
- **Traduire** les valeurs de `title` en anglais
- **Conserver** les slugs si présents

### 2. Contenu technique
- **Conserver** :
  - Les noms de commandes (`kubectl`, `virtctl`, etc.)
  - Les noms de fichiers et chemins
  - Les exemples de code YAML/JSON/Bash
  - Les noms de ressources Kubernetes (API versions, kinds)
  - Les URLs et liens externes
  - Les diagrammes Mermaid (sauf les labels en français)

- **Traduire** :
  - Les commentaires dans les exemples de code (si présents)
  - Les descriptions et explications
  - Les labels dans les diagrammes Mermaid
  - Les messages d'erreur et exemples de sortie

### 3. Liens internes
- **Adapter** tous les liens internes pour pointer vers les fichiers anglais
- **Vérifier** que les chemins relatifs sont corrects
- **Utiliser** l'extension `.md` pour tous les liens

### 4. Terminologie
- **Standardiser** la terminologie technique :
  - "Tenant" → "Tenant" (garder tel quel)
  - "Machine virtuelle" → "Virtual Machine" ou "VM"
  - "Cluster Kubernetes" → "Kubernetes cluster"
  - "Plan de contrôle" → "Control plane"
  - "Nœud worker" → "Worker node"
  - "Stockage" → "Storage"
  - "Haute disponibilité" → "High availability"

### 5. Formatage
- **Conserver** :
  - Les emojis (🚀, 📦, etc.)
  - La structure des tableaux
  - Les blocs de code avec syntax highlighting
  - Les admonitions (:::tip, :::warning, etc.)

- **Traduire** :
  - Le contenu des admonitions
  - Les titres de tableaux
  - Les légendes et descriptions

---

## ✅ Checklist de validation

Pour chaque fichier traduit, vérifier :

- [ ] Frontmatter traduit (title, etc.)
- [ ] Tous les titres et sous-titres traduits
- [ ] Tous les liens internes adaptés
- [ ] Exemples de code conservés (sauf commentaires)
- [ ] Diagrammes Mermaid avec labels traduits
- [ ] Terminologie cohérente
- [ ] Pas d'erreurs de syntaxe Markdown
- [ ] Liens externes fonctionnels
- [ ] Images et assets référencés correctement

---

## 🚀 Ordre d'exécution recommandé

### Sprint 1 (Semaine 1) - Fondations
1. Phase 1 complète (Getting Started)
2. Phase 2.1 (Kubernetes overview + quick-start)

### Sprint 2 (Semaine 2) - Services principaux
1. Phase 2.1 complète (Kubernetes API reference)
2. Phase 2.2 (Compute)
3. Phase 2.3 (Storage)

### Sprint 3 (Semaine 3) - Bases de données
1. Phase 3 complète (toutes les bases de données)

### Sprint 4 (Semaine 4) - Finalisation
1. Phase 4 (GPU + Messaging)
2. Phase 5 (Resources + Tools)
3. Vérification globale et corrections

---

## 📝 Notes importantes

1. **Fichier get-started.md existant** : Il existe déjà un `get-started.md` en anglais dans `i18n/en/docusaurus-plugin-content-docs/version-2.0/` mais il semble être une ancienne version. Il faudra le remplacer par la nouvelle traduction.

2. **Sidebar** : Vérifier si un sidebar spécifique pour la version anglaise est nécessaire ou si Docusaurus gère automatiquement la traduction des labels.

3. **Tests** : Après chaque phase, tester la navigation et vérifier que tous les liens fonctionnent.

4. **Révision** : Prévoir une phase de révision par un locuteur natif anglais pour la qualité linguistique.

---

## 🎯 Objectifs de qualité

- **Cohérence terminologique** : Utiliser un glossaire partagé
- **Clarté technique** : Préserver la précision technique de l'original
- **Lisibilité** : Adapter le style pour un public anglophone
- **Complétude** : Tous les fichiers traduits avant publication

---

*Plan créé le : $(date)*
*Dernière mise à jour : $(date)*

