---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {ApiEnv} from '@site/src/components/HikubeApi';

# Premiers appels à l'API publique

Ce guide vous accompagne de l'obtention d'une clé d'API jusqu'à la création d'une première ressource, un bucket S3, avec `curl`.

:::warning Préversion
L'API publique est en préversion (`v1alpha1`) : chemins et champs peuvent encore évoluer.
:::

---

## Objectifs

À la fin de ce guide, vous aurez :

- Une **clé d'API** et l'**identifiant de votre projet**
- Un **environnement shell** prêt pour tous les exemples de la documentation
- Un **premier appel** de lecture réussi
- Un **bucket S3** créé par l'API, avec un utilisateur et ses clés d'accès

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../getting-started/quick-start.md))
- Être **administrateur** du projet ou de son organisation, ou passer par un administrateur, pour obtenir la clé
- `curl` et [`jq`](https://jqlang.org/) sur votre poste

---

## Étape 1 : Obtenir une clé et l'identifiant du projet {#project-id}

La création des clés d'API depuis la console arrive bientôt. En attendant, un administrateur du projet ou de l'organisation demande la clé au [support](mailto:support@hidora.io), avec son nom, ses scopes et sa durée de validité (voir [Obtenir une clé](./authentication.md#obtenir)).

Pour ce guide, demandez une clé avec le scope `admin` : elle doit pouvoir créer et supprimer un bucket. Une durée de `7d` suffit pour un essai.

Vous recevez :

- la **clé**, de la forme `sk_hk_<keyId>_<secret>`. Elle n'est affichée qu'une fois : enregistrez-la aussitôt dans votre gestionnaire de secrets ;
- l'**identifiant du projet** (`projectId`), un UUID tel que `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`.

:::note Identifiant du projet
La console n'affiche pas encore l'identifiant du projet : il vous est communiqué avec la clé. Ne le confondez pas avec le nom du projet, ni avec l'**ID de l'Organisation** affiché dans **Mon Compte**.
:::

---

## Étape 2 : Préparer l'environnement {#environnement}

Tous les exemples `curl` de la documentation lisent l'URL de base, la clé et l'identifiant du projet dans trois variables. Définissez-les dans votre shell :

<ApiEnv />

Remplacez `sk_hk_<keyId>_<secret>` et `<project_id>` par vos valeurs. Pour ne pas laisser la clé dans l'historique du shell, lisez-la depuis votre gestionnaire de secrets plutôt que de la taper en clair.

---

## Étape 3 : Faire un premier appel de lecture

Commencez par un catalogue, qui ne dépend d'aucun projet : la liste des types d'instance.

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/instance-types" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

Puis listez les buckets de votre projet, ce qui vérifie la clé **et** l'identifiant du projet :

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq .
```

**Résultat attendu :**

```json
{
  "totalCount": "0",
  "buckets": []
}
```

Les champs entiers de 64 bits, comme `totalCount`, sont renvoyés sous forme de chaîne. Une réponse `403` avec le code `10002` signifie que la clé est invalide, expirée, révoquée, ou qu'elle n'appartient pas à ce projet.

---

## Étape 4 : Créer un bucket

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "demoapi", "locking": false, "encrypted": false}'
```

- `name` : 16 caractères maximum, lettres minuscules et chiffres ;
- `locking` : verrouillage des objets (WORM), non modifiable après la création ;
- `encrypted` : chiffrement au repos, non modifiable après la création.

La réponse décrit le bucket, avec son `id` et un `status` à `provisioning`. La création est asynchrone : passez à l'étape suivante.

---

## Étape 5 : Vérifier l'état et récupérer les identifiants

Interrogez le bucket jusqu'à ce que son statut soit `ready` :

```bash
curl -sS "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '{name, status, bucketName, endpoint}'
```

**Résultat attendu :** `status` vaut `ready` ; `bucketName` est le nom S3 du bucket et `endpoint` l'URL du point d'accès S3.

Créez ensuite un utilisateur du bucket, en lecture-écriture :

```bash
curl -sS -X POST "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"username": "app", "config": {"readonly": false}}'
```

La réponse contient `bucketName`, `endpoint` et `secrets.accessKeyId` / `secrets.accessSecretKey`.

:::warning Clés S3 affichées une seule fois
Les clés S3 ne sont renvoyées qu'à la création de l'utilisateur. Enregistrez-les aussitôt dans votre gestionnaire de secrets. En cas de perte, générez-en de nouvelles avec `POST .../users/app/rotate-credentials`.
:::

Testez l'accès avec un client S3, par exemple l'AWS CLI (voir [Buckets — démarrage rapide](../services/storage/buckets/quick-start.md)).

---

## Étape 6 : Dépannage rapide

| Symptôme | Cause probable | Action |
|----------|----------------|--------|
| `403`, code `10002` | Clé invalide, expirée ou révoquée, mauvais `PROJECT_ID`, ou scope insuffisant (`read` pour une création) | Vérifiez les variables ; la création demande une clé `admin` |
| `400`, code de validation | Champ invalide (nom trop long, caractère interdit…) | Lisez `message`, qui nomme le champ en cause |
| `409` | Une ressource porte déjà ce nom dans le projet | Choisissez un autre nom |
| `503`, code `10004` | Vérification de la clé momentanément impossible | Réessayez après quelques secondes : la clé n'est pas en cause |
| `curl: (6) Could not resolve host` | `HIKUBE_API` vide ou erronée | Relancez l'étape 2 |

Voir aussi [Erreurs](./errors.md).

---

## Étape 7 : Nettoyage

Supprimez l'utilisateur, puis le bucket :

```bash
curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi/users/app" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"

curl -sS -X DELETE "$HIKUBE_API/bucket/v1alpha1/projects/$PROJECT_ID/buckets/demoapi" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

Chaque suppression réussie renvoie `200` et un objet vide `{}`.

:::warning Suppression irréversible
La suppression d'un bucket est définitive. Un bucket qui contient encore des objets ne peut pas être supprimé : videz-le d'abord avec votre client S3.
:::

Si la clé ne servait qu'à cet essai, demandez sa révocation (voir [Révoquer une clé](./authentication.md#révoquer-une-clé)).

<NavigationFooter
  nextSteps={[
    {label: "Authentification et bonnes pratiques", href: "../authentication"},
    {label: "Référence de l'API", href: "../reference/hikube-api"},
  ]}
  seeAlso={[
    {label: "Erreurs", href: "../errors"},
    {label: "FAQ de l'API", href: "../faq"},
  ]}
/>
