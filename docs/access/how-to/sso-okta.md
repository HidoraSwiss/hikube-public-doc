---
sidebar_position: 10
title: "Comment configurer Okta pour le SSO"
description: "Préparer une application Okta pour la connexion SSO de votre organisation Hikube : intégration OIDC, assignations, URL de découverte et claim groups pour les rangs."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurer Okta

:::tip Fournisseur vérifié
Hikube a vérifié cette configuration sur une organisation Okta de test :
connexions complètes, claim `groups`, role bindings et changement
d'application.
:::

Cette page décrit la partie Okta. Lisez d'abord
[Démarrage rapide](../quick-start.md), puis revenez à
[Créer la connexion SSO](./configure-sso-connection.md) pour la partie Hikube.

## 1. Créer l'application

1. Dans l'Admin Console d'Okta, ouvrez **Applications → Create App
   Integration**.
2. Choisissez **OIDC - OpenID Connect**, puis **Web Application**.
3. **Sign-in redirect URIs** : collez l'URI de redirection affichée par la
   console Hikube.
4. **Grant type** : **Authorization Code**.
5. **Client authentication** : **Client secret**. Vous pouvez cocher
   **Require PKCE as additional verification**.
6. Enregistrez, puis copiez le **Client ID** et le **Client secret**.

## 2. Assigner les personnes

Dans **Assignments**, assignez seulement les personnes ou les groupes qui ont
besoin de Hikube. Une personne assignée uniquement par un groupe ne peut plus se
connecter une fois retirée de ce groupe.

## 3. Trouver l'URL de découverte

| Serveur d'autorisation | URL de découverte |
|---|---|
| Serveur personnalisé `default` | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` |
| Autre serveur personnalisé | `https://acme.okta.com/oauth2/<id du serveur>/.well-known/openid-configuration` |
| Serveur de l'organisation Okta | `https://acme.okta.com/.well-known/openid-configuration` |

Avec un domaine personnalisé, remplacez `acme.okta.com` par ce domaine.

## 4. Ajouter le claim `groups` (facultatif)

Faites-le seulement si Okta doit décider des rangs dans Hikube (voir
[Donner les rangs depuis votre fournisseur](./sso-role-bindings.md)).

1. Ouvrez **Security → API → Authorization Servers**, puis le serveur choisi à
   l'étape 3 et l'onglet **Claims**.
2. Ajoutez un claim nommé `groups` :
   - inclus dans l'**ID Token**, **Always** (pas seulement pour un scope) ;
   - **Value type** : **Groups** ;
   - un filtre, au plus 100 groupes. Par exemple **Starts with** `hikube-`,
     si vos groupes Hikube partagent ce préfixe.
3. Dans Hikube, saisissez `groups` dans **Claim des rôles**.

Ajoutez le claim au serveur d'autorisation, pas à l'application. Un claim du
serveur s'applique à toutes les applications qui l'utilisent.

## Récapitulatif

| | Okta |
|---|---|
| Adresse e-mail, prénom et nom | Claims standard des scopes `email` et `profile` |
| `email_verified` | Envoyé |
| **Confirmer l'adresse par un lien** désactivable | Oui |
| Claim des rôles | `groups` |
| PKCE | Pris en charge |

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Donner les rangs depuis votre fournisseur", href: "../sso-role-bindings"},
    {label: "Microsoft Entra ID", href: "../sso-entra-id"},
  ]}
/>
