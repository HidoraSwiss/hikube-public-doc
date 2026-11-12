---
sidebar_position: 1
title: Rangs et qui fait quoi
description: "Gestion des accès Hikube : organisations, projets, rangs Lecture, Utilisation, Administration et Super-administration, types de membres et ce que chaque rang permet."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gestion des accès : rangs et qui fait quoi

Chaque personne accède à Hikube avec son propre compte. Elle reçoit un ou
plusieurs **rangs** dans une **organisation** : sur l'organisation entière, ou
sur certains de ses projets.

## Organisation et projets

- L'**organisation** représente votre entreprise. Elle regroupe vos membres et
  vos projets.
- Un **projet** est un espace isolé de l'organisation : vos VM, clusters et
  bases de données y vivent.
- Un rang sur l'organisation vaut pour tous ses projets. Un rang sur un projet
  s'y ajoute.

## Les quatre rangs

| Rang | Valeur | Ce qu'il permet |
|---|---|---|
| **Lecture** | `read` | Consulter les ressources |
| **Utilisation** | `write` | Lecture, plus l'utilisation des ressources |
| **Administration** | `admin` | Créer, modifier et supprimer les ressources ; gérer les membres |
| **Super-administration** | `superadmin` | Tous les droits, dont donner ce rang ; gérer la connexion SSO |

Un rang inclut les droits des rangs inférieurs. Un membre qui tient plusieurs
rangs sur une même portée est affiché avec le plus élevé.

:::note Pas de super-administration de projet
**Super-administration** est un rang de l'organisation seulement. Sur un
projet, le rang le plus élevé est **Administration**.
:::

## Qui peut faire quoi dans l'organisation

| Action | Lecture | Utilisation | Administration | Super-administration |
|---|:-:|:-:|:-:|:-:|
| Voir les membres, leur e-mail et leur rang | oui | oui | oui | oui |
| Inviter ; annuler et renvoyer les invitations | non | non | oui | oui |
| Donner ou retirer **Lecture**, **Utilisation**, **Administration** | non | non | oui | oui |
| Retirer l'accès d'un membre | non | non | oui | oui |
| Exporter la revue des accès ; gérer les domaines | non | non | oui | oui |
| Agir sur un membre de rang supérieur au sien | non | non | non | oui |
| Donner ou retirer **Super-administration** | non | non | non | oui |
| Gérer la connexion SSO et ses role bindings | non | non | non | oui |
| Baisser son propre rang | non | non | non | non |
| Quitter l'organisation | oui | oui | oui | oui |

Règles qui protègent l'organisation :

- personne ne donne un rang supérieur au sien ;
- personne ne baisse ni ne retire son propre rang : pour partir, on
  [quitte l'organisation](./members.md#quitter-lorganisation-ou-un-projet) ;
- l'organisation garde toujours au moins un super-administrateur qui se
  connecte avec un mot de passe ;
- **Super-administration** ne va qu'à un compte avec un mot de passe et un
  second facteur, sans lien avec un fournisseur d'identité. L'organisation garde
  ainsi un accès si sa connexion SSO tombe.

## Types de membres

| Membre | À qui appartient le compte | Ce que vos administrateurs peuvent faire |
|---|---|---|
| **Compte de l'organisation** | Votre organisation, après un [transfert](./account-transfer.md) | Donner et retirer ses accès ; le reste avec le support |
| **Compte SSO** | Votre organisation, créé par votre [connexion SSO](./sso/before-you-start.md) | Donner et retirer ses accès (ou vos role bindings) |
| **Compte personnel** (membre externe) | La personne | Donner et retirer ses accès dans votre organisation, rien d'autre |
| **Compte d'une autre organisation** (membre externe) | L'autre organisation | Donner et retirer ses accès dans votre organisation, rien d'autre |

Un membre externe garde son compte, ses identifiants et ses accès ailleurs.
Retirer son accès chez vous ne touche pas le reste.

Un **membre d'un seul projet** tient des rangs sur un ou plusieurs projets, et
aucun sur l'organisation. La page des membres l'affiche avec le badge
**Projets seulement**. Il voit le nom de l'organisation et ses projets, rien
d'autre. Son accès prend fin avec le projet.

## Où se gère l'accès

Dans la console, ouvrez le menu de votre profil (en haut à droite), puis
**Membres de l'organisation**. Les **Réglages de l'organisation** ont trois
onglets :

| Onglet | Visible à partir de |
|---|---|
| **Membres** | Tous les membres de l'organisation |
| **Domaines** | **Administration** |
| **Connexion SSO** | **Super-administration** |

L'accès à un projet se gère aussi dans les paramètres du projet, carte
**Membres du projet** (voir [Gérer les membres](./members.md#membres-dun-projet)).

:::info Console et API
La gestion des membres, des invitations, des domaines et de la connexion SSO se
fait dans la console. Une [clé d'API](../../api/authentication) ne peut pas
l'appeler : une clé agit sur les ressources d'un projet, jamais sur les accès.
:::

<NavigationFooter
  nextSteps={[
    {label: "Inviter des personnes", href: "../invitations"},
    {label: "Gérer les membres", href: "../members"},
  ]}
  seeAlso={[
    {label: "Second facteur", href: "../mfa"},
    {label: "Connexion SSO", href: "../sso/before-you-start"},
  ]}
/>
