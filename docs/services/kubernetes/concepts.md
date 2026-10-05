---
sidebar_position: 2
title: Concepts
---

# Concepts — Kubernetes

## Terminologie

| Terme | Définition |
|-------|------------|
| **Projet** | Espace isolé de votre organisation, doté de quotas (CPU, mémoire, stockage), dans lequel le cluster et ses nœuds sont créés. Anciennement appelé « tenant ». |
| **Cluster** | Cluster Kubernetes managé : un control plane opéré par Hikube et un ou plusieurs groupes de nœuds. |
| **Control plane** | Composants qui pilotent le cluster (API Server, Scheduler, Controller Manager, etcd), hébergés par Hikube. |
| **Groupe de nœuds** | Ensemble de nœuds workers homogènes (même type d'instance, même stockage), avec ses propres bornes d'auto-scaling. La page de détail du cluster les affiche sous **Pools de Nœuds**. |
| **Addon** | Composant optionnel installé et maintenu par la plateforme dans le cluster (Cert-Manager, Ingress NGINX, etc.). |
| **Kubeconfig** | Fichier d'accès au cluster, téléchargé depuis la page de détail du cluster dans la console. |

## Architecture

Le schéma, ci-après, illustre la structure et les interactions principales du **cluster Kubernetes Hikube**, incluant la haute disponibilité du plan de contrôle, la gestion des nœuds, la persistance des données, et la réplication inter-régions.

<div class="only-light">
  <img src="/img/hikube-kubernetes-architecture.svg" alt="Logo clair"/>
</div>
<div class="only-dark">
  <img src="/img/hikube-kubernetes-architecture-dark.svg" alt="Logo sombre"/>
</div>

---

### Composants principaux du cluster

#### Etcd Cluster

- Contient plusieurs instances d'**etcd** répliquées entre elles.
- Assure la **cohérence du stockage d'état du cluster Kubernetes** (informations sur les pods, services, configurations, etc.).
- La réplication interne entre les nœuds `etcd` garantit la **tolérance aux pannes**.

#### Control Plane

- Composé de l'API Server, du Scheduler et du Controller Manager.
- Rôle :
  - **Planifie les workloads** (pods, déploiements, etc.) sur les nœuds disponibles.
  - **Interagit avec etcd** pour lire/écrire l'état du cluster.

#### Node Groups

- Chaque groupe contient plusieurs **nœuds de travail (worker nodes)**.
- Les workloads (pods) sont déployés sur ces nœuds.
- Les nœuds communiquent avec le Control Plane pour recevoir leurs tâches.
- Ils lisent et écrivent leurs données dans les **Persistent Volume (PV)** Kubernetes.

#### Kubernetes PV Data

- Représente le **stockage persistant** utilisé par les pods.
- Les données des workloads sont **écrites et lues depuis ce stockage**.
- Cette couche est intégrée à la réplication Hikube pour garantir la disponibilité des données.

---

### Couche de réplication Hikube

#### Hikube Replication Data Layer

- Sert d'interface entre Kubernetes et les **systèmes de stockage régionaux**.
- Réplique automatiquement les données des PV vers plusieurs régions pour :
  - la **haute disponibilité**,
  - la **résilience aux pannes régionales**,
  - et la **continuité de service**.

#### Stockages régionaux

- **Region 1** → Geneva Data Storage
- **Region 2** → Gland Data Storage
- **Region 3** → Lucerne Data Storage

Chaque région dispose de son propre backend de stockage, tous synchronisés via la couche Hikube.

---

### Flux de communication

1. Les **nœuds etcd** se synchronisent entre eux pour maintenir un état global cohérent.
2. Le **Control Plane** lit/écrit dans etcd pour stocker l'état du cluster.
3. Le **Control Plane** planifie les workloads sur les **Node Groups**.
4. Les **Node Groups** interagissent avec les **PV Kubernetes** pour stocker ou récupérer des données.
5. Les **PV Data** sont répliquées à travers la **Hikube Replication Data Layer** vers les **3 régions**.

---

### Résumé fonctionnel

| Couche | Fonction principale | Technologie |
|--------|---------------------|-------------|
| Etcd Cluster | Stockage de l'état du cluster | etcd |
| Control Plane | Gestion et planification des workloads | Kubernetes |
| Node Groups | Exécution des workloads | kubelet, container runtime |
| PV Data | Stockage persistant | Kubernetes Persistent Volumes |
| Hikube Data Layer | Réplication et synchronisation multi-régions | Hikube |
| Data Storage | Stockage physique régional | Geneva / Gland / Lucerne |

---

### Objectif global

Cette architecture assure :

- **Haute disponibilité** du cluster Kubernetes.
- **Résilience géographique** grâce à la réplication inter-régions.
- **Intégrité des données** via etcd et le stockage persistant.
- **Scalabilité** horizontale avec les Node Groups.

---


## Control Plane

Le control plane se dimensionne à l'étape **Général** de l'assistant de création, avec deux champs.

### Taille de l'instance Control Plane

Preset de ressources appliqué à l'ensemble des composants du control plane (API Server, Controller Manager, Scheduler). La liste est fournie par la plateforme et chaque option affiche son CPU et sa mémoire. Le preset **Small** est sélectionné par défaut.

| Preset | Usage conseillé (aide de la console) |
|--------|--------------------------------------|
| **Small** | Faibles charges, développement ou tests. Optimisation des coûts. |
| **Medium** | Usage standard avec une charge modérée. Bon équilibre performance/coût. |
| **Large** | Usages intensifs ou trafic élevé. Performance maximale. |

La plateforme propose également des presets plus petits (`nano`, `micro`) et plus grands (`xlarge`, `2xlarge`).

:::note
Le dimensionnement composant par composant (ressources dédiées à l'API Server, au Scheduler, etc.) n'est pas proposé dans la console ; contactez le support.
:::

### Haute Disponibilité du Control Plane

Nombre d'instances du control plane : **1**, **3 (HA)** ou **5 (HA)**. La valeur par défaut est 3.
Un nombre impair d'instances garantit le quorum d'`etcd` ; utilisez au moins 3 instances en production.

Sous le champ, la console affiche l'empreinte comptée au quota du projet, par exemple « → 3 × Small = … CPU · … Gio comptés au quota ».

:::warning
La taille et le nombre d'instances du control plane ne sont pas modifiables après la création du cluster dans la console. Pour les changer, contactez le support.
:::

---

## Groupes de nœuds

Les groupes de nœuds se configurent à l'étape **Nœuds** de l'assistant (titre **Groupes de nœuds Worker**). Un cluster contient au moins un groupe ; **Ajouter un groupe de nœuds** en crée un nouveau. Chaque groupe est une carte repliable qui résume son gabarit, ses bornes et son stockage.

| Champ | Description | Valeur par défaut |
|-------|-------------|-------------------|
| **Nom du groupe** | 3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre | `worker-pool-1`, `worker-pool-2`… |
| **Taille du stockage éphémère** | Espace disque alloué aux pods sur chaque nœud, en Go (minimum 5 Go) | 20 Go |
| **Nombre minimum de nœuds** | Nombre de nœuds toujours présents. 0 est accepté | 1 |
| **Nombre maximum de nœuds** | Plafond de l'auto-scaling (entre 1 et 100, supérieur ou égal au minimum ; 50 au maximum recommandé) | 3 |
| **Type d'instance** | Gabarit des nœuds, choisi par série puis par taille | aucun (choix obligatoire) |
| **Exposé sur internet (IP Publique)** | Les nœuds du groupe hébergent le contrôleur Ingress NGINX et reçoivent le trafic entrant | activé pour le premier groupe |
| **GPU** | Modèle et nombre de GPU attachés à chaque nœud du groupe | aucun |

:::note
Le premier groupe de nœuds est toujours exposé sur internet et ne peut pas être supprimé. Les groupes ajoutés ensuite ne sont pas exposés par défaut.
:::

### Types d'instance

Le sélecteur propose trois séries. La liste exacte des gabarits disponibles est fournie par la plateforme.

#### Série Standard (S) — ratio 1:2

Usage économique, pour le développement et les tests.

| Gabarit | vCPU | RAM |
|---------|------|-----|
| `s1.small` | 1 | 2 Go |
| `s1.medium` | 2 | 4 Go |
| `s1.large` | 4 | 8 Go |
| `s1.xlarge` | 8 | 16 Go |
| `s1.3large` | 12 | 24 Go |
| `s1.2xlarge` | 16 | 32 Go |
| `s1.3xlarge` | 24 | 48 Go |
| `s1.4xlarge` | 32 | 64 Go |
| `s1.8xlarge` | 64 | 128 Go |

#### Série Universel (U) — ratio 1:4

Usage général : serveurs web, applications.

| Gabarit | vCPU | RAM |
|---------|------|-----|
| `u1.medium` | 1 | 4 Go |
| `u1.large` | 2 | 8 Go |
| `u1.xlarge` | 4 | 16 Go |
| `u1.2xlarge` | 8 | 32 Go |
| `u1.4xlarge` | 16 | 64 Go |
| `u1.8xlarge` | 32 | 128 Go |

#### Série Mémoire (M) — ratio 1:8

Optimisée mémoire : bases de données, caches.

| Gabarit | vCPU | RAM |
|---------|------|-----|
| `m1.large` | 2 | 16 Go |
| `m1.xlarge` | 4 | 32 Go |
| `m1.2xlarge` | 8 | 64 Go |
| `m1.4xlarge` | 16 | 128 Go |
| `m1.8xlarge` | 32 | 256 Go |

### GPU

La section **GPU** d'un groupe n'apparaît que si des GPU sont disponibles pour votre projet. Vous y choisissez un ou plusieurs modèles et leur nombre ; ces GPU sont attachés à **chaque** nœud du groupe.

Règles appliquées par la console :

- dès qu'un groupe a des GPU, l'addon **GPU Operator** est activé et ne peut plus être décoché ;
- un groupe créé sans GPU ne peut pas en recevoir : ajoutez un nouveau groupe de nœuds pour avoir des GPU ;
- un groupe créé avec des GPU peut changer de modèle ou de nombre, mais doit garder au moins un GPU.

:::warning
La réservation de GPU est calculée sur le nombre maximum de nœuds du groupe : un groupe de 4 nœuds au maximum avec 1 GPU par nœud réserve 4 GPU.
:::

### Options non proposées

Les rôles de nœuds personnalisés (autres que l'exposition sur internet) et la surcharge des ressources CPU/mémoire d'un gabarit ne sont pas proposés dans la console ; contactez le support.

:::tip Bonnes pratiques groupes de nœuds
- Ajustez le minimum et le maximum de nœuds en fonction des besoins de montée en charge.
- Choisissez une série cohérente avec la charge de travail (S pour le général, U pour l'équilibré, M pour la mémoire).
- Prévoyez un stockage éphémère suffisant pour les images, les logs et les caches.
- Séparez les rôles par groupe : un groupe exposé pour le trafic entrant, des groupes internes pour le calcul.
:::

---

## Addons

Les addons se choisissent à l'étape **Addons** de l'assistant (titre **Extensions et Addons**), puis se modifient depuis la page de modification du cluster.

### Addons du cluster

Ils s'activent ou se désactivent par une case à cocher.

| Addon | Description | Activé par défaut |
|-------|-------------|-------------------|
| [Cert-Manager](./plugins/cert-manager.md) | Gestion automatique des certificats SSL/TLS | Oui |
| [Ingress NGINX](./plugins/ingress-nginx.md) | Contrôleur Ingress basé sur NGINX | Oui |
| [Gateway API](./plugins/gateway-api.md) | Installe les CRDs Kubernetes Gateway API (canal experimental) | Non |
| [GPU Operator](./plugins/gpu-operator.md) | Gestion des GPU NVIDIA dans le cluster | Non (imposé si un groupe a des GPU) |
| [HAMi](./plugins/hami.md) | Partage d'un même GPU entre plusieurs pods | Non |
| [Flux CD](./plugins/fluxcd.md) | Déploiement continu GitOps | Non |
| [Monitoring Agents](./plugins/monitoring-agents.md) | Agents de surveillance pour logs et métriques | Oui |
| [Ouroboros](./plugins/ouroboros.md) | Corrige le NAT en épingle (hairpin) d'Ingress NGINX avec le PROXY protocol | Non |
| [Velero](./plugins/velero.md) | Sauvegarde et restauration | Non |

Dépendances vérifiées par la console :

- **HAMi** nécessite l'addon **GPU Operator** ;
- **Ouroboros** nécessite l'addon **Ingress NGINX**.

### Configuration avancée

[Cilium](./plugins/cilium.md), [CoreDNS](./plugins/coredns.md) et [Vertical Pod Autoscaler](./plugins/verticalpodautoscaler.md) sont toujours présents dans le cluster. Ils ne se désactivent pas : vous pouvez seulement déplier leur bloc pour surcharger leur configuration.

### Surcharge des valeurs Helm

Chaque addon (sauf Gateway API) accepte un champ **Configuration Helm (YAML) — optionnel**. La valeur YAML est transmise directement au chart Helm de l'addon et surcharge ses valeurs par défaut. Elle doit être un dictionnaire YAML (`clé: valeur`) ; la console refuse un YAML invalide. L'icône de lien à côté du nom de l'addon ouvre la documentation du chart.

---

## Accès au cluster

Une fois le cluster prêt, le bouton **Kubeconfig** de la section **Actions** de la page de détail télécharge le fichier `kubeconfig-<nom-du-cluster>.yaml`. Ce fichier donne un accès administrateur au cluster avec `kubectl`, `helm` ou tout client Kubernetes. Le certificat client qu'il contient est valable un an à partir de la création du cluster. Voir [Accès et outils](./how-to/toolbox.md).

L'adresse de l'API du cluster est définie par le champ **Endpoint API (Host)** de l'étape **Général**. Il est optionnel : laissé vide, il est généré automatiquement par la plateforme et se résout sans action de votre part. Si vous saisissez votre propre nom de domaine, le certificat du serveur API le couvre, mais l'enregistrement DNS reste à créer chez votre fournisseur DNS : demandez au [support](mailto:support@hidora.io) l'adresse vers laquelle le faire pointer.

---

## Cycle de vie et quotas

- **Statut** : un cluster nouvellement créé apparaît dans la liste **Clusters Kubernetes** avec le statut **En création**, puis **Prêt** lorsqu'il est opérationnel.
- **Quotas** : les jauges **Quotas du projet** de l'assistant comptent le control plane et chaque groupe de nœuds **à son nombre maximum de nœuds**. La création est bloquée si le projet n'a pas assez de quota.
- **Modification** : le bouton **Modifier** permet de changer la version, l'endpoint API, les groupes de nœuds et les addons. Le nom du cluster n'est pas modifiable.
- **Suppression** : le bouton **Supprimer** supprime le cluster après confirmation de son nom.
