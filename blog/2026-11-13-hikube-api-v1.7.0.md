---
title: Hikube API v1.7.0
authors: [hikube]
tags: [release]
---

L'API v1.7.0 apporte la gestion des accès des organisations : rangs sur l'organisation et sur ses projets, invitations, membres d'un seul projet, transfert de compte, revue des accès, domaines vérifiés et connexion SSO par organisation avec ses role bindings. Le second facteur devient obligatoire pour les comptes avec mot de passe, et la console web ouvre la console VNC et la console série des instances.

**Changements incompatibles** : le second facteur est exigé, la connexion par identifiant et mot de passe des scripts prend fin, et les routes des membres d'une organisation changent de contrat (voir *Migration* en fin de note).

:::warning Action requise
- **Second facteur obligatoire** — Tout compte qui se connecte avec un mot de passe Hikube doit présenter un second facteur : une application d'authentification ou une clé de sécurité. Un compte qui n'en a pas encore l'enregistre à sa prochaine connexion. Une requête faite avec une session ouverte sans second facteur est refusée en HTTP 401 avec le code `10007`. Les comptes SSO utilisent le second facteur de leur fournisseur d'identité. Voir [Enregistrer son second facteur](/access/how-to/set-up-second-factor/).
- **Fin de la connexion par identifiant et mot de passe** — Le service de connexion Hikube ne délivre plus de jeton contre un identifiant et un mot de passe (« password grant »). Les scripts et outils qui s'authentifiaient ainsi doivent passer à une [clé d'API](/api/authentication/), à créer dans les paramètres du projet.
- **Membres d'une organisation** — Si vous appelez les routes `/iam/v1alpha1/organizations/{organization_id}/users` avec une session utilisateur, adaptez vos appels avant la mise à jour : voir *Modifié* et *Migration*.
:::

<!-- truncate -->

## Ajouté

- **Gestion des accès** — Une personne reçoit un rang sur l'organisation ou sur un de ses projets : `read`, `write`, `admin` ou `superadmin` (**Lecture**, **Utilisation**, **Administration** et **Super-administration** dans la console). Un rang sur l'organisation vaut pour tous ses projets ; un rang sur un projet s'y ajoute. Personne ne donne un rang supérieur au sien, et seul un super-administrateur donne la super-administration. Un rang baissé ou retiré déconnecte la personne et s'applique sous 5 minutes. La gestion des accès se fait dans la console : une clé d'API ne peut pas l'appeler. Voir [Gestion des accès](/access/overview/).

- **Invitations** — Les administrateurs invitent jusqu'à 50 adresses à la fois, sur l'organisation ou sur un projet, avec les rangs qu'elles recevront. Une invitation est valable 7 jours ; elle peut être renvoyée ou annulée. Une personne qui a déjà un compte Hikube la trouve à sa prochaine connexion, les autres reçoivent un e-mail pour créer leur compte. Elle l'accepte ou la refuse. L'invitation indique l'organisation et la personne qui l'a envoyée. Voir [Inviter des personnes](/access/how-to/invite-members/).

- **Membres d'un seul projet** — Une personne peut tenir un rang sur un projet sans être membre de l'organisation. Elle ne voit que les projets où elle a un rang. Un réglage de l'organisation permet à ses admins de projet d'inviter sur leur projet et d'y gérer les rangs **Lecture**, **Utilisation** et **Administration**. Voir [Gérer les membres](/access/how-to/manage-members/).

- **Membres externes et transfert de compte** — Chaque membre a un type de compte : personnel, de l'organisation ou SSO. Un membre dont le compte personnel appartient à une autre organisation est externe. Une personne peut confier son compte à l'organisation si son adresse vérifiée appartient à un domaine vérifié de l'organisation et si elle n'a d'accès dans aucune autre. Les administrateurs peuvent ensuite bloquer, débloquer ou supprimer ce compte, et réinitialiser ses identifiants. Voir [Confier un compte à l'organisation](/access/how-to/transfer-account/).

- **Quitter une organisation ou un projet** — Un membre peut quitter une organisation ou un projet. Il perd les rangs concernés, sa session est fermée, et son compte est conservé avec ses accès ailleurs.

- **Revue des accès** — Les administrateurs exportent la revue des accès de l'organisation : pour chaque rang, la personne, la portée, la date et l'auteur de l'attribution, sa source (console, invitation ou fournisseur d'identité), le type de compte, le statut de membre externe, une adresse hors des domaines vérifiés, la dernière connexion et l'inactivité. Voir [Exporter la revue des accès](/access/how-to/export-access-review/).

- **Domaines vérifiés** — Une organisation prouve qu'elle possède un domaine de messagerie en publiant un enregistrement TXT dans sa zone DNS, dans les 7 jours. Un domaine vérifié est contrôlé de nouveau : s'il disparaît, les opérations qui en dépendent sont refusées jusqu'à sa republication. Une organisation déclare au plus 20 domaines ; une messagerie publique ou un suffixe public sont refusés, tout comme un domaine déjà vérifié par une autre organisation. Voir [Vérifier un domaine](/access/how-to/verify-domain/).

- **Connexion SSO** — Une organisation relie son fournisseur d'identité OpenID Connect, à partir de son URL de découverte. Les personnes des domaines vérifiés se connectent alors avec le compte de leur entreprise. La connexion est validée avec Okta et Microsoft Entra ID ; Google Workspace est en cours de validation. Une connexion peut exiger une invitation et confirmer chaque nouvelle adresse par un lien. Le fournisseur se remplace sans perdre les comptes. SAML n'est pas pris en charge (`60119`). Voir [Démarrage rapide : connexion SSO](/access/quick-start/).

- **Role bindings** — Quand la connexion SSO lit un claim des rôles, chaque valeur de ce claim, par exemple un groupe de votre annuaire, donne un rang sur l'organisation ou sur un projet, à chaque connexion. Jamais la super-administration. Les rangs des comptes SSO ne viennent alors que du fournisseur : ils ne se changent plus dans Hikube (`60206`). Voir [Donner les rangs depuis votre fournisseur](/access/how-to/sso-role-bindings/).

- **Console d'instance** — La console web ouvre l'écran (VNC) et la console série d'une instance en marche. Le ticket d'ouverture est réservé à la console web : une clé d'API ne peut pas le demander.

- **Codes d'erreur** — Les nouveaux refus ont chacun leur code. Ils sont renvoyés en HTTP 400, sauf indication contraire. Le format des erreurs est décrit dans [Erreurs](/api/errors/), et les codes de la gestion des accès dans [Dépannage — Gestion des accès](/access/troubleshooting/).

| Code | Service | Signification |
| --- | --- | --- |
| `10003` | Tous | Ticket expiré (flux d'événements, console d'instance) : demandez-en un nouveau |
| `10007` | Tous | HTTP 401 : second facteur requis, reconnectez-vous avec votre second facteur |
| `60004`, `60010` à `60012` | Gestion des accès | Invitation, domaine, connexion SSO ou role binding introuvable |
| `60013`, `60015` | Gestion des accès | Échec temporaire (DNS, rang pas encore prêt) : réessayez |
| `60110` à `60120` | Gestion des accès | Domaine, émetteur, claim, scope, rang, cible de role binding ou invitation invalide, valeur hors limites, SAML non pris en charge |
| `60200` à `60205` | Domaines | Domaine non vérifié, enregistrement absent, vérifié par une autre organisation, vérification expirée, ou domaine utilisé par la connexion SSO |
| `60206` | Gestion des accès | Rang donné par le fournisseur d'identité : il se change dans votre annuaire |
| `60207` à `60211` | Membres | Dernier super-administrateur avec mot de passe, rang de la cible supérieur au vôtre, auto-rétrogradation, rang refusé à ce compte |
| `60212`, `60213` | Comptes | Compte qui n'appartient pas à l'organisation, opération impossible sur un compte SSO |
| `60214` à `60217` | Invitations | Limite de membres, limite d'invitations en attente, trop d'invitations d'un coup, adresse déjà utilisée |
| `60218` | Connexion SSO | L'organisation a déjà une connexion SSO |
| `60219`, `60220` | Transfert | Accès dans une autre organisation, ou adresse hors des domaines vérifiés |
| `60221`, `60222` | Invitations | Invitation qui n'est plus en attente, ou collaboration externe refusée par l'organisation propriétaire du compte |
| `60223` | Role bindings | Valeur déjà utilisée sur la connexion |
| `210001` à `210200` | Console d'instance | Instance introuvable ou arrêtée, console indisponible ou saturée, type de console invalide |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **Membres d'une organisation** — Les routes `/iam/v1alpha1/organizations/{organization_id}/users` changent de contrat. Elles ne sont pas dans la surface des clés d'API : seuls les appels faits avec une session utilisateur sont concernés.
  - `{name}` est désormais l'identifiant du compte (le champ `id` renvoyé par la liste), et non plus son nom d'utilisateur ;
  - les réponses ne renvoient plus `groups`. Elles renvoient `tiers`, la liste des rangs du membre (`projectId` vide pour l'organisation, `tier`), ainsi que `accountType` (`organization`, `sso` ou `personal`), `owned`, `external` et `tiersFromIdentityProvider` ;
  - `PATCH .../users/{name}` ne modifie plus que `tiers`, qui remplace les rangs du membre dans l'organisation et ses projets, et seulement là. Les champs `enabled`, `email`, `firstname`, `lastname` et `groups` ne sont plus acceptés. Une liste vide retire tout accès à l'organisation ;
  - `DELETE .../users/{name}` retire l'accès de la personne à l'organisation et garde son compte ; il le supprimait jusqu'ici ;
  - la liste accepte les filtres `tier`, `projectId` et `identitySource` (`local` ou `federated`).

- **Second facteur** — Une session ouverte sans second facteur est refusée avec le code `10007` (HTTP 401), sauf pour un compte SSO.

- **Projets** — Un membre d'un seul projet liste et lit les projets où il tient un rang. La liste renvoie tous les projets à un membre de l'organisation.

- **Retrait d'un accès** — Baisser ou retirer un rang ferme les sessions de la personne : le changement s'applique sous 5 minutes.

## Retiré

- **Création directe d'un utilisateur** — `POST /iam/v1alpha1/organizations/{organization_id}/users` est retiré. Les invitations le remplacent.

- **Connexion par identifiant et mot de passe** — Le service de connexion ne délivre plus de jeton contre un identifiant et un mot de passe. Utilisez une clé d'API.

## Corrigé

- **Instances VM** — Une VM qui démarre normalement n'affiche plus de raison de blocage. La raison ne vient plus que d'une vraie cause d'échec, comme un quota insuffisant ou aucun serveur disponible.

- **Sauvegardes** — La première sauvegarde d'une VM vers une destination toute neuve ne peut plus échouer faute de dépôt prêt.

:::warning Migration
- **Scripts authentifiés par identifiant et mot de passe** : créez une clé d'API dans les paramètres du projet (carte **Clés d'API**), puis appelez l'API avec l'en-tête `X-Hikube-Api-Key`. Voir [Authentification](/api/authentication/) et [Démarrage rapide](/api/quick-start/). La gestion des accès et la gestion des clés ne s'appellent pas avec une clé d'API : faites-les dans la console.
- **Second facteur** : prévenez les personnes de votre organisation qui se connectent avec un mot de passe ; elles enregistreront leur second facteur à leur prochaine connexion. Voir [Enregistrer son second facteur](/access/how-to/set-up-second-factor/).
- **Routes des membres** : il n'y a pas de période de transition pour ces routes. Lisez l'`id` d'un membre dans la liste avant de le modifier ou de retirer son accès, remplacez `groups` par `tiers`, et passez par les invitations pour faire entrer une personne.
:::
