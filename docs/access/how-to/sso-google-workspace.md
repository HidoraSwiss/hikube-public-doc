---
sidebar_position: 12
title: "Comment configurer Google Workspace pour le SSO"
description: "Préparer un client OAuth Google Workspace pour la connexion SSO de votre organisation Hikube : écran de consentement interne, URI de redirection et domaine principal."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurer Google Workspace

:::caution Non vérifié
Cette page suit la documentation de Google. Hikube ne l'a pas encore vérifiée
sur un Workspace réel. Point ouvert : le comportement pour une personne d'un
domaine secondaire du Workspace. Contactez le support avant de la mettre en
production.
:::

Cette page décrit la partie Google. Lisez d'abord
[Démarrage rapide](../quick-start.md), puis revenez à
[Créer la connexion SSO](./configure-sso-connection.md) pour la partie Hikube.

## 1. Restreindre l'application à votre Workspace

1. Dans la console Google Cloud de votre Workspace, ouvrez **APIs & Services →
   OAuth consent screen**.
2. **User type** : **Internal**. Seuls les comptes de votre Workspace peuvent
   alors utiliser l'application.

## 2. Créer le client OAuth

1. Ouvrez **Credentials → Create credentials → OAuth client ID**.
2. **Application type** : **Web application**.
3. **Authorized redirect URIs** : l'URI de redirection affichée par la console
   Hikube.
4. Copiez le **Client ID** et le **Client secret**.

## 3. Préparer la connexion dans Hikube

- **URL de découverte** :
  `https://accounts.google.com/.well-known/openid-configuration`.
- **Domaines autorisés** : exactement un domaine, le domaine principal de votre
  Workspace (par exemple `acme.com`). Il doit être vérifié dans Hikube.
- **Claim des rôles** : laissez-le vide. Le jeton d'identité de Google ne porte
  pas de groupes. Les rangs se donnent dans Hikube.

Les comptes Google personnels et les autres Workspaces sont refusés.

## Récapitulatif

| | Google Workspace |
|---|---|
| Domaines | Exactement un : le domaine principal du Workspace, vérifié dans Hikube |
| Adresse e-mail, prénom et nom | Claims standard des scopes `email` et `profile` |
| `email_verified` | Envoyé |
| **Confirmer l'adresse par un lien** désactivable | Oui |
| Claim des rôles | Aucun : donnez les rangs dans Hikube |
| PKCE | Pris en charge |

:::warning Pas de changement de type
Une connexion Google ne peut pas devenir une connexion vers un autre
fournisseur, ni l'inverse. Supprimez la connexion et créez-en une nouvelle.
:::

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Gérer les membres", href: "../manage-members"},
  ]}
/>
