---
sidebar_position: 1
title: Présentation de la gestion des accès
description: "Gestion des accès Hikube : qui accède à quoi dans votre organisation, invitations, rangs, second facteur, revue des accès et connexion SSO avec votre fournisseur d'identité."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gestion des accès

La gestion des accès décide **qui** entre dans votre organisation Hikube et
**ce que chaque personne peut y faire**. Elle se pilote depuis la
[console](https://console.hikube.cloud), menu de votre profil → **Membres de
l'organisation**.

## Ce qu'elle couvre

| Besoin | Ce que Hikube propose |
|---|---|
| Faire entrer quelqu'un | Une invitation, sur l'organisation ou sur un seul projet |
| Décider de ses droits | Quatre rangs : **Lecture**, **Utilisation**, **Administration**, **Super-administration** |
| Protéger les connexions | Un second facteur obligatoire pour chaque compte avec un mot de passe |
| Contrôler les accès | Une revue des accès exportable, avec dernière connexion et inactivité |
| Prouver la possession d'un domaine | Des domaines vérifiés par un enregistrement DNS |
| Utiliser les comptes de votre entreprise | Une connexion SSO avec votre fournisseur d'identité (Okta, Microsoft Entra ID…) |
| Laisser votre annuaire décider des droits | Des role bindings : un groupe de votre annuaire donne un rang |

## Pour qui

- **Les membres** consultent la liste des membres, répondent à leurs
  invitations et peuvent quitter une organisation.
- **Les administrateurs** invitent, changent les rangs, retirent des accès,
  gèrent les domaines et exportent la revue des accès.
- **Les super-administrateurs** donnent la **Super-administration** et gèrent la
  connexion SSO.

## Les accès retirés prennent effet vite

Un rang baissé, un membre retiré, un role binding supprimé : la personne est
déconnectée et le changement s'applique sous **5 minutes** au plus.

:::info Console et API
La gestion des accès se fait dans la console. Une
[clé d'API](../../api/authentication) ne peut pas l'appeler : une clé agit sur
les ressources d'un projet, jamais sur les accès.
:::

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Démarrage rapide : connexion SSO", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Inviter des personnes", href: "../how-to/invite-members"},
  ]}
/>
