---
sidebar_position: 4
title: "Comment enregistrer son second facteur"
description: "Le second facteur (MFA) est obligatoire pour tout compte Hikube avec un mot de passe : enrôlement à la connexion, facteurs acceptés, comptes SSO et perte du second facteur."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Second facteur (MFA)

Tout compte qui se connecte avec un mot de passe Hikube doit aussi présenter un **second facteur**. Il n'y a pas d'exception.

## Facteurs acceptés

- une application d'authentification (code à six chiffres, TOTP) ;
- une clé de sécurité ;
- un code de récupération.

Hikube n'envoie pas de code par e-mail ni par SMS.

## Enregistrer son second facteur

L'enregistrement se fait à la connexion, pas dans la console.

1. Connectez-vous à [console.hikube.cloud](https://console.hikube.cloud) avec votre adresse et votre mot de passe.
2. Si votre compte n'a pas encore de second facteur, la page de connexion vous demande d'en enregistrer un. Scannez le code QR avec votre application d'authentification, ou enregistrez votre clé de sécurité.
3. Saisissez le code affiché pour terminer.

Les connexions suivantes demandent le mot de passe, puis le second facteur.

Une personne invitée sans compte enregistre son second facteur en créant son compte, depuis l'e-mail d'invitation.

## « Un second facteur est requis »

La console affiche cette page quand votre session a été ouverte sans second facteur. Cliquez sur **Se reconnecter**, puis connectez-vous avec votre mot de passe et votre second facteur. Si la connexion ne vous le demande pas, contactez le support.

## Comptes SSO

Un compte qui se connecte par la [connexion SSO](../quick-start.md) de son organisation n'a ni mot de passe ni second facteur dans Hikube. Son second facteur est celui de votre fournisseur d'identité : imposez-le chez lui.

## Mot de passe ou second facteur perdu

- **Mot de passe oublié** : sur la page de connexion, saisissez votre adresse, puis cliquez sur **Mot de passe oublié ?** sous le champ du mot de passe. Vous recevez par e-mail un lien pour choisir un nouveau mot de passe. Votre second facteur reste le même. Un compte SSO n'a pas ce lien : son mot de passe se gère chez votre fournisseur d'identité.

Second facteur perdu :

- **Compte de l'organisation** : un administrateur de l'organisation peut réinitialiser ses identifiants (voir [Confier un compte à l'organisation](./transfer-account.md#ce-que-vos-administrateurs-peuvent-faire)). La personne reçoit un lien valable 24 heures pour choisir un nouveau mot de passe et un nouveau second facteur.
- **Compte personnel** : contactez le support.
- **Plus aucun super-administrateur ne peut se connecter** : contactez le support. Après vérification de votre identité, le support réinitialise les identifiants d'un super-administrateur.

<NavigationFooter
  seeAlso={[
    {label: "Concepts", href: "../../concepts"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
