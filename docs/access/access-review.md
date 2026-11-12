---
sidebar_position: 6
title: Revue des accès
description: "Exporter la revue des accès d'une organisation Hikube : qui tient quel rang, depuis quand, par qui, dernière connexion, inactivité et membres externes."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Revue des accès

La revue des accès est un export CSV de tous les rangs de tous les membres de
l'organisation. Elle sert aux revues périodiques et aux audits.

## Exporter la revue

Prérequis : le rang **Administration** ou plus.

1. Ouvrez **Membres de l'organisation**, onglet **Membres**.
2. Cliquez sur **Exporter la revue des accès**.

La console télécharge `revue-des-acces-acme-2026-11-12.csv`. Une ligne par rang
et par portée, triée par e-mail puis par projet.

## Colonnes

| Colonne | Contenu |
|---|---|
| **E-mail**, **Prénom**, **Nom** | La personne |
| **Portée**, **Id du projet**, **Rang** | Le rang, sur l'organisation ou sur un projet |
| **Accordé le (UTC)**, **Accordé par** | Quand et par qui le rang a été donné. Vide pour un rang donné avant que Hikube n'enregistre ces informations |
| **Source** | **Console**, **Invitation** ou **Fournisseur d'identité** |
| **Type de compte** | **Compte de l'organisation**, **Compte SSO** ou **Compte personnel** |
| **Membre externe** | **oui** pour un compte que l'organisation ne possède pas |
| **Adresse hors des domaines vérifiés** | **oui** pour un compte de l'organisation dont l'adresse n'est sur aucun de ses domaines vérifiés |
| **Compte actif** | **non** pour un compte bloqué |
| **Dernière connexion (UTC)** | Vide si aucune connexion n'a été enregistrée |
| **Inactif** | **oui** sans connexion depuis le seuil d'inactivité |
| **Connexion SSO**, **Role bindings** | Pour un rang donné par le fournisseur d'identité : la connexion et les role bindings qui le donnent |
| **Autre organisation** | Pour les comptes de votre organisation : les accès qu'ils tiennent dans une autre organisation, sur des lignes à part |

## Dernière connexion et inactivité

Hikube enregistre la première requête de chaque connexion à la console. Un
membre est **inactif** quand il ne s'est pas connecté depuis **90 jours**. Un
compte sans connexion enregistrée compte depuis sa création.

Une organisation peut aussi bloquer automatiquement ses propres comptes
inactifs :

- seuls les comptes de l'organisation sont bloqués. Les membres externes sont
  seulement signalés, et un super-administrateur n'est jamais bloqué ainsi ;
- le blocage a lieu à la prochaine consultation de la liste des membres ou de
  la revue des accès ;
- les jours comptent au plus tôt depuis l'activation du réglage : l'activer ne
  bloque personne tout de suite ;
- un administrateur débloque le compte.

:::info Disponibilité
Le seuil d'inactivité (de 1 à 3650 jours) et le blocage des comptes inactifs ne
se règlent pas encore dans la console. Pour les changer, contactez le support.
La colonne **Inactif** utilise le seuil de 90 jours par défaut.
:::

## Que vérifier

- les **Membres externes** : leurs accès sont-ils toujours justifiés ?
- les comptes **Inactifs** : retirez les accès qui ne servent plus ;
- les rangs **Administration** et **Super-administration** : gardez-en le moins
  possible, mais au moins un super-administrateur avec un mot de passe ;
- les **Adresses hors des domaines vérifiés** ;
- pour les comptes SSO, les **Role bindings** qui donnent chaque rang.

<NavigationFooter
  seeAlso={[
    {label: "Gérer les membres", href: "../members"},
    {label: "Sécurité et retrait des accès", href: "../sso/security"},
  ]}
/>
