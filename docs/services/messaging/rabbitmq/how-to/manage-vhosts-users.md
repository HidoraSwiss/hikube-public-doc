---
title: "Comment gérer les vhosts et utilisateurs"
---

# Comment gérer les vhosts et utilisateurs

Ce guide explique comment ajouter et supprimer des virtual hosts (vhosts), créer des utilisateurs RabbitMQ, gérer leurs droits par vhost et renouveler leur mot de passe depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Un **cluster RabbitMQ** créé dans votre projet (voir le [démarrage rapide](../quick-start.md))
- Accès à la page de détail du cluster : menu **DB & Messaging** → **RabbitMQ**, puis clic sur le cluster

## Ajouter un vhost

1. Sur la page du cluster, dans la section **VHosts**, cliquez sur **Ajouter un VHost**.
2. Dans la fenêtre **Créer un VHost**, saisissez le **Nom du VHost** (lettres, chiffres, `_`, `.` et `-`, par exemple `production`).
3. Cliquez sur **Créer**. Le message « VHost créé » confirme l'opération et le vhost apparaît dans la liste.

## Supprimer un vhost

1. Dans la section **VHosts**, ouvrez le menu d'actions du vhost.
2. Choisissez **Supprimer le VHost**.
3. Saisissez le nom exact du vhost pour confirmer, puis cliquez sur **Supprimer définitivement**.

:::warning
La suppression d'un vhost supprime ses exchanges, queues et messages. Le vhost par défaut `/`, s'il est présent, ne peut pas être supprimé.
:::

## Créer un utilisateur

1. Dans la section **Utilisateurs**, cliquez sur **Créer un utilisateur**.
2. Saisissez le **Nom d'utilisateur** (lettres, chiffres, `_`, `.` et `-`).
3. Dans **Accès spécifiques (VHosts)**, cliquez sur **Ajouter** pour chaque vhost auquel l'utilisateur doit accéder, puis choisissez :
   - le **Nom du VHost** dans la liste ;
   - les **Droits** : **Administrateur (Admin)** ou **Lecture seule (Read-only)**.
4. Cliquez sur **Créer l'utilisateur**.

La console affiche le mot de passe généré pour l'utilisateur.

:::warning Mot de passe affiché une seule fois
Copiez le mot de passe immédiatement : il ne sera plus affiché après avoir quitté cet écran. Cliquez ensuite sur **Terminer**.
:::

:::tip
Créez un utilisateur par application, avec le droit **Lecture seule** pour les applications qui ne font que consommer des messages. Cela limite l'impact d'une fuite d'identifiants.
:::

## Modifier les droits d'un utilisateur

1. Dans la section **Utilisateurs**, ouvrez le menu d'actions de l'utilisateur et choisissez **Gérer les accès**.
2. La page **Modifier l'utilisateur** liste ses accès par vhost. Le **Nom d'utilisateur** ne peut pas être modifié.
3. Ajoutez un accès avec **Ajouter**, changez les **Droits** d'un vhost, ou retirez un accès avec l'icône de suppression de la ligne.
4. Cliquez sur **Enregistrer**.

Le mot de passe de l'utilisateur n'est pas modifié par cette opération.

## Renouveler le mot de passe d'un utilisateur

1. Dans le menu d'actions de l'utilisateur, choisissez **Changer le mot de passe**.
2. La fenêtre **Rotation du mot de passe** demande confirmation. Cliquez sur **Effectuer la rotation**.
3. Copiez le nouveau mot de passe affiché, puis cliquez sur **Terminer**.

:::warning
L'ancien mot de passe est révoqué immédiatement. Mettez à jour sans attendre les applications qui utilisent ce compte, sinon leurs connexions seront refusées.
:::

## Supprimer un utilisateur

1. Dans le menu d'actions de l'utilisateur, choisissez **Supprimer l'utilisateur**.
2. Saisissez le nom exact de l'utilisateur pour confirmer, puis cliquez sur **Supprimer définitivement**.

Ses droits sur tous les vhosts sont retirés en même temps.

## Vérification

- La section **VHosts** liste tous les vhosts du cluster.
- La colonne **VHosts** du tableau **Utilisateurs** affiche, pour chaque utilisateur, ses vhosts et le droit associé.
- Un test de connexion avec un client AMQP (voir l'étape 5 du [démarrage rapide](../quick-start.md)) confirme que l'utilisateur accède au vhost attendu.

## Pour aller plus loin

- [Concepts](../concepts.md) : vhosts, utilisateurs et droits
- [Modifier la configuration d'un cluster](./scale-resources.md)
- [Configurer l'accès externe](./configure-external-access.md)
