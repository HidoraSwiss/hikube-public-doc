---
sidebar_position: 10
title: Sécurité et retrait des accès
description: "Ce que Hikube garantit pour la connexion SSO, ce qui reste sous votre responsabilité, et en combien de temps un accès retiré prend effet."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Sécurité de la connexion SSO et retrait des accès

## Ce que Hikube garantit, ce qui reste à vous

| Garanti par Hikube, quelle que soit la configuration | Recommandé, sous votre responsabilité |
|---|---|
| L'émetteur est celui du document de découverte, en HTTPS, sans adresse interne | Une application dédiée à Hikube |
| Client confidentiel, flux par code d'autorisation, signature du jeton vérifiée avec les clés publiées par votre fournisseur | L'application réservée aux personnes ou aux groupes qui ont besoin de Hikube (**Assignment required** d'Entra ID, assignations d'Okta, écran de consentement **Internal** de Google, Auth0 sans inscription) |
| Le domaine hébergé de Google et l'émetteur du locataire Entra ID | Un identifiant de personne (`sub`) stable, jamais réattribué à une autre personne |
| Une adresse e-mail présente dans le jeton d'identité, sur un domaine vérifié de l'organisation | Une adresse e-mail que la personne ne peut pas changer elle-même |
| L'adresse confirmée par un lien, sauf si vous désactivez **Confirmer l'adresse par un lien** | La désactivation des personnes qui quittent l'entreprise, chez votre fournisseur |
| Les claims lus dans le jeton d'identité uniquement | Le remplacement du secret client avant son expiration |
| | Le second facteur (MFA), imposé par votre fournisseur |

## Le second facteur des comptes SSO

Hikube ne demande pas de second facteur à un compte SSO : c'est votre
fournisseur d'identité qui l'impose. Activez la MFA chez lui pour toutes les
personnes qui accèdent à Hikube.

Les comptes avec un mot de passe Hikube ont toujours un second facteur
obligatoire (voir [Second facteur](../mfa.md)).

## Retirer un accès

| Où vous retirez l'accès | Délai |
|---|---|
| **Dans Hikube** : retrait d'un rang, d'un membre ou d'un role binding, suppression de la connexion SSO | **5 minutes** au plus |
| **Chez votre fournisseur** : personne partie, groupe retiré, assignation supprimée | La personne ne peut plus se reconnecter. Une session Hikube déjà ouverte dure jusqu'à sa fin : après une période d'inactivité, et au plus tard à sa durée maximale |

Hikube n'utilise pas la déconnexion déclenchée par le fournisseur (*back-channel
logout*). Microsoft Entra ID ne la propose pas ; Okta et Google ne l'annoncent
pas dans leur document de découverte.

:::tip Couper un accès tout de suite
Quand une personne quitte l'entreprise, désactivez-la chez votre fournisseur
**et** retirez-la dans Hikube. Le retrait dans Hikube prend effet en 5 minutes
au plus.
:::

Une personne retirée d'un groupe chez votre fournisseur perd le rang de ce
groupe à sa prochaine connexion (voir
[Donner les rangs depuis votre fournisseur](./role-bindings.md)).

<NavigationFooter
  seeAlso={[
    {label: "Gérer les membres", href: "../../members"},
    {label: "Revue des accès", href: "../../access-review"},
  ]}
/>
