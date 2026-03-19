---
sidebar_position: 1
title: Übersicht
---

# PostgreSQL auf Hikube

Hikube bietet einen verwalteten PostgreSQL-Service, basierend auf dem Operator **CloudNativePG**, der in der Community anerkannt und weit verbreitet ist.
Die Plattform unterstützt das Deployment und die Verwaltung eines **replizierten und selbstheilenden** PostgreSQL-Clusters und gewährleistet Robustheit, Leistung und Hochverfügbarkeit ohne Aufwand auf Benutzerseite.

---

## 🏗️ Architektur und Funktionsweise

Der verwaltete PostgreSQL-Service auf Hikube basiert auf dem Operator **CloudNativePG**, der die vollständige Verwaltung des Datenbank-Lebenszyklus automatisiert: Erstellung, Aktualisierung, Replikation und Wiederherstellung nach Ausfällen.

Die Architektur basiert auf einem **replizierten Cluster**:

- Ein **primärer Knoten** (Primary), der Schreibvorgänge verarbeitet und als Referenz für die Datenkonsistenz dient.
- Ein oder mehrere **Replicas** (Standby), die Änderungen in Echtzeit durch synchrone oder asynchrone Replikation erhalten.
- Ein **Auto-Failover**-Mechanismus, der automatisch ein Replica zum neuen Primary befördert, falls ein Ausfall auftritt, und so **Hochverfügbarkeit** ohne manuellen Eingriff sicherstellt.

Dieser Ansatz gewährleistet:

- **Resilienz** gegenüber Hardware- oder Softwareausfällen
- **Lese-Skalierbarkeit** durch Verteilung der Abfragen auf die Replicas
- **Operative Einfachheit**, da die Plattform die Koordination und Wartung des Clusters übernimmt

```mermaid
graph TD
    subgraph Gland
        P1[Pod PostgreSQL Primary] --> PVC1[(PVC - Storage)]
    end

    subgraph Lucerne
        P2[Pod PostgreSQL Standby] --> PVC2[(PVC - Storage)]
    end

    subgraph Genève
        P3[Pod PostgreSQL Standby] --> PVC3[(PVC - Storage)]
    end

    P1 -->|Réplication| P2
    P1 -->|Réplication| P3
```

---

## 💡 Anwendungsfälle

- **Kritische Geschäftsanwendungen**, die eine zuverlässige und hochverfügbare Datenbank benötigen
- **E-Commerce und ERP**, wo Dienstkontinuität unerlässlich ist
- **Multi-Tenant SaaS**, ermöglicht die Lastverteilung zwischen Primary und Replicas
- **Business Intelligence und Reporting**, dank optimiertem Lesen auf den Replicas
- **Cloud-native Anwendungen**, integriert in Kubernetes-Umgebungen
