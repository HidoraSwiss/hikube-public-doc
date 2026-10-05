---
title: "Comment ajouter et modifier un groupe de nœuds"
---

# Comment ajouter et modifier un groupe de nœuds

Les groupes de nœuds permettent de segmenter les nœuds de votre cluster Kubernetes selon les besoins de vos workloads. Ce guide explique comment ajouter, modifier et supprimer des groupes de nœuds depuis la console Hikube.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**), pour vérifier les nœuds avec `kubectl`

## Étapes

### 1. Comprendre les types d'instance

Hikube propose trois séries d'instances adaptées à différents cas d'usage :

| Série | Ratio CPU:RAM | Cas d'usage |
|-------|---------------|-------------|
| **Standard (S)** | 1:2 | Usage économique, développement, tests |
| **Universel (U)** | 1:4 | Usage général : serveurs web, applications |
| **Mémoire (M)** | 1:8 | Optimisé mémoire : bases de données, caches |

Le détail des gabarits de chaque série figure dans les [concepts](../concepts.md#types-dinstance).

### 2. Ouvrir la page de modification du cluster

1. Dans la console, ouvrez **Infrastructure** > **Kubernetes**.
2. Ouvrez le menu **Actions** du cluster et choisissez **Modifier** (ou cliquez sur **Modifier** depuis la page de détail du cluster).

La page de modification présente les sections **Informations générales**, **Groupes de nœuds** et **Extensions & Addons**, ainsi que les jauges de quota du projet.

### 3. Ajouter un groupe de nœuds

1. Dans la section **Groupes de nœuds**, cliquez sur **Ajouter un groupe de nœuds**. Une nouvelle carte s'ouvre.
2. Renseignez les champs :
   - **Nom du groupe** : par exemple `compute` (3 à 16 caractères : minuscules, chiffres et tirets) ;
   - **Taille du stockage éphémère** : par exemple 100 Go ;
   - **Nombre minimum de nœuds** et **Nombre maximum de nœuds** : par exemple 1 et 10 ;
   - **Type d'instance** : par exemple série **Universel (U)**, taille **4XLarge** (`u1.4xlarge`) ;
   - **Exposé sur internet (IP Publique)** : à activer seulement si ce groupe doit recevoir le trafic entrant (Ingress NGINX) ;
   - **GPU** : si nécessaire, voir [Ajouter des GPU](#5-ajouter-des-gpu).
3. Cliquez sur **Enregistrer**.

:::tip
Choisissez un nom descriptif pour vos groupes (`compute`, `web`, `monitoring`, `gpu`) afin de faciliter la gestion du cluster.
:::

### 4. Modifier un groupe existant

Dans la section **Groupes de nœuds**, dépliez la carte du groupe, modifiez les champs souhaités (type d'instance, stockage éphémère, nombre minimum ou maximum de nœuds, exposition) puis cliquez sur **Enregistrer**.

:::warning
Le changement de type d'instance remplace les nœuds du groupe progressivement : de nouveaux nœuds sont créés, puis les anciens sont retirés un par un. Le quota du projet doit pouvoir accueillir les nœuds supplémentaires pendant le remplacement.
:::

:::note
Évitez de renommer un groupe existant : un groupe renommé est traité comme un nouveau groupe.
:::

### 5. Ajouter des GPU

La section **GPU** d'une carte n'apparaît que si des GPU sont disponibles pour votre projet.

- Pour un **nouveau** groupe, sélectionnez le modèle et le nombre de GPU par nœud. L'addon **GPU Operator** est alors activé automatiquement et ne peut plus être décoché.
- Un groupe **créé sans GPU** ne peut pas en recevoir : ajoutez un nouveau groupe de nœuds GPU.
- Un groupe **créé avec des GPU** peut changer de modèle ou de nombre, mais doit garder au moins un GPU : pour revenir à des nœuds sans GPU, ajoutez plutôt un nouveau groupe sans GPU.

Voir aussi [Provisionner des GPU dans Kubernetes](../../gpu/how-to/provision-gpu-kubernetes.md).

### 6. Supprimer un groupe de nœuds

:::warning
Avant de supprimer un groupe, assurez-vous que les workloads qui y tournent peuvent être replanifiés sur d'autres groupes. Utilisez `kubectl drain` sur les nœuds concernés si nécessaire.
:::

1. Dans la section **Groupes de nœuds**, cliquez sur l'icône **Supprimer ce groupe** de la carte concernée.
2. Cliquez sur **Enregistrer**.

Le premier groupe du cluster ne peut pas être supprimé ; un cluster doit toujours conserver au moins un groupe de nœuds.

## Vérification

Après l'enregistrement, la console affiche « Cluster mis à jour » et revient sur la page de détail. La section **Pools de Nœuds** liste chaque groupe avec son type d'instance et son nombre de nœuds actifs.

Dans le cluster, observez l'arrivée des nouveaux nœuds :

```bash
export KUBECONFIG=~/Downloads/kubeconfig-<nom-du-cluster>.yaml
kubectl get nodes -w
```

**Résultat attendu :**

```console
NAME                        STATUS   ROLES    AGE   VERSION
my-cluster-general-xxxxx    Ready    <none>   10m   v1.xx.x
my-cluster-compute-yyyyy    Ready    <none>   2m    v1.xx.x
```

## Pour aller plus loin

- [Concepts](../concepts.md) : description de chaque champ d'un groupe de nœuds
- [Comment configurer l'autoscaling](./configure-autoscaling.md) : gérer le scaling automatique des groupes
