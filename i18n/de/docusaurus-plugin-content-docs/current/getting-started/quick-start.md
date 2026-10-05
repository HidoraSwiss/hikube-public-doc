---
sidebar_position: 3
title: Schnellstart
---

# Schnellstart mit Hikube

Dieser Leitfaden begleitet Sie von der ersten Anmeldung bis zu Ihrem ersten Kubernetes-Cluster, vollständig über die [Hikube-Konsole](https://console.hikube.cloud). Rechnen Sie mit etwa zehn Minuten.

---

## Voraussetzungen

- **Ein Hikube-Konto.** Falls Sie noch keines haben, wenden Sie sich an unser Team unter **sales@hidora.io**.
- **Ein aktueller Webbrowser.**
- **kubectl**, nur für den letzten Schritt, der Ihren Kubernetes-Cluster abfragt. Siehe [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).

:::note
Die Konsole ist auf Französisch und Englisch verfügbar. Diese Dokumentation zitiert die englischen Beschriftungen: Wählen Sie Englisch im Profilmenü → **Language**.
:::

---

## Schritt 1: Bei der Konsole anmelden

1. Öffnen Sie [https://console.hikube.cloud](https://console.hikube.cloud).
2. Melden Sie sich mit den von Hidora bereitgestellten Zugangsdaten an.
3. Sie gelangen zu Ihrer **Organisation**. Ihr Name wird im Profilmenü unter **Current Organization** angezeigt.

:::note Keine Organisation?
Zeigt die Konsole **No organization** an, ist Ihr Konto noch keiner Organisation zugeordnet. Aktualisieren Sie die Seite, falls Sie gerade eine erhalten haben, andernfalls [wenden Sie sich an den Support](mailto:support@hidora.io).
:::

---

## Schritt 2: Ein Projekt erstellen

Ein **Projekt** ist ein isolierter Bereich, der Ihre Ressourcen (VMs, Cluster, Datenbanken …) bündelt und eigene Quotas hat.

1. Öffnen Sie die Projektauswahl und klicken Sie auf **Create a project**. Bei Ihrer ersten Anmeldung öffnet sich direkt der Assistent **Welcome to Hikube**.
2. Schritt **General**: Geben Sie den **Project Name** ein. Er muss mit einem Buchstaben beginnen und darf nur Kleinbuchstaben und Ziffern enthalten, ohne Bindestrich, mit 3 bis 16 Zeichen (Beispiel: `demo01`).

   ![Assistent zum Erstellen eines Projekts, Schritt General](/img/console/projects/wizard-general.en.png)

3. Schritt **Quotas** (optional): Legen Sie die Limits für **CPU** (vCPU), **Memory** (GB) und **Storage** (GB) des Projekts fest.
4. Schritt **Summary**: Prüfen Sie die Zusammenfassung und klicken Sie dann auf **Create project**.

Das Dashboard zeigt **Setting up your project…** an, während das Projekt vorbereitet wird, und öffnet sich dann automatisch.

---

## Schritt 3: Einen Kubernetes-Cluster erstellen

1. Öffnen Sie im Seitenmenü **Infrastructure** → **Kubernetes** und klicken Sie dann auf **Create cluster**.
2. Schritt **General**: Wählen Sie einen **Cluster name**, eine **Kubernetes Version** und die **Control Plane Instance Size**. Lassen Sie **API Endpoint (Host)** leer: Die Plattform erzeugt ihn für Sie.
3. Schritt **Nodes**: Konfigurieren Sie mindestens eine Node-Gruppe (Instanztyp, Anzahl der Nodes, ephemerer Speicher).
4. Schritt **Addons**: Aktivieren Sie die Erweiterungen, die Sie benötigen (zum Beispiel cert-manager oder ingress-nginx).
5. Schritt **Summary**: Prüfen Sie die Zusammenfassung und die geschätzten Kosten und starten Sie dann die Erstellung.

Die einzelnen Felder sind im [Kubernetes-Schnellstart](../services/kubernetes/quick-start.md) beschrieben.

---

## Schritt 4: Die Bereitstellung verfolgen

Die Liste **Kubernetes Clusters** zeigt den Status des Clusters an:

- **Creating**: Control Plane und Nodes werden bereitgestellt;
- **Ready** / **Running**: Der Cluster ist betriebsbereit.

Der Wechsel zu **Ready** dauert in der Regel einige Minuten.

---

## Schritt 5: Die kubeconfig des Clusters abrufen

1. Klicken Sie auf den Cluster, um seine Detailseite zu öffnen.
2. Klicken Sie auf **Kubeconfig**. Die Konsole lädt eine Datei `kubeconfig-<cluster-name>.yaml` herunter.

:::warning Sensible Datei
Diese Datei gewährt administrativen Zugriff auf Ihren Cluster. Versionieren Sie sie nicht und speichern Sie sie an einem geschützten Ort (zum Beispiel `~/.kube/`).
:::

---

## Schritt 6: Den Cluster abfragen

```bash
export KUBECONFIG=~/.kube/kubeconfig-<cluster-name>.yaml
kubectl get nodes
```

**Erwartetes Ergebnis:**

```console
NAME                       STATUS   ROLES    AGE   VERSION
<cluster-name>-<group>-xxxxx   Ready    <none>   3m    v1.xx.x
```

Die Worker-Nodes können nach dem Wechsel des Clusters zu **Ready** noch einige Minuten länger brauchen, bis sie erscheinen.

---

## Zusammenfassung

Sie haben:

- ein isoliertes **Projekt** mit eigenen Quotas erstellt;
- einen **verwalteten Kubernetes-Cluster** über die Konsole bereitgestellt;
- seine kubeconfig abgerufen und den Zugriff mit `kubectl` überprüft.

## Brauchen Sie Hilfe?

- **[FAQ](../resources/faq.md)**: Antworten auf häufige Fragen
- **[Fehlerbehebung](../resources/troubleshooting.md)**: Lösungen für häufige Probleme
- **Support**: Schaltfläche **Contact support** im Profilmenü der Konsole oder **support@hidora.io**

**Empfohlener nächster Schritt:** [Schlüsselkonzepte](./concepts.md)
