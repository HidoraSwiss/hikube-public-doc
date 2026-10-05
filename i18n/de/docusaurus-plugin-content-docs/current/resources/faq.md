---
sidebar_position: 2
title: FAQ
---

# Häufig gestellte Fragen

Hier finden Sie Antworten auf die häufigsten Fragen zur Nutzung von Hikube. Jeder Service hat außerdem eine eigene FAQ.

---

## 1. Wie greife ich auf Hikube zu?

Melden Sie sich mit den von Hidora bereitgestellten Zugangsdaten bei der Konsole an: [https://console.hikube.cloud](https://console.hikube.cloud). Wenn Sie noch kein Konto haben, wenden Sie sich an **sales@hidora.io**.

Siehe: [Schnellstart](../getting-started/quick-start.md)

---

## 2. Was ist der Unterschied zwischen Organisation und Projekt?

Die **Organisation** repräsentiert Ihr Unternehmen; sie wird von Hidora erstellt. **Projekte** sind die isolierten Bereiche, die Sie in der Organisation anlegen, um Ihre Ressourcen mit eigenen Quotas zu bündeln. In früheren Versionen der Dokumentation hieß ein Projekt **Tenant**.

Siehe: [Schlüsselkonzepte](../getting-started/concepts.md)

---

## 3. Wie rufe ich die kubeconfig meines Kubernetes-Clusters ab?

Öffnen Sie **Infrastructure** → **Kubernetes**, klicken Sie auf Ihren Cluster und dann auf **Kubeconfig**. Die Konsole lädt die Datei `kubeconfig-<cluster-name>.yaml` herunter.

```bash
export KUBECONFIG=~/.kube/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

Siehe: [Kubernetes - Schnellstart](../services/kubernetes/quick-start.md)

---

## 4. Brauche ich noch eine kubeconfig, um meine Hikube-Ressourcen zu verwalten?

Nein. VMs, Disks, Buckets, Netzwerke, Kubernetes-Cluster und Datenbanken werden in der Konsole erstellt und verwaltet. Die Projekt-kubeconfig wird nicht mehr standardmäßig ausgegeben; für Legacy-Anwendungsfälle wie [Terraform](../tools/terraform.md) ist sie weiterhin auf Anfrage beim Support erhältlich.

Die kubeconfig eines **Kubernetes-Clusters** (Frage 3) bleibt hingegen der normale Weg, auf diesen Cluster zuzugreifen.

---

## 5. Wo finde ich die Zugangsdaten meiner Datenbank?

Auf der Detailseite des Datenbank-Clusters in der Konsole (**DB & Messaging** → Service → Cluster). Dort werden die Benutzer, ihre Passwörter und der Verbindungshost angezeigt.

Siehe: [PostgreSQL](../services/databases/postgresql/quick-start.md), [MariaDB](../services/databases/mariadb/quick-start.md), [MongoDB](../services/databases/mongodb/quick-start.md), [Redis](../services/databases/redis/quick-start.md), [RabbitMQ](../services/messaging/rabbitmq/quick-start.md)

---

## 6. Wie mache ich eine Datenbank im Internet erreichbar?

Aktivieren Sie die Option **External access** bei der Erstellung des Clusters oder über **Edit**. Daraufhin wird eine öffentliche IP zugewiesen und im Feld **Host** der Detailseite angezeigt.

:::warning
Machen Sie eine Datenbank nur erreichbar, wenn es nötig ist, und verwenden Sie starke Passwörter.
:::

---

## 7. Wie wähle ich die Größe meiner Ressourcen?

Die Erstellungsassistenten bieten vordefinierte Größen an:

- **VMs und Kubernetes-Nodes**: Instanztypen der Serien `s1`, `u1` und `m1` (von 1 bis 64 vCPU). Siehe [Kubernetes-Konzepte](../services/kubernetes/concepts.md) und [Konzepte virtueller Maschinen](../services/compute/concepts.md).
- **Datenbanken**: Presets von `nano` bis `2xlarge`. Siehe die Konzeptseite des jeweiligen Services.

Jeder Assistent zeigt vor der Erstellung die Auswirkung auf die Quota des Projekts und die geschätzten Kosten an.

---

## 8. Wie erhöhe ich die Quotas eines Projekts?

Die Administratoren des Projekts oder der Organisation ändern die Quotas in den Projekteinstellungen. Eine Quota kann nicht unter den aktuellen Verbrauch gesenkt werden. Reicht die Kapazität Ihrer Organisation nicht aus, wenden Sie sich an den Support.

Siehe: [Schlüsselkonzepte - Quotas](../getting-started/concepts.md#quotas)

---

## 9. Wie skaliere ich meine Ressourcen?

- **Kubernetes-Cluster**: Ändern Sie die Minimal- und Maximalwerte der Node-Gruppen über **Edit**. Die Nodes passen sich innerhalb dieser Grenzen automatisch an die Last an. Siehe [Node-Gruppen verwalten](../services/kubernetes/how-to/manage-node-groups.md).
- **Datenbanken**: Je nach Service werden Preset und Speicher über **Edit** geändert. Siehe die Anleitung zur Skalierung des jeweiligen Services.

---

## 10. Wie funktioniert die Hochverfügbarkeit der Datenbanken?

Mit mehreren Replicas wechselt jeder verwaltete Service bei einem Ausfall der primären Instanz automatisch auf ein gesundes Replica. Die Anzahl der Replicas wird bei der Erstellung gewählt.

Siehe: [PostgreSQL - Konzepte](../services/databases/postgresql/concepts.md), [Redis - Konzepte](../services/databases/redis/concepts.md)

---

## 11. Sind Datenbank-Backups in der Konsole verfügbar?

Noch nicht. Die Konfiguration der Backups und die Wiederherstellung erfolgen derzeit über den Support. Siehe zum Beispiel [PostgreSQL - Backups](../services/databases/postgresql/how-to/configure-backups.md).

---

## 12. Wie erreiche ich den Support?

Öffnen Sie in der Konsole das Profilmenü und klicken Sie auf **Contact support**: Der technische Kontext der Seite wird Ihrer Anfrage beigefügt. Sie können auch an **support@hidora.io** schreiben.
