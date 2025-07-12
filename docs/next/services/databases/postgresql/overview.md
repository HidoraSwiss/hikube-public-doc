---
title: PostgreSQL sur Hikube
---

# PostgreSQL Managed sur Hikube

PostgreSQL est l'un des choix les plus populaires parmi les bases de données relationnelles, réputé pour ses fonctionnalités robustes et ses performances élevées. Le service **Managed PostgreSQL** sur Hikube offre un cluster répliqué auto-réparant avec une gestion simplifiée.

---

## Qu'est-ce que PostgreSQL Managed ?

PostgreSQL Managed sur Hikube est un service de base de données relationnelle entièrement managé qui élimine la complexité de l'administration tout en conservant la puissance et la flexibilité de PostgreSQL.

### Avantages sur Hikube

- **🔄 Haute disponibilité** : Réplication automatique avec failover
- **💾 Sauvegardes intégrées** : Sauvegardes automatiques avec Restic
- **📊 Monitoring** : Métriques et alertes intégrées
- **🔒 Sécurité** : Chiffrement en transit et au repos
- **⚡ Performance** : Optimisations spécifiques à Hikube
- **🔄 Scaling** : Mise à l'échelle horizontale et verticale

### Cas d'usage

- **Applications web** : Sites e-commerce, applications SaaS
- **Analytics** : Data warehousing, reporting
- **Microservices** : Backend pour APIs
- **Legacy migration** : Migration depuis d'autres bases de données

---

## Architecture

```
┌─────────────────────────────────────┐
│           Application               │
├─────────────────────────────────────┤
│         PostgreSQL Proxy            │
├─────────────────────────────────────┤
│  Primary │ Replica 1 │ Replica 2   │
├─────────────────────────────────────┤
│         Storage Layer               │
│    (Replicated/Local)               │
└─────────────────────────────────────┘
```

### Composants

- **Primary** : Instance principale gérant les écritures
- **Replicas** : Instances en lecture seule pour la scalabilité
- **Proxy** : Répartition de charge et failover automatique
- **Storage** : Stockage persistant avec réplication

---

## Fonctionnalités

### Réplication automatique

- **Synchronous replication** : Garantie de durabilité
- **Automatic failover** : Basculement automatique en cas de panne
- **Read scaling** : Répartition des lectures sur les réplicas

### Sauvegardes

- **Backup automatique** : Sauvegardes quotidiennes
- **Point-in-time recovery** : Restauration à un moment précis
- **Cross-region backup** : Sauvegardes géographiquement distribuées

### Monitoring

- **Métriques système** : CPU, mémoire, disque, réseau
- **Métriques PostgreSQL** : Connexions, requêtes, locks
- **Alertes** : Notifications automatiques
- **Logs** : Logs centralisés et structurés

### Sécurité

- **Chiffrement TLS** : Connexions chiffrées
- **RBAC** : Contrôle d'accès granulaire
- **Network policies** : Isolation réseau
- **Audit logs** : Traçabilité complète

---

## Comparaison avec d'autres solutions

| Fonctionnalité | PostgreSQL Managed | PostgreSQL Self-hosted | Cloud PostgreSQL |
|----------------|-------------------|----------------------|------------------|
| **Setup** | ⚡ Instantané | 🔧 Complexe | ⚡ Simple |
| **Maintenance** | 🤖 Automatique | 👨‍💻 Manuel | 🤖 Automatique |
| **Monitoring** | 📊 Intégré | 🔧 À configurer | 📊 Intégré |
| **Backup** | 💾 Automatique | 🔧 À configurer | 💾 Automatique |
| **Scaling** | 📈 Auto | 🔧 Manuel | 📈 Auto |
| **Coût** | 💰 Prévisible | 💰 Variable | 💰 Prévisible |

---

## Intégration avec l'écosystème Hikube

### Kubernetes

PostgreSQL s'intègre parfaitement avec Kubernetes :

- **Custom Resources** : Définition déclarative
- **Operators** : Gestion automatique
- **Secrets** : Gestion sécurisée des credentials
- **Services** : Découverte de service automatique

### Terraform

Déploiement automatisé avec Terraform :

```hcl
resource "kubernetes_manifest" "postgres" {
  manifest = {
    apiVersion = "apps.cozystack.io/v1alpha1"
    kind       = "Postgres"
    metadata = {
      name = "my-postgres"
    }
    spec = {
      size = "20Gi"
      replicas = 3
    }
  }
}
```

### Monitoring

Intégration avec la stack de monitoring Hikube :

- **Prometheus** : Collecte de métriques
- **Grafana** : Dashboards prêts à l'emploi
- **AlertManager** : Alertes configurables

---

## Prochaines étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez PostgreSQL en 5 minutes
2. **[Référence API](api-reference.md)** : Tous les paramètres disponibles
3. **[Tutoriels](tutorials/)** : Guides avancés
4. **[Dépannage](troubleshooting.md)** : Solutions aux problèmes courants 