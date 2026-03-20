---
sidebar_position: 1
title: Übersicht
---

# ClickHouse auf Hikube

Die **ClickHouse-Datenbanken** von Hikube bieten ein leistungsstarkes, spaltenorientiertes Open-Source-SQL-Datenbankmanagementsystem, das für die analytische Online-Verarbeitung (OLAP) konzipiert ist. Sie garantieren die schnelle Aufnahme massiver Datenmengen, die Ausführung komplexer Abfragen in nahezu Echtzeit und die für geschäftskritische Analyseanwendungen erforderliche Zuverlässigkeit.

---

## 🏗️ Architektur und Funktionsweise

Die ClickHouse-Architektur basiert auf zwei wesentlichen Parametern, die die Bereitstellung an die tatsächlichen Bedürfnisse anpassen:

- **Shards** → ermöglichen die **Aufteilung der Daten in mehrere Teile** auf verschiedenen Knoten. Je mehr Shards, desto besser wird die Last verteilt, was die Ausführungsgeschwindigkeit von Abfragen über sehr große Volumen verbessert.
- **Replikas** → erstellen **redundante Kopien** der Shards. Dies erhöht die Resilienz und Fehlertoleranz und ermöglicht gleichzeitig die Verteilung der Leselast auf mehrere Knoten.

### 🔎 Anschauliches Beispiel

Stellen Sie sich eine Datenbank mit **1 Milliarde Kundendatensätzen** vor:

- **1 Shard – 1 Replika**
  Alle Daten werden in einem einzigen Bereich gespeichert.
  **Anwendungsfälle:**
  - Pilotprojekte (POC)
  - Entwicklungsumgebungen
  - Gelegentliche Analyselasten

- **2 Shards – 1 Replika**
  Die Daten werden in zwei Teile aufgeteilt (z.B. Kunden A–M und N–Z). Die Abfragen werden parallel ausgeführt, was die Analyse erheblich beschleunigt.
  **Anwendungsfälle:**
  - Analysen über große Datenvolumen
  - Anwendungen, die bessere Leistung erfordern
  - Regelmäßige Berichte über große Kunden- oder Transaktionsdatenbanken

- **2 Shards – 2 Replikas**
  Jeder Shard wird auf einem anderen Knoten dupliziert. Man profitiert gleichzeitig von Geschwindigkeit (verteilte Daten) und Sicherheit (Fehlertoleranz).
  **Anwendungsfälle:**
  - Geschäftskritische Produktions-Analyseanwendungen
  - Hochverfügbarkeitsanforderungen
  - Multi-User-Plattformen mit hoher Abfragekonkurrenz
  - Disaster-Recovery-Pläne (DRP)
