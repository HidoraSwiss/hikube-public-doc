---
title: Console Hikube v1.3.2
authors: [hikube]
tags: [release]
---

Ce correctif rend le temps réel de la console plus discret. Un renouvellement de session ne recharge plus la page en arrière-plan, et un onglet laissé sans activité ne prolonge plus votre session.

<!-- truncate -->

## Corrigé

- **Temps réel** — Quand votre session est renouvelée, la console ne recharge plus toutes les données de la page. Seules les données qui n'avaient pas pu être chargées sont redemandées. Les listes, comme celle des instances VM, ne sont plus relues ni interrompues à chaque renouvellement.

## Sécurité

- **Session** — Un onglet laissé ouvert sans activité ne prolonge plus votre session. Quand votre session arrive à échéance, la mise à jour en temps réel se met en pause et l'indicateur affiche **Reconnexion…**. Dès que vous revenez sur l'onglet, la session est renouvelée, les données sont rechargées et l'indicateur repasse à **En direct**. Sans activité, la session expire normalement, au terme prévu par la plateforme.
