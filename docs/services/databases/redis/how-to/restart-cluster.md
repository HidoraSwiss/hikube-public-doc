---
title: "Comment redémarrer un cluster Redis"
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment redémarrer un cluster Redis

Ce guide explique comment redémarrer un cluster Redis depuis la [console Hikube](https://console.hikube.cloud), en particulier pour appliquer un changement d'authentification ou un nouveau mot de passe.

## Quand redémarrer

Certaines modifications sont enregistrées immédiatement mais n'atteignent les serveurs Redis en cours d'exécution qu'après un redémarrage du cluster :

- l'activation ou la désactivation de l'**Authentification requise** sur un cluster existant ;
- la [rotation du mot de passe](./rotate-password.md).

D'ici là, les serveurs gardent leur configuration précédente. Après l'activation de l'authentification, les connexions sans mot de passe fonctionnent encore ; après une rotation, les serveurs acceptent toujours l'ancien mot de passe et refusent le nouveau.

Tant qu'un redémarrage est en attente, la page du cluster affiche le bandeau **Redémarrage requis**, avec un bouton **Redémarrer maintenant**.

## Prérequis

- Un cluster **Redis** au statut **Prêt** dans votre projet
- Le droit de modifier ce cluster
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; l'exemple utilise `curl`

## Ce qui se passe pendant le redémarrage

Toutes les instances du cluster redémarrent en même temps, sentinelles comprises :

- le cluster est injoignable pendant environ une minute ;
- les connexions ouvertes sont coupées et vos applications doivent se reconnecter ;
- les données sont conservées.

:::warning
Planifiez le redémarrage dans une fenêtre de maintenance ou en dehors des heures de forte charge, et vérifiez que vos applications savent se reconnecter automatiquement.
:::

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir la page du cluster

1. Ouvrez **DB & Messaging** → **Redis**.
2. Ouvrez le cluster.

### 2. Lancer le redémarrage

1. Cliquez sur **Redémarrer**, à côté des boutons **Modifier** et **Supprimer**. Si le bandeau **Redémarrage requis** est affiché, son bouton **Redémarrer maintenant** fait de même.
2. La fenêtre « Redémarrer `<nom>` ? » rappelle l'effet du redémarrage. Confirmez avec **Redémarrer**.

Le message « Redémarrage lancé » confirme la prise en compte. Le redémarrage se poursuit en arrière-plan.

La console propose aussi le redémarrage au bon moment :

- après l'enregistrement d'un changement d'authentification depuis **Modifier** : confirmez avec **Redémarrer**, ou cliquez sur **Plus tard** pour le reporter ; le bandeau **Redémarrage requis** reste alors affiché ;
- dans la fenêtre qui affiche le nouveau mot de passe après une rotation, avec le bouton **Redémarrer maintenant**.

</TabItem>
<TabItem value="api" label="API">

Le redémarrage se lance en un appel, sans corps de requête :

```bash
curl -sS -X POST "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache/restart" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

La réponse `200`, un objet vide, confirme la prise en compte : l'appel n'attend pas la fin du redémarrage, qui se poursuit en arrière-plan.

Avec l'API, un redémarrage en attente se lit dans le champ `restartRequired` du cluster (`GET $HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache`) : il vaut `true` jusqu'au redémarrage de tous les serveurs.

</TabItem>
</Tabs>

:::note
Un cluster encore en cours de création n'a rien à redémarrer : la demande est refusée (avec l'API : `400`, code `120205`). Patientez quelques minutes après le passage au statut **Prêt**, le temps que le cluster finisse de démarrer, puis relancez le redémarrage.
:::

## Vérification

Le statut du cluster ne change pas pendant un redémarrage : il reste affiché **Prêt**. Le bandeau **Redémarrage requis** disparaît une fois le redémarrage pris en compte. Contrôlez ensuite que l'instance vient de redémarrer :

```bash
REDISCLI_AUTH='<mot de passe>' redis-cli -h <hôte> -p 6379 INFO server | grep uptime_in_seconds
```

Après un changement d'authentification ou de mot de passe, vérifiez aussi que la nouvelle configuration s'applique :

```bash
# Authentification activée : une connexion sans mot de passe est refusée
redis-cli -h <hôte> -p 6379 ping
# NOAUTH Authentication required.

# Nouveau mot de passe accepté
REDISCLI_AUTH='<nouveau mot de passe>' redis-cli -h <hôte> -p 6379 ping
# PONG
```

## Pour aller plus loin

- [Renouveler le mot de passe](./rotate-password.md)
- [Modifier les ressources d'un cluster](./scale-resources.md)
- [Dépannage Redis](../troubleshooting.md)
