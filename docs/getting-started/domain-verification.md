---
sidebar_position: 4
title: Vérifier un domaine
description: "Prouver que votre organisation possède un domaine par un enregistrement DNS TXT : publication, opérations qui le vérifient à nouveau, délais de propagation et transfert d'un domaine."
---

# Vérifier un domaine de votre organisation

Une organisation prouve qu'elle possède un domaine (par exemple `acme.com`) en
publiant un enregistrement DNS TXT. Un domaine vérifié permet à l'organisation de
gérer les comptes de ses adresses : un membre dont l'adresse est sur ce domaine
peut confier son compte à l'organisation.

:::info Disponibilité
La vérification de domaines arrive avec la gestion des membres de l'organisation.
Elle n'est pas encore proposée dans la console : contactez le support Hidora si
vous en avez besoin.
:::

---

## Publier l'enregistrement

Un administrateur de l'organisation déclare le domaine. Hikube lui donne un
enregistrement à publier dans la zone DNS du domaine :

| Nom | Type | Valeur |
|-----|------|--------|
| `_hikube-challenge.acme.com` | `TXT` | `hikube-verify=<jeton>` |

Le jeton est propre à votre organisation et à ce domaine. Une fois
l'enregistrement publié, l'administrateur demande la vérification. Le domaine
passe alors de **en attente** à **vérifié**.

- **Délai de 7 jours.** Un domaine qui n'est pas vérifié dans les 7 jours
  **expire**. Relancez sa vérification : Hikube donne un nouveau jeton, et
  l'ancien enregistrement ne vérifie plus rien.
- **Un sous-domaine est un domaine à part.** Vérifier `acme.com` ne vérifie pas
  `eu.acme.com`. Chaque sous-domaine a son propre enregistrement. Une adresse
  `bob@eu.acme.com` n'appartient pas au domaine `acme.com`.
- **Domaines refusés.** Les domaines de messagerie publique (`gmail.com`,
  `outlook.com`…) et les suffixes publics (`co.uk`, `github.io`…) ne peuvent pas
  être déclarés. Un sous-domaine d'un suffixe public (`acme.github.io`) peut
  l'être.
- **20 domaines au plus** par organisation, quel que soit leur état.

## Laisser l'enregistrement en place

:::warning Ne supprimez pas l'enregistrement
L'enregistrement doit rester publié tant que l'organisation garde le domaine.
Hikube le vérifie à nouveau avant chaque opération qui donne un nouvel effet au
domaine.
:::

Les opérations qui vérifient à nouveau l'enregistrement :

- l'acceptation d'une invitation en confiant son compte à l'organisation ;
- le transfert d'un compte existant à l'organisation, demandé par la personne ;
- à venir, avec la connexion d'entreprise (SSO) : son activation et le
  changement des domaines qu'elle sert.

Envoyer une invitation ne vérifie pas l'enregistrement. Une vérification réussie
vaut une heure pour le domaine : une série d'acceptations ne consulte le DNS
qu'une fois.

### Si l'enregistrement a disparu

L'opération est refusée avec un message qui demande de republier
l'enregistrement. Rien d'autre ne change :

- le domaine reste **vérifié** ;
- les comptes existants, leurs accès et leurs connexions continuent de
  fonctionner ;
- le résultat de la dernière vérification est affiché aux administrateurs de
  l'organisation.

Republiez l'enregistrement avec le même jeton (il est affiché avec le domaine),
puis refaites l'opération. Une personne qui ne veut pas attendre peut accepter
son invitation sans confier son compte : elle devient membre externe avec son
compte personnel.

Si le DNS n'a pas pu être consulté (délai dépassé, serveur en erreur),
l'opération est refusée sans que cela compte comme un enregistrement absent :
réessayez un peu plus tard.

### Un enregistrement tout juste publié

Hikube interroge des résolveurs DNS publics. Après une réponse « absent », un
résolveur garde cette réponse pendant le TTL négatif de la zone (le minimum de
son enregistrement SOA), souvent quelques minutes, parfois jusqu'à une heure.
Hikube ne garde lui-même aucun résultat « absent » : dès que les résolveurs voient
l'enregistrement, l'opération suivante passe.

:::tip
Publiez l'enregistrement avant de demander la vérification, et attendez qu'il
soit visible depuis un résolveur public, par exemple avec
`dig TXT _hikube-challenge.acme.com @9.9.9.9`.
:::

## Déléguer l'enregistrement par un CNAME

Un `CNAME` à `_hikube-challenge.<domaine>` est suivi : vous pouvez publier le
`TXT` dans une autre zone. La valeur doit correspondre exactement : un `TXT`
générique (wildcard) ne vérifie rien par hasard.

:::warning CNAME générique
Un `CNAME` générique, par exemple `*.acme.com CNAME saas.exemple.net`, couvre
aussi `_hikube-challenge.acme.com`. Celui qui contrôle les enregistrements `TXT`
de `saas.exemple.net` peut alors répondre à la vérification de `acme.com`.
Avec un `CNAME` générique, publiez l'enregistrement `TXT` explicitement à
`_hikube-challenge.acme.com` : un nom explicite l'emporte sur le générique.
:::

## Un domaine vérifié par une autre organisation

Un domaine n'est vérifié que pour une organisation. Si une autre organisation le
détient déjà, la vérification est refusée, même si votre enregistrement est en
place.

Un domaine ne change d'organisation que par le **support Hidora**, par exemple
après un rachat ou la vente du domaine. Le support le retire à l'organisation qui
le détient, avec l'accord de son super-administrateur ou sur preuve de
possession. Votre organisation le vérifie ensuite normalement. Les comptes que
l'ancienne organisation gère déjà restent les siens.

## Retirer un domaine

Un administrateur peut retirer un domaine à tout moment. Le domaine redevient
libre pour une autre organisation. Les comptes que votre organisation gère sur
ce domaine restent les siens.
