---
sidebar_position: 3
title: Glossar
---

# Hikube-Glossar

Hier finden Sie die Definitionen der Begriffe und Konzepte, die in der Hikube-Dokumentation verwendet werden.

---

| **Begriff** | **Definition** | **Dokumentation** |
|-----------|---------------|-------------------|
| **Add-on / Plugin** | Aktivierbare Erweiterung auf einem Kubernetes-Cluster (cert-manager, ingress-nginx, monitoring usw.), die Funktionen ohne manuelle Konfiguration hinzufügt. | [Kubernetes API-Referenz](../services/kubernetes/api-reference.md) |
| **AMQP** | Advanced Message Queuing Protocol. Standard-Messaging-Protokoll, das insbesondere von RabbitMQ für die Kommunikation zwischen Anwendungen verwendet wird. | [RabbitMQ Übersicht](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | In ClickHouse integrierter verteilter Konsensdienst, der für die Koordination der Cluster-Knoten verwendet wird (Alternative zu ZooKeeper). | [ClickHouse Übersicht](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Tool zur automatischen Initialisierung virtueller Maschinen beim ersten Start. Ermöglicht die Konfiguration von Benutzern, Paketen, Skripten und Netzwerk über eine YAML-Datei. | [Compute API-Referenz](../services/compute/api-reference.md) |
| **CNI (Container Network Interface)** | Standard, der die Netzwerkverwaltung für Container in einem Kubernetes-Cluster definiert. Hikube verwendet standardmässig Cilium als CNI. | [Kubernetes Übersicht](../services/kubernetes/overview.md) |
| **Control Plane** | Gesamtheit der Komponenten, die den Zustand des Kubernetes-Clusters verwalten (API-Server, Scheduler, Controller Manager). Die Anzahl der Replicas bestimmt die Hochverfügbarkeit. | [Kubernetes API-Referenz](../services/kubernetes/api-reference.md) |
| **Golden Image** | Vorkonfiguriertes Basis-Image für virtuelle Maschinen, optimiert für ein bestimmtes Betriebssystem (Ubuntu, Rocky Linux usw.). | [Compute Übersicht](../services/compute/overview.md) |
| **Ingress / IngressClass** | Kubernetes-Ressource, die den externen HTTP/HTTPS-Zugang zu den Diensten des Clusters verwaltet. IngressClass definiert den verwendeten Controller (nginx, traefik usw.). | [Kubernetes API-Referenz](../services/kubernetes/api-reference.md) |
| **JetStream** | In NATS integriertes Streaming- und Persistenzsystem, das dauerhafte Nachrichtenspeicherung, Replay und garantierte Zustellung ermöglicht. | [NATS Übersicht](../services/messaging/nats/overview.md) |
| **Kubeconfig** | Konfigurationsdatei mit den Zugangsinformationen zu einem Kubernetes-Cluster (Server-URL, Zertifikate, Tokens). Erforderlich für die Verwendung von `kubectl`. | [Kubernetes Schnellstart](../services/kubernetes/quick-start.md) |
| **Namespace** | Logischer Bereich innerhalb eines Kubernetes-Clusters zur Isolation und Organisation von Ressourcen. Jeder Tenant verfügt über dedizierte Namespaces. | [Schlüsselkonzepte](../getting-started/concepts.md) |
| **NodeGroup** | Gruppe von Worker-Knoten in einem Kubernetes-Cluster mit gemeinsamen Eigenschaften (Instanztyp, Min/Max-Skalierung, Rollen). Ermöglicht die Anpassung der Ressourcen an verschiedene Workloads. | [Kubernetes API-Referenz](../services/kubernetes/api-reference.md) |
| **Operator** | Kubernetes-Pattern, das die Verwaltung komplexer Anwendungen automatisiert. Hikube verwendet spezialisierte Operatoren: Spotahome (Redis), CloudNativePG (PostgreSQL) usw. | [Redis Übersicht](../services/databases/redis/overview.md) |
| **PVC (PersistentVolumeClaim)** | Anforderung für persistenten Speicher in Kubernetes. Ermöglicht Pods, Daten über ihren Lebenszyklus hinaus zu bewahren. Die Grösse wird durch den Parameter `size` definiert. | [Kubernetes Schnellstart](../services/kubernetes/quick-start.md) |
| **Quorum Queues** | RabbitMQ-Warteschlangentyp basierend auf dem Raft-Konsens, der starke Replikation und Fehlertoleranz für kritische Nachrichten bietet. | [RabbitMQ Übersicht](../services/messaging/rabbitmq/overview.md) |
| **ResourcesPreset** | Vordefiniertes Ressourcenprofil (nano, micro, small, medium, large, xlarge, 2xlarge), das die CPU-/Arbeitsspeicher-Zuweisung verwalteter Dienste vereinfacht. | [Redis API-Referenz](../services/databases/redis/api-reference.md) |
| **Sentinel** | Redis-Komponente, die den Cluster-Zustand permanent überwacht, Master-Ausfälle erkennt und automatisch das Failover zu einem Replica orchestriert. | [Redis Übersicht](../services/databases/redis/overview.md) |
| **Shard / Replica** | Ein **Shard** ist eine horizontale Datenpartition (verwendet von ClickHouse). Ein **Replica** ist eine Datenkopie für Hochverfügbarkeit und Fehlertoleranz. | [ClickHouse Übersicht](../services/databases/clickhouse/overview.md) |
| **StorageClass** | Definiert den Speichertyp für persistente Volumes. `replicated` bietet Datenreplikation über mehrere Rechenzentren für Hochverfügbarkeit. | [Kubernetes API-Referenz](../services/kubernetes/api-reference.md) |
| **Tenant / Sub-Tenant** | Isolierte und sichere Umgebung innerhalb von Hikube. Ein Tenant kann Sub-Tenants enthalten, um Umgebungen zu trennen (Produktion, Staging, Entwicklung). | [Schlüsselkonzepte](../getting-started/concepts.md) |
