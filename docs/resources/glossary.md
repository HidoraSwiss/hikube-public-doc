---
sidebar_position: 3
title: Glossaire
---

# Glossaire Hikube

Retrouvez ici les définitions des termes et concepts utilisés dans la documentation Hikube.

---

| **Terme** | **Définition** | **Documentation** |
|-----------|---------------|-------------------|
| **Accès externe** | Option des bases de données et de RabbitMQ qui attribue une IP publique au cluster ; l'adresse s'affiche dans le champ **Hôte** de la page de détail. | [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md) |
| **Add-on / Extension** | Composant activable sur un cluster Kubernetes depuis l'étape **Addons** de l'assistant (cert-manager, Ingress NGINX, monitoring, etc.). | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **AMQP** | Advanced Message Queuing Protocol. Protocole de messagerie standard utilisé notamment par RabbitMQ pour la communication entre applications. | [RabbitMQ - Vue d'ensemble](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | Service de consensus distribué intégré à ClickHouse, utilisé pour la coordination des nœuds du cluster (alternative à ZooKeeper). | [ClickHouse - Vue d'ensemble](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Outil d'initialisation automatique des machines virtuelles au premier démarrage : utilisateurs, paquets, scripts, réseau. Le script se saisit dans l'assistant de création de la VM. | [Configurer cloud-init](../services/compute/how-to/configure-cloud-init.md) |
| **CNI (Container Network Interface)** | Standard définissant la gestion du réseau pour les conteneurs dans un cluster Kubernetes. Hikube utilise Cilium comme CNI. | [Kubernetes - Vue d'ensemble](../services/kubernetes/overview.md) |
| **Console** | Interface web d'Hikube, [console.hikube.cloud](https://console.hikube.cloud), depuis laquelle vous gérez toutes vos ressources. | [Concepts clés](../getting-started/concepts.md) |
| **Control Plane** | Ensemble des composants qui gèrent l'état du cluster Kubernetes (API server, scheduler, controller manager). Sa taille et son nombre d'instances se choisissent à la création du cluster. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Disque** | Volume de stockage bloc persistant attaché à une machine virtuelle (disque système ou de données), géré dans **Infrastructure** → **Disques**. | [Disques - Vue d'ensemble](../services/storage/disks/overview.md) |
| **Golden Image** | Image de base préconfigurée pour les machines virtuelles, optimisée pour un système d'exploitation donné (Ubuntu, Rocky Linux, Windows Server, etc.). | [Machines virtuelles - Vue d'ensemble](../services/compute/overview.md) |
| **Groupe de nœuds** | Ensemble de nœuds workers d'un cluster Kubernetes partageant un type d'instance, des bornes d'auto-scaling (minimum/maximum) et, le cas échéant, un GPU. | [Gérer les groupes de nœuds](../services/kubernetes/how-to/manage-node-groups.md) |
| **Ingress / IngressClass** | Ressource Kubernetes qui gère l'accès HTTP/HTTPS externe vers les services du cluster. IngressClass définit le contrôleur utilisé. | [Ingress NGINX](../services/kubernetes/plugins/ingress-nginx.md) |
| **JetStream** | Système de streaming et persistance intégré à NATS, permettant le stockage durable des messages, le replay et la livraison garantie. | [NATS - Vue d'ensemble](../services/messaging/nats/overview.md) |
| **Kubeconfig** | Fichier d'accès à un cluster Kubernetes (URL du serveur, certificats). Celui de votre cluster se télécharge depuis sa page de détail dans la console (bouton **Kubeconfig**). | [Kubernetes - Démarrage rapide](../services/kubernetes/quick-start.md) |
| **Organisation** | Entité qui représente votre entreprise dans Hikube. Elle regroupe vos utilisateurs et vos projets ; elle est créée par Hidora. | [Concepts clés](../getting-started/concepts.md) |
| **Preset** | Profil de ressources prédéfini (`nano` à `2xlarge`) proposé dans les assistants des bases de données pour dimensionner CPU et mémoire. | [PostgreSQL - Concepts](../services/databases/postgresql/concepts.md) |
| **Projet** | Espace isolé au sein d'une organisation, qui regroupe des ressources et porte des quotas (CPU, mémoire, stockage). Anciennement appelé **tenant**. | [Concepts clés](../getting-started/concepts.md) |
| **PVC (PersistentVolumeClaim)** | Requête de stockage persistant dans un cluster Kubernetes. Permet aux pods de conserver des données au-delà de leur cycle de vie. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Quorum Queues** | Type de file d'attente RabbitMQ basé sur le consensus Raft, offrant une réplication forte et une tolérance aux pannes pour les messages critiques. | [RabbitMQ - Vue d'ensemble](../services/messaging/rabbitmq/overview.md) |
| **Quota** | Limite de CPU, de mémoire ou de stockage d'un projet. Les assistants affichent l'impact de chaque création sur le quota. | [Concepts clés](../getting-started/concepts.md#quotas) |
| **Sentinel** | Composant Redis qui surveille l'état du cluster, détecte les pannes du master et orchestre automatiquement le failover vers un réplica. | [Redis - Vue d'ensemble](../services/databases/redis/overview.md) |
| **Shard / Replica** | Un **shard** est une partition horizontale des données (MongoDB, ClickHouse). Un **replica** est une copie des données pour la haute disponibilité. | [MongoDB - Concepts](../services/databases/mongodb/concepts.md) |
| **StorageClass** | Type de stockage des volumes persistants dans un cluster Kubernetes. `replicated` réplique les données sur plusieurs datacenters. | [Kubernetes - Concepts](../services/kubernetes/concepts.md) |
| **Type d'instance** | Gabarit de CPU et de mémoire d'une VM ou d'un nœud Kubernetes (séries `s1`, `u1`, `m1`). | [Machines virtuelles - Concepts](../services/compute/concepts.md) |
| **VPC** | Réseau privé virtuel d'un projet, découpé en sous-réseaux, qui relie vos VM entre elles. Géré dans **Infrastructure** → **Réseau**. | [Réseau - Vue d'ensemble](../services/networking/overview.md) |
