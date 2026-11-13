---
sidebar_position: 2
title: "Comment gérer les membres"
description: "Changer les rangs d'un membre, retirer un accès, quitter une organisation ou un projet, et déléguer l'accès d'un projet à ses administrateurs dans la console Hikube."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gérer les membres

## Ouvrir la liste des membres

1. Dans le menu de votre profil (en haut à droite), cliquez sur **Membres de l'organisation**.
2. L'onglet **Membres** liste chaque personne avec son **Rang sur l'organisation** et ses **Rangs sur des projets**.

Badges possibles : **Vous**, **Compte désactivé**, **Projets seulement** (aucun rang sur l'organisation), **Aucun rang** (un compte SSO à qui aucun role binding ne donne de rang).

![Liste des membres de l’organisation et invitations en attente](/img/console/access/members.fr.png)

## Changer les rangs d'un membre

Prérequis : le rang **Administration** ou plus.

1. Sur la ligne du membre, cliquez sur **Modifier**.
2. Dans **Rangs de …** :
   - **Sur l'organisation** : **Aucun**, **Lecture**, **Utilisation**, **Administration** ou **Super-administration** ;
   - **Sur un projet** : un rang par projet, qui s'ajoute à celui de l'organisation.
3. Cliquez sur **Enregistrer**.

Baisser un rang déconnecte la personne. Le changement s'applique sous **5 minutes**.

Vous ne pouvez pas modifier :

- un membre de rang supérieur au vôtre ;
- vos propres rangs ;
- un compte SSO dont les rangs viennent du fournisseur d'identité (voir [role bindings](./sso-role-bindings.md)).

Seul un super-administrateur donne **Super-administration**, et seulement à un compte avec un mot de passe et un second facteur, sans lien avec un fournisseur d'identité.

## Retirer l'accès d'un membre

1. Sur la ligne du membre, cliquez sur l'icône de corbeille.
2. Confirmez **Retirer l'accès**.

Tous ses rangs dans l'organisation et ses projets sont retirés, et la personne est déconnectée sous **5 minutes**. Son compte est conservé, avec ses accès aux autres organisations. Pour revenir, elle aura besoin d'une nouvelle invitation.

Retirer tous les rangs dans **Modifier** (bouton **Retirer l'accès**) a le même effet.

:::warning Clés d'API
Retirer un membre ne révoque pas les clés d'API qu'il a créées : une clé garde ses scopes. Révoquez-les dans la carte **Clés d'API** des paramètres du projet (voir [Authentification de l'API](../../../api/authentication)).
:::

## Quitter l'organisation ou un projet

Tout membre peut partir de lui-même.

1. Sur votre ligne (badge **Vous**), cliquez sur **Quitter**.
2. Choisissez **Quitter l'organisation** ou **Quitter le projet …**, puis confirmez.

- **Quitter l'organisation** retire tous vos rangs dans l'organisation et ses projets, et ferme votre session. Votre compte est conservé. Revenir demande une nouvelle invitation.
- **Quitter le projet** retire le rang que vous tenez directement sur ce projet. Un rang sur l'organisation continue de s'y appliquer. Vous pouvez aussi quitter un projet depuis ses paramètres, **Zone dangereuse** → **Quitter le projet**.

Deux cas ne peuvent pas partir :

- le dernier super-administrateur qui se connecte avec un mot de passe : nommez d'abord un autre super-administrateur ;
- un compte SSO dont les rangs viennent du fournisseur d'identité : sa prochaine connexion les lui rendrait. Retirez-le de son groupe chez votre fournisseur.

## Membres d'un projet

Les paramètres d'un projet (icône d'engrenage à côté du projet, dans le sélecteur de projet) ont une carte **Membres du projet**. Elle liste les personnes qui tiennent un rang **directement** sur ce projet. Les accès donnés par l'organisation s'y appliquent aussi, sans y figurer.

Depuis cette carte, un administrateur peut :

- **Inviter** une personne avec un **Rang sur le projet** ;
- **Changer le rang** d'un membre sur ce projet ;
- **Retirer l'accès** d'un membre à ce projet.

Ces actions ne touchent que le rang tenu directement sur ce projet. Un projet n'a pas de **Super-administration** : choisissez **Lecture**, **Utilisation** ou **Administration**.

### Délégation aux admins de projet

Par défaut, seuls les administrateurs de l'organisation gèrent l'accès aux projets. Un super-administrateur peut le confier aux administrateurs de chaque projet :

1. Ouvrez **Membres de l'organisation**, onglet **Membres**.
2. Dans la carte **Délégation aux admins de projet**, activez **Laisser les admins de projet gérer l'accès à leur projet**.

Un admin de projet invite alors sur son projet et y change les rangs **Lecture**, **Utilisation** et **Administration**, jamais au-dessus du sien. Il ne peut ni retirer ni rétrograder le dernier administrateur direct du projet. Les accès donnés par l'organisation restent gérés par ses administrateurs. Une invitation envoyée pendant la délégation reste valable après sa désactivation.

<NavigationFooter
  nextSteps={[
    {label: "Inviter des personnes", href: "../invite-members"},
  ]}
  seeAlso={[
    {label: "Concepts", href: "../../concepts"},
    {label: "Revue des accès", href: "../export-access-review"},
  ]}
/>
