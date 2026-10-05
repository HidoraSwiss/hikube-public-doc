---
title: "Comment modifier la configuration d'un cluster"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment modifier la configuration d'un cluster RabbitMQ

Ce guide explique quels paramètres d'un cluster RabbitMQ peuvent être modifiés après sa création depuis la [console Hikube](https://console.hikube.cloud), et comment procéder.

## Prérequis

- Un **cluster RabbitMQ** créé dans votre projet
- Un quota de projet suffisant si vous augmentez la taille du disque
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Paramètres modifiables

| Paramètre | Modifiable après création | Remarque |
|-----------|---------------------------|----------|
| **Version RabbitMQ** | Oui | Versions proposées : 4.2, 4.1, 4.0, 3.13 |
| **Taille du disque (Go)** | Oui | Capacité par nœud, dans la limite du quota de stockage du projet |
| **Accès externe** | Oui | Voir [Configurer l'accès externe](./configure-external-access.md) |
| **Préconfiguration (Preset)** | Non | « La préconfiguration ne peut pas être modifiée après création » |
| **Nombre de réplicas** | Non | « Le mode ne peut pas être modifié après création » |

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir le formulaire de modification

1. Dans le menu **DB & Messaging** → **RabbitMQ**, cliquez sur le cluster.
2. Cliquez sur **Modifier**. Vous pouvez aussi ouvrir le menu d'actions du cluster dans la liste et choisir **Modifier**.

La page **Modifier RabbitMQ** affiche la carte **Paramètres du cluster**. Les champs **Préconfiguration (Preset)** et **Nombre de réplicas** y sont grisés.

### 2. Ajuster les paramètres

- **Version RabbitMQ** : sélectionnez la version cible.
- **Taille du disque (Go)** : saisissez la nouvelle capacité par nœud. La taille ne peut qu'augmenter : une valeur inférieure est acceptée par le formulaire mais refusée par la plateforme, et le cluster garde sa taille actuelle.
- **Accès externe** : activez ou désactivez l'interrupteur.

:::warning Changement de version
Le changement de version recrée les nœuds RabbitMQ un par un : avec un seul réplica, le cluster est indisponible pendant le redémarrage (de l'ordre d'une à deux minutes) et les clients doivent se reconnecter. L'adresse du champ **Hôte (Host)** ne change pas. Testez le changement de version sur un cluster hors production avant de l'appliquer à un cluster de production, et vérifiez la compatibilité de vos clients avec la version cible.
:::

### 3. Enregistrer

Cliquez sur **Sauvegarder**. Le message « Cluster mis à jour » confirme que les paramètres ont été appliqués et la console revient à la page de détail.

Si le quota du projet ne permet pas la nouvelle configuration, le bouton **Sauvegarder** reste inactif.

</TabItem>
<TabItem value="api" label="API">

### 1. Lire la configuration actuelle

```bash
curl -sS "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{version, size, external, replicas, preset}'
```

### 2. Envoyer la nouvelle configuration

`PATCH /rabbitmq/v1alpha1/projects/{projectId}/clusters/{name}` exige `version` et `size`, et applique toujours `external` : un `external` omis vaut `false` et coupe l'accès externe. Le corps n'a pas de champ `preset`. Renvoyez donc `version`, `size` et `external`, avec vos modifications. Par exemple, pour passer le disque à 20 Go :

```bash
curl -sS "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{version, size: 20, external}' > rabbitmq-update.json

curl -sS -X PATCH "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @rabbitmq-update.json
```

- `version` : `v3.13`, `v4.0`, `v4.1` ou `v4.2` ;
- `size` : taille du disque de chaque nœud, en Go ; comme dans la console, elle ne peut qu'augmenter ;
- `replicas` est facultatif : laissez-le de côté. L'API refuse de passer d'un nœud unique à plusieurs nœuds, ou l'inverse.

La réponse décrit le cluster mis à jour. Le changement de version a les mêmes effets que depuis la console (voir l'avertissement de l'onglet **Console**).

</TabItem>
</Tabs>

## Changer de preset ou de nombre de réplicas

La préconfiguration et le nombre de réplicas sont fixés à la création. Deux possibilités :

- **Créer un nouveau cluster** avec la configuration voulue, recréer les vhosts et utilisateurs, puis basculer vos applications ;
- **Contacter le support** : ces options ne sont pas proposées dans la console ; [contactez le support](mailto:support@hidora.io).

## Vérification

Sur la page de détail du cluster, la section **Informations générales** affiche la **Version** et la **Taille du volume** mises à jour, et la section **Connexion** l'état de l'**Accès externe**.

## Pour aller plus loin

- [Concepts](../concepts.md) : modes de déploiement et préconfigurations
- [Gérer les vhosts et utilisateurs](./manage-vhosts-users.md)
