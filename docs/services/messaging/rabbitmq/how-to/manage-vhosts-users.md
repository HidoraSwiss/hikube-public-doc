---
title: "Comment gérer les vhosts et utilisateurs"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment gérer les vhosts et utilisateurs

Ce guide explique comment ajouter et supprimer des virtual hosts (vhosts), créer des utilisateurs RabbitMQ, gérer leurs droits par vhost et renouveler leur mot de passe depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un **cluster RabbitMQ** créé dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Accès à la page de détail du cluster : menu **DB & Messaging** → **RabbitMQ**, puis clic sur le cluster
- Pour l'onglet **API** : une clé d'API `admin` du projet et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`

## Ajouter un vhost

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Sur la page du cluster, dans la section **VHosts**, cliquez sur **Ajouter un VHost**.
2. Dans la fenêtre **Créer un VHost**, saisissez le **Nom du VHost** (lettres, chiffres, `_`, `.` et `-`, par exemple `production`).
3. Cliquez sur **Créer**. Le message « VHost créé » confirme l'opération et le vhost apparaît dans la liste.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/vhosts" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"vhostName": "production"}'
```

`vhostName` accepte jusqu'à 255 caractères, mais seulement des minuscules, des chiffres et des tirets.

</TabItem>
</Tabs>

## Supprimer un vhost

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **VHosts**, ouvrez le menu d'actions du vhost.
2. Choisissez **Supprimer le VHost**.
3. Saisissez le nom exact du vhost pour confirmer, puis cliquez sur **Supprimer définitivement**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/vhosts/production" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

L'API ne demande pas de confirmation.

</TabItem>
</Tabs>

:::warning
La suppression d'un vhost supprime ses exchanges, queues et messages. Le vhost par défaut `/`, s'il est présent, ne peut pas être supprimé.
:::

## Créer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Utilisateurs**, cliquez sur **Créer un utilisateur**.
2. Saisissez le **Nom d'utilisateur** (lettres, chiffres, `_`, `.` et `-`).
3. Dans **Accès spécifiques (VHosts)**, cliquez sur **Ajouter** pour chaque vhost auquel l'utilisateur doit accéder, puis choisissez :
   - le **Nom du VHost** dans la liste ;
   - les **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
4. Cliquez sur **Créer l'utilisateur**.

</TabItem>
<TabItem value="api" label="API">

Les droits sont une table « nom du vhost → rôle », avec le rôle `admin` (**Administrateur**) ou `readonly` (**Lecture seule**) :

```bash
curl -sS -X POST "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "consumer",
    "config": {
      "vhosts": {
        "production": {"role": "readonly"},
        "demo": {"role": "admin"}
      }
    }
  }' | jq '{username, password}'
```

`username` accepte jusqu'à 63 caractères : minuscules, chiffres et tirets. La réponse contient le champ `password`, renvoyé une seule fois.

</TabItem>
</Tabs>

La console affiche le mot de passe généré pour l'utilisateur.

:::warning Mot de passe affiché une seule fois
Copiez le mot de passe immédiatement : il ne sera plus affiché après avoir quitté cet écran. Cliquez ensuite sur **Terminer**.
:::

:::tip
Créez un utilisateur par application, avec le droit **Lecture seule** pour les applications qui ne font que consommer des messages. Cela limite l'impact d'une fuite d'identifiants.
:::

## Modifier les droits d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Utilisateurs**, ouvrez le menu d'actions de l'utilisateur et choisissez **Gérer les accès**.
2. La page **Modifier l'utilisateur** liste ses accès par vhost. Le **Nom d'utilisateur** ne peut pas être modifié.
3. Ajoutez un accès avec **Ajouter**, changez les **Droits** d'un vhost, ou retirez un accès avec l'icône de suppression de la ligne.
4. Cliquez sur **Enregistrer**.

Le mot de passe de l'utilisateur n'est pas modifié par cette opération.

</TabItem>
<TabItem value="api" label="API">

`PATCH .../users/{username}` remplace l'ensemble des droits de l'utilisateur : les vhosts absents de `config.vhosts` lui sont retirés. Envoyez donc la liste complète des accès voulus :

```bash
curl -sS -X PATCH "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/users/consumer" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "config": {
      "vhosts": {
        "production": {"role": "admin"}
      }
    }
  }'
```

Pour consulter les droits actuels :

```bash
curl -sS "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/users/consumer" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.config.vhosts'
```

Le mot de passe de l'utilisateur n'est pas modifié par cette opération.

</TabItem>
</Tabs>

## Renouveler le mot de passe d'un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans le menu d'actions de l'utilisateur, choisissez **Changer le mot de passe**.
2. La fenêtre **Rotation du mot de passe** demande confirmation. Cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe affiché, puis cliquez sur **Terminer**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X POST "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/users/consumer/rotate-password" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq -r '.password'
```

La requête n'a pas de corps. Le champ `password` de la réponse contient le nouveau mot de passe, renvoyé une seule fois.

</TabItem>
</Tabs>

:::warning
L'ancien mot de passe est révoqué immédiatement. Mettez à jour sans attendre les applications qui utilisent ce compte, sinon leurs connexions seront refusées.
:::

## Supprimer un utilisateur

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans le menu d'actions de l'utilisateur, choisissez **Supprimer l'utilisateur**.
2. Saisissez le nom exact de l'utilisateur pour confirmer, puis cliquez sur **Supprimer définitivement**.

Ses droits sur tous les vhosts sont retirés en même temps.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X DELETE "$HIKUBE_API/rabbitmq/v1alpha1/projects/$PROJECT_ID/clusters/rabbitdemo/users/consumer" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Ses droits sur tous les vhosts sont retirés en même temps.

</TabItem>
</Tabs>

## Vérification

- La section **VHosts** liste tous les vhosts du cluster.
- La colonne **VHosts** du tableau **Utilisateurs** affiche, pour chaque utilisateur, ses vhosts et le droit associé.
- Un test de connexion avec un client AMQP (voir l'étape 5 du [démarrage rapide](../quick-start.md)) confirme que l'utilisateur accède au vhost attendu.

## Pour aller plus loin

- [Concepts](../concepts.md) : vhosts, utilisateurs et droits
- [Modifier la configuration d'un cluster](./scale-resources.md)
- [Configurer l'accès externe](./configure-external-access.md)
