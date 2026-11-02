---
sidebar_position: 4
title: Erreurs
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Erreurs de l'API

Une requête en échec renvoie un **code HTTP** et un **corps JSON** qui porte un **code numérique** stable. Basez la logique de vos scripts sur le code HTTP et sur ce code numérique, jamais sur le texte du message, qui peut évoluer.

Ce format vaut pour toutes les erreurs, y compris les refus d'authentification et les dépassements de [limite de débit](#limites-de-debit).

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

### Identifiant de requête {#identifiant-de-requete}

Chaque réponse, y compris une réponse `2xx`, porte un en-tête `x-request-id`. Le corps d'une erreur porte en plus un `requestId`, qui n'a pas toujours la même valeur que l'en-tête. Pour toute demande d'analyse au support, communiquez l'un ou l'autre, et les deux si vous les avez : conservez l'en-tête dans les journaux de vos outils, il permet de retrouver aussi une requête qui a réussi.

```bash
curl -sS -D - -o /dev/null "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | grep -i '^x-request-id'
```

---

## Codes HTTP

| Code HTTP | Signification | Que faire |
|-----------|---------------|-----------|
| `400` | Requête invalide : champ manquant ou mal formé, valeur hors limites, opération impossible dans l'état actuel de la ressource | Corrigez la requête d'après `message` ; ne réessayez pas à l'identique |
| `401` | Jeton utilisateur invalide ou expiré (code `10001`). Ne concerne que les sessions de la console, pas les clés d'API | Avec une clé d'API, n'envoyez pas d'en-tête `Authorization` |
| `403` | Accès refusé (code `10002`), y compris pour une requête sans clé | Voir [Accès refusé](#acces-refuse) |
| `404` | Ressource introuvable dans le projet | Vérifiez le nom de la ressource dans le chemin |
| `409` | Conflit : une ressource porte déjà ce nom, est encore utilisée, ou a été modifiée en même temps | Changez de nom, libérez la ressource, ou relisez-la avant de réessayer |
| `429` | Trop de requêtes (code `10008`) | Attendez le délai indiqué par l'en-tête `Retry-After`, puis réessayez. Voir [Limites de débit](#limites-de-debit) |
| `500` | Erreur interne | Réessayez plus tard ; si l'erreur persiste, contactez le support avec le `requestId` |
| `503` | Service momentanément indisponible. Avec le code `10004`, la clé n'a pas pu être vérifiée : elle n'est pas jugée invalide | Réessayez avec un délai croissant (par exemple 1 s, 2 s, 4 s…) |

---

## Accès refusé {#acces-refuse}

Tout refus d'accès lié à la clé renvoie la **même** réponse `403` avec le code `10002`, quelle qu'en soit la raison :

- aucune clé présentée (en-tête `X-Hikube-Api-Key` absent ou vide) ;
- clé mal formée, inconnue, révoquée ou expirée ;
- clé d'un autre projet que celui du chemin, ou projet inexistant ;
- scope insuffisant (par exemple une clé `read` pour une création) ;
- opération non accessible aux clés d'API (gestion du compte, de l'organisation, des projets ou des clés).

Cette réponse uniforme est volontaire : elle ne révèle rien sur l'existence d'un projet ou d'une clé. Pour diagnostiquer, vérifiez dans l'ordre la clé (`HIKUBE_API_KEY`), l'identifiant du projet (`PROJECT_ID`), puis le scope nécessaire (voir [Scopes](./authentication.md#scopes)).

---

## Codes communs

| Code | HTTP | Signification |
|------|------|---------------|
| `10001` | 401 | Jeton utilisateur invalide ou expiré. Une requête sans clé ni jeton reçoit `10002`, pas `10001` |
| `10002` | 403 | Accès refusé (voir ci-dessus) |
| `10004` | 503 | La clé n'a pas pu être vérifiée pour le moment. Ce n'est pas un refus : la clé n'est pas en cause, réessayez |
| `10008` | 429 | Trop de requêtes : attendez le délai de `Retry-After`, puis réessayez (voir [Limites de débit](#limites-de-debit)) |
| `10005` | 403 ou 400 | Refus d'une règle de la plateforme : le message nomme le champ refusé, `details` la règle et sa raison |
| `10006` | 400 | Un chemin de `updateMask` ne désigne aucun champ modifiable de la requête `PATCH` (voir [Mises à jour partielles](./overview.md#mises-a-jour-partielles)) |

Un client qui annule sa requête ou dépasse son propre délai reçoit `499` ou `504`, sans code numérique.

---

## Limites de débit {#limites-de-debit}

Les requêtes sont limitées **par clé d'API** et **par adresse IP**. Les deux limites s'appliquent ensemble : une requête est refusée dès que l'une d'elles est atteinte. Valeurs actuelles, susceptibles d'évoluer :

| Limite | Rafale | Débit soutenu |
|--------|--------|---------------|
| Par clé d'API | 120 requêtes | 300 requêtes par minute |
| Par adresse IP | 300 requêtes | 600 requêtes par minute |

La rafale est le nombre de requêtes acceptées d'un coup. Elle se reconstitue ensuite au rythme du débit soutenu.

Chaque réponse porte deux en-têtes, qui décrivent la limite la plus contraignante pour l'appelant :

| En-tête | Description |
|---------|-------------|
| `X-RateLimit-Limit` | Nombre de requêtes autorisées par cette limite |
| `X-RateLimit-Remaining` | Nombre de requêtes encore disponibles |

Au-delà, la requête est refusée en `429` avec le code `10008`. La réponse porte un en-tête `Retry-After`, en secondes (5 aujourd'hui) : attendez ce délai, puis réessayez. Ne réessayez pas tout de suite, la requête serait de nouveau refusée.

```json
{
  "requestId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "code": 10008,
  "message": "Too many requests. Please slow down.",
  "details": []
}
```

Plusieurs outils qui partagent une clé ou une adresse IP (par exemple les tâches d'un même pipeline derrière une passerelle NAT) partagent aussi sa limite. Donnez une clé à chaque outil, et espacez les `GET` qui suivent l'état d'une ressource.

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
| `180xxx` | Sauvegardes |

Quelques codes métier utiles :

| Code | HTTP | Signification |
|------|------|---------------|
| `20200` | 400 | Le disque est déjà attaché à une autre VM |
| `20201` / `20202` | 400 | La VM est déjà démarrée / déjà arrêtée |
| `20204`, `20205`, `20207` | 400 | GPU demandé indisponible, en quantité insuffisante, ou impossible à réunir sur un même serveur |
| `20206` | 400 | Plus d'adresse IPv4 publique disponible |
| `20209` | 400 | La VM ne peut pas encore démarrer : sa dernière modification est en cours d'application. Réessayez dans quelques secondes |
| `30007` | 400 | Le disque est attaché à une VM : détachez-le avant de le supprimer |
| `80201`, `110201`, `120201`, `140201`, `150201` | 400 | Passage d'une instance unique à un cluster répliqué (ou l'inverse) impossible après la création |
| `80205`, `110205`, `120205`, `140205`, `150205` | 400 | Redémarrage d'une base encore en cours de création : rien à redémarrer, réessayez une fois le cluster prêt |
| `160003` / `160012` | 409 | Le VPC / le sous-réseau est encore utilisé par des VM, listées dans `details` |
| `160152` | 400 | La plage d'adresses chevauche un sous-réseau existant |
| `180200` | 400 | La destination de sauvegarde n'est pas encore prête |
| `180205` | 400 | Une restauration est déjà en cours pour cette application |
| `180214` | 400 | L'instant de restauration demandé sort de la fenêtre de restauration |

La [référence de l'API](./reference/hikube-api.info.mdx) indique les codes HTTP possibles pour chaque opération.

---

## Codes liés aux clés d'API

Ces codes concernent la gestion des clés (création, liste, révocation), réservée aux administrateurs du projet, depuis la console ou avec leur session utilisateur (voir [Obtenir une clé](./authentication.md#obtenir)).

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
- Après une `429`, attendez le délai de l'en-tête `Retry-After` avant de réessayer.
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
