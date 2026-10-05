---
sidebar_position: 1
title: Übersicht
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# ClickHouse auf Hikube

:::info Verfügbarkeit
ClickHouse ist in der [Hikube-Konsole](https://console.hikube.cloud) noch nicht als Self-Service verfügbar.
Um eine Instanz bereitzustellen oder ihre Konfiguration zu ändern, [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

Die **ClickHouse-Datenbanken** von Hikube bieten ein spaltenorientiertes, hochperformantes Open-Source-SQL-Datenbanksystem, das für die analytische Online-Verarbeitung (OLAP) konzipiert ist. Sie gewährleisten die schnelle Aufnahme großer Datenmengen, die Ausführung komplexer Abfragen nahezu in Echtzeit und die Zuverlässigkeit, die geschäftskritische Analyseanwendungen von Unternehmen benötigen.

---

## Architektur und Funktionsweise

Die Architektur von ClickHouse beruht auf zwei zentralen Parametern, mit denen sich die Bereitstellung an den tatsächlichen Bedarf anpassen lässt:  

- **Shards** → Sie **verteilen die Daten in mehrere Teile** auf verschiedene Knoten. Je mehr Shards, desto stärker wird die Last verteilt, was die Ausführungsgeschwindigkeit von Abfragen auf sehr großen Datenmengen verbessert.  
- **Replicas** → Sie erstellen **redundante Kopien** der Shards. Das erhöht die Resilienz und Ausfallsicherheit und ermöglicht zugleich, die Leselast auf mehrere Knoten zu verteilen.  

### Anschauliches Beispiel

Nehmen wir eine Datenbank mit **1 Milliarde Kundendatensätzen** an:  

- **1 Shard – 1 Replica**  
  Alle Daten werden an einem einzigen Ort gespeichert.  
  **Anwendungsfälle:**  
  - Pilotprojekte (POC)  
  - Entwicklungsumgebungen  
  - Gelegentliche Analyse-Workloads  

- **2 Shards – 1 Replica**  
  Die Daten werden in zwei Teile aufgeteilt (z. B. Kunden A–M und N–Z). Die Abfragen werden parallel ausgeführt, was die Analyse erheblich beschleunigt.  
  **Anwendungsfälle:**  
  - Analysen auf großen Datenmengen  
  - Anwendungen, die eine höhere Leistung erfordern  
  - Regelmäßige Berichte über große Kunden- oder Transaktionsdatenbestände  

- **2 Shards – 2 Replicas**  
  Jeder Shard wird auf einem anderen Knoten dupliziert. So profitieren Sie sowohl von Geschwindigkeit (verteilte Daten) als auch von Sicherheit (Ausfallsicherheit).  
  **Anwendungsfälle:**  
  - Geschäftskritische Analyseanwendungen in der Produktion  
  - Anforderungen an Hochverfügbarkeit  
  - Mehrbenutzerplattformen mit vielen gleichzeitigen Abfragen  
  - Notfallwiederherstellungspläne (DRP)

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Alle Datenbanken", href: "../../"},
  ]}
/>
