---
title: Console Hikube v1.3.2
authors: [hikube]
tags: [release]
---

Questa correzione rende più discreti gli aggiornamenti in tempo reale della console. Il rinnovo della sessione non ricarica più la pagina in background, e una scheda lasciata inattiva non prolunga più la sessione.

<!-- truncate -->

## Corretto

- **Tempo reale** — Quando la vostra sessione viene rinnovata, la console non ricarica più tutti i dati della pagina. Vengono richiesti di nuovo solo i dati che non era stato possibile caricare. Gli elenchi, come quello delle istanze VM, non vengono più riletti né interrotti a ogni rinnovo.

## Sicurezza

- **Sessione** — Una scheda lasciata aperta senza attività non prolunga più la vostra sessione. Quando la sessione arriva a scadenza, l'aggiornamento in tempo reale si mette in pausa e l'indicatore mostra **Reconnecting…**. Appena tornate sulla scheda, la sessione viene rinnovata, i dati vengono ricaricati e l'indicatore torna a **Live**. Senza attività, la sessione scade normalmente, al termine previsto dalla piattaforma.
