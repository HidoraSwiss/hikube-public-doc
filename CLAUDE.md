# CLAUDE.md — Hikube Public Documentation

## Projet

Documentation publique Hikube, basée sur **Docusaurus** (v3). Hébergée sur `https://docs.hikube.cloud`.

- **Build** : `npm run build`
- **Dev** : `npm run start`
- **Servir le build** : `npm run serve`
- **Vérification** : le build échoue sur les broken links (`onBrokenLinks: 'warn'` dans `docusaurus.config.js`)

## Structure du projet

```
docs/
├── getting-started/          # Introduction, concepts clés, quick-start global
├── services/
│   ├── kubernetes/           # Clusters K8s (overview, quick-start, api-reference, plugins/)
│   ├── compute/              # Machines virtuelles
│   ├── databases/            # Redis, PostgreSQL, MySQL, ClickHouse
│   ├── messaging/            # Kafka, NATS, RabbitMQ
│   ├── storage/buckets/      # Object storage S3
│   └── gpu/                  # GPU as a Service
├── resources/                # FAQ, troubleshooting, glossaire
└── tools/                    # Terraform
```

### Convention par service

Chaque service suit la structure : `overview.md` → `quick-start.md` → `api-reference.md`.
L'ordre dans la sidebar est contrôlé par `sidebar_position` dans le frontmatter.

## Conventions de rédaction

### Langue
- Contenu principal en **français** (locale par défaut)
- Traductions anglaises dans `i18n/en/`

### Manifestes YAML
- **Ne jamais inclure `namespace: default`** dans les exemples YAML : le namespace est implicite, déterminé par le contexte du tenant
- API group standard : `apiVersion: apps.cozystack.io/v1alpha1`
- Toujours ajouter `title="fichier.yaml"` sur les blocs code YAML

### Structure des quick-starts
Suivre le modèle en **7 étapes** (cf. `docs/services/kubernetes/quick-start.md`) :
1. Créer le manifeste
2. Déployer
3. Vérification des pods (avec résultat attendu)
4. Récupérer les identifiants
5. Connexion et tests
6. Dépannage rapide
7. Nettoyage

### Admonitions Docusaurus
Utiliser `:::tip`, `:::note`, `:::warning` pour les encadrés importants.

### Diagrammes
Mermaid est supporté nativement (blocs ` ```mermaid `).

## Pièges connus

- **RabbitMQ, NATS, Kafka** sont sous `services/messaging/`, pas `services/databases/`
- Les presets de ressources (`resourcesPreset`) sont partagés entre tous les services DB : nano, micro, small, medium, large, xlarge, 2xlarge
- Si `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est ignoré
- Les opérateurs varient par service : Spotahome (Redis), CloudNativePG (PostgreSQL), etc.
- `onBrokenLinks: 'warn'` : le build ne casse pas sur les liens cassés, il faut vérifier les warnings manuellement

## Commits

Style mixte français/anglais. Exemples récents :
- `Supprimer des lignes inutiles dans la référence API pour les machines virtuelles`
- `Enhance API Reference for Virtual Machines`
- `fix(docs): remove angle brackets from URLs in Cilium and CoreDNS documentation`
