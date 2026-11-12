---
sidebar_position: 7
title: "Comment configurer la connexion SSO"
description: "Créer la connexion SSO de votre organisation dans la console Hikube : URL de découverte, client id, secret, domaines autorisés, claims, URI de redirection et activation."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer et activer la connexion SSO

Ce guide crée la connexion SSO de l'organisation `acme`, pour les adresses `@acme.com`, puis l'active.

## Prérequis

- Le rang **Super-administration** sur l'organisation.
- Le domaine `acme.com` vérifié (voir [Vérifier un domaine](./verify-domain.md)).
- Une application enregistrée chez votre fournisseur d'identité, avec son client id et son secret : [Okta](./sso-okta.md), [Microsoft Entra ID](./sso-entra-id.md), [Google Workspace](./sso-google-workspace.md) ou [Auth0](./sso-auth0.md). Vous y ajouterez l'URI de redirection à l'étape 3.
- La [liste de contrôle](../quick-start.md#liste-de-contrôle) parcourue.

## 1. Ouvrir la page de la connexion

1. Dans le menu de votre profil (en haut à droite), cliquez sur **Membres de l'organisation**.
2. Ouvrez l'onglet **Connexion SSO**.

La page **Connexion unique (SSO)** affiche **Aucune connexion SSO**.

## 2. Créer la connexion

1. Cliquez sur **Créer la connexion**.
2. Remplissez le formulaire **Créer la connexion SSO** :

| Champ | Exemple | À savoir |
|---|---|---|
| **Nom affiché** | `Acme` | Le nom que voient les personnes à la connexion, 64 caractères au plus |
| **URL de découverte** | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` | Telle que votre fournisseur l'affiche, en `https`. Son émetteur doit être l'URL suivie de `/.well-known/openid-configuration` |
| **Client id** | `0oa1b2c3d4e5f6g7h8i9` | L'identifiant de l'application chez votre fournisseur |
| **Secret du client** | | Écriture seule : il n'est jamais réaffiché |
| **Domaines autorisés** | `acme.com` coché | Aucun coché : tous les domaines vérifiés de l'organisation. Un sous-domaine est un domaine à part |
| **Confirmer l'adresse par un lien** | Activé | Désactivez-le seulement si votre fournisseur envoie `email_verified` dans le jeton d'identité |
| **Invitation requise** | Désactivé | Activé : seules les personnes invitées se connectent (voir [Gérer la connexion](./manage-sso-connection.md#invitation-requise)) |
| **Claim du prénom** / **Claim du nom** | Vides | Vides : `given_name` et `family_name` |
| **Claim des rôles** | Vide, ou `groups` | Vide : les rangs se donnent dans Hikube. Renseigné : les role bindings décident des rangs des comptes SSO |

Sous **Réglages avancés** :

| Champ | À savoir |
|---|---|
| **PKCE** | Laissez-le actif, sauf si votre fournisseur le refuse |
| **Scopes supplémentaires** | Séparés par des espaces. `openid`, `email` et `profile` sont toujours demandés. `offline_access` est refusé |

3. Cliquez sur **Créer**.

Hikube lit le document de découverte et refuse une connexion dont l'émetteur, les points de terminaison ou la signature ne conviennent pas. La console affiche **Connexion SSO créée. Enregistrez son URI de redirection chez votre fournisseur, puis activez-la.** La connexion est **Inactive**.

:::note Claims imbriqués
Un claim peut être un chemin pointé, par exemple `hikube.roles` pour le champ `roles` de l'objet `hikube`. Un point à l'intérieur d'un nom s'écrit `\.` : `https://acme\.com/roles`.
:::

## 3. Enregistrer l'URI de redirection

1. Dans la carte **Connexion SSO**, copiez l'**URI de redirection**.
2. Chez votre fournisseur, collez-la dans l'application, telle quelle.

## 4. Activer la connexion

1. Cliquez sur **Activer**.
2. La console affiche **Connexion SSO activée.** et le statut passe à **Active**.

À l'activation, Hikube contrôle à nouveau l'enregistrement DNS de chaque domaine servi. S'il a disparu, l'activation est refusée : republiez l'enregistrement (voir [Vérifier un domaine](./verify-domain.md)).

## 5. Tester

1. Ouvrez une fenêtre de navigation privée sur [console.hikube.cloud](https://console.hikube.cloud).
2. Saisissez une adresse `@acme.com` qui n'a pas de mot de passe Hikube.
3. Vous êtes envoyé chez votre fournisseur. Connectez-vous.
4. Avec **Confirmer l'adresse par un lien**, ouvrez le lien reçu par e-mail.

## Première connexion d'une personne

- **Création du compte.** À sa première connexion, Hikube crée le compte de la personne, **sans aucun rang**. Le compte appartient à l'organisation : c'est un **compte SSO**.
- **Confirmation.** Avec **Confirmer l'adresse par un lien**, la personne confirme son adresse par le lien reçu. Le compte apparaît dans les membres une fois confirmé. Il est supprimé s'il n'est pas confirmé sous 24 heures.
- **Rangs.** Un administrateur donne ensuite un rang depuis [la page des membres](./manage-members.md). Avec un claim des rôles, les [role bindings](./sso-role-bindings.md) donnent les rangs à chaque connexion.
- **Domaines.** L'adresse du jeton d'identité doit être sur un domaine autorisé, comparé exactement. Avec `acme.com` seul, `bob@eu.acme.com` est refusé.
- **Comptes avec mot de passe.** Ils continuent de se connecter avec leur mot de passe et ne sont jamais redirigés.
- **Nombre de membres.** La limite de membres de l'organisation s'applique. Une personne au-delà peut se connecter, mais Hikube refuse ses requêtes tant qu'un membre n'a pas été retiré.
- **Profil.** Le prénom et le nom sont repris du jeton d'identité à chaque connexion. Ils ne se modifient pas dans Hikube.

<NavigationFooter
  nextSteps={[
    {label: "Donner les rangs depuis votre fournisseur", href: "../sso-role-bindings"},
    {label: "Gérer la connexion SSO", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Démarrage rapide", href: "../../quick-start"},
    {label: "Dépannage", href: "../../troubleshooting"},
  ]}
/>
