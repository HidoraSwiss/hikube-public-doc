---
sidebar_position: 1
title: Globale Fehlerbehebung
---

# Globale Fehlerbehebung Hikube

Dieser Leitfaden behandelt die häufigsten Probleme auf Hikube. Für ein Problem, das einen bestimmten Service betrifft, sehen Sie auch die Seite **Fehlerbehebung** dieses Services ein.

---

## 1. Zugriff auf die Konsole

### „No organization“

**Symptom:** Nach der Anmeldung zeigt die Konsole **No organization** an.

**Lösungen:**
- Wenn Ihre Organisation gerade erst erstellt wurde, klicken Sie auf **Refresh**;
- andernfalls ist Ihr Konto keiner Organisation zugeordnet: [Wenden Sie sich an den Support](mailto:support@hidora.io).

### „Service Unavailable“

**Symptom:** Die Konsole zeigt **Service Unavailable** an.

**Lösungen:**
- Die Plattform befindet sich in Wartung oder ist vorübergehend nicht erreichbar: Warten Sie einen Moment und klicken Sie dann auf **Retry**;
- wenn das Problem weiterhin besteht, wenden Sie sich von dieser Seite aus an den Support: Die **Error details** werden Ihrer Anfrage beigefügt.

### Ich sehe ein Projekt nicht

Welche Projekte angezeigt werden, hängt von der ausgewählten Organisation und Ihren Berechtigungen ab. Prüfen Sie die **Current Organization** im Profilmenü (**Change organization**, wenn Sie mehrere haben) und bitten Sie dann einen Administrator der Organisation, Ihnen Zugriff auf das Projekt zu geben.

---

## 2. Erstellen einer Ressource

### „Quota exceeded“

**Symptom:** Der Erstellungsassistent blockiert die Bestätigung und meldet eine Überschreitung der Quota.

**Lösungen:**
- Verringern Sie die angeforderte Größe (Instanztyp, Preset, Speicher, maximale Anzahl der Nodes);
- geben Sie ungenutzte Ressourcen im Projekt frei;
- bitten Sie einen Administrator, die Quotas des Projekts zu erhöhen (Projekteinstellungen → **Quotas**).

:::note Kubernetes
Bei einem Kubernetes-Cluster wird die Quota anhand der **maximalen Anzahl** an Nodes jeder Gruppe berechnet, einschließlich Autoscaling.
:::

### „Project quotas are unavailable right now“

Die Konsole kann die Quotas des Projekts nicht lesen und blockiert die Erstellung aus Sicherheitsgründen. Laden Sie die Seite neu; wenn die Meldung bestehen bleibt, wenden Sie sich an den Support.

### Ressource hängt in „Creating“ fest

**Symptom:** Eine Ressource bleibt weit über die übliche Dauer (einige Minuten) hinaus im Status **Creating**.

**Lösungen:**
- Laden Sie die Detailseite neu;
- wenn sich der Status nicht ändert oder zu **Error** / **Failed** wechselt, wenden Sie sich an den Support und geben Sie das Projekt und den Namen der Ressource an.

---

## 3. Kubernetes

### Der Download der kubeconfig schlägt fehl

**Symptom:** Die Schaltfläche **Kubeconfig** zeigt **Download failed** an.

**Lösung:** Der Cluster ist vermutlich noch nicht bereit. Warten Sie, bis er den Status **Ready** erreicht, und versuchen Sie es dann erneut.

### `kubectl` erreicht den Cluster nicht

```bash
# Verwendete Datei prüfen
echo $KUBECONFIG
kubectl config view --minify

# Verbindung testen
kubectl cluster-info
```

**Lösungen:**
- Prüfen Sie, dass `KUBECONFIG` auf die aus der Konsole heruntergeladene Datei `kubeconfig-<cluster-name>.yaml` zeigt;
- wenn der Cluster neu erstellt wurde, laden Sie seine kubeconfig erneut herunter.

### Fehlerhafte Pods in Ihrem Cluster

Die folgenden Befehle werden **in Ihrem Kubernetes-Cluster** mit dessen kubeconfig ausgeführt:

```bash
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
kubectl logs <pod-name> -n <namespace> --previous
```

| Zustand | Häufige Ursache | Lösungsansatz |
|---------|-----------------|---------------|
| `CrashLoopBackOff` | Anwendungsfehler, unzureichender Arbeitsspeicher | Lesen Sie die Logs des vorherigen Containers; erhöhen Sie die Speicherlimits |
| `Pending` | Nicht genügend Ressourcen auf den Nodes | Erhöhen Sie das Maximum der Node-Gruppe in der Konsole oder wählen Sie einen größeren Instanztyp |
| `ImagePullBackOff` | Image nicht gefunden oder private Registry | Prüfen Sie den Namen des Images und die Zugangsdaten der Registry |
| `OOMKilled` | Speicherlimit erreicht | Erhöhen Sie `resources.limits.memory` des Containers |

Siehe: [Kubernetes - Fehlerbehebung](../services/kubernetes/troubleshooting.md)

---

## 4. Virtuelle Maschinen

### SSH-Verbindung nicht möglich

**Lösungen:**
- Prüfen Sie, dass die VM in **VM Instances** den Status **Running** hat;
- prüfen Sie, dass eine öffentliche IP zugewiesen ist und Port 22 in der Netzwerkkonfiguration der VM erlaubt ist;
- prüfen Sie, dass Sie den privaten Schlüssel verwenden, der zum bei der Erstellung angegebenen öffentlichen Schlüssel passt.

Siehe: [Virtuelle Maschinen - Fehlerbehebung](../services/compute/troubleshooting.md)

---

## 5. Datenbanken und Messaging

### Verbindung von außen abgelehnt

**Lösungen:**
- Prüfen Sie, dass **External access** auf dem Cluster aktiviert ist (**Edit**);
- verwenden Sie die Adresse, die im Feld **Host** der Detailseite angezeigt wird. Solange sie nicht zugewiesen ist, ist keine externe Verbindung möglich;
- prüfen Sie Benutzer und Passwort, die in der Konsole angezeigt werden.

### Passwort abgelehnt

Prüfen Sie, dass Sie das Passwort des betreffenden Benutzers verwenden, das auf der Detailseite des Clusters angezeigt wird. Wenn Sie bei Redis und RabbitMQ das Passwort rotiert haben, aktualisieren Sie Ihre Anwendungen.

Siehe: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Speicher

### Einen Bucket löschen, ohne Daten zu verlieren

Das Löschen eines Buckets ist endgültig und entfernt alle seine Objekte: Die Konsole prüft nicht, ob er leer ist. Kopieren Sie zuerst die zu behaltenden Daten mit Ihrem S3-Client (zum Beispiel `aws s3 sync`). Schlägt das Löschen fehl, versuchen Sie es erneut und wenden Sie sich dann an den Support.

### S3-Zugriff verweigert (`AccessDenied`)

Prüfen Sie, dass der verwendete Zugriffsschlüssel zu einem Benutzer des Buckets gehört und die passenden Rechte hat (nur Lesen oder Lesen/Schreiben).

Siehe: [Buckets - Fehlerbehebung](../services/storage/buckets/troubleshooting.md), [Disks - Fehlerbehebung](../services/storage/disks/troubleshooting.md)

---

## Den Support kontaktieren

Wenn das Problem weiterhin besteht: Profilmenü → **Contact support** (der technische Kontext der Seite wird beigefügt) oder **support@hidora.io**. Geben Sie die Organisation, das Projekt und den Namen der betroffenen Ressourcen an.
