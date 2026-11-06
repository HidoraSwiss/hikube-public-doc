---
title: Hikube API v1.6.5
authors: [hikube]
tags: [release]
---

Questa versione correttiva ripristina il consumo visualizzato e le verifiche di quota dei progetti che non hanno una quota propria e condividono quella della loro organizzazione.

<!-- truncate -->

## Corretto

- **Quote** — Per un progetto senza quota propria, che condivide quella della sua organizzazione, `GET .../projects/{name}/quota-usage` restituiva `0` consumato su un totale di `0`, e la console mostrava quindi un progetto vuoto. Il consumo reale viene di nuovo restituito, e il totale è la parte della quota dell'organizzazione che si applica al progetto. Gli aggiornamenti in tempo reale della console seguono la stessa regola.

- **Quote** — Per questi stessi progetti, la creazione o l'ingrandimento di un disco (`30202`, `20210`) e il ridimensionamento di un control plane Kubernetes (`70209`) non erano verificati rispetto alla quota. Una richiesta troppo grande veniva accettata e poi restava bloccata per mancanza di spazio. Viene di nuovo rifiutata subito, e non viene creato nulla.
