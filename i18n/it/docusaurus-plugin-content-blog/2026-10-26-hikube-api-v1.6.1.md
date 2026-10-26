---
title: Hikube API v1.6.1
authors: [hikube]
tags: [release]
---

L'API applica ora limiti di frequenza per chiave API e per indirizzo IP. Tutti i suoi errori, rifiuti di autenticazione compresi, seguono uno stesso formato con `requestId` e `code`, e ogni risposta porta un identificativo di richiesta. Questa versione corregge anche un problema di sicurezza che non richiede alcuna azione da parte vostra.

<!-- truncate -->

## Aggiunto

- **Limiti di frequenza** — Le richieste sono limitate per chiave API (oggi un picco di 120 richieste, poi 300 al minuto) e per indirizzo IP (un picco di 300, poi 600 al minuto). Questi valori possono cambiare. Oltre, l'API risponde `429` con il codice `10008`, e un'intestazione `Retry-After` indica in secondi quanto attendere prima di riprovare. Ogni risposta porta anche `X-RateLimit-Limit` e `X-RateLimit-Remaining`, che descrivono il limite più restrittivo per il chiamante. Vedi [Limiti di frequenza](/api/errors/#limites-de-debit).

- **Identificativo di richiesta** — Ogni risposta, comprese quelle riuscite, porta un'intestazione `x-request-id`. Il corpo di un errore porta inoltre un `requestId`. Comunicate l'uno o l'altro al supporto per ogni richiesta di analisi, ed entrambi se li avete. Vedi [Identificativo di richiesta](/api/errors/#identifiant-de-requete).

## Modificato

- **Formato degli errori** — I rifiuti di autenticazione e di frequenza seguono ora il formato degli altri errori dell'API: un corpo JSON con `requestId`, `code`, `message` e `details`. Una richiesta senza chiave API riceve `403` con il codice `10002`, come una chiave non valida. Il codice `401` (`10001`) riguarda solo i token di sessione non validi o scaduti, non le chiavi API. Vedi [Errori](/api/errors/).

- **Specifica OpenAPI** — La risposta `429` figura su ogni operazione, e la descrizione della risposta `401` è corretta. Il [riferimento dell'API](/api/reference/hikube-api) è aggiornato.

## Sicurezza

- **Flusso di eventi** — Un token temporaneo usato per aprire il flusso di eventi poteva essere conservato nei log interni della piattaforma. Non lo è più. Non è richiesta alcuna azione da parte vostra.
