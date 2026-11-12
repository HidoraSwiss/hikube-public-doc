---
sidebar_position: 13
title: "Comment configurer Auth0 pour le SSO"
description: "Préparer une application Auth0 pour la connexion SSO de votre organisation Hikube : Regular Web Application, inscriptions fermées et claim des rôles écrit par une Action."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurer Auth0

:::caution Non vérifié
Cette page suit la documentation d'Auth0. Hikube ne l'a pas vérifiée sur un locataire Auth0 de test. Contactez le support avant de la mettre en production.
:::

Cette page décrit la partie Auth0. Lisez d'abord [Démarrage rapide](../quick-start.md), puis revenez à [Créer la connexion SSO](./configure-sso-connection.md) pour la partie Hikube.

## 1. Créer l'application

1. Ouvrez **Applications → Create Application → Regular Web Application**.
2. **Allowed Callback URLs** : l'URI de redirection affichée par la console Hikube.
3. **Token Endpoint Authentication Method** : une méthode par secret client.
4. Copiez le **Client ID** et le **Client Secret**.

## 2. Fermer les inscriptions

Désactivez les inscriptions (**sign-ups**) sur la connexion de base de données que l'application utilise. Seules les personnes que vous avez créées peuvent alors se connecter.

## 3. Écrire le claim des rôles (facultatif)

Faites-le seulement si Auth0 doit décider des rangs dans Hikube (voir [Donner les rangs depuis votre fournisseur](./sso-role-bindings.md)).

Écrivez les rôles dans le jeton d'identité par une Action **post-login**. Les noms `roles` et `groups` sont réservés par Auth0 : utilisez un nom avec espace de noms, par exemple `https://acme.com/roles`.

Dans Hikube, un point à l'intérieur d'un nom de claim s'écrit `\.`. Saisissez donc `https://acme\.com/roles` dans **Claim des rôles**.

## URL de découverte

```text
https://acme.eu.auth0.com/.well-known/openid-configuration
```

Remplacez `acme.eu` par votre locataire et sa région, ou utilisez votre domaine personnalisé.

## Récapitulatif

| | Auth0 |
|---|---|
| Adresse e-mail, prénom et nom | Claims standard des scopes `email` et `profile` |
| `email_verified` | Envoyé |
| **Confirmer l'adresse par un lien** désactivable | Oui |
| Claim des rôles | Écrit par une Action post-login, avec un nom à espace de noms |
| PKCE | Pris en charge avec le secret client |

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Donner les rangs depuis votre fournisseur", href: "../sso-role-bindings"},
  ]}
/>
