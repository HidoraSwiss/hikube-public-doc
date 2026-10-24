---
title: "Comment redémarrer un cluster — MariaDB"
sidebar_label: "Comment redémarrer un cluster"
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment redémarrer un cluster

Ce guide explique comment redémarrer un cluster MariaDB depuis la [console Hikube](https://console.hikube.cloud), par exemple lorsqu'une instance ne se comporte plus normalement.

## Prérequis

- Un cluster **MariaDB** au statut **Prêt** dans votre projet
- Le droit de modifier ce cluster
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; l'exemple utilise `curl`

## Ce qui se passe pendant le redémarrage

Toutes les instances du cluster redémarrent en même temps :

- le cluster est injoignable pendant quelques secondes, le temps que les instances redémarrent ;
- les connexions ouvertes sont coupées et vos applications doivent se reconnecter ;
- les données sont conservées.

:::warning
Planifiez le redémarrage dans une fenêtre de maintenance ou en dehors des heures de forte charge, et vérifiez que vos applications savent se reconnecter automatiquement.
:::

## Étapes

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

### 1. Ouvrir la page du cluster

1. Ouvrez **DB & Messaging** → **MariaDB**.
2. Ouvrez le cluster.

### 2. Lancer le redémarrage

1. Cliquez sur **Redémarrer**, à côté des boutons **Modifier** et **Supprimer**.
2. La fenêtre « Redémarrer `<nom>` ? » rappelle l'effet du redémarrage. Confirmez avec **Redémarrer**.

Le message « Redémarrage lancé » confirme la prise en compte. Le redémarrage se poursuit en arrière-plan.

</TabItem>
<TabItem value="api" label="API">

Le redémarrage se lance en un appel, sans corps de requête :

```bash
curl -sS -X POST "$HIKUBE_API/mariadb/v1alpha1/projects/$PROJECT_ID/clusters/demomariadb/restart" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

La réponse `200`, un objet vide, confirme la prise en compte : l'appel n'attend pas la fin du redémarrage, qui se poursuit en arrière-plan.

</TabItem>
</Tabs>

:::note
Un cluster encore en cours de création n'a rien à redémarrer : la demande est refusée (avec l'API : `400`, code `110205`). Patientez quelques minutes après le passage au statut **Prêt**, le temps que le cluster finisse de démarrer, puis relancez le redémarrage.
:::

## Vérification

Le statut du cluster ne change pas pendant un redémarrage : il reste affiché **Prêt**. Pour confirmer le redémarrage, contrôlez depuis combien de secondes l'instance tourne :

```bash
mysql -h <hôte> -P 3306 -u <utilisateur> -p -e "SHOW GLOBAL STATUS LIKE 'Uptime';"
```

Une valeur faible confirme que l'instance vient de redémarrer.

## Pour aller plus loin

- [Concepts MariaDB](../concepts.md) : réplication et haute disponibilité
- [Modifier les ressources d'un cluster](./scale-resources.md)
