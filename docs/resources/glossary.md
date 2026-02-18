---
sidebar_position: 3
title: Glossaire
---

# Glossaire Hikube

Retrouvez ici les définitions des termes et concepts utilisés dans la documentation Hikube.

---

| **Terme** | **Définition** | **Documentation** |
|-----------|---------------|-------------------|
| **Add-on / Plugin** | Extension activable sur un cluster Kubernetes (cert-manager, ingress-nginx, monitoring, etc.) qui ajoute des fonctionnalités sans configuration manuelle. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **AMQP** | Advanced Message Queuing Protocol. Protocole de messagerie standard utilisé notamment par RabbitMQ pour la communication entre applications. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | Service de consensus distribué intégré à ClickHouse, utilisé pour la coordination des nœuds du cluster (alternative à ZooKeeper). | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Outil d'initialisation automatique des machines virtuelles au premier démarrage. Permet de configurer utilisateurs, paquets, scripts et réseau via un fichier YAML. | [Compute API Reference](../services/compute/api-reference.md) |
| **CNI (Container Network Interface)** | Standard définissant la gestion du réseau pour les conteneurs dans un cluster Kubernetes. Hikube utilise Cilium comme CNI par défaut. | [Kubernetes Overview](../services/kubernetes/overview.md) |
| **Control Plane** | Ensemble des composants qui gèrent l'état du cluster Kubernetes (API server, scheduler, controller manager). Le nombre de réplicas détermine la haute disponibilité. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Golden Image** | Image de base préconfigurée pour les machines virtuelles, optimisée pour un système d'exploitation donné (Ubuntu, Rocky Linux, etc.). | [Compute Overview](../services/compute/overview.md) |
| **Ingress / IngressClass** | Ressource Kubernetes qui gère l'accès HTTP/HTTPS externe vers les services du cluster. IngressClass définit le contrôleur utilisé (nginx, traefik, etc.). | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **JetStream** | Système de streaming et persistance intégré à NATS, permettant le stockage durable des messages, le replay et la livraison garantie. | [NATS Overview](../services/messaging/nats/overview.md) |
| **Kubeconfig** | Fichier de configuration contenant les informations d'accès à un cluster Kubernetes (URL du serveur, certificats, tokens). Nécessaire pour utiliser `kubectl`. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Namespace** | Espace logique au sein d'un cluster Kubernetes permettant d'isoler et organiser les ressources. Chaque tenant dispose de namespaces dédiés. | [Concepts clés](../getting-started/concepts.md) |
| **NodeGroup** | Groupe de nœuds workers dans un cluster Kubernetes, avec des caractéristiques communes (type d'instance, scaling min/max, rôles). Permet d'adapter les ressources aux différents workloads. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Operator** | Pattern Kubernetes qui automatise la gestion d'applications complexes. Hikube utilise des opérateurs spécialisés : Spotahome (Redis), CloudNativePG (PostgreSQL), etc. | [Redis Overview](../services/databases/redis/overview.md) |
| **PVC (PersistentVolumeClaim)** | Requête de stockage persistant dans Kubernetes. Permet aux pods de conserver des données au-delà de leur cycle de vie. La taille est définie par le paramètre `size`. | [Kubernetes Quick Start](../services/kubernetes/quick-start.md) |
| **Quorum Queues** | Type de file d'attente RabbitMQ basé sur le consensus Raft, offrant une réplication forte et une tolérance aux pannes pour les messages critiques. | [RabbitMQ Overview](../services/messaging/rabbitmq/overview.md) |
| **ResourcesPreset** | Profil de ressources prédéfini (nano, micro, small, medium, large, xlarge, 2xlarge) qui simplifie l'allocation CPU/mémoire des services managés. | [Redis API Reference](../services/databases/redis/api-reference.md) |
| **Sentinel** | Composant Redis qui surveille en permanence l'état du cluster, détecte les pannes du master et orchestre automatiquement le failover vers un réplica. | [Redis Overview](../services/databases/redis/overview.md) |
| **Shard / Replica** | Un **shard** est une partition horizontale des données (utilisé par ClickHouse). Un **replica** est une copie des données pour la haute disponibilité et la tolérance aux pannes. | [ClickHouse Overview](../services/databases/clickhouse/overview.md) |
| **StorageClass** | Définit le type de stockage utilisé pour les volumes persistants. `replicated` offre une réplication des données sur plusieurs datacenters pour la haute disponibilité. | [Kubernetes API Reference](../services/kubernetes/api-reference.md) |
| **Tenant / Sous-tenant** | Environnement isolé et sécurisé au sein d'Hikube. Un tenant peut contenir des sous-tenants pour séparer les environnements (production, staging, développement). | [Concepts clés](../getting-started/concepts.md) |
