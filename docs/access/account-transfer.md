---
sidebar_position: 4
title: Confier un compte à l'organisation
description: "Transférer un compte Hikube personnel à l'organisation : conditions, effets, ce que les administrateurs peuvent ensuite faire, et lien avec la connexion SSO."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Confier un compte à l'organisation

La plupart des personnes se connectent avec un **compte personnel** : il leur
appartient, et l'organisation ne fait que lui donner des accès. Une personne
peut aussi **confier** son compte à l'organisation. Le compte devient alors un
**compte de l'organisation**, que ses administrateurs gèrent.

:::info Disponibilité
Le transfert d'un compte n'est pas encore proposé dans la console. Pour confier
un compte à votre organisation, contactez le support.
:::

## Conditions

Rien n'est transféré sans l'accord de la personne. Le transfert demande :

- une adresse e-mail **vérifiée**, sur un [domaine vérifié](./domains.md) de
  l'organisation, dont l'enregistrement DNS est toujours en place ;
- être membre de l'organisation, ou accepter son invitation au même moment ;
- **aucun accès dans une autre organisation**, ni sur elle ni sur un de ses
  projets. Les invitations en attente ne comptent pas.

Une personne dont le transfert est refusé garde son compte personnel et les
accès qu'on lui a donnés. Elle peut accepter l'invitation sans transférer son
compte : elle devient membre externe.

## Effets

- Le compte garde son mot de passe et son second facteur.
- Les super-administrateurs de l'organisation voient le transfert.
- Par défaut, le compte ne peut plus rejoindre une autre organisation (voir
  [Membres externes](./invitations.md#membres-externes)).

### Avec une connexion SSO active

Si la connexion SSO de l'organisation est active et sert le domaine de
l'adresse, le transfert se termine à la prochaine connexion de la personne par
votre fournisseur, après son mot de passe et son second facteur. Le compte
devient alors un compte SSO : son mot de passe et son second facteur Hikube sont
retirés. Avec un claim des rôles, ses rangs donnés dans Hikube sont remplacés
par ceux des [role bindings](./sso/role-bindings.md).

Un super-administrateur n'est jamais converti : il garde son mot de passe.

## Ce que vos administrateurs peuvent faire

Sur un compte de l'organisation, un administrateur peut, en plus de gérer ses
accès :

- **le bloquer** : la personne est déconnectée et ne peut plus se connecter ;
  ses accès sont gardés pour le déblocage ;
- **le débloquer** ;
- **réinitialiser ses identifiants** : son mot de passe et tous ses seconds
  facteurs sont retirés, elle est déconnectée et reçoit un lien valable
  24 heures pour en choisir de nouveaux. Un compte SSO n'a pas d'identifiants
  dans Hikube : réinitialisez-les chez votre fournisseur ;
- **le supprimer**, avec tous ses accès.

:::info Disponibilité
Ces actions ne sont pas encore dans la console. Contactez le support.
:::

Personne n'agit sur un membre de rang supérieur au sien, ni ne bloque ou
supprime son propre compte. L'organisation garde toujours un
super-administrateur actif avec un mot de passe. Le profil (nom, e-mail)
appartient à la personne : vos administrateurs ne le modifient pas.

<NavigationFooter
  seeAlso={[
    {label: "Rangs et qui fait quoi", href: "../overview"},
    {label: "Vérifier un domaine", href: "../domains"},
  ]}
/>
