---
sidebar_position: 1
title: Panoramica
---

# ClickHouse su Hikube

I **database ClickHouse** di Hikube offrono un sistema di gestione SQL open source, ad alte prestazioni e orientato per colonne, progettato per l'elaborazione analitica online (OLAP). Garantiscono l'ingestione rapida di dati massivi, l'esecuzione di query complesse in tempo quasi reale e l'affidabilita necessaria per le applicazioni analitiche critiche delle aziende.

---

## 🏗️ Architettura e Funzionamento

L'architettura di ClickHouse si basa su due parametri essenziali che permettono di adattare il deployment alle esigenze reali:

- **Shard** --> permettono di **distribuire i dati in piu parti** su diversi nodi. Piu shard ci sono, piu il carico e distribuito, il che migliora la velocita di esecuzione delle query su volumi molto grandi.
- **Repliche** --> creano **copie ridondanti** degli shard. Questo aumenta la resilienza e la tolleranza ai guasti, permettendo al contempo di distribuire il carico di lettura tra piu nodi.

### 🔎 Esempio illustrativo

Immaginiamo un database di **1 miliardo di record clienti**:

- **1 shard -- 1 replica**
  Tutti i dati sono archiviati in un unico spazio.
  **Casi d'uso:**
  - Progetti pilota (POC)
  - Ambienti di sviluppo
  - Carichi analitici occasionali

- **2 shard -- 1 replica**
  I dati sono divisi in due parti (es. clienti A-M e N-Z). Le query vengono eseguite in parallelo, il che accelera considerevolmente l'analisi.
  **Casi d'uso:**
  - Analisi su grandi volumi di dati
  - Applicazioni che necessitano di migliori prestazioni
  - Report regolari su ampie basi clienti o transazioni

- **2 shard -- 2 repliche**
  Ogni shard e duplicato su un altro nodo. Si beneficia sia della rapidita (dati distribuiti) che della sicurezza (tolleranza ai guasti).
  **Casi d'uso:**
  - Applicazioni analitiche critiche in produzione
  - Esigenze di alta disponibilita
  - Piattaforme multi-utente con forte concorrenza di query
  - Piani di ripristino in caso di disastro (DRP)
