---
# Brouillon : à renommer en YYYY-MM-DD-hikube-api-vX.Y.Z.md, avec le titre
# de la version, quand la release qui livre les membres et les invitations
# est taguée. Retirer alors `draft: true`.
title: Hikube API — membres et invitations
authors: [hikube]
tags: [release]
draft: true
---

Cette version change la gestion des membres d'une organisation. On n'ajoute plus un membre en lui créant un compte : on l'invite par e-mail, et il accepte l'invitation avec son propre compte. Les accès s'expriment en niveaux (`read`, `write`, `admin`, `superadmin`) sur l'organisation et sur ses projets.

**Changement incompatible** : plusieurs champs et un appel de l'API des membres sont retirés, et la suppression d'un membre ne supprime plus son compte (voir *Migration*).

<!-- truncate -->

## Ajouté

- **IAM : invitations** — `POST /iam/v1alpha1/organizations/{organization_id}/invitations` invite jusqu'à 50 adresses e-mail, avec les niveaux à leur donner sur l'organisation ou sur un projet. La personne reçoit un e-mail. Si elle n'a pas encore de compte, elle en crée un en choisissant son mot de passe et son second facteur. Une invitation est valable 7 jours. Un admin peut lister, renvoyer et annuler les invitations de l'organisation (`GET .../invitations`, `POST .../invitations/{invitation_id}/resend`, `DELETE .../invitations/{invitation_id}`). Réinviter la même adresse remplace l'invitation en attente.

- **IAM : mes invitations** — `GET /iam/v1alpha1/me/invitations` liste les invitations en attente de l'adresse e-mail vérifiée de l'appelant. Il les accepte (`POST /iam/v1alpha1/me/invitations/{invitation_id}/accept`) ou les refuse (`.../decline`). Accepter ne baisse jamais un niveau déjà détenu.

- **IAM : quitter** — `POST /iam/v1alpha1/organizations/{organization_id}/leave` et `POST /iam/v1alpha1/projects/{project_id}/leave` retirent à l'appelant tous ses niveaux sur l'organisation et ses projets, ou sur le projet. Le compte est conservé. Le dernier superadmin disposant d'un mot de passe ne peut pas quitter l'organisation.

- **IAM : revue des accès** — `GET /iam/v1alpha1/organizations/{organization_id}/access-review` liste chaque niveau de chaque membre, avec sa date, son auteur et son origine (console ou invitation), et signale les membres externes à l'organisation.

- **IAM : comptes gérés par l'organisation** — Bloquer, débloquer, réinitialiser les identifiants et supprimer un compte (`POST .../accounts/{user_id}/block`, `/unblock`, `/reset-credentials`, `DELETE .../accounts/{user_id}`). Ces opérations ne portent que sur les comptes que l'organisation gère. Une organisation ne gère un compte qu'après avoir vérifié son domaine e-mail, ce qui n'est pas encore disponible : d'ici là, elles répondent `60212`.

- **IAM : limites par organisation** — Le nombre de membres, d'invitations en attente et d'invitations envoyées par heure est limité selon l'offre de l'organisation. Le support peut relever ces limites.

- **Codes d'erreur** — Le format des erreurs est décrit dans [Erreurs](/api/errors/).

| Code | HTTP | Signification |
| --- | --- | --- |
| `60003` | 403 | Niveau demandé au-dessus du vôtre |
| `60004` | 404 | Invitation introuvable, ou adressée à une autre personne |
| `60115` | 400 | Niveau inconnu (ni `read`, ni `write`, ni `admin`, ni `superadmin`) |
| `60120` | 400 | Invitation invalide : adresse, doublon, niveaux ou projet |
| `60207` | 409 | Dernier superadmin disposant d'un mot de passe : nommez-en un autre d'abord |
| `60208` | 403 | Le membre a un niveau supérieur au vôtre |
| `60209` | 409 | Vous ne pouvez pas baisser vos propres niveaux |
| `60211` | 409 | Ce compte ne peut pas devenir superadmin (sans mot de passe, sans second facteur, ou connecté par le SSO de son entreprise) |
| `60212` | 403 | Compte non géré par l'organisation |
| `60213` | 409 | Opération impossible sur un compte connecté par SSO |
| `60214` | 409 | Nombre maximal de membres de l'organisation atteint |
| `60215` | 409 | Nombre maximal d'invitations en attente atteint |
| `60216` | 429 | Trop d'invitations envoyées dans l'heure : réessayez plus tard |
| `60220` | 409 | Transfert du compte refusé : l'adresse n'est pas dans un domaine vérifié de l'organisation |
| `60221` | 409 | L'invitation n'est plus en attente (acceptée, refusée, expirée ou annulée) |

## Modifié

Ces changements modifient un comportement existant. Vérifiez-les si vous appelez l'API depuis vos propres outils.

- **IAM : modifier un membre** — `PATCH /iam/v1alpha1/organizations/{organization_id}/users/{name}` ne change plus que les niveaux du membre : `tiers`, avec `updateMask: "tiers"`. Les niveaux donnés remplacent ceux du membre sur l'organisation et ses projets. Baisser ou retirer un accès déconnecte le membre.

- **IAM : retirer un membre** — `DELETE /iam/v1alpha1/organizations/{organization_id}/users/{name}` retire au membre ses accès à l'organisation et à ses projets, et conserve son compte. Il supprimait le compte.

- **IAM : identifiant d'un membre** — `{name}` est l'identifiant du compte, celui que renvoie `GET .../users` dans `id`, et non plus son nom d'utilisateur.

- **IAM : réponses** — Un membre est décrit par ses niveaux (`tiers`), le type de son compte (`accountType`), et deux indicateurs : le compte est géré par l'organisation (`owned`), ou il est externe à l'organisation (`external`). Le champ `groups` est retiré.

## Retiré

- **IAM : création d'un utilisateur** — `POST /iam/v1alpha1/organizations/{organization_id}/users` est retiré. Invitez la personne à la place.

## Sécurité

- **Comptes : second facteur** — Le second facteur va devenir obligatoire pour tout compte qui se connecte avec un mot de passe. Les comptes existants qui n'en ont pas devront en enregistrer un à leur prochaine connexion. La date et un éventuel délai de mise en conformité seront annoncés avant l'activation. Un compte qui se connecte par le SSO de son entreprise suit les règles de son fournisseur d'identité.

:::warning Migration
- Remplacez la création d'utilisateurs par des invitations (`POST .../invitations`).
- Dans `PATCH .../users/{name}`, n'envoyez plus que `tiers`, avec `updateMask: "tiers"`. Les champs `enabled`, `email`, `firstname`, `lastname` et `groups` ne sont plus acceptés.
- Utilisez l'`id` du membre dans `{name}`, et plus son nom d'utilisateur.
- `DELETE .../users/{name}` ne supprime plus le compte : il retire seulement l'accès à l'organisation.
- Lisez les accès dans `tiers` plutôt que dans `groups`.
:::
