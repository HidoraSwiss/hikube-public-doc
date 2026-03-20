---
sidebar_position: 2
title: Schlüsselkonzepte
---

# Schlüsselkonzepte von Hikube

Diese Seite erklärt Ihnen die **grundlegenden Konzepte**, die Hikube zu einer einzigartigen Cloud-Plattform machen. Das Verständnis dieser Konzepte ermöglicht es Ihnen, das Beste aus Ihrer Infrastruktur herauszuholen und fundierte Entscheidungen zu treffen.

---

## Tenants: Ihr privater Bereich

### **Was ist ein Tenant?**
Ein **Tenant** ist Ihre isolierte und sichere Umgebung innerhalb von Hikube. Es ist wie ein eigenes "virtuelles Rechenzentrum" mit:
- **Isoliertem Netzwerk**
- **Getrennten Benutzern und Berechtigungen**
- **Personalisierten Sicherheitsrichtlinien**
- **Verfügbaren Sub-Tenants**

### **Warum dieser Ansatz?**
```mermaid
graph TB
    A[Unternehmen] --> B[Tenant Produktion]
    A --> C[Tenant Entwicklung]
    A --> D[Tenant Staging]

    B --> E[Kritische App 1]
    B --> F[Kritische App 2]

    C --> G[Dev-Tests]
    C --> H[Experimente]

    D --> I[QA-Tests]
    D --> J[Validierung]
```

**Konkrete Vorteile:**
- **Vollständige Isolation**: Keine Auswirkungen zwischen Umgebungen
- **Teamverwaltung**: Granulare Berechtigungen pro Tenant
- **Differenzierte Richtlinien**: Produktion vs. Entwicklung
- **Getrennte Abrechnung**: Kostenverfolgung pro Projekt

### **Typische Anwendungsfälle**
| Tenant | Verwendung |
|--------|------------|
| **Production** | Kritische Anwendungen |
| **Staging** | Pre-Production-Tests |
| **Development** | Aktive Entwicklung |
| **Sandbox** | Schulung/Demonstration |

---

## Infrastructure as Code (IaC)

### **Für die Industrialisierung konzipiert**
Hikube ist für die Automatisierung und Industrialisierung Ihrer Infrastruktur konzipiert. Alle Funktionen sind zugänglich über:

- **Vollständige API**: Native Integration in Ihre CI/CD-Pipelines
- **Leistungsstarke CLI**: Automatisierung und Skripte für Ihre DevOps-Teams
- **Deklarativ**: Beschreiben Sie den gewünschten Zustand, Hikube kümmert sich um den Rest

### **Vorteile des industriellen Ansatzes**
- **Reproduzierbarkeit**: Jedes Mal identische Bereitstellungen
- **Versionierung**: Vollständige Nachverfolgung von Infrastrukturänderungen
- **Zusammenarbeit**: Gemeinsamer Code zwischen Entwicklungs- und Ops-Teams
- **Automatisierung**: Nahtlose Integration in Ihre Workflows

---

## Observability und Monitoring

### **Vollständiger Monitoring-Stack**

Hikube ermöglicht es Ihnen, Ihren eigenen Monitoring-Stack in Ihrem Tenant mit **Grafana + VictoriaMetrics + VictoriaLogs** bereitzustellen. Dieser Stack kann Daten aller Ihrer Sub-Tenants zentralisieren und bietet einen globalen Überblick über Ihre Infrastruktur.

```mermaid
flowchart TD
    subgraph TENANT["HAUPT-TENANT"]
        G[Grafana]
        VM[VictoriaMetrics]
        VL[VictoriaLogs]
    end

    subgraph SOUS["SUB-TENANT"]
        K8S[Kubernetes]
        VMS[VMs]
        APP[Anwendungen]
        M[Metriken]
        L[Logs]
    end

    G -.-> VM
    G -.-> VL
    K8S --> M
    VMS --> M
    APP --> M
    APP --> L

    M --> VM
    L --> VL

    VM --> D1[Dashboard K8s]
    VM --> D2[Dashboard VMs]
    VM --> D3[Dashboard Apps]
    VL --> D4[Dashboard Logs]
```

### **Multi-Tenant-Monitoring-Architektur**

#### **Intelligente Zentralisierung**
- **Haupt-Tenant**: Hostet den Grafana + VictoriaMetrics + VictoriaLogs-Stack
- **Sub-Tenants**: Erzeugen automatisch Metriken und Logs
- **Sichere Weiterleitung**: Zentralisierte Aggregation mit Datenisolation
- **Globale Ansicht**: Einheitliches Dashboard Ihrer gesamten Infrastruktur

#### **Dashboards pro Ressource**

Hikube stellt **vorkonfigurierte Dashboards** für jeden Ressourcentyp bereit:

| **Ressourcentyp** | **Enthaltenes Dashboard** | **Wichtige Metriken** |
|---------------------------|-------------------------|------------------------|
| **Kubernetes** | Cluster, Nodes, Pods, Services | CPU, RAM, Netzwerk, Speicher |
| **Virtuelle Maschinen** | Host, VM, Leistung | Auslastung, I/O, Verfügbarkeit |
| **Datenbanken** | MySQL, PostgreSQL, Redis | Verbindungen, Abfragen, Cache |
| **Anwendungen** | Leistung, Fehler | Latenz, Durchsatz, 5xx |
| **Netzwerk** | LoadBalancer, VPN | Datenverkehr, Latenz, Verbindungen |
| **Speicher** | Buckets, Volumes | Kapazität, IOPS, Transfers |

---

## Nächste Schritte

Nachdem Sie die Konzepte von Hikube beherrschen, können Sie:

### **In die Praxis umsetzen**
- **[Kubernetes bereitstellen](../services/kubernetes/overview.md)** → Erstellen Sie Ihren ersten Cluster
- **[VMs konfigurieren](../services/compute/overview.md)** → Hybride Infrastruktur
- **[Speicher verwalten](../services/storage/buckets/overview.md)** → Persistente Daten

### **Automatisieren**
- **[Terraform](../tools/terraform.md)** → Infrastructure as Code
<!--- **[CLI](../tools/cli.md)** → Skripte und Automatisierung-->

### **Vertiefen**
- **[FAQ](../resources/faq.md)** → Häufig gestellte Fragen
- **[Troubleshooting](../resources/troubleshooting.md)** → Problemlösung

---

**Empfehlung:** Beginnen Sie mit der Erkundung der **[Kubernetes-Dienste](../services/kubernetes/overview.md)** oder **[Compute-Dienste](../services/compute/overview.md)**, um zu sehen, wie diese Konzepte konkret auf jede Komponente von Hikube angewendet werden.
