---
sidebar_position: 8
title: Gérer la connexion SSO
description: "Modifier, désactiver, remplacer le fournisseur ou supprimer la connexion SSO de votre organisation Hikube, et n'admettre que les personnes invitées."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gérer la connexion SSO

Toutes ces actions se font dans **Membres de l'organisation**, onglet
**Connexion SSO**, avec le rang **Super-administration**.

## Modifier les réglages

1. Cliquez sur **Modifier les réglages**.
2. Changez les champs voulus, puis cliquez sur **Enregistrer**.

Pour changer seulement le secret, saisissez le nouveau dans **Secret du
client**. Laissé vide, le secret actuel est gardé. Remplacez le secret avant
son expiration chez votre fournisseur : un secret expiré bloque toutes les
connexions SSO.

Ajouter un domaine aux **Domaines autorisés** contrôle à nouveau son
enregistrement DNS.

## Invitation requise

Avec **Invitation requise**, une première connexion ne crée aucun compte. Seules
les personnes que vous invitez se connectent.

Pour admettre quelqu'un, [invitez-le](../invitations.md) comme d'habitude :

- pour une adresse d'un domaine autorisé, Hikube crée tout de suite son compte
  SSO, avec les rangs invités, **sans envoyer d'e-mail**. Dites à la personne
  de se connecter par votre fournisseur ;
- à sa première connexion, la personne reçoit un lien à son adresse. Une fois
  le lien ouvert, le compte est à elle et l'invitation apparaît acceptée ;
- le compte compte dans votre limite de membres dès l'invitation ;
- une invitation qui expire, ou que vous annulez avant la première connexion,
  supprime le compte créé. La renvoyer garde le compte ;
- une personne non invitée voit qu'aucun compte n'existe pour son adresse ;
- une adresse qui a déjà un compte est invitée comme d'habitude.

Avec un claim des rôles, les rangs viennent du fournisseur à la connexion, pas
de l'invitation. Activer ou désactiver l'option ne change aucun compte.

## Désactiver et réactiver

1. Cliquez sur **Désactiver**, puis confirmez **Désactiver**.

Plus personne ne se connecte par votre fournisseur. Les comptes SSO et leurs
accès sont gardés. Ils peuvent se reconnecter dès que vous cliquez sur
**Activer**.

:::note Domaine retiré
Un domaine nommé dans les **Domaines autorisés** ne peut pas être retiré :
retirez-le d'abord de la connexion. Si la connexion ne sert plus aucun domaine,
elle est désactivée. Pour la réactiver, choisissez à nouveau ses domaines
autorisés.
:::

## Remplacer le fournisseur

Changez d'application ou de fournisseur sans perdre les comptes.

1. Chez le nouveau fournisseur, configurez l'application comme la première :
   même URI de redirection, mêmes assignations, même claim des rôles.
2. Dans Hikube, cliquez sur **Remplacer le fournisseur**.
3. Saisissez la nouvelle **URL de découverte**, le **Client id** et le
   **Secret du client**, puis cliquez sur **Remplacer**.

Sont gardés : l'identifiant de la connexion, son URI de redirection, ses
réglages, les comptes SSO et leurs accès.

À leur prochaine connexion, les comptes SSO se relient au nouveau fournisseur
après avoir ouvert le lien envoyé à leur adresse. Un compte qui a gardé un mot
de passe se relie en saisissant ce mot de passe. Les comptes SSO dont l'adresse
n'était pas encore confirmée sont supprimés.

:::warning Google Workspace
Une connexion Google ne peut pas passer à un autre fournisseur, ni l'inverse.
Supprimez la connexion et créez-en une nouvelle.
:::

## Supprimer la connexion

:::danger Comptes supprimés
Supprimer la connexion supprime les comptes SSO qu'elle a créés, et les comptes
confiés à l'organisation qui se connectaient par elle. Leur accès prend fin
partout sous 5 minutes. Pour changer de fournisseur sans perdre les comptes,
remplacez le fournisseur.
:::

1. Cliquez sur **Supprimer**.
2. La boîte **Supprimer la connexion SSO ?** donne le nombre de comptes SSO
   supprimés.
3. Cochez **Je comprends que … compte(s) sera/seront supprimé(s).**
4. Cliquez sur **Supprimer**.

Un compte qui a gardé un mot de passe n'est que délié de la connexion. Il
continue de se connecter avec son mot de passe et son second facteur.

<NavigationFooter
  seeAlso={[
    {label: "Sécurité et retrait des accès", href: "../security"},
    {label: "Inviter des personnes", href: "../../invitations"},
    {label: "Vérifier un domaine", href: "../../domains"},
  ]}
/>
