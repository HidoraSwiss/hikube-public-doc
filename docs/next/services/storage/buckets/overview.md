---
title: Buckets sur Hikube
---

# Buckets - Stockage d'objets managé

Les **Buckets** sur Hikube offrent un stockage d'objets scalable et performant, basé sur SeaweedFS. Ce service vous permet de stocker et gérer facilement de grandes quantités de données non structurées.

---

## Qu'est-ce que Buckets ?

Buckets est un service de stockage d'objets managé qui fournit une interface S3-compatible pour stocker et récupérer des données. Il est basé sur SeaweedFS, un système de fichiers distribué haute performance.

### Avantages sur Hikube

- **📈 Scalabilité** : Stockage distribué automatique
- **🔒 Durabilité** : Réplication automatique des données
- **⚡ Performance** : Accès haute performance
- **🌐 Compatibilité S3** : API standard de l'industrie
- **💾 Gestion automatique** : Pas d'administration requise
- **📊 Monitoring** : Métriques et alertes intégrées

### Cas d'usage

- **Backup et archivage** : Sauvegardes de bases de données
- **Médias** : Stockage d'images, vidéos, documents
- **Logs** : Centralisation des logs applicatifs
- **Data lakes** : Stockage de données analytiques
- **CDN** : Distribution de contenu statique

---

## Architecture

```
┌─────────────────────────────────────┐
│           Application               │
├─────────────────────────────────────┤
│         S3 API Gateway             │
├─────────────────────────────────────┤
│  Master │ Volume 1 │ Volume 2      │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Distributed Storage)            │
└─────────────────────────────────────┘
```

### Composants

- **Master** : Coordination et métadonnées
- **Volume Servers** : Stockage des données
- **S3 Gateway** : Interface S3-compatible
- **Storage** : Stockage distribué avec réplication

---

## Fonctionnalités

### Compatibilité S3

- **API S3 complète** : Toutes les opérations S3 standard
- **SDKs** : Support de tous les SDKs S3
- **CLI** : Compatible avec AWS CLI
- **Outils** : Compatible avec tous les outils S3

### Gestion des données

- **Versioning** : Historique des versions d'objets
- **Lifecycle** : Gestion automatique du cycle de vie
- **Encryption** : Chiffrement en transit et au repos
- **Access Control** : Contrôle d'accès granulaire

### Performance

- **Haute disponibilité** : Réplication automatique
- **Scalabilité** : Ajout automatique de capacité
- **Latence faible** : Optimisations réseau
- **Throughput élevé** : Parallélisation des opérations

---

## Comparaison avec d'autres solutions

| Fonctionnalité | Buckets Hikube | AWS S3 | MinIO | SeaweedFS |
|----------------|----------------|--------|-------|-----------|
| **API S3** | ✅ Complète | ✅ Complète | ✅ Complète | ⚠️ Partielle |
| **Scalabilité** | 📈 Auto | 📈 Auto | 📈 Manuel | 📈 Auto |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Prévisible | 💰 Prévisible |
| **Setup** | ⚡ Instantané | ⚡ Instantané | 🔧 Complexe | 🔧 Complexe |
| **Monitoring** | 📊 Intégré | 📊 Intégré | 🔧 À configurer | 🔧 À configurer |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

Buckets s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Secrets** : Gestion sécurisée des credentials
- **Services** : Découverte de service automatique

### Terraform

Déploiement automatisé avec Terraform :

```text
resource "kubernetes_manifest" "bucket" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Bucket"
    metadata = {
      name = "my-bucket"
    }
    spec = {
      size = "100Gi"
      replicas = 3
    }
  }
}
```

### Applications

Intégration avec les autres services Hikube :

- **PostgreSQL** : Sauvegardes automatiques
- **Kubernetes** : Stockage persistant
- **Monitoring** : Métriques intégrées

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Créez votre premier bucket en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants 