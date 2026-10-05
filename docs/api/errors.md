---
sidebar_position: 4
title: Erreurs
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Erreurs de l'API

Une requête en échec renvoie un **code HTTP** et un **corps JSON** qui porte un **code numérique** stable. Basez la logique de vos scripts sur le code HTTP et sur ce code numérique, jamais sur le texte du message, qui peut évoluer.

---

## Format

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 30101,
  "message": "invalid name: must start with a letter, end with a letter or digit, and contain only lowercase letters, digits, and hyphens",
  "details": []
}
```

| Champ | Type | Description |
|-------|------|-------------|
| `requestId` | chaîne | Identifiant de la requête. Communiquez-le au support pour toute demande d'analyse |
| `code` | entier | Code numérique de l'erreur (voir ci-dessous). Absent quand l'erreur n'a pas de code dédié |
| `message` | chaîne | Description lisible, en anglais. Pour une erreur de validation, il nomme le champ en cause |
| `details` | tableau | Informations complémentaires, le plus souvent vide. Par exemple, la liste des VM qui utilisent encore un VPC, ou les types de GPU indisponibles |

---

## Codes HTTP

| Code HTTP | Signification | Que faire |
|-----------|---------------|-----------|
| `400` | Requête invalide : champ manquant ou mal formé, valeur hors limites, opération impossible dans l'état actuel de la ressource | Corrigez la requête d'après `message` ; ne réessayez pas à l'identique |
| `401` | Aucune clé d'API présentée | Ajoutez l'en-tête `X-Hikube-Api-Key` |
| `403` | Accès refusé (code `10002`) | Voir [Accès refusé](#acces-refuse) |
| `404` | Ressource introuvable dans le projet | Vérifiez le nom de la ressource dans le chemin |
| `409` | Conflit : une ressource porte déjà ce nom, est encore utilisée, ou a été modifiée en même temps | Changez de nom, libérez la ressource, ou relisez-la avant de réessayer |
| `500` | Erreur interne | Réessayez plus tard ; si l'erreur persiste, contactez le support avec le `requestId` |
| `503` | Service momentanément indisponible | Réessayez avec un délai croissant (par exemple 1 s, 2 s, 4 s…) |

---

## Accès refusé {#acces-refuse}

Tout refus d'accès lié à la clé renvoie la **même** réponse `403` avec le code `10002`, quelle qu'en soit la raison :

- clé mal formée, inconnue, révoquée ou expirée ;
- clé d'un autre projet que celui du chemin, ou projet inexistant ;
- scope insuffisant (par exemple une clé `read` pour une création) ;
- opération non accessible aux clés d'API (gestion du compte, de l'organisation, des projets ou des clés).

Cette réponse uniforme est volontaire : elle ne révèle rien sur l'existence d'un projet ou d'une clé. Pour diagnostiquer, vérifiez dans l'ordre la clé (`HIKUBE_API_KEY`), l'identifiant du projet (`PROJECT_ID`), puis le scope nécessaire (voir [Scopes](./authentication.md#scopes)).

---

## Codes communs

| Code | HTTP | Signification |
|------|------|---------------|
| `10001` | 401 | Authentification absente ou invalide |
| `10002` | 403 | Accès refusé (voir ci-dessus) |
| `10004` | 503 | La clé n'a pas pu être vérifiée pour le moment. Ce n'est pas un refus : la clé n'est pas en cause, réessayez |

Un client qui annule sa requête ou dépasse son propre délai reçoit `499` ou `504`, sans code numérique.

---

## Codes des services

Chaque service a sa plage de codes. Les derniers chiffres suivent la même logique partout :

| Fin du code | Catégorie | Exemples |
|-------------|-----------|----------|
| `001` à `099` | État de la plateforme : introuvable (`…001`), existe déjà (`…002`), accès refusé (`…003`), indisponible (`…005`), échec du provisionnement (`…006`) | `30001` disque introuvable, `80002` cluster PostgreSQL déjà existant |
| `100` à `199` | Validation de la requête : identifiant de projet invalide (`…100`), nom invalide (`…101`), puis un code par champ | `20103` type d'instance inconnu, `70103` version de Kubernetes non prise en charge |
| `200` à `299` | Règle métier : opération impossible dans l'état actuel | `20200` disque déjà attaché à une autre VM, `20201` VM déjà démarrée |

| Préfixe | Service |
|---------|---------|
| `20xxx` | Machines virtuelles |
| `30xxx` | Disques |
| `50xxx` | Buckets |
| `60xxx` | Clés d'API |
| `70xxx` | Kubernetes |
| `80xxx` | PostgreSQL |
| `110xxx` | MariaDB |
| `120xxx` | Redis |
| `140xxx` | RabbitMQ |
| `150xxx` | MongoDB |
| `160xxx` | Réseau |
| `170xxx` | Tarifs |

Quelques codes métier utiles :

| Code | HTTP | Signification |
|------|------|---------------|
| `20200` | 400 | Le disque est déjà attaché à une autre VM |
| `20201` / `20202` | 400 | La VM est déjà démarrée / déjà arrêtée |
| `20204`, `20205`, `20207` | 400 | GPU demandé indisponible, en quantité insuffisante, ou impossible à réunir sur un même serveur |
| `20206` | 400 | Plus d'adresse IPv4 publique disponible |
| `30007` | 400 | Le disque est attaché à une VM : détachez-le avant de le supprimer |
| `80201`, `110201`, `120201`, `140201`, `150201` | 400 | Passage d'une instance unique à un cluster répliqué (ou l'inverse) impossible après la création |
| `160003` / `160012` | 409 | Le VPC / le sous-réseau est encore utilisé par des VM, listées dans `details` |
| `160152` | 400 | La plage d'adresses chevauche un sous-réseau existant |

La [référence de l'API](./reference/hikube-api.info.mdx) indique les codes HTTP possibles pour chaque opération.

---

## Codes liés aux clés d'API

Ces codes concernent la gestion des clés (création, liste, révocation), réservée aux administrateurs depuis la console. Ils sont donnés ici pour référence.

| Code | HTTP | Signification |
|------|------|---------------|
| `60003` | 403 | Scope demandé supérieur aux droits de la personne qui crée la clé |
| `60005` | 503 | Limite de clés du projet momentanément illisible ; réessayez |
| `60006` | 404 | Clé introuvable dans ce projet |
| `60007` | 503 | Enregistrement momentanément impossible. Pour une révocation, elle a pu être appliquée : réessayez, l'opération peut être répétée sans risque |
| `60008` | 400 | Clés d'API non activées sur cet environnement |
| `60009` | 400 | Nombre maximal de clés actives atteint pour le projet |
| `60106` | 400 | Scope invalide (valeurs admises : `read`, `write`, `admin`, `superadmin`) |
| `60107` | 400 | Identifiant de clé invalide (32 caractères hexadécimaux minuscules) |
| `60108` | 400 | Nom de clé invalide (obligatoire, 255 caractères maximum, sans caractère de contrôle) |
| `60109` | 400 | Durée de validité invalide (valeurs admises : `1d`, `7d`, `30d`, `90d`, `180d`, `365d`) |

---

## Réessayer sans risque

- Réessayez les réponses `503` et `10004` avec un délai croissant et un nombre de tentatives borné.
- Ne réessayez pas une `400` ou une `403` à l'identique : la requête ou la clé doit d'abord être corrigée.
- Après une création qui a échoué par délai dépassé, consultez la ressource avec `GET` avant de la recréer : elle a pu être créée, et une nouvelle tentative renverrait `409`.

<NavigationFooter
  nextSteps={[
    {label: "FAQ de l'API", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Authentification", href: "../authentication"},
    {label: "Référence de l'API", href: "../reference/hikube-api"},
  ]}
/>
