---
sidebar_position: 1
title: Introduction à Hikube
---

# Bienvenue sur Hikube

Hikube est une plateforme cloud moderne basée sur Kubernetes qui vous permet de déployer et gérer facilement vos applications et infrastructures.

## Qu'est-ce que Hikube ?

Hikube combine la puissance de Kubernetes avec la simplicité d'une plateforme managée pour vous offrir :

- **🚀 Déploiement simplifié** : Déployez vos applications en quelques clics
- **🔧 Infrastructure as Code** : Gérez votre infrastructure avec Terraform
- **📊 Monitoring intégré** : Surveillez vos applications en temps réel
- **🔒 Sécurité renforcée** : Isolation multi-tenant et sécurité réseau
- **📈 Scalabilité automatique** : Adaptez vos ressources selon vos besoins

## Architecture Hikube

```
┌─────────────────┐
│   Applications  │
├─────────────────┤
│   Kubernetes    │
├─────────────────┤
│   Virtualization│
├─────────────────┤
│   Infrastructure│
└─────────────────┘
```

## Services Disponibles

### 💾 Stockage
- **Buckets** : Stockage d'objets scalable

### 🗄️ Bases de Données
- **PostgreSQL** : Base de données relationnelle robuste
- **MySQL** : Base de données relationnelle populaire
- **Redis** : Cache et base de données clé-valeur
- **ClickHouse** : Base de données analytique

### 🖥️ Compute
- **Virtual Machines** : Machines virtuelles personnalisables
- **GPU** : Calcul intensif et machine learning

### ☸️ Orchestration
- **Kubernetes** : Orchestration de conteneurs

### 🌐 Réseau
- **VPN** : Connexions sécurisées
- **Load Balancers** : Équilibrage de charge

### 📨 Messagerie
- **Kafka** : Streaming de données
- **RabbitMQ** : Gestion de messages
- **NATS** : Messagerie légère

## Prochaines Étapes

1. **[Démarrage rapide](quick-start.md)** : Déployez votre première application
2. **[Concepts clés](concepts.md)** : Comprenez l'architecture Hikube
3. **[Services](services/)** : Explorez les services disponibles 