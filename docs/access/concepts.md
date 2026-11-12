---
sidebar_position: 2
title: Concepts
description: "Organisations, projets, rangs, qui fait quoi, types de membres, domaines vérifiés, connexion SSO et role bindings : les notions de la gestion des accès Hikube."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Concepts de la gestion des accès

## Organisation et projets

- L'**organisation** représente votre entreprise. Elle regroupe vos membres et
  vos projets.
- Un **projet** est un espace isolé de l'organisation : vos VM, clusters et
  bases de données y vivent.
- Un rang sur l'organisation vaut pour tous ses projets. Un rang sur un projet
  s'y ajoute.

## Les quatre rangs

| Rang | Valeur | Ce qu'il permet |
|---|---|---|
| **Lecture** | `read` | Consulter les ressources |
| **Utilisation** | `write` | Lecture, plus l'utilisation des ressources |
| **Administration** | `admin` | Créer, modifier et supprimer les ressources ; gérer les membres |
| **Super-administration** | `superadmin` | Tous les droits, dont donner ce rang ; gérer la connexion SSO |

Un rang inclut les droits des rangs inférieurs. Un membre qui tient plusieurs
rangs sur une même portée est affiché avec le plus élevé.

:::note Pas de super-administration de projet
**Super-administration** est un rang de l'organisation seulement. Sur un
projet, le rang le plus élevé est **Administration**.
:::

## Qui peut faire quoi dans l'organisation

| Action | Lecture | Utilisation | Administration | Super-administration |
|---|:-:|:-:|:-:|:-:|
| Voir les membres, leur e-mail et leur rang | oui | oui | oui | oui |
| Inviter ; annuler et renvoyer les invitations | non | non | oui | oui |
| Donner ou retirer **Lecture**, **Utilisation**, **Administration** | non | non | oui | oui |
| Retirer l'accès d'un membre | non | non | oui | oui |
| Exporter la revue des accès ; gérer les domaines | non | non | oui | oui |
| Agir sur un membre de rang supérieur au sien | non | non | non | oui |
| Donner ou retirer **Super-administration** | non | non | non | oui |
| Gérer la connexion SSO et ses role bindings | non | non | non | oui |
| Baisser son propre rang | non | non | non | non |
| Quitter l'organisation | oui | oui | oui | oui |

Règles qui protègent l'organisation :

- personne ne donne un rang supérieur au sien ;
- personne ne baisse ni ne retire son propre rang : pour partir, on
  [quitte l'organisation](./how-to/manage-members.md#quitter-lorganisation-ou-un-projet) ;
- l'organisation garde toujours au moins un super-administrateur qui se
  connecte avec un mot de passe ;
- **Super-administration** ne va qu'à un compte avec un mot de passe et un
  second facteur, sans lien avec un fournisseur d'identité. L'organisation garde
  ainsi un accès si sa connexion SSO tombe.

## Types de membres

| Membre | À qui appartient le compte | Ce que vos administrateurs peuvent faire |
|---|---|---|
| **Compte de l'organisation** | Votre organisation, après un [transfert](./how-to/transfer-account.md) | Donner et retirer ses accès ; le reste avec le support |
| **Compte SSO** | Votre organisation, créé par votre connexion SSO | Donner et retirer ses accès (ou vos role bindings) |
| **Compte personnel** (membre externe) | La personne | Donner et retirer ses accès dans votre organisation, rien d'autre |
| **Compte d'une autre organisation** (membre externe) | L'autre organisation | Donner et retirer ses accès dans votre organisation, rien d'autre |

Un membre externe garde son compte, ses identifiants et ses accès ailleurs.
Retirer son accès chez vous ne touche pas le reste.

Un **membre d'un seul projet** tient des rangs sur un ou plusieurs projets, et
aucun sur l'organisation. La page des membres l'affiche avec le badge
**Projets seulement**. Il voit le nom de l'organisation et ses projets, rien
d'autre. Son accès prend fin avec le projet.

Par défaut, un compte qui appartient à une organisation ne peut pas rejoindre
une autre organisation : la **collaboration externe** est refusée.

## Second facteur

Tout compte qui se connecte avec un mot de passe Hikube présente aussi un
second facteur. Un compte SSO n'a ni mot de passe ni second facteur dans
Hikube : sa MFA est celle de votre fournisseur d'identité. Voir
[Second facteur](./how-to/set-up-second-factor.md).

## Domaine vérifié

Un domaine vérifié prouve que l'organisation possède un domaine, par exemple
`acme.com`, grâce à un enregistrement DNS `TXT` nommé
`_hikube-challenge.acme.com`. Un domaine n'appartient qu'à une organisation. Un
sous-domaine est un domaine à part. L'enregistrement doit rester publié. Voir
[Vérifier un domaine](./how-to/verify-domain.md).

## Connexion SSO

Avec la connexion unique (SSO), les personnes de votre organisation se
connectent avec le compte de leur entreprise, chez votre **fournisseur
d'identité**, au lieu d'un mot de passe Hikube.

- **Une seule connexion par organisation**, en OpenID Connect. SAML n'est pas
  pris en charge.
- **Les domaines vérifiés seulement.** Seules les adresses des domaines
  autorisés de la connexion, tous vérifiés, peuvent l'utiliser.
- **Un compte SSO** est créé à la première connexion d'une personne. Il
  appartient à l'organisation.
- **Les comptes avec un mot de passe** continuent de se connecter avec lui et
  ne sont jamais redirigés vers votre fournisseur.

### Exigences techniques

| Réglage chez votre fournisseur | Valeur |
|---|---|
| Type d'application | Application web, confidentielle, flux par code d'autorisation |
| URI de redirection | Celle affichée par la console, qui se termine par `/broker/org-<organisation>/endpoint` |
| Authentification du client | Secret client |
| Scopes | `openid`, `email`, `profile` |
| Claims | `email`, prénom, nom et, si vous l'utilisez, le claim des rôles, dans le **jeton d'identité** (*ID token*) |
| Signature du jeton d'identité | Asymétrique (RS256, ES256…). HS256 seul est refusé |
| PKCE | S256, activé par défaut |

### Fournisseurs

| Fournisseur | État |
|---|---|
| [Okta](./how-to/sso-okta.md) | Vérifié par Hikube |
| [Microsoft Entra ID](./how-to/sso-entra-id.md) | Vérifié par Hikube |
| [Google Workspace](./how-to/sso-google-workspace.md) | Non vérifié |
| [Auth0](./how-to/sso-auth0.md) | Non vérifié |

Tout autre fournisseur OpenID Connect qui respecte les exigences ci-dessus peut
convenir. Il n'a pas été vérifié par Hikube : contactez le support avant de le
mettre en production.

## Role bindings : une seule source de droits

Un **role binding** associe une valeur du claim des rôles de votre fournisseur
(un groupe ou un rôle de votre annuaire) à un rang Hikube, sur l'organisation ou
sur un projet. Chaque connexion SSO a une seule source de droits :

| Claim des rôles | D'où viennent les rangs des comptes SSO |
|---|---|
| **Renseigné** | Des role bindings uniquement, à chaque connexion. Ils ne se changent plus dans Hikube |
| **Vide** | De Hikube : un administrateur les donne depuis la page des membres |

Un role binding ne donne jamais **Super-administration**. Voir
[Donner les rangs depuis votre fournisseur](./how-to/sso-role-bindings.md).

<NavigationFooter
  nextSteps={[
    {label: "Démarrage rapide : connexion SSO", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Inviter des personnes", href: "../how-to/invite-members"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
