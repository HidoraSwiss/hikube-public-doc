---
sidebar_position: 3
title: Démarrage rapide
description: "Mettre en place la connexion SSO de votre organisation Hikube en 7 étapes : domaine vérifié, connexion, URI de redirection, activation, test, dépannage et désactivation."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Démarrage rapide : connexion SSO

Ce guide met en place la connexion SSO de l'organisation `acme`. Les personnes dont l'adresse est en `@acme.com` se connecteront ensuite à Hikube avec le compte de leur entreprise.

## Avant de commencer

- Le rang **Super-administration** sur l'organisation.
- Un accès d'administration à votre fournisseur d'identité.
- Une application web **confidentielle**, dédiée à Hikube, enregistrée chez votre fournisseur, avec son client id et son secret : [Okta](./how-to/sso-okta.md), [Microsoft Entra ID](./how-to/sso-entra-id.md), [Google Workspace](./how-to/sso-google-workspace.md) ou [Auth0](./how-to/sso-auth0.md).

### Liste de contrôle

1. **Claims dans le jeton d'identité.** `email`, le prénom, le nom et, si vous l'utilisez, le claim des rôles doivent être dans le **jeton d'identité**. Hikube ne les lit nulle part ailleurs.
2. **Confirmation de l'adresse.** Laissez **Confirmer l'adresse par un lien** activé, sauf si votre fournisseur envoie `email_verified` dans le jeton d'identité. Microsoft Entra ID ne l'envoie pas.
3. **PKCE.** Laissez-le actif, sauf si votre fournisseur le refuse.
4. **Claim des rôles.** Renseignez-le seulement si votre fournisseur doit décider des rangs (voir [role bindings](./how-to/sso-role-bindings.md)).
5. **Second facteur.** La MFA des comptes SSO est imposée par votre fournisseur, pas par Hikube.
6. **Invitation ou pas.** Par défaut, toute personne d'un domaine autorisé que votre fournisseur laisse passer obtient un compte. **Invitation requise** n'admet que les personnes invitées.
7. **Un super-administrateur avec mot de passe.** Gardez-en au moins un : c'est votre accès de secours si votre fournisseur est indisponible.

Les exigences techniques complètes sont dans [Concepts](./concepts.md#exigences-techniques).

## Étape 1 : vérifier le domaine

1. Menu de votre profil → **Membres de l'organisation**, onglet **Domaines**.
2. **Ajouter un domaine** : `acme.com`, puis **Ajouter**.
3. Publiez l'enregistrement `TXT` affiché dans la zone DNS de `acme.com`.
4. Cliquez sur **Vérifier**.

**Résultat attendu** : `acme.com` porte le statut **Vérifié**. Détails : [Vérifier un domaine](./how-to/verify-domain.md).

![Onglet Domaines : acme.com en attente, avec l’enregistrement TXT à publier](/img/console/access/domain-pending.fr.png)

## Étape 2 : créer la connexion

1. Ouvrez l'onglet **Connexion SSO**, puis cliquez sur **Créer la connexion**.
2. Remplissez au minimum :
   - **Nom affiché** : `Acme` ;
   - **URL de découverte** : `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` ;
   - **Client id** et **Secret du client** : ceux de l'application ;
   - **Domaines autorisés** : cochez `acme.com`.
3. Cliquez sur **Créer**.

**Résultat attendu** : **Connexion SSO créée.** La connexion est **Inactive**. Tous les champs sont décrits dans [Configurer la connexion SSO](./how-to/configure-sso-connection.md).

![Formulaire Créer la connexion SSO rempli pour Okta](/img/console/access/sso-create.fr.png)

## Étape 3 : enregistrer l'URI de redirection et activer

1. Dans la carte **Connexion SSO**, copiez l'**URI de redirection**.
2. Chez votre fournisseur, collez-la telle quelle dans l'application.
3. Dans Hikube, cliquez sur **Activer**.

**Résultat attendu** : **Connexion SSO activée.** Le statut passe à **Active**.

![Connexion SSO active : URI de redirection, réglages et role bindings](/img/console/access/sso-connection.fr.png)

## Étape 4 : tester la connexion

1. Ouvrez une fenêtre de navigation privée sur [console.hikube.cloud](https://console.hikube.cloud).
2. Saisissez une adresse `@acme.com` qui n'a pas de mot de passe Hikube.
3. Connectez-vous chez votre fournisseur.
4. Ouvrez le lien de confirmation reçu par e-mail.

**Résultat attendu** : la personne arrive dans la console. Elle apparaît dans **Membres de l'organisation** avec le badge **Aucun rang**.

## Étape 5 : donner les rangs

- **Sans claim des rôles** : sur la ligne de la personne, **Modifier**, puis choisissez son rang (voir [Gérer les membres](./how-to/manage-members.md)).
- **Avec un claim des rôles** : créez un role binding par groupe (voir [Donner les rangs depuis votre fournisseur](./how-to/sso-role-bindings.md)).

**Résultat attendu** : après actualisation, la personne voit les projets de son rang.

## Étape 6 : dépannage rapide

| Symptôme | Cause probable |
|---|---|
| Création refusée, URL de découverte | Copiez l'URL telle que votre fournisseur l'affiche ; l'émetteur doit correspondre |
| **Activer** refusé | Le domaine n'est pas vérifié, ou son enregistrement `TXT` a disparu |
| Erreur d'URI de redirection chez le fournisseur | L'URI enregistrée n'est pas exactement celle de la console |
| Personne refusée | Adresse hors des domaines autorisés, ou personne non assignée à l'application |
| Connectée sans accès | Aucun rang donné, ou aucun role binding ne correspond à son jeton |

Plus de cas : [Dépannage](./troubleshooting.md).

## Étape 7 : désactiver ou supprimer

- **Désactiver** : plus personne ne se connecte par votre fournisseur. Les comptes SSO et leurs accès sont gardés.
- **Supprimer** : les comptes SSO créés par la connexion sont supprimés.

Voir [Gérer la connexion SSO](./how-to/manage-sso-connection.md).

<NavigationFooter
  nextSteps={[
    {label: "Donner les rangs depuis votre fournisseur", href: "../how-to/sso-role-bindings"},
    {label: "Gérer la connexion SSO", href: "../how-to/manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Concepts", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
