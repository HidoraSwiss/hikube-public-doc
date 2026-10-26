---
title: "Comment gérer la rétention des objets d'un bucket verrouillé"
description: "Consultez le verrouillage d'un bucket WORM, prolongez la rétention d'un objet et posez un verrou juridique avec les commandes S3 Object Lock."
---

# Comment gérer la rétention des objets d'un bucket verrouillé

Un bucket créé avec **Activer le verrouillage (Object Lock / WORM)** verrouille chaque objet 365 jours après son écriture, en mode `COMPLIANCE`. Ce guide montre comment consulter ce verrouillage et, avec les commandes S3 Object Lock standard, conserver un objet plus longtemps : rétention propre à l'objet, prolongation, verrou juridique (*legal hold*).

Ces opérations se font avec un client S3. La console et l'API Hikube n'exposent que la rétention par défaut du bucket.

## Prérequis

- Un **bucket verrouillé (WORM)**, au statut **Prêt** : le verrouillage se choisit à la création (voir le [démarrage rapide](../quick-start.md)) et ne peut pas être activé ensuite
- Un **utilisateur S3** en **Lecture / Écriture** sur ce bucket (voir [Gérer les utilisateurs et les clés d'accès](./configure-access.md))
- [AWS CLI](https://aws.amazon.com/cli/) installé, et les variables `S3_ENDPOINT`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` et `BUCKET_NAME` exportées comme à l'[étape 4 du démarrage rapide](../quick-start.md#étape-4--récupérer-les-identifiants)

:::warning Un verrou ne se retire pas
Une rétention en mode `COMPLIANCE` ne peut être ni raccourcie ni retirée. L'objet ne pourra pas être supprimé, ni le bucket vidé, avant l'échéance. Vérifiez la date avant de lancer une commande.
:::

## Comprendre les deux mécanismes

| Mécanisme | Durée | Qui le pose | Levée |
|-----------|-------|-------------|-------|
| **Rétention** | Jusqu'à une date (`RetainUntilDate`) | Le bucket, à l'écriture de chaque objet (365 jours), ou vous, objet par objet | Automatique à l'échéance ; ne peut être que prolongée |
| **Verrou juridique** (*legal hold*) | Sans échéance | Vous, objet par objet | Quand vous le retirez (`Status=OFF`) |

Les deux se cumulent : un objet ne peut être supprimé qu'une fois sa rétention échue **et** son verrou juridique retiré.

## Étapes

### 1. Consulter le verrouillage du bucket

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-lock-configuration \
  --bucket "$BUCKET_NAME"
```

**Résultat attendu :**

```json
{
    "ObjectLockConfiguration": {
        "ObjectLockEnabled": "Enabled",
        "Rule": {
            "DefaultRetention": {
                "Mode": "COMPLIANCE",
                "Days": 365
            }
        }
    }
}
```

`DefaultRetention` est la rétention appliquée à tout objet écrit sans rétention propre.

### 2. Envoyer un objet avec sa propre rétention

Pour conserver un objet au-delà de 365 jours (archive réglementaire de dix ans, par exemple), donnez-lui une date d'échéance à l'envoi. Choisissez une date **postérieure** à l'échéance par défaut (365 jours après l'envoi) : la rétention propre à un objet sert à le garder plus longtemps.

```bash
# Date d'échéance : ISO 8601, en UTC
RETAIN_UNTIL="2036-12-31T00:00:00Z"

aws --endpoint-url "$S3_ENDPOINT" s3api put-object \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf --body ./rapport-2026.pdf \
  --object-lock-mode COMPLIANCE \
  --object-lock-retain-until-date "$RETAIN_UNTIL"
```

### 3. Lire la rétention d'un objet

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-retention \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf
```

**Résultat attendu :**

```json
{
    "Retention": {
        "Mode": "COMPLIANCE",
        "RetainUntilDate": "2036-12-31T00:00:00+00:00"
    }
}
```

### 4. Prolonger la rétention d'un objet

Une rétention ne peut être que **prolongée** : la nouvelle date doit être postérieure à l'échéance actuelle, sinon la requête est refusée.

```bash
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-retention \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf \
  --retention '{"Mode":"COMPLIANCE","RetainUntilDate":"2040-12-31T00:00:00Z"}'
```

### 5. Poser ou retirer un verrou juridique

Le verrou juridique bloque la suppression d'un objet sans date d'échéance, par exemple pendant un litige ou un audit :

```bash
# Poser le verrou
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf \
  --legal-hold Status=ON

# Consulter le verrou
aws --endpoint-url "$S3_ENDPOINT" s3api get-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf

# Retirer le verrou
aws --endpoint-url "$S3_ENDPOINT" s3api put-object-legal-hold \
  --bucket "$BUCKET_NAME" --key archives/rapport-2026.pdf \
  --legal-hold Status=OFF
```

Retirer le verrou juridique ne lève pas la rétention : l'objet reste protégé jusqu'à son échéance.

## Mode `GOVERNANCE`

Le mode `GOVERNANCE` est accepté, mais les utilisateurs d'un bucket n'ont pas la permission de contourner une rétention : `--bypass-governance-retention` renvoie `AccessDenied`. Un objet en `GOVERNANCE` est donc, en pratique, aussi immuable qu'en `COMPLIANCE` jusqu'à son échéance. Utilisez `COMPLIANCE`, qui dit ce qui sera appliqué.

## Dépannage

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `get-object-lock-configuration` échoue | Bucket créé sans verrouillage | Le verrouillage ne s'active qu'à la création : créez un bucket verrouillé et copiez-y les objets |
| `AccessDenied` sur `put-object-retention` ou `put-object-legal-hold` | Utilisateur en **Lecture seule** | Utilisez un utilisateur en **Lecture / Écriture** |
| Prolongation refusée | Nouvelle date antérieure à l'échéance actuelle | Choisissez une date postérieure à l'échéance actuelle (étape 3) |
| Date refusée à l'envoi | Date passée ou format incorrect | Date future, au format ISO 8601 en UTC (`2036-12-31T00:00:00Z`) |
| `AccessDenied` à la suppression d'un objet | Rétention en cours ou verrou juridique posé | Lisez la rétention (étape 3) et le verrou juridique (étape 5) de l'objet |

## Pour aller plus loin

- [Concepts des buckets S3](../concepts.md) : verrouillage et suppression d'un bucket verrouillé
- [FAQ des buckets S3](../faq.md#à-quoi-sert-le-verrouillage-worm-)
