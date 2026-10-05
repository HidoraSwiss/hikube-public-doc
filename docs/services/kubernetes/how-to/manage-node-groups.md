---
title: "Comment ajouter et modifier un groupe de nœuds"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment ajouter et modifier un groupe de nœuds

Les groupes de nœuds permettent de segmenter les nœuds de votre cluster Kubernetes selon les besoins de vos workloads. Ce guide explique comment ajouter, modifier et supprimer des groupes de nœuds depuis la console Hikube.

## Prérequis

- Un cluster Kubernetes Hikube déployé (voir le [démarrage rapide](../quick-start.md))
- Le kubeconfig du cluster téléchargé depuis la console (bouton **Kubeconfig**), pour vérifier les nœuds avec `kubectl`
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

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

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la console, ouvrez **Infrastructure** > **Kubernetes**.
2. Ouvrez le menu **Actions** du cluster et choisissez **Modifier** (ou cliquez sur **Modifier** depuis la page de détail du cluster).

La page de modification présente les sections **Informations générales**, **Groupes de nœuds** et **Extensions & Addons**, ainsi que les jauges de quota du projet.

</TabItem>
<TabItem value="api" label="API">

Les groupes de nœuds se modifient avec `PATCH /kubernetes/v1alpha1/projects/{projectId}/clusters/{name}`. Cette requête décrit la configuration **complète** du cluster :

- `version`, `controlPlane` et au moins un groupe dans `nodeGroups` sont obligatoires ;
- un groupe absent de `nodeGroups` est **supprimé** ;
- les addons sont réappliqués tels qu'envoyés : un addon absent ou à `enabled: false` est désactivé.

Partez donc de la configuration actuelle, enregistrée dans un fichier :

```bash
CLUSTER=democluster   # nom du cluster

curl -sS "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters/$CLUSTER" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq 'del(.id, .projectId, .name, .createdAt, .updatedAt, .status)' > cluster.json

jq '.nodeGroups' cluster.json
```

Chaque étape ci-dessous modifie `cluster.json` avec `jq`, puis envoie le résultat :

```bash
curl -sS -X PATCH "$HIKUBE_API/kubernetes/v1alpha1/projects/$PROJECT_ID/clusters/$CLUSTER" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @cluster-update.json
```

</TabItem>
</Tabs>

### 3. Ajouter un groupe de nœuds

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Groupes de nœuds**, cliquez sur **Ajouter un groupe de nœuds**. Une nouvelle carte s'ouvre.
2. Renseignez les champs :
   - **Nom du groupe** : par exemple `compute` (3 à 16 caractères : minuscules, chiffres et tirets) ;
   - **Taille du stockage éphémère** : par exemple 100 Go ;
   - **Nombre minimum de nœuds** et **Nombre maximum de nœuds** : par exemple 1 et 10 ;
   - **Type d'instance** : par exemple série **Universel (U)**, taille **4XLarge** (`u1.4xlarge`) ;
   - **Exposé sur internet (IP Publique)** : à activer seulement si ce groupe doit recevoir le trafic entrant (Ingress NGINX) ;
   - **GPU** : si nécessaire, voir [Ajouter des GPU](#5-ajouter-des-gpu).
3. Cliquez sur **Enregistrer**.

</TabItem>
<TabItem value="api" label="API">

Ajoutez une entrée à `nodeGroups`, la clé étant le nom du groupe :

```bash
jq '.nodeGroups.compute = {
      instanceType: "u1.4xlarge",
      storage: 100,
      minReplicas: 1,
      maxReplicas: 10,
      isExposed: false
    }' cluster.json > cluster-update.json
```

Envoyez ensuite `cluster-update.json` avec la requête `PATCH` de l'étape 2. Pour un groupe avec GPU, ajoutez `gpus` (modèles listés par `GET /gpu/v1alpha1/gpus`), avec les mêmes règles qu'à l'étape 5.

</TabItem>
</Tabs>

:::tip
Choisissez un nom descriptif pour vos groupes (`compute`, `web`, `monitoring`, `gpu`) afin de faciliter la gestion du cluster.
:::

### 4. Modifier un groupe existant

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

Dans la section **Groupes de nœuds**, dépliez la carte du groupe, modifiez les champs souhaités (type d'instance, stockage éphémère, nombre minimum ou maximum de nœuds, exposition) puis cliquez sur **Enregistrer**.

</TabItem>
<TabItem value="api" label="API">

Modifiez les champs du groupe dans le fichier, par exemple le nombre maximum de nœuds et le type d'instance :

```bash
jq '.nodeGroups.compute.maxReplicas = 20
    | .nodeGroups.compute.instanceType = "u1.8xlarge"' cluster.json > cluster-update.json
```

Envoyez ensuite `cluster-update.json` avec la requête `PATCH` de l'étape 2.

</TabItem>
</Tabs>

:::warning
Le changement de type d'instance remplace tous les nœuds du groupe : la plateforme crée les nouveaux nœuds et retire les anciens un par un, sans attendre que chaque remplaçant soit prêt. Un groupe d'un seul nœud est donc indisponible pendant le remplacement (plusieurs minutes) : prévoyez au moins deux nœuds pour les charges qui ne tolèrent pas d'interruption. Le quota du projet doit pouvoir accueillir les nœuds supplémentaires pendant le remplacement.
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

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Groupes de nœuds**, cliquez sur l'icône **Supprimer ce groupe** de la carte concernée.
2. Cliquez sur **Enregistrer**.

</TabItem>
<TabItem value="api" label="API">

Retirez le groupe du fichier : un groupe absent de `nodeGroups` est supprimé.

```bash
jq 'del(.nodeGroups.compute)' cluster.json > cluster-update.json
```

Envoyez ensuite `cluster-update.json` avec la requête `PATCH` de l'étape 2.

</TabItem>
</Tabs>

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
