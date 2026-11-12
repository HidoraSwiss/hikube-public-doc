---
sidebar_position: 1
title: "Comment inviter des personnes"
description: "Inviter des personnes dans une organisation ou un projet Hikube, renvoyer ou annuler une invitation, accepter ou refuser une invitation reçue, membres externes."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Inviter des personnes

Une invitation est le seul moyen d'ajouter une personne à une organisation. La
personne reçoit les rangs invités quand elle **accepte**, pas avant.

## Inviter

Prérequis : le rang **Administration** ou plus sur l'organisation.

1. Ouvrez **Membres de l'organisation**, onglet **Membres**.
2. Dans la carte **Invitations en attente**, cliquez sur **Inviter des
   personnes**.
3. **Adresses e-mail** : par exemple `ana@acme.com, bruno@acme.com`. Séparez
   les adresses par des virgules ou des retours à la ligne, 50 au plus.
4. Choisissez les rangs, **Sur l'organisation** et/ou **Sur un projet**. Au
   moins un rang est obligatoire, jamais au-dessus du vôtre.
5. Cliquez sur **Inviter … personne(s)**.

L'invitation est valable **7 jours**.

- **La personne a déjà un compte Hikube** : elle ne reçoit pas d'e-mail. Elle
  trouve l'invitation à sa prochaine connexion à la console.
- **La personne n'a pas de compte** : elle reçoit un e-mail pour créer son
  compte. Elle y vérifie son adresse, choisit un mot de passe et enregistre un
  [second facteur](./set-up-second-factor.md).

Inviter de nouveau une adresse qui a déjà une invitation en attente remplace
l'ancienne.

Pour inviter sur un seul projet, utilisez **Inviter** dans la carte **Membres
du projet** des paramètres du projet (voir
[Membres d'un projet](./manage-members.md#membres-dun-projet)).

## Suivre, renvoyer ou annuler

La carte **Invitations en attente** liste l'**E-mail**, les **Rangs invités** et
la date **Expire le**. Une invitation expirée porte le badge **Expirée**.

- **Renvoyer** : envoie de nouveau l'invitation et la prolonge de 7 jours.
- **Annuler** : cliquez sur l'icône d'annulation, puis **Annuler
  l'invitation**. Elle ne peut plus être acceptée. Vous pouvez inviter cette
  adresse à nouveau.

À l'acceptation, chaque rang invité est plafonné au rang que tient alors
l'auteur de l'invitation. Si l'auteur a perdu son rang entre-temps, ce rang
n'est pas donné.

### Limites

Une organisation a un nombre maximal de membres, d'invitations en attente et
d'invitations envoyées par heure (un renvoi compte). Au-delà, la console
affiche un message : retirez un membre, annulez des invitations ou réessayez
plus tard. Pour relever une limite, contactez le support.

## Répondre à une invitation

1. Connectez-vous à la console.
2. Un badge apparaît sur **Invitations**, dans le menu de votre profil.
   Cliquez dessus.
3. Chaque invitation indique l'**Organisation**, son auteur (**Envoyée par …**),
   les **Rangs invités** et sa date d'expiration.
4. Cliquez sur **Accepter**, ou sur **Refuser** puis **Refuser l'invitation**.

Après **Accepter**, vos accès apparaissent d'ici quelques minutes ; actualisez
alors la page. Une invitation refusée ne peut plus être acceptée : il faudra en
recevoir une nouvelle.

L'invitation est liée à votre adresse e-mail **vérifiée**. Connectez-vous avec
le compte de l'adresse invitée.

:::note Invitation à la Super-administration
Une invitation qui donne **Super-administration** ne s'accepte qu'avec un
compte qui a un mot de passe et un second facteur, sans lien avec un
fournisseur d'identité. Enregistrez d'abord votre second facteur. L'invitation
reste en attente d'ici là.
:::

## Membres externes

Vous pouvez inviter une personne qui a déjà un compte, y compris un compte qui
appartient à une autre organisation. Elle devient **membre externe** : elle
garde son compte, ses identifiants et ses accès ailleurs. Vous ne pouvez que
lui donner et lui retirer des accès dans votre organisation.

:::info Collaboration externe refusée par défaut
Un compte qui appartient à une organisation (compte de l'organisation ou compte
SSO) ne peut pas, par défaut, rejoindre une autre organisation. S'il accepte
votre invitation, Hikube lui répond que son organisation ne le permet pas. De
votre côté, l'invitation reste en attente jusqu'à son expiration.

L'organisation propriétaire peut autoriser la collaboration externe. Ce réglage
n'est pas encore dans la console : son super-administrateur s'adresse au
support. Les comptes personnels ne sont jamais restreints.
:::

## Invitation et connexion SSO

Si votre connexion SSO a l'option **Invitation requise**, inviter une adresse
d'un domaine autorisé crée tout de suite son compte SSO, sans e-mail. Voir
[Gérer la connexion SSO](./manage-sso-connection.md#invitation-requise).

<NavigationFooter
  nextSteps={[
    {label: "Gérer les membres", href: "../manage-members"},
  ]}
  seeAlso={[
    {label: "Confier un compte à l'organisation", href: "../transfer-account"},
    {label: "Second facteur", href: "../set-up-second-factor"},
  ]}
/>
