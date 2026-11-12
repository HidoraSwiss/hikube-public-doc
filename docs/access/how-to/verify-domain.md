---
sidebar_position: 6
title: "Comment vérifier un domaine"
description: "Prouver que votre organisation possède un domaine par un enregistrement DNS TXT _hikube-challenge : déclaration, vérification, expiration, relance, délégation par CNAME et retrait."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Vérifier un domaine

Une organisation prouve qu'elle possède un domaine, par exemple `acme.com`, en
publiant un enregistrement DNS TXT. Un domaine vérifié sert à :

- la [connexion SSO](../quick-start.md) : seules les adresses des
  domaines vérifiés peuvent l'utiliser ;
- le [transfert d'un compte](./transfer-account.md) à l'organisation.

Prérequis : le rang **Administration** ou plus.

## 1. Déclarer le domaine

1. Ouvrez **Membres de l'organisation**, onglet **Domaines**.
2. Dans la carte **Domaines vérifiés**, cliquez sur **Ajouter un domaine**.
3. **Domaine** : `acme.com`, sans `http://` ni `@`.
4. Cliquez sur **Ajouter**.

La console affiche l'enregistrement à publier :

| Type | Nom | Valeur |
|---|---|---|
| `TXT` | `_hikube-challenge.acme.com` | `hikube-verify=<jeton>` |

Chaque champ a un bouton de copie. Le jeton est propre à votre organisation et
à ce domaine. Le domaine est **En attente**.

## 2. Publier l'enregistrement

Publiez l'enregistrement `TXT` dans la zone DNS de `acme.com` **dans les
7 jours**.

Vérifiez qu'il est visible depuis un résolveur public :

```bash
dig +short TXT _hikube-challenge.acme.com @9.9.9.9
```

Résultat attendu :

```text
"hikube-verify=<jeton>"
```

Après une réponse « absent », un résolveur garde cette réponse pendant le TTL
négatif de la zone (le minimum de son enregistrement SOA) : souvent quelques
minutes, parfois jusqu'à une heure. Publiez l'enregistrement avant de lancer la
vérification.

## 3. Vérifier

Cliquez sur **Vérifier**. La console affiche **acme.com est vérifié.** et le
statut passe à **Vérifié**.

## Statuts

| Statut | Signification | Que faire |
|---|---|---|
| **En attente** | Enregistrement à publier avant la date affichée | Publiez-le, puis **Vérifier** |
| **Expiré** | Non vérifié dans les 7 jours | **Relancer la vérification** : nouveau jeton, nouveau délai de 7 jours |
| **Vérifié** | L'organisation possède le domaine | Laissez l'enregistrement en place |

Le menu **Actions** d'un domaine en attente propose aussi **Générer un nouvel
enregistrement**. L'ancien enregistrement ne vaut alors plus rien : publiez le
nouveau avant de vérifier.

## Règles

- **Un sous-domaine est un domaine à part.** Vérifier `acme.com` ne vérifie pas
  `eu.acme.com`. Chaque sous-domaine a son propre enregistrement. Une adresse
  `bob@eu.acme.com` n'appartient pas au domaine `acme.com`.
- **Domaines refusés.** Les messageries publiques (`gmail.com`,
  `outlook.com`…) et les suffixes publics (`co.uk`, `github.io`…). Un
  sous-domaine d'un suffixe public, comme `acme.github.io`, est accepté.
- **Longueur.** 235 caractères au plus. Un domaine accentué est converti dans
  sa forme ASCII : `bücher.ch` devient `xn--bcher-kva.ch`.
- **20 domaines au plus** par organisation, quel que soit leur statut.
- **Un domaine, une organisation.** Si une autre organisation a déjà vérifié le
  domaine, la vérification est refusée.

## Laisser l'enregistrement en place

:::warning Ne supprimez pas l'enregistrement
L'enregistrement doit rester publié tant que l'organisation garde le domaine.
Hikube le contrôle à nouveau avant chaque opération qui donne un nouvel effet au
domaine.
:::

Opérations qui contrôlent à nouveau l'enregistrement :

- l'activation de la connexion SSO, pour chaque domaine qu'elle sert ;
- l'ajout d'un domaine aux **Domaines autorisés** de la connexion SSO ;
- le transfert d'un compte à l'organisation.

Envoyer une invitation ne le contrôle pas. Un contrôle réussi vaut une heure
pour le domaine.

La console affiche le dernier contrôle sous le domaine : **enregistrement
trouvé**, **enregistrement absent** ou **le DNS n'a pas répondu**.

### Si l'enregistrement a disparu

L'opération est refusée. Rien d'autre ne change :

- le domaine reste **Vérifié** ;
- les comptes, leurs accès et leurs connexions continuent de fonctionner.

Republiez l'enregistrement avec le même jeton, affiché avec le domaine, puis
refaites l'opération. Si le DNS n'a pas répondu, réessayez un peu plus tard.

## Déléguer l'enregistrement par un CNAME

Un `CNAME` sur `_hikube-challenge.acme.com` est suivi : vous pouvez publier le
`TXT` dans une autre zone. La valeur doit correspondre exactement.

:::warning CNAME générique
Un `CNAME` générique, par exemple `*.acme.com CNAME saas.exemple.net`, couvre
aussi `_hikube-challenge.acme.com`. Qui contrôle les enregistrements `TXT` de
`saas.exemple.net` peut alors répondre à la vérification de `acme.com`. Avec un
`CNAME` générique, publiez le `TXT` explicitement sur
`_hikube-challenge.acme.com` : un nom explicite l'emporte sur le générique.
:::

## Un domaine vérifié par une autre organisation

Un domaine ne change d'organisation que par le **support Hidora**, par exemple
après un rachat ou la vente du domaine. Le support le retire à l'organisation
qui le détient, avec l'accord de son super-administrateur ou sur preuve de
possession. Votre organisation le vérifie ensuite normalement. Les comptes que
l'ancienne organisation gère déjà restent les siens.

## Retirer un domaine

1. Dans le menu **Actions** du domaine, cliquez sur **Retirer**.
2. Confirmez **Retirer**.

Le domaine redevient libre pour une autre organisation. Les comptes de ce
domaine qui appartiennent à l'organisation lui restent.

Un domaine nommé dans les **Domaines autorisés** de la connexion SSO ne peut
pas être retiré : retirez-le d'abord de la connexion. Une connexion qui ne sert
plus aucun domaine est désactivée.

<NavigationFooter
  nextSteps={[
    {label: "Créer la connexion SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Démarrage rapide", href: "../../quick-start"},
    {label: "Dépannage", href: "../../troubleshooting"},
  ]}
/>
