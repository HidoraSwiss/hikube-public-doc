---
title: Hikube API v1.6.1
authors: [hikube]
tags: [release]
---

L'API applique désormais des limites de débit par clé d'API et par adresse IP. Toutes ses erreurs, refus d'authentification compris, suivent un même format avec `requestId` et `code`, et chaque réponse porte un identifiant de requête. Cette version corrige aussi un problème de sécurité qui ne demande aucune action de votre part.

<!-- truncate -->

## Ajouté

- **Limites de débit** — Les requêtes sont limitées par clé d'API (aujourd'hui une rafale de 120 requêtes, puis 300 par minute) et par adresse IP (une rafale de 300, puis 600 par minute). Ces valeurs peuvent évoluer. Au-delà, l'API répond `429` avec le code `10008`, et un en-tête `Retry-After` donne en secondes le délai à attendre avant de réessayer. Chaque réponse porte aussi `X-RateLimit-Limit` et `X-RateLimit-Remaining`, qui décrivent la limite la plus contraignante pour l'appelant. Voir [Limites de débit](/api/errors/#limites-de-debit).

- **Identifiant de requête** — Chaque réponse, y compris une réponse réussie, porte un en-tête `x-request-id`. Le corps d'une erreur porte en plus un `requestId`. Communiquez l'un ou l'autre au support pour toute demande d'analyse, et les deux si vous les avez. Voir [Identifiant de requête](/api/errors/#identifiant-de-requete).

## Modifié

- **Format des erreurs** — Les refus d'authentification et de débit suivent désormais le format des autres erreurs de l'API : un corps JSON avec `requestId`, `code`, `message` et `details`. Une requête sans clé d'API reçoit `403` avec le code `10002`, comme une clé invalide. Le code `401` (`10001`) ne concerne que les jetons de session invalides ou expirés, pas les clés d'API. Voir [Erreurs](/api/errors/).

- **Spécification OpenAPI** — La réponse `429` figure sur chaque opération, et la description de la réponse `401` est corrigée. La [référence de l'API](/api/reference/hikube-api) est à jour.

## Sécurité

- **Flux d'événements** — Un jeton temporaire utilisé pour ouvrir le flux d'événements pouvait être conservé dans des journaux internes de la plateforme. Il ne l'est plus. Aucune action n'est demandée de votre part.
