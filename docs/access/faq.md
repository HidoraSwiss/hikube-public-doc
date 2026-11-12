---
sidebar_position: 6
title: "FAQ — Gestion des accès"
sidebar_label: FAQ
description: "Questions fréquentes sur la gestion des accès Hikube : délais de retrait d'un accès, garanties de la connexion SSO, MFA, super-administrateur de secours, clés d'API."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# FAQ — Gestion des accès

### En combien de temps un accès retiré prend-il effet ?

| Où vous retirez l'accès | Délai |
|---|---|
| **Dans Hikube** : retrait d'un rang, d'un membre ou d'un role binding, suppression de la connexion SSO | **5 minutes** au plus |
| **Chez votre fournisseur** : personne partie, groupe retiré, assignation supprimée | La personne ne peut plus se reconnecter. Une session Hikube déjà ouverte dure jusqu'à sa fin : après une période d'inactivité, et au plus tard à sa durée maximale |

Hikube n'utilise pas la déconnexion déclenchée par le fournisseur (*back-channel logout*). Microsoft Entra ID ne la propose pas ; Okta et Google ne l'annoncent pas dans leur document de découverte.

### Comment couper tout de suite l'accès d'une personne qui part ?

Désactivez-la chez votre fournisseur **et** retirez-la dans Hikube (voir [Gérer les membres](./how-to/manage-members.md#retirer-laccès-dun-membre)). Le retrait dans Hikube prend effet en 5 minutes au plus. Révoquez aussi les clés d'API qu'elle a créées.

### Que garantit Hikube pour la connexion SSO, et que reste-t-il à ma charge ?

| Garanti par Hikube, quelle que soit la configuration | Recommandé, sous votre responsabilité |
|---|---|
| L'émetteur est celui du document de découverte, en HTTPS, sans adresse interne | Une application dédiée à Hikube |
| Client confidentiel, flux par code d'autorisation, signature du jeton vérifiée avec les clés publiées par votre fournisseur | L'application réservée aux personnes ou aux groupes qui ont besoin de Hikube (**Assignment required** d'Entra ID, assignations d'Okta, écran de consentement **Internal** de Google, Auth0 sans inscription) |
| Le domaine hébergé de Google et l'émetteur du locataire Entra ID | Un identifiant de personne (`sub`) stable, jamais réattribué à une autre personne |
| Une adresse e-mail présente dans le jeton d'identité, sur un domaine vérifié de l'organisation | Une adresse e-mail que la personne ne peut pas changer elle-même |
| L'adresse confirmée par un lien, sauf si vous désactivez **Confirmer l'adresse par un lien** | La désactivation des personnes qui quittent l'entreprise, chez votre fournisseur |
| Les claims lus dans le jeton d'identité uniquement | Le remplacement du secret client avant son expiration |
| | Le second facteur (MFA), imposé par votre fournisseur |

### Hikube demande-t-il un second facteur aux comptes SSO ?

Non. C'est votre fournisseur d'identité qui l'impose : activez la MFA chez lui pour toutes les personnes qui accèdent à Hikube. Les comptes avec un mot de passe Hikube ont toujours un second facteur obligatoire (voir [Second facteur](./how-to/set-up-second-factor.md)).

### Pourquoi garder un super-administrateur avec un mot de passe ?

C'est votre accès de secours si votre fournisseur d'identité est indisponible ou mal configuré. Hikube l'impose : **Super-administration** ne va qu'à un compte avec un mot de passe et un second facteur, et l'organisation en garde toujours au moins un.

### Un membre retiré garde-t-il ses clés d'API ?

Oui. Une clé garde ses scopes, même si la personne qui l'a créée perd ses droits. Révoquez-la dans la carte **Clés d'API** des paramètres du projet (voir [Authentification de l'API](../../api/authentication)).

### Une clé d'API peut-elle gérer les membres ?

Non. Une clé agit sur les ressources d'un projet. Les membres, invitations, domaines et la connexion SSO se gèrent dans la console.

### Une personne peut-elle être membre de plusieurs organisations ?

Oui, avec un compte personnel. Un compte qui appartient à une organisation (compte de l'organisation ou compte SSO) ne peut pas, par défaut, rejoindre une autre organisation (voir [Membres externes](./how-to/invite-members.md#membres-externes)).

### Puis-je utiliser SAML ?

Non. La connexion SSO utilise OpenID Connect.

### Puis-je avoir deux connexions SSO ?

Non, une seule par organisation. Pour changer d'application ou de fournisseur, [remplacez le fournisseur](./how-to/manage-sso-connection.md#remplacer-le-fournisseur) : les comptes SSO sont gardés.

<NavigationFooter
  seeAlso={[
    {label: "Concepts", href: "../concepts"},
    {label: "Dépannage", href: "../troubleshooting"},
  ]}
/>
