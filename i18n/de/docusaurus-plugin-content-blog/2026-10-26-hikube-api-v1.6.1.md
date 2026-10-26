---
title: Hikube API v1.6.1
authors: [hikube]
tags: [release]
---

Die API wendet jetzt Ratenlimits pro API-Schlüssel und pro IP-Adresse an. Alle ihre Fehler, Authentifizierungsablehnungen eingeschlossen, folgen demselben Format mit `requestId` und `code`, und jede Antwort trägt eine Anfragekennung. Diese Version behebt außerdem ein Sicherheitsproblem, das keine Maßnahme Ihrerseits erfordert.

<!-- truncate -->

## Hinzugefügt

- **Ratenlimits** — Anfragen sind pro API-Schlüssel (derzeit ein Burst von 120 Anfragen, danach 300 pro Minute) und pro IP-Adresse (ein Burst von 300, danach 600 pro Minute) begrenzt. Diese Werte können sich ändern. Darüber hinaus antwortet die API mit `429` und dem Code `10008`, und ein Header `Retry-After` gibt in Sekunden an, wie lange vor einem erneuten Versuch zu warten ist. Jede Antwort trägt außerdem `X-RateLimit-Limit` und `X-RateLimit-Remaining`, die das strengste Limit des Aufrufers beschreiben. Siehe [Ratenlimits](/api/errors/#limites-de-debit).

- **Anfragekennung** — Jede Antwort, auch eine erfolgreiche, trägt einen Header `x-request-id`. Der Body eines Fehlers wiederholt sie in `requestId`. Geben Sie dem Support für jede Analyse das eine oder das andere an. Siehe [Anfragekennung](/api/errors/#identifiant-de-requete).

## Geändert

- **Fehlerformat** — Ablehnungen wegen Authentifizierung oder Ratenlimit folgen jetzt dem Format der übrigen API-Fehler: ein JSON-Body mit `requestId`, `code`, `message` und `details`. Eine Anfrage ohne API-Schlüssel erhält `403` mit dem Code `10002`, wie ein ungültiger Schlüssel. Der Code `401` (`10001`) betrifft nur ungültige oder abgelaufene Sitzungstoken, nicht API-Schlüssel. Siehe [Fehler](/api/errors/).

- **OpenAPI-Spezifikation** — Die Antwort `429` ist bei jeder Operation aufgeführt, und die Beschreibung der Antwort `401` ist korrigiert. Die [API-Referenz](/api/reference/hikube-api) ist aktuell.

## Sicherheit

- **Ereignisstrom** — Ein temporäres Token, mit dem der Ereignisstrom geöffnet wird, konnte in internen Protokollen der Plattform gespeichert werden. Das ist nicht mehr der Fall. Es ist keine Maßnahme Ihrerseits erforderlich.
