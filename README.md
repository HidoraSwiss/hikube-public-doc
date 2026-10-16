<div align="center">

<a href="https://docs.hikube.cloud">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="static/img/logo_darkmode.svg">
    <img alt="Hikube" src="static/img/logo_whitemode.svg" width="280">
  </picture>
</a>

### Le cloud souverain suisse, expliqué pas à pas

VM, Kubernetes, bases de données, GPU et stockage S3, hébergés en Suisse sur trois datacenters.<br>
Ce dépôt est la source de **[docs.hikube.cloud](https://docs.hikube.cloud)**.

[![Documentation](https://img.shields.io/badge/docs-docs.hikube.cloud-38BA6A?style=flat-square)](https://docs.hikube.cloud)
[![Console](https://img.shields.io/badge/console-console.hikube.cloud-00683B?style=flat-square)](https://console.hikube.cloud)
[![Statut](https://img.shields.io/badge/statut-status.hikube.cloud-38BA6A?style=flat-square)](https://status.hikube.cloud)
[![Déploiement](https://img.shields.io/github/actions/workflow/status/HidoraSwiss/hikube-public-doc/deploy.yml?branch=main&style=flat-square&label=d%C3%A9ploiement)](https://github.com/HidoraSwiss/hikube-public-doc/actions/workflows/deploy.yml)
[![Plumber Score](https://score.getplumber.io/github.com/HidoraSwiss/hikube-public-doc.svg)](https://score.getplumber.io/github.com/HidoraSwiss/hikube-public-doc)

**[Démarrage rapide](https://docs.hikube.cloud/getting-started/quick-start)** · [Introduction](https://docs.hikube.cloud/getting-started/introduction) · [Nouveautés](https://docs.hikube.cloud/blog) · [Contribuer](CONTRIBUTING.md)

🇫🇷 Français · 🇬🇧 [English](https://docs.hikube.cloud/en/) · 🇩🇪 [Deutsch](https://docs.hikube.cloud/de/) · 🇮🇹 [Italiano](https://docs.hikube.cloud/it/)

</div>

---

## Ce que couvre la documentation

Chaque service est décrit depuis la **[console](https://console.hikube.cloud)** : présentation, concepts, démarrage rapide, guides pratiques, FAQ et dépannage.

| | Service | Pour quoi faire |
|:-:|---|---|
| <img src="static/img/services/kubernetes.svg" width="32" alt=""> | **[Kubernetes](https://docs.hikube.cloud/services/kubernetes/overview)** | Clusters managés, groupes de nœuds, autoscaling et extensions prêtes à l'emploi |
| <img src="static/img/services/compute.svg" width="32" alt=""> | **[Machines virtuelles](https://docs.hikube.cloud/services/compute/overview)** | VM Linux et Windows, disques persistants, IP publique |
| <img src="static/img/services/gpu.svg" width="32" alt=""> | **[GPU](https://docs.hikube.cloud/services/gpu/overview)** | GPU NVIDIA pour l'IA, le machine learning et le calcul intensif |
| <img src="static/img/services/postgresql.svg" width="32" alt=""> | **[Bases de données](https://docs.hikube.cloud/services/databases)** | PostgreSQL, MariaDB, MongoDB, Redis, ClickHouse |
| <img src="static/img/services/rabbitmq.svg" width="32" alt=""> | **[Messagerie](https://docs.hikube.cloud/services/messaging)** | RabbitMQ, Kafka, NATS |
| <img src="static/img/services/s3.svg" width="32" alt=""> | **[Stockage](https://docs.hikube.cloud/services/storage)** | Disques persistants et buckets compatibles S3 |
| <img src="static/img/services/networking.svg" width="32" alt=""> | **[Réseau](https://docs.hikube.cloud/services/networking/overview)** | VPC et sous-réseaux privés entre vos ressources |
| <img src="static/img/services/terraform.svg" width="32" alt=""> | **[Terraform](https://docs.hikube.cloud/tools/terraform)** | Décrire son infrastructure Hikube en code |

## Lancer le site en local

Il faut Node.js 18 ou plus récent.

```bash
git clone https://github.com/HidoraSwiss/hikube-public-doc.git
cd hikube-public-doc
npm ci
npm run start          # http://localhost:3000, rechargement à chaud
```

| Commande | Ce qu'elle fait |
|---|---|
| `npm run start` | Serveur de développement, en français |
| `npm run start -- --locale en` | Le même dans une autre langue (`en`, `de`, `it`) |
| `npm run build` | Build de production des quatre langues, dans `build/` |
| `npm run serve` | Sert le build local, toutes langues comprises |

## Comment le dépôt est organisé

```
docs/
├── getting-started/   Introduction, concepts, démarrage rapide
├── services/          Un dossier par service, structuré selon Diátaxis
├── resources/         FAQ, glossaire, dépannage transverses
└── tools/             Terraform
blog/                  Notes de version de l'API et de la console
i18n/{en,de,it}/       Traductions des pages et des notes de version
static/img/            Logos, icônes de service, captures de la console
```

Le français est la langue de référence. Quand une page change, ses traductions dans `i18n/en`, `i18n/de` et `i18n/it` changent avec elle.

## Contribuer

Une erreur, une capture périmée, un guide qui manque ? Les contributions sont bienvenues.

1. Lire **[CONTRIBUTING.md](CONTRIBUTING.md)** : structure des pages, conventions de rédaction, pièges connus.
2. Créer une branche, faire la modification, vérifier que `npm run build` passe.
3. Ouvrir une pull request vers `main`.

Une fois la PR fusionnée, GitHub Actions construit le site et le publie sur GitHub Pages.

---

<div align="center">

Un produit **[Hidora](https://hidora.io)** · [hikube.cloud](https://hikube.cloud) · Hébergé en Suisse 🇨🇭

</div>
