---
sidebar_position: 1
title: Vue d'ensemble
---

import NavigationFooter from '@site/src/components/NavigationFooter';
import {HikubeApiUrl} from '@site/src/components/HikubeApi';

# API publique Hikube

L'**API publique Hikube** permet de piloter les ressources d'un projet depuis un script, un pipeline CI/CD ou un outil d'automatisation, sans passer par la [console Hikube](https://console.hikube.cloud). Elle expose, en REST et JSON, les opérations que la console réalise sur les machines virtuelles, les disques, les buckets, les clusters Kubernetes, le réseau et les bases de données.

L'API complète la console ; elle ne la remplace pas. La gestion du compte, de l'organisation, des projets et des membres reste dans la console.

:::warning Préversion
L'API publique est en **préversion** (`v1alpha1`). Les chemins, les champs et les comportements peuvent encore évoluer, et l'URL publique définitive reste à confirmer. Ne bâtissez pas encore d'automatisation critique sur cette version sans prévoir de la suivre.
:::

---

## Ce que couvre l'API

| Domaine | Préfixe des chemins | Opérations |
|---------|---------------------|------------|
| Machines virtuelles | `/instance/v1alpha1` | Créer, lister, consulter, modifier, supprimer ; démarrer, arrêter, redémarrer ; recharger le cloud-init. Catalogues : images (`/cloud-images`) et types d'instance (`/instance-types`) |
| Disques | `/disk/v1alpha1` | Créer, lister, consulter, agrandir, supprimer |
| Buckets S3 | `/bucket/v1alpha1` | Créer, lister, consulter, supprimer ; gérer les utilisateurs d'un bucket et faire tourner leurs clés |
| Kubernetes | `/kubernetes/v1alpha1` | Créer, lister, consulter, modifier, supprimer un cluster ; télécharger son kubeconfig. Catalogues : versions, presets |
| Réseau | `/network/v1alpha1` | VPC et sous-réseaux : créer, lister, consulter, supprimer |
| PostgreSQL | `/postgres/v1alpha1` | Clusters, bases, utilisateurs (dont la rotation du mot de passe). Catalogues : presets, extensions |
| MariaDB | `/mariadb/v1alpha1` | Clusters, bases, utilisateurs (dont la rotation du mot de passe). Catalogue : presets |
| MongoDB | `/mongodb/v1alpha1` | Clusters, bases, utilisateurs (dont la rotation du mot de passe). Catalogue : presets |
| Redis | `/redis/v1alpha1` | Clusters, rotation du mot de passe. Catalogue : presets |
| RabbitMQ | `/rabbitmq/v1alpha1` | Clusters, utilisateurs, vhosts. Catalogue : presets |
| GPU | `/gpu/v1alpha1` | Catalogue des GPU disponibles (l'attribution se fait sur la VM ou le groupe de nœuds) |
| Tarifs | `/billing/v1alpha1` | Grilles tarifaires (VM, bases de données, Kubernetes, licences, GPU, réseau, stockage bloc et objet) |

La liste exhaustive des opérations, avec leurs paramètres et leurs réponses, est dans la [référence de l'API](./reference/hikube-api.info.mdx).

### Ce que l'API ne couvre pas

- **Compte, organisation, projets, membres et rôles** : réservés à la console.
- **Clés d'API** : une clé ne peut pas créer ni révoquer de clé (voir [Authentification](./authentication.md)).
- **Flux d'événements temps réel** de la console.
- **Services absents de la console** (ClickHouse, Kafka, NATS) : sur demande auprès du support.

Une opération absente de la référence n'est pas appelable avec une clé d'API, même si la console la propose.

---

## URL de base

Toutes les requêtes partent de l'URL de base suivante :

<HikubeApiUrl />

Les chemins de la référence s'ajoutent à cette URL. Les exemples de la documentation la lisent dans la variable `HIKUBE_API` :

```bash
curl -sS "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

---

## Versions

Chaque service porte sa version dans le chemin : `/disk/v1alpha1/...`, `/postgres/v1alpha1/...`. Tous les services sont aujourd'hui en `v1alpha1`, c'est-à-dire en préversion : une version `v1alpha1` peut changer de manière incompatible. Les évolutions sont annoncées dans le [changelog](/blog).

---

## Organisation et projet

Sur Hikube, une **organisation** regroupe des **projets**, et chaque ressource (VM, disque, base de données…) appartient à un projet. Dans l'API, le projet figure dans le chemin de chaque opération :

```text
/<service>/v1alpha1/projects/{projectId}/<ressources>/{name}
```

- `projectId` est l'identifiant du projet, un UUID (par exemple `01928f6e-7b2c-7d4e-9a10-3f5b6c7d8e9f`). Il n'est pas égal au nom du projet affiché dans la console.
- `name` est le nom que vous avez donné à la ressource à sa création : c'est lui qui l'identifie dans les chemins.

Une clé d'API est rattachée à **un seul projet** : toute requête qui vise un autre projet est refusée. Pour automatiser plusieurs projets, utilisez une clé par projet. Voir [Trouver l'identifiant du projet](./quick-start.md#project-id).

Les catalogues (images, types d'instance, versions, presets, GPU, tarifs) ne dépendent d'aucun projet : leurs chemins ne contiennent pas `projectId`.

---

## Conventions

- **Format** : les corps de requête et de réponse sont en JSON (`Content-Type: application/json`), avec des noms de champs en *camelCase* (`instanceType`, `asyncReplication`). Les dates suivent la RFC 3339 (`2026-10-05T09:30:00Z`).
- **Verbes** : `GET` consulte, `POST` crée ou lance une action, `PATCH` modifie, `PUT` lance une action sur une VM (démarrer, arrêter…), `DELETE` supprime.
- **Opérations asynchrones** : une création ou une modification renvoie la ressource aussitôt, avec un champ `status` (`provisioning`, puis `ready`). Interrogez la ressource avec `GET` jusqu'à l'état attendu avant de l'utiliser.
- **Modifications** : un `PATCH` est une mise à jour partielle, seuls les champs envoyés changent (voir [Mises à jour partielles](#mises-a-jour-partielles)).
- **Erreurs** : une erreur renvoie un code HTTP et un corps JSON avec un code numérique stable (voir [Erreurs](./errors.md)).

---

## Mises à jour partielles {#mises-a-jour-partielles}

Toutes les requêtes `PATCH` suivent la même règle : **seuls les champs envoyés sont modifiés**. Il n'est pas nécessaire de relire la ressource et de la renvoyer en entier.

- **Champ absent** : un champ absent du corps, ou envoyé à `null`, garde sa valeur. `{"external": true}` sur un cluster Redis active l'accès externe et garde la version, la taille et l'authentification.
- **Champ envoyé** : sa valeur est appliquée telle quelle, y compris une valeur vide (`false`, `0`, `""`). Elle est validée comme à la création : une taille de `0` est refusée.
- **Sous-objet** : il est modifié champ par champ. `{"network": {"publicIpv4": true}}` sur une VM ne touche ni au pare-feu ni aux VPC. Envoyé vide, en revanche, il remet **chacun de ses champs** à sa valeur vide : `{"network": {}}` retire l'adresse publique, désactive le pare-feu et détache tous les VPC.
- **Liste ou carte** : envoyée, elle remplace celle en place, et `[]` ou `{}` la vide. `{"network": {"vpcs": []}}` détache tous les VPC d'une VM ; `{"config": {"databases": {}}}` retire tous les droits d'un utilisateur de base de données.
- **Configuration libre** (surcharges Helm d'un cluster Kubernetes : `config.cni`, `config.dns`, `config.verticalPodAutoscaler`, `configOverride` des addons) : un objet envoyé remplace la surcharge en place, `{}` ne change rien, et `null` la retire.
- **Corps vide** : `{}` ne modifie rien et renvoie la ressource telle qu'elle est enregistrée.
- **Champs non modifiables** : le nom et les identifiants du chemin sont ignorés s'ils figurent dans le corps. Un champ fixé à la création (par exemple le mode d'un cluster de base de données, standalone ou répliqué) peut être renvoyé avec sa valeur actuelle ; une autre valeur est refusée avec un code propre au service. Un champ absent de la requête de modification (comme `preset` sur MariaDB ou `image` sur une VM) est refusé comme champ inconnu (`400`).

Par exemple, pour activer l'accès externe d'un cluster Redis sans rien changer d'autre :

```bash
curl -sS -X PATCH "$HIKUBE_API/redis/v1alpha1/projects/$PROJECT_ID/clusters/democache" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"external": true}'
```

### Le champ `updateMask`

Chaque requête `PATCH` accepte un champ facultatif `updateMask` : la liste, séparée par des virgules, des chemins à modifier, en *camelCase* (`external,authEnabled`). Sans lui, les chemins sont déduits des champs présents dans le corps, ce qui suffit dans la plupart des cas.

Avec `updateMask`, seuls les chemins listés sont modifiés, avec la valeur du corps. Un chemin listé mais absent du corps prend sa valeur vide : `{"updateMask": "external"}` seul **désactive** l'accès externe. Un chemin qui ne désigne aucun champ modifiable est refusé avec le code `10006` (voir [Erreurs](./errors.md)).

---

## Spécification OpenAPI

La spécification de l'API publique est téléchargeable au format OpenAPI 2.0 (Swagger) : [`hikube-public.swagger.json`](pathname:///openapi/hikube-public.swagger.json). Elle permet de générer un client dans votre langage. Elle ne décrit que les opérations appelables avec une clé d'API.

<NavigationFooter
  nextSteps={[
    {label: "Authentification", href: "../authentication"},
    {label: "Démarrage rapide", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Référence de l'API", href: "../reference/hikube-api"},
    {label: "Erreurs", href: "../errors"},
  ]}
/>
