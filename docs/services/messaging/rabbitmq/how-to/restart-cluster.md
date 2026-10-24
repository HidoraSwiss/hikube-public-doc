---
title: "Comment redémarrer un cluster — RabbitMQ"
sidebar_label: "Comment redémarrer un cluster"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment redémarrer un cluster RabbitMQ

Ce guide explique comment redémarrer un cluster RabbitMQ depuis la [console Hikube](https://console.hikube.cloud), par exemple lorsqu'un nœud ne se comporte plus normalement.

## Prérequis

- Un **cluster RabbitMQ** au statut **Prêt** dans votre projet
- Le droit de modifier ce cluster
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; l'exemple utilise `curl`

## Ce qui se passe pendant le redémarrage

Toutes les instances du cluster redémarrent en même temps :

- le cluster est injoignable pendant quelques secondes, le temps que les nœuds redémarrent ;
- les connexions AMQP ouvertes sont coupées et vos clients doivent se reconnecter ;
- les données sont conservées : vhosts, utilisateurs, files durables et leurs messages persistants. Comme pour tout redémarrage de RabbitMQ, les files non durables et les messages non persistants ne survivent pas.

L'adresse du champ **Hôte (Host)** ne change pas.

:::warning
Planifiez le redémarrage dans une fenêtre de maintenance ou en dehors des heures de forte charge, et vérifiez que vos producteurs et consommateurs savent se reconnecter automatiquement.
:::

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir la page du cluster

Dans le menu **DB & Messaging** → **RabbitMQ**, cliquez sur le cluster.

### 2. Lancer le redémarrage

1. Cliquez sur **Redémarrer**, à côté des boutons **Modifier** et **Supprimer**.
2. La fenêtre « Redémarrer `<nom>` ? » rappelle l'effet du redémarrage. Confirmez avec **Redémarrer**.

Le message « Redémarrage lancé » confirme la prise en compte. Le redémarrage se poursuit en arrière-plan.

</TabItem>
<TabItem value="api" label="API">

Le redémarrage se lance en un appel, sans corps de requête :

```bash
curl -sS -X POST "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/restart" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

La réponse `200`, un objet vide, confirme la prise en compte : l'appel n'attend pas la fin du redémarrage, qui se poursuit en arrière-plan.

</TabItem>
</Tabs>

:::note
Un cluster encore en cours de création n'a rien à redémarrer : la demande est refusée (avec l'API : `400`, code `140205`). Patientez quelques minutes après le passage au statut **Prêt**, le temps que le cluster finisse de démarrer, puis relancez le redémarrage.
:::

## Vérification

Le statut du cluster ne change pas pendant un redémarrage : il reste affiché **Prêt**. Vérifiez dans les journaux de vos applications que leurs connexions ont été rétablies et que la consommation des messages a repris.

## Pour aller plus loin

- [Concepts](../concepts.md) : quorum queues et haute disponibilité
- [Modifier la configuration d'un cluster](./scale-resources.md)
