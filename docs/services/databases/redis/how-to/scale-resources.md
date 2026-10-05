---
title: "Comment modifier les ressources d'un cluster Redis"
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment modifier les ressources d'un cluster Redis

Ce guide explique comment ajuster un cluster Redis existant depuis la [console Hikube](https://console.hikube.cloud) : préconfiguration (CPU et mémoire), taille du volume, version, accès externe et authentification.

## Prérequis

- Un cluster **Redis** existant dans votre projet
- Des quotas de projet suffisants pour la nouvelle configuration
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Ce qui est modifiable

| Paramètre | Modifiable après création |
|-----------|---------------------------|
| **Version Redis** | Oui |
| **Préconfiguration** | Oui |
| **Taille du volume (Go)** | Oui |
| **Accès externe** | Oui |
| **Authentification requise** | Oui |
| **Nombre de réplicas** | Non, « Le mode ne peut pas être modifié après création » |

Pour changer le nombre de réplicas, [contactez le support](mailto:support@hidora.io).

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir le formulaire de modification

1. Ouvrez **DB & Messaging** → **Redis**.
2. Ouvrez le cluster, puis cliquez sur **Modifier** (ou utilisez **Actions** → **Modifier** dans la liste).

La page **Modifier le cluster** affiche la carte **Paramètres du cluster** et l'impact sur les quotas du projet.

### 2. Ajuster les paramètres

- **Préconfiguration** : choisissez un preset supérieur si la mémoire est saturée. La mémoire du preset borne le volume de données que Redis peut garder en mémoire.
- **Taille du volume (Go)** : « La taille de stockage allouée à chaque nœud du cluster ».
- **Version Redis** : `8 (Latest)` ou `7`.
- **Accès externe** : « Autoriser l'accès au cluster depuis l'extérieur du réseau privé ».
- **Authentification requise** : « Activer la protection par mot de passe ».

### 3. Enregistrer

Cliquez sur **Enregistrer les modifications**. Le message « Modifications enregistrées » confirme la prise en compte.

:::warning
Désactiver l'authentification sur un cluster exposé au réseau public rend vos données accessibles à quiconque connaît l'adresse. Conservez l'authentification activée.
:::

</TabItem>
<TabItem value="api" label="API">

### 1. Lire la configuration actuelle

```bash
curl -sS "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{version, preset, size, replicas, external, authEnabled}'
```

### 2. Envoyer la nouvelle configuration

`PATCH /redis/v1alpha1/projects/{projectId}/clusters/{name}` exige `version`, `preset` et `size`, et applique toujours `external` et `authEnabled` : un booléen omis vaut `false`, ce qui couperait l'accès externe ou l'authentification. Renvoyez donc la configuration complète, avec vos modifications. Par exemple, pour passer en `medium` avec un volume de 20 Go :

```bash
curl -sS "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
| jq '{version, preset: "medium", size: 20, external, authEnabled}' > redis-update.json

curl -sS -X PATCH "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d @redis-update.json
```

- `version` : `v7` ou `v8` ;
- `preset` : `nano`, `micro`, `small`, `medium`, `large`, `xlarge` ou `2xlarge` (`GET /redis/v1alpha1/presets`) ;
- `size` : taille du volume de chaque nœud, en Go ;
- `replicas` est facultatif : laissez-le de côté. L'API refuse de passer d'un nœud unique au mode cluster, ou l'inverse.

La réponse décrit le cluster mis à jour.

:::warning
Désactiver l'authentification sur un cluster exposé au réseau public rend vos données accessibles à quiconque connaît l'adresse. Conservez `"authEnabled": true`.
:::

</TabItem>
</Tabs>

## Vérification

- La page du cluster, section **Général**, affiche la nouvelle **Version** et la nouvelle **Taille**.
- Depuis un client, contrôlez la mémoire disponible :

```bash
redis-cli -h <hôte> -p 6379 INFO memory | grep -E 'used_memory_human|maxmemory_human'
```

## Pour aller plus loin

- [Configurer la haute disponibilité](./configure-ha.md)
- [Renouveler le mot de passe](./rotate-password.md)
