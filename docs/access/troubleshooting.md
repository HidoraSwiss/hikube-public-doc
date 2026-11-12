---
sidebar_position: 7
title: "Dépannage — Gestion des accès"
sidebar_label: Dépannage
description: "Codes d'erreur 60xxx de la gestion des accès Hikube (membres, invitations, domaines, connexion SSO, role bindings) : signification et action."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Dépannage — Gestion des accès

La console affiche un message pour chaque refus. Les tableaux ci-dessous donnent le code de l'erreur (`60xxx`), sa signification et l'action à mener. Si vous contactez le support, indiquez le message affiché et l'heure de l'opération.

## Membres et rangs

| Code | Message | Que faire |
|---|---|---|
| `60003` | Vous ne pouvez pas donner un rang supérieur au vôtre | Demandez à un membre de rang suffisant |
| `60206` | Les rangs de ce compte viennent du fournisseur d'identité | Changez-les dans votre annuaire (voir [role bindings](./how-to/sso-role-bindings.md)) |
| `60207` | L'organisation doit garder au moins un super-administrateur pouvant se connecter avec un mot de passe | Nommez d'abord un autre super-administrateur |
| `60208` | Ce membre a un rang supérieur au vôtre | Demandez à un super-administrateur |
| `60209` | Vous ne pouvez pas réduire ni retirer vos propres rangs | Demandez à un autre administrateur, ou [quittez l'organisation](./how-to/manage-members.md#quitter-lorganisation-ou-un-projet) |
| `60210` | Le projet doit garder au moins un administrateur direct | Nommez d'abord un autre administrateur du projet |
| `60211` | Un super-administrateur doit avoir un mot de passe et un second facteur, sans lien avec un fournisseur d'identité | Enregistrez un [second facteur](./how-to/set-up-second-factor.md), ou choisissez un compte avec mot de passe |
| `60115` | Rang inconnu, ou **Super-administration** demandée sur un projet | Choisissez **Lecture**, **Utilisation** ou **Administration** sur un projet |
| `60015` | Le rang n'est pas encore prêt sur un projet tout juste créé | Réessayez dans quelques secondes |
| `60005` | Service momentanément indisponible | Réessayez |

## Invitations

| Code | Message | Que faire |
|---|---|---|
| `60004` | Invitation introuvable | Connectez-vous avec le compte de l'adresse invitée, dont l'adresse est vérifiée |
| `60221` | L'invitation n'est plus en attente | Elle a expiré, été annulée ou déjà acceptée : demandez-en une nouvelle |
| `60214` | L'organisation a atteint son nombre maximal de membres | Retirez un membre, ou contactez le support |
| `60215` | Nombre maximal d'invitations en attente atteint | Annulez des invitations, ou attendez qu'elles soient acceptées |
| `60216` | Trop d'invitations envoyées dans l'heure | Réessayez plus tard |
| `60222` | L'organisation qui possède votre compte ne lui permet pas de rejoindre d'autres organisations | Demandez à ses administrateurs (voir [Membres externes](./how-to/invite-members.md#membres-externes)) |
| `60120` | Invitation invalide : adresse, doublon, aucun rang ou projet | Corrigez la saisie |

## Transfert de compte

| Code | Message | Que faire |
|---|---|---|
| `60220` | L'adresse n'est sur aucun domaine vérifié de l'organisation | Vérifiez le domaine, ou acceptez sans transférer le compte |
| `60219` | Le compte a des accès dans une autre organisation | Acceptez sans transférer le compte |
| `60212` | Le compte n'appartient pas à l'organisation | Vous ne pouvez que retirer ses accès |
| `60213` | Action impossible sur un compte SSO : ses identifiants sont chez votre fournisseur | Agissez chez votre fournisseur d'identité |

## Domaines

| Code | Message | Que faire |
|---|---|---|
| `60110` | Domaine invalide | Saisissez un nom d'hôte d'au moins deux libellés, 235 caractères au plus |
| `60111` | Messagerie publique ou suffixe public | Déclarez le domaine de votre entreprise |
| `60118` | Limite dépassée, par exemple un 21e domaine | Retirez un domaine qui ne sert plus |
| `60201` | L'enregistrement TXT est absent ou ne porte pas le jeton | Republiez-le ; un enregistrement tout juste publié peut mettre le TTL négatif de la zone à être visible |
| `60013` | La consultation DNS a échoué | Réessayez |
| `60202` | Le domaine est vérifié par une autre organisation | Contactez le support pour le transférer |
| `60203` | La vérification a expiré | **Relancer la vérification** |
| `60204` | Le domaine est déjà vérifié | Republiez son enregistrement plutôt que de relancer |
| `60205` | La connexion SSO autorise ce domaine | Retirez-le d'abord de ses **Domaines autorisés** |
| `60010` | Domaine introuvable dans l'organisation | Actualisez la page |

## Connexion SSO et role bindings

| Code | Message | Que faire |
|---|---|---|
| `60112` | Document de découverte refusé : injoignable, émetteur différent, point de terminaison ou signature manquants ; ou passage de Google à un autre fournisseur | Copiez l'URL de découverte telle que votre fournisseur l'affiche (voir [Exigences techniques](./concepts.md#exigences-techniques)) |
| `60119` | SAML n'est pas pris en charge | Utilisez OpenID Connect |
| `60113` | Nom de claim invalide | Un nom ou un chemin pointé ; un point dans un nom s'écrit `\.` |
| `60114` | Scope invalide, ou projet du role binding introuvable | Retirez `offline_access` ; choisissez un projet de l'organisation |
| `60118` | Champ hors limites : connexion Google sans exactement un domaine, valeur de plus de 255 caractères, 257e role binding… | Corrigez le champ nommé dans le message |
| `60200` | Un domaine autorisé, ou celui requis pour activer, n'est pas vérifié | [Vérifiez le domaine](./how-to/verify-domain.md) |
| `60201` | L'enregistrement TXT d'un domaine a disparu | Republiez-le, puis réessayez |
| `60218` | L'organisation a déjà une connexion SSO | Modifiez ou remplacez la connexion existante |
| `60117` | Role binding sur une connexion sans claim des rôles | Renseignez d'abord le **Claim des rôles** |
| `60116` | Ce projet ne peut pas recevoir de rang à part | Donnez le rang sur l'organisation, ou contactez le support |
| `60223` | La valeur est déjà liée sur la connexion | Modifiez le role binding existant |
| `60011` / `60012` | Connexion ou role binding introuvable | Actualisez la page |

## Problèmes de connexion SSO

### Une personne est refusée à la connexion

- Son adresse n'est pas sur un **Domaine autorisé** : `bob@eu.acme.com` n'est pas `acme.com`.
- Son adresse n'est pas dans le jeton d'identité (Entra ID : attribut de messagerie vide).
- Elle n'est pas assignée à l'application chez votre fournisseur.
- **Invitation requise** est activée et elle n'a pas été invitée.

### Une personne se connecte mais n'a aucun accès

- Sans claim des rôles : un administrateur doit lui donner un rang.
- Avec un claim des rôles : aucun role binding ne correspond à une valeur de son jeton. Vérifiez la valeur exacte, majuscules comprises. Avec Entra ID et le claim `groups`, au-delà de 200 groupes le claim est absent.
- Avec **Confirmer l'adresse par un lien** : elle n'a pas encore ouvert le lien.
- La limite de membres est atteinte.

### Plus personne ne peut se connecter par SSO

- Le secret client a expiré chez votre fournisseur : saisissez le nouveau dans **Modifier les réglages**.
- La connexion est **Inactive** : un domaine autorisé a peut-être été retiré.
- Connectez-vous avec un super-administrateur qui a un mot de passe.

<NavigationFooter
  seeAlso={[
    {label: "Erreurs de l'API", href: "../../api/errors"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
