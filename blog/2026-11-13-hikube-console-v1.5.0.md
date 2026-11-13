---
title: Console Hikube v1.5.0
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.7.0 avec la gestion des accès : membres et rangs, invitations, accès à un seul projet, revue des accès, domaines vérifiés et connexion SSO de l'organisation avec ses role bindings. La connexion demande désormais un second facteur pour les comptes avec mot de passe, et la fiche d'une instance VM ouvre sa console VNC et sa console série.

:::warning À savoir
- **Second facteur obligatoire** — Tout compte qui se connecte avec un mot de passe doit présenter un second facteur : une application d'authentification ou une clé de sécurité. Un compte qui n'en a pas encore l'enregistre à sa prochaine connexion, sur la page de connexion. Les comptes SSO utilisent le second facteur de leur fournisseur d'identité. Voir [Enregistrer son second facteur](/access/how-to/set-up-second-factor/).
- **Connexion en deux temps** — La page de connexion demande d'abord votre adresse e-mail, puis votre mot de passe. Une adresse servie par la connexion SSO de votre organisation, sans mot de passe Hikube, est envoyée vers votre fournisseur d'identité. Le lien **Mot de passe oublié ?** apparaît sous le champ du mot de passe.
- **Scripts** — Les scripts qui se connectaient avec un identifiant et un mot de passe ne fonctionnent plus : passez-les à une [clé d'API](/api/authentication/).
:::

<!-- truncate -->

## Ajouté

- **Membres de l'organisation** — Une page **Membres de l'organisation**, dans le menu de votre profil, liste les personnes qui ont accès à l'organisation et à ses projets, avec leur **Rang sur l'organisation** et leurs **Rangs sur des projets** : **Lecture**, **Utilisation**, **Administration** ou **Super-administration**. **Modifier** change les rangs d'un membre, sans dépasser le vôtre ; sans aucun rang, il perd l'accès à l'organisation et garde son compte. Baisser un rang déconnecte la personne, et le changement s'applique sous 5 minutes. Les rangs donnés par le fournisseur d'identité sont verrouillés. Voir [Gérer les membres](/access/how-to/manage-members/).

- **Invitations** — **Inviter des personnes** envoie jusqu'à 50 invitations à la fois, avec les rangs à donner sur l'organisation ou sur des projets. Une invitation est valable 7 jours. La liste **Invitations en attente** permet de la **Renvoyer** ou de l'annuler. Une personne invitée trouve ses invitations à sa connexion, avec l'organisation et l'auteur de chacune, et les **Accepter** ou les **Refuser**. Voir [Inviter des personnes](/access/how-to/invite-members/).

- **Membres du projet** — Les paramètres d'un projet listent les **Membres du projet** : les personnes qui tiennent un rang directement sur lui. Ses admins peuvent y inviter et changer les rangs **Lecture**, **Utilisation** et **Administration** si l'organisation active la **Délégation aux admins de projet**.

- **Accès à un seul projet** — Une personne qui n'a accès qu'à des projets, sans être membre de l'organisation, voit seulement ces projets. La console lui explique pourquoi les membres et les réglages de l'organisation ne lui sont pas ouverts.

- **Quitter** — **Quitter l'organisation** ou **Quitter le projet** retire vos rangs et ferme votre session. Votre compte est conservé, avec vos accès ailleurs.

- **Revue des accès** — **Exporter la revue des accès** télécharge un fichier CSV : pour chaque rang, la personne, la portée, la date et l'auteur de l'attribution, sa source, le type de compte, le statut de membre externe, une adresse hors des domaines vérifiés, l'état du compte, la **Dernière connexion (UTC)** et l'inactivité. Voir [Exporter la revue des accès](/access/how-to/export-access-review/).

- **Domaines vérifiés** — L'onglet **Domaines** des **Réglages de l'organisation** déclare les domaines de messagerie de l'organisation. **Ajouter un domaine** affiche l'enregistrement TXT à publier dans la zone DNS, avec un bouton de copie, puis **Vérifier** contrôle sa présence. Chaque domaine a son statut (**En attente**, **Expiré**, **Vérifié**) et son dernier contrôle. Un domaine expiré se relance avec **Générer un nouvel enregistrement**. Voir [Vérifier un domaine](/access/how-to/verify-domain/).

- **Connexion SSO** — L'onglet **Connexion SSO** des **Réglages de l'organisation** crée la connexion de l'organisation à son fournisseur d'identité OpenID Connect, à partir de son **URL de découverte**, de son **Client id** et de son **Secret du client**. La connexion est créée inactive et affiche l'**URI de redirection** à enregistrer chez le fournisseur ; elle s'active ensuite. Les réglages proposent les **Domaines autorisés**, l'**Invitation requise** et la confirmation de l'adresse par lien. **Remplacer le fournisseur** garde les comptes SSO et leurs accès. Okta et Microsoft Entra ID sont validés ; Google Workspace est en cours de validation. Voir [Démarrage rapide : connexion SSO](/access/quick-start/), [Okta](/access/how-to/sso-okta/) et [Microsoft Entra ID](/access/how-to/sso-entra-id/).

- **Role bindings** — Quand la connexion SSO lit un **Claim des rôles**, **Ajouter un role binding** associe une valeur de ce claim, par exemple un groupe de votre annuaire, à un rang sur l'organisation ou sur un projet. Les rangs des comptes SSO ne viennent plus alors que de votre fournisseur. Voir [Donner les rangs depuis votre fournisseur](/access/how-to/sso-role-bindings/).

- **Console d'instance** — Un onglet **Console** apparaît sur la fiche d'une instance VM en marche, avec l'**Écran (VNC)** et la **Console série**. La barre d'outils propose **Ctrl+Alt+Suppr**, **Coller le presse-papiers**, **Plein écran**, **Nouvel onglet**, la taille de la police, **Reconnecter** et, pour la console série, l'adaptation de la VM à la taille de la fenêtre. La console se reconnecte d'elle-même après une coupure ou un déplacement de l'instance, et une session dure au plus 8 heures. La console série demande un compte avec mot de passe dans l'instance ; pour un travail suivi, préférez SSH.

- **Second facteur** — Une session ouverte sans second facteur affiche la page **Un second facteur est requis**, avec **Se reconnecter**.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Toutes les ressources** — Les actions de création, de modification et de suppression n'apparaissent qu'à partir du rang qu'elles demandent. Une page de création ou d'édition ouverte sans ce rang affiche **Lecture seule**, avec le rang demandé et le vôtre.

- **Projets** — Les paramètres d'un projet s'ouvrent en lecture seule à qui n'est pas super-administrateur de l'organisation : seul un super-administrateur modifie ou supprime un projet.

- **Connexion** — Quand vos organisations et vos projets ne peuvent pas être chargés, la console affiche **Accès impossible**, avec **Actualiser** et **Se déconnecter**, au lieu de charger sans fin.

- **Instances VM** — Les touches tapées dans la console d'instance comptent comme de l'activité : la session de la console ne se ferme plus pendant que vous travaillez dans l'instance.

## Corrigé

- **Connexion** — Le lien de confirmation reçu par e-mail lors d'une première connexion SSO, ouvert dans un nouvel onglet, termine bien la connexion au lieu d'afficher une erreur.

- **Invitations** — Une personne invitée qui n'appartient encore à aucune organisation arrive sur ses invitations, au lieu de tourner en boucle vers la création d'un projet.

- **Listes de ressources** — Les lignes ne clignotent plus quand rien d'affiché n'a changé.

- **Instances VM** — Une VM qui démarre normalement n'affiche plus d'avertissement de démarrage impossible.
