---
sidebar_position: 3
title: Glossar
---

# Hikube-Glossar

Hier finden Sie die Definitionen der Begriffe und Konzepte, die in der Hikube-Dokumentation verwendet werden.

---

| **Begriff** | **Definition** | **Dokumentation** |
|-------------|----------------|-------------------|
| **Add-on / Erweiterung** | Komponente, die auf einem Kubernetes-Cluster im Schritt **Addons** des Assistenten aktiviert werden kann (cert-manager, Ingress NGINX, Monitoring usw.). | [Kubernetes - Konzepte](../services/kubernetes/concepts.md) |
| **AMQP** | Advanced Message Queuing Protocol. Standard-Messaging-Protokoll, das unter anderem von RabbitMQ für die Kommunikation zwischen Anwendungen verwendet wird. | [RabbitMQ - Überblick](../services/messaging/rabbitmq/overview.md) |
| **ClickHouse Keeper** | In ClickHouse integrierter verteilter Konsensdienst zur Koordination der Nodes des Clusters (Alternative zu ZooKeeper). | [ClickHouse - Überblick](../services/databases/clickhouse/overview.md) |
| **Cloud-init** | Werkzeug zur automatischen Initialisierung virtueller Maschinen beim ersten Start: Benutzer, Pakete, Skripte, Netzwerk. Das Skript wird im Erstellungsassistenten der VM eingegeben. | [Cloud-init konfigurieren](../services/compute/how-to/configure-cloud-init.md) |
| **CNI (Container Network Interface)** | Standard, der die Netzwerkverwaltung für Container in einem Kubernetes-Cluster definiert. Hikube verwendet Cilium als CNI. | [Kubernetes - Überblick](../services/kubernetes/overview.md) |
| **Control Plane** | Gesamtheit der Komponenten, die den Zustand des Kubernetes-Clusters verwalten (API-Server, Scheduler, Controller Manager). Größe und Anzahl der Instanzen werden bei der Erstellung des Clusters gewählt. | [Kubernetes - Konzepte](../services/kubernetes/concepts.md) |
| **Disk** | Persistentes Block-Speichervolume, das an eine virtuelle Maschine angehängt ist (System- oder Daten-Disk), verwaltet unter **Infrastructure** → **Disks**. | [Disks - Überblick](../services/storage/disks/overview.md) |
| **Externer Zugriff** | Option der Datenbanken und von RabbitMQ, die dem Cluster eine öffentliche IP zuweist; die Adresse erscheint im Feld **Host** der Detailseite. | [PostgreSQL - Konzepte](../services/databases/postgresql/concepts.md) |
| **Golden Image** | Vorkonfiguriertes Basis-Image für virtuelle Maschinen, optimiert für ein bestimmtes Betriebssystem (Ubuntu, Rocky Linux, Windows Server usw.). | [Virtuelle Maschinen - Überblick](../services/compute/overview.md) |
| **Ingress / IngressClass** | Kubernetes-Ressource, die den externen HTTP/HTTPS-Zugriff auf die Services des Clusters verwaltet. IngressClass legt den verwendeten Controller fest. | [Ingress NGINX](../services/kubernetes/plugins/ingress-nginx.md) |
| **Instanztyp** | CPU- und Arbeitsspeicher-Größe einer VM oder eines Kubernetes-Nodes (Serien `s1`, `u1`, `m1`). | [Virtuelle Maschinen - Konzepte](../services/compute/concepts.md) |
| **JetStream** | In NATS integriertes Streaming- und Persistenzsystem, das dauerhafte Speicherung von Nachrichten, Replay und garantierte Zustellung ermöglicht. | [NATS - Überblick](../services/messaging/nats/overview.md) |
| **Konsole** | Weboberfläche von Hikube, [console.hikube.cloud](https://console.hikube.cloud), über die Sie alle Ihre Ressourcen verwalten. | [Schlüsselkonzepte](../getting-started/concepts.md) |
| **Kubeconfig** | Zugriffsdatei für einen Kubernetes-Cluster (Server-URL, Zertifikate). Die Datei Ihres Clusters laden Sie über seine Detailseite in der Konsole herunter (Schaltfläche **Kubeconfig**). | [Kubernetes - Schnellstart](../services/kubernetes/quick-start.md) |
| **Node-Gruppe** | Gruppe von Worker-Nodes eines Kubernetes-Clusters mit gemeinsamem Instanztyp, gemeinsamen Autoscaling-Grenzen (Minimum/Maximum) und gegebenenfalls einer GPU. | [Node-Gruppen verwalten](../services/kubernetes/how-to/manage-node-groups.md) |
| **Organisation** | Einheit, die Ihr Unternehmen in Hikube repräsentiert. Sie bündelt Ihre Benutzer und Ihre Projekte; sie wird von Hidora erstellt. | [Schlüsselkonzepte](../getting-started/concepts.md) |
| **Preset** | Vordefiniertes Ressourcenprofil (`nano` bis `2xlarge`), das in den Assistenten der Datenbanken zur Dimensionierung von CPU und Arbeitsspeicher angeboten wird. | [PostgreSQL - Konzepte](../services/databases/postgresql/concepts.md) |
| **Projekt** | Isolierter Bereich innerhalb einer Organisation, der Ressourcen bündelt und Quotas (CPU, Arbeitsspeicher, Speicher) trägt. Früher **Tenant** genannt. | [Schlüsselkonzepte](../getting-started/concepts.md) |
| **PVC (PersistentVolumeClaim)** | Anforderung von persistentem Speicher in einem Kubernetes-Cluster. Ermöglicht Pods, Daten über ihren Lebenszyklus hinaus zu behalten. | [Kubernetes - Konzepte](../services/kubernetes/concepts.md) |
| **Quorum Queues** | Auf dem Raft-Konsens basierender RabbitMQ-Queue-Typ, der starke Replikation und Ausfalltoleranz für kritische Nachrichten bietet. | [RabbitMQ - Überblick](../services/messaging/rabbitmq/overview.md) |
| **Quota** | Limit für CPU, Arbeitsspeicher oder Speicher eines Projekts. Die Assistenten zeigen die Auswirkung jeder Erstellung auf die Quota an. | [Schlüsselkonzepte](../getting-started/concepts.md#quotas) |
| **Sentinel** | Redis-Komponente, die den Zustand des Clusters überwacht, Ausfälle des Masters erkennt und automatisch das Failover auf ein Replica steuert. | [Redis - Überblick](../services/databases/redis/overview.md) |
| **Shard / Replica** | Ein **Shard** ist eine horizontale Partition der Daten (MongoDB, ClickHouse). Ein **Replica** ist eine Kopie der Daten für die Hochverfügbarkeit. | [MongoDB - Konzepte](../services/databases/mongodb/concepts.md) |
| **StorageClass** | Speichertyp der persistenten Volumes in einem Kubernetes-Cluster. `replicated` repliziert die Daten über mehrere Rechenzentren. | [Kubernetes - Konzepte](../services/kubernetes/concepts.md) |
| **VPC** | Virtuelles privates Netzwerk eines Projekts, in Subnetze unterteilt, das Ihre VMs miteinander verbindet. Verwaltet unter **Infrastructure** → **Networking**. | [Netzwerk - Überblick](../services/networking/overview.md) |
