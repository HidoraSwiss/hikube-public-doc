---
sidebar_position: 8
title: "Comment donner les rangs depuis votre fournisseur"
description: "Role bindings : une valeur du claim des rôles de votre fournisseur d'identité donne un rang Hikube sur l'organisation ou un projet. Une seule source de droits par connexion."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Donner les rangs depuis votre fournisseur (role bindings)

Avec un claim des rôles, votre annuaire décide qui tient quel rang dans Hikube. Un **role binding** associe une valeur de ce claim (un nom de groupe ou de rôle de votre annuaire) à un rang, sur l'organisation ou sur un de ses projets.

Exemple pour l'organisation `acme` :

| Valeur du claim | Portée | Rang |
|---|---|---|
| `acme-devs` | Organisation | **Utilisation** |
| `web-admins` | Projet `web` | **Administration** |

Une personne du groupe `acme-devs` reçoit **Utilisation** sur toute l'organisation à sa connexion. Une personne de `web-admins` reçoit **Administration** sur le projet `web`.

## Une seule source de droits par connexion

| Claim des rôles | D'où viennent les rangs des comptes SSO |
|---|---|
| **Renseigné** (rôles d'application Entra ID, groupes Okta…) | Des role bindings uniquement. Ils ne se donnent, ne se changent et ne se retirent plus dans Hikube : changez-les dans votre annuaire |
| **Vide** (Google Workspace, dont le jeton ne porte pas de groupes) | De Hikube : un administrateur les donne depuis la page des membres. La connexion n'a pas de role binding |

Quand les rangs viennent du fournisseur, la page des membres affiche sur ces comptes : **Rangs attribués par le fournisseur d'identité : ils se changent dans votre annuaire.** Une telle personne ne peut pas non plus quitter l'organisation ni accepter une invitation qui lui donnerait un rang.

Les comptes qui se connectent avec un mot de passe Hikube ne sont jamais concernés : leurs rangs se donnent toujours dans Hikube.

:::note Jamais la Super-administration
Un role binding donne **Lecture**, **Utilisation** ou **Administration**. Jamais **Super-administration** : ce rang reste aux comptes qui se connectent avec un mot de passe Hikube et un second facteur.
:::

## À chaque connexion

Une personne reçoit le rang de chaque role binding dont son jeton d'identité porte la valeur. Elle perd le rang de chaque role binding dont la valeur a disparu, sauf si un autre role binding donne le même rang.

- Une personne retirée d'un groupe chez votre fournisseur perd le rang à sa **prochaine connexion**.
- Un jeton sans le claim des rôles ne donne aucun rang.
- La valeur est comparée telle quelle, majuscules et espaces compris.

## Mettre en place les role bindings

Prérequis : le rang **Super-administration**, et une connexion SSO créée (voir [Créer la connexion SSO](./configure-sso-connection.md)).

### 1. Renseigner le claim des rôles

1. Ouvrez **Membres de l'organisation**, onglet **Connexion SSO**.
2. Cliquez sur **Modifier les réglages**.
3. Dans **Claim des rôles**, saisissez le nom du claim, par exemple `groups` (Okta) ou `roles` (rôles d'application Entra ID).
4. Cliquez sur **Enregistrer**.

:::warning Effet immédiat
Renseigner le claim des rôles retire les rangs donnés dans Hikube aux comptes SSO de la connexion. Ces comptes sont déconnectés. Les role bindings décident ensuite. Créez-les juste après, puis demandez aux personnes de se reconnecter.
:::

### 2. Ajouter un role binding

1. Dans la section **Role bindings**, cliquez sur **Ajouter un role binding**.
2. **Valeur du claim** : `acme-devs`.
3. **Portée** : **Organisation**, ou un projet.
4. **Rang donné** : **Utilisation**.
5. Cliquez sur **Ajouter**.

La console affiche **Role binding de « acme-devs » ajouté. Il s'applique à la prochaine connexion.**

Répétez pour chaque groupe. Une connexion porte au plus 256 role bindings, et une valeur n'y figure qu'une fois.

### 3. Modifier ou supprimer un role binding

- **Modifier** : changez la valeur, la portée ou le rang, puis **Enregistrer**.
- **Supprimer** : confirmez **Supprimer**.

Les comptes SSO qui tenaient l'ancien rang le perdent, sauf si un autre role binding le donne. Ils sont déconnectés : leur accès prend fin sous **5 minutes** au plus. Leur prochaine connexion donne exactement ce que les role bindings restants accordent.

## Changer de source

- **Vider le claim des rôles** supprime tous les role bindings et les rangs qu'ils donnaient. Les comptes concernés sont déconnectés. Les rangs se donnent ensuite dans Hikube.
- **Supprimer un projet** supprime les role bindings qui le visent, avec les rangs qu'ils donnaient.
- **Une personne qui confie à l'organisation un compte avec mot de passe** garde ses rangs jusqu'à sa première connexion par le fournisseur. Ensuite, ses rangs donnés dans Hikube sont retirés et les role bindings décident.

## Revue des accès

La [revue des accès](./export-access-review.md) indique, pour chaque rang d'un compte SSO, la source **Fournisseur d'identité**, la connexion et les role bindings qui le donnent.

<NavigationFooter
  nextSteps={[
    {label: "Gérer la connexion SSO", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Okta : claim groups", href: "../sso-okta"},
    {label: "Entra ID : rôles d'application", href: "../sso-entra-id"},
    {label: "Concepts", href: "../../concepts"},
  ]}
/>
