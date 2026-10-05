---
title: "Comment renouveler le mot de passe Redis"
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment renouveler le mot de passe Redis

Ce guide explique comment générer un nouveau mot de passe pour un cluster Redis depuis la [console Hikube](https://console.hikube.cloud), par exemple après la perte du mot de passe initial ou dans le cadre d'une rotation périodique.

## Prérequis

- Un cluster **Redis** avec l'authentification activée
- La liste des applications qui utilisent ce cluster, pour les mettre à jour juste après la rotation
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

:::warning
La rotation révoque immédiatement le mot de passe actuel. Les applications qui l'utilisent encore perdent l'accès jusqu'à leur mise à jour.
:::

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir la section Sécurité

Ouvrez **DB & Messaging** → **Redis**, puis le cluster concerné. La section **Sécurité** indique : « Générez un nouveau mot de passe global pour ce cluster. Cette action révoquera le mot de passe actuel. »

### 2. Lancer la rotation

1. Cliquez sur **Effectuer une rotation**.
2. Dans la fenêtre **Rotation du mot de passe**, confirmez avec **Effectuer la rotation**.

### 3. Copier le nouveau mot de passe

La fenêtre **Mot de passe généré** affiche le nouveau mot de passe. Copiez-le dans votre gestionnaire de mots de passe : il ne sera plus affiché après la fermeture de la fenêtre. Cliquez sur **Terminer**.

</TabItem>
<TabItem value="api" label="API">

Les étapes 1 à 3 se font en un appel, sans corps de requête :

```bash
curl -sS -X POST "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

Le champ `password` de la réponse contient le nouveau mot de passe. Il n'est renvoyé qu'ici : enregistrez-le aussitôt dans votre gestionnaire de secrets.

</TabItem>
</Tabs>

### 4. Mettre à jour vos applications

Remplacez l'ancien mot de passe dans la configuration de vos applications (variables d'environnement, secrets Kubernetes de vos clusters, fichiers de configuration), puis redémarrez-les si elles ne relisent pas la configuration à chaud.

## Vérification

```bash
REDISCLI_AUTH='<nouveau mot de passe>' redis-cli -h <hôte> -p 6379 ping
# PONG
```

## Pour aller plus loin

- [Concepts Redis](../concepts.md) : authentification
- [Dépannage Redis](../troubleshooting.md)
