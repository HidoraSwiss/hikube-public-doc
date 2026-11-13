---
sidebar_position: 11
title: "Comment configurer Microsoft Entra ID pour le SSO"
description: "Préparer une application Microsoft Entra ID pour la connexion SSO de votre organisation Hikube : inscription mono-locataire, claims, rôles d'application et assignation obligatoire."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurer Microsoft Entra ID

:::tip Fournisseur vérifié
Hikube a vérifié cette configuration sur un locataire Entra ID de test : connexions complètes avec rôles d'application et role bindings, refus d'une personne non assignée, refus de l'URL `/common`. Le claim `groups` n'a pas été vérifié : préférez les rôles d'application.
:::

Cette page décrit la partie Entra ID. Lisez d'abord [Démarrage rapide](../quick-start.md), puis revenez à [Créer la connexion SSO](./configure-sso-connection.md) pour la partie Hikube.

## 1. Inscrire l'application

1. Ouvrez **App registrations → New registration**.
2. **Supported account types** : **Accounts in this organizational directory only** (un seul locataire).
3. **Redirect URI** : plateforme **Web**, puis l'URI de redirection affichée par la console Hikube.

## 2. Créer le secret

1. Ouvrez **Certificates & secrets → New client secret**.
2. Copiez la valeur du secret et l'**Application (client) ID**.
3. Notez la date d'expiration du secret. Remplacez-le dans Hikube avant cette date, sinon plus personne ne pourra se connecter par la connexion SSO.

## 3. Ajouter les claims au jeton d'identité

1. Ouvrez **Token configuration → Add optional claim**, type **ID**.
2. Cochez `email`, `given_name` et `family_name`.

Entra ID n'envoie `email` que pour les personnes dont l'attribut de messagerie est renseigné. Sans adresse, la connexion est refusée.

## 4. Donner le consentement

1. Ouvrez **API permissions**.
2. Ajoutez les permissions déléguées Microsoft Graph `openid`, `email` et `profile`.
3. Cliquez sur **Grant admin consent**.

Sans ce consentement, chaque personne doit consentir à sa première connexion.

## 5. Créer les rôles d'application (facultatif)

Faites-le seulement si Entra ID doit décider des rangs dans Hikube (voir [Donner les rangs depuis votre fournisseur](./sso-role-bindings.md)).

1. Ouvrez **App roles → Create app role** et créez un rôle par niveau d'accès, par exemple `hikube-admins` et `hikube-devs`. **Allowed member types** : **Users/Groups**.
2. Dans **Enterprise applications → Users and groups**, assignez à chaque personne ou groupe son rôle.
3. Dans Hikube, saisissez `roles` dans **Claim des rôles**. La valeur à lier est la **Value** du rôle.

Dès que l'application a des rôles, chaque assignation en demande un : Entra ID ne propose plus de rôle « Default Access ». Pour laisser entrer quelqu'un sans rang, donnez-lui un rôle qu'aucun role binding ne nomme.

## 6. Restreindre l'accès

1. Dans **Enterprise applications**, ouvrez l'application.
2. Passez **Assignment required** à **Yes**.
3. Assignez les personnes ou les groupes qui ont besoin de Hikube.

Une personne non assignée est arrêtée par Entra ID (erreur `AADSTS50105`). Elle n'obtient pas de compte Hikube.

## URL de découverte

```text
https://login.microsoftonline.com/<id du locataire>/v2.0/.well-known/openid-configuration
```

Utilisez l'identifiant de votre locataire. Les URL `/common` et `/organizations` sont refusées : leur émetteur n'est pas votre locataire.

## Invités du locataire

Un invité de votre locataire (compte Microsoft personnel ou compte d'une autre entreprise) se connecte avec sa propre adresse. Cette adresse n'est pas sur vos domaines vérifiés : Hikube la refuse.

## Récapitulatif

| | Microsoft Entra ID |
|---|---|
| Adresse e-mail, prénom et nom | Claims facultatifs à ajouter au jeton d'identité |
| `email_verified` | Non envoyé |
| **Confirmer l'adresse par un lien** désactivable | Non : laissez l'option activée |
| Claim des rôles | `roles` (rôles d'application, recommandé). Ou `groups` : identifiants d'objets des groupes, omis au-delà de 200 groupes |
| PKCE | Pris en charge |

:::warning Claim `groups` et plus de 200 groupes
Une personne membre de plus de 200 groupes ne reçoit aucun claim `groups`. Elle se connecte alors sans aucun rang. Préférez les rôles d'application.
:::

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Donner les rangs depuis votre fournisseur", href: "../sso-role-bindings"},
    {label: "Okta", href: "../sso-okta"},
  ]}
/>
