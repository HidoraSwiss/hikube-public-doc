---
sidebar_position: 1
title: Avant de commencer
description: "Connexion unique (SSO) de votre organisation Hikube avec votre fournisseur d'identité OpenID Connect : principe, prérequis et liste de contrôle avant la configuration."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Connexion SSO : avant de commencer

Avec la connexion unique (SSO), les personnes de votre organisation se
connectent à Hikube avec le compte de leur entreprise, chez votre fournisseur
d'identité (Microsoft Entra ID, Okta, Google Workspace…), au lieu d'un mot de
passe Hikube.

Votre organisation a **une seule connexion SSO**. Elle utilise le protocole
OpenID Connect. SAML n'est pas pris en charge.

## Qui configure la connexion

Seul un membre de rang **Super-administration** de l'organisation crée,
modifie ou supprime la connexion SSO. L'onglet **Connexion SSO** des **Réglages
de l'organisation** n'apparaît qu'à lui.

## Prérequis

- **Au moins un domaine vérifié.** Seules les adresses des domaines vérifiés de
  l'organisation peuvent utiliser la connexion. Sans domaine vérifié, la
  connexion peut être créée, pas activée. Voir
  [Vérifier un domaine](../domains.md).
- **Un accès d'administration à votre fournisseur d'identité**, pour y
  enregistrer une application.

## Liste de contrôle

Vérifiez chaque point avant d'enregistrer l'application chez votre fournisseur.

1. **URI de redirection.** La console l'affiche une fois la connexion créée,
   avec un bouton de copie. Elle se termine par `/broker/org-<nom de
   l'organisation>/endpoint`, par exemple `…/broker/org-acme/endpoint`.
   Enregistrez-la telle quelle chez votre fournisseur. Elle ne change pas si
   vous remplacez le fournisseur.
2. **Une application web confidentielle, dédiée à Hikube.** Une application web
   avec un secret client. Pas de client public ni d'application monopage.
   Réservez-la aux personnes ou aux groupes qui ont besoin de Hikube.
3. **Les claims dans le jeton d'identité.** L'adresse e-mail (`email`), le
   prénom, le nom et, si vous l'utilisez, le claim des rôles doivent être dans
   le **jeton d'identité** (*ID token*). Hikube ne les lit nulle part ailleurs.
   Hikube demande toujours les scopes `openid`, `email` et `profile`.
4. **Confirmation de l'adresse.** L'option **Confirmer l'adresse par un lien**
   est activée par défaut : chaque nouvelle personne confirme son adresse une
   fois, par un lien reçu par e-mail. Désactivez-la seulement si votre
   fournisseur envoie `email_verified` dans le jeton d'identité. Microsoft Entra
   ID ne l'envoie pas.
5. **PKCE.** Laissez **PKCE** actif, sauf si votre fournisseur le refuse.
6. **Claim des rôles.** Renseignez-le seulement si votre fournisseur doit
   décider des rangs dans Hikube. Laissez-le vide pour donner les rangs dans
   Hikube. Voir [Donner les rangs depuis votre fournisseur](./role-bindings.md).
7. **Second facteur.** La MFA des comptes SSO est imposée par votre fournisseur,
   pas par Hikube.
8. **Seulement les personnes invitées, ou tout le monde ?** Par défaut, toute
   personne d'un domaine autorisé que votre fournisseur laisse passer obtient un
   compte à sa première connexion. Activez **Invitation requise** pour
   n'admettre que les personnes que vous invitez.
9. **Gardez un super-administrateur avec un mot de passe.** Au moins un
   super-administrateur continue de se connecter avec son mot de passe Hikube et
   son second facteur. C'est votre accès de secours si votre fournisseur est
   indisponible. Un compte avec un mot de passe n'est jamais redirigé vers votre
   fournisseur.

## Exigences techniques

| Réglage chez votre fournisseur | Valeur |
|---|---|
| Type d'application | Application web, confidentielle, flux par code d'autorisation |
| URI de redirection | Celle affichée par la console |
| Authentification du client | Secret client |
| Scopes | `openid`, `email`, `profile` |
| Signature du jeton d'identité | Asymétrique (RS256, ES256…). HS256 seul est refusé |
| PKCE | S256, activé par défaut |

## Fournisseurs

| Fournisseur | État |
|---|---|
| [Okta](./okta.md) | Vérifié par Hikube |
| [Microsoft Entra ID](./entra-id.md) | Vérifié par Hikube |
| [Google Workspace](./google-workspace.md) | Non vérifié |
| [Auth0](./auth0.md) | Non vérifié |

Tout autre fournisseur OpenID Connect qui propose le flux par code
d'autorisation avec un client confidentiel et une signature asymétrique peut
convenir. Il n'a pas été vérifié par Hikube : contactez le support avant de le
mettre en production.

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../create-connection"},
  ]}
  seeAlso={[
    {label: "Vérifier un domaine", href: "../../domains"},
    {label: "Sécurité et retrait des accès", href: "../security"},
  ]}
/>
