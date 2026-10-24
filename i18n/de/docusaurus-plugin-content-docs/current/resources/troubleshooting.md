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

### Ressource hängt in „Creating“ fest oder hat den Status „Error“

**Symptom:** Eine Ressource bleibt weit über die übliche Dauer (einige Minuten) hinaus im Status **Creating** oder wechselt in den Status **Error**.

Ein Projekt, ein VPC oder eine verwaltete Anwendung (Kubernetes-Cluster, Datenbank …) wechselt in den Status **Error**, wenn die Plattform ihre letzte Änderung nicht anwenden konnte. Die Ressource kann mit ihrer vorherigen Konfiguration weiterlaufen. Ein Projekt im Fehlerzustand trägt in der Projektauswahl ein Badge **Error**.

**Lösungen:**
- Laden Sie die Detailseite neu;
- wenn sich der Status nicht ändert oder zu **Error** / **Failed** wechselt, wenden Sie sich an den Support und geben Sie das Projekt und den Namen der Ressource an.

---

## 3. Kubernetes

### Die Erstellung des ersten Clusters wartet auf „Preparing the Kubernetes environment“

**Symptom:** Nach **Create cluster** zeigt der Assistent „Preparing the project's Kubernetes environment; creation will resume automatically.“ an.

**Lösung:** Beim ersten Cluster eines Projekts bereitet die Plattform zunächst die Kubernetes-Umgebung des Projekts vor, was einige Minuten dauert. Warten Sie: Die Konsole startet die Erstellung selbstständig neu, ohne dass Ihre Konfiguration verloren geht (die Schaltfläche **Cancel** beendet das Warten). Werden Sie in einer Meldung aufgefordert, sich an den Support zu wenden, versuchen Sie es nicht erneut und kontaktieren Sie den Support.

### Der Download der kubeconfig schlägt fehl

**Symptom:** Nach einem Klick auf **Kubeconfig** zeigt die Konsole **Error** an: „Could not download the kubeconfig file.“

**Lösung:** Der Cluster ist vermutlich noch nicht bereit. Warten Sie, bis er den Status **Ready** erreicht, und versuchen Sie es dann erneut.

### Die Schaltfläche Kubeconfig ist deaktiviert

**Symptom:** Die Schaltfläche **Kubeconfig** ist ausgegraut und mit dem Hinweis „Reserved for project administrators.“ versehen, oder die Konsole zeigt „The kubeconfig grants administrator access to the cluster: it is reserved for project administrators.“ an.

**Lösung:** Die kubeconfig gewährt administrativen Zugriff auf den Cluster; ihr Download ist den Projektadministratoren vorbehalten. Wenden Sie sich an einen Projektadministrator.

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
- prüfen Sie, dass Sie den privaten Schlüssel verwenden, der zum bei der Erstellung angegebenen öffentlichen Schlüssel passt;
- melden Sie sich mit dem Benutzer an, der im Block **SSH Connection** der Detailseite der VM angegeben ist (zum Beispiel `debian` für Debian, `opc` für Oracle Linux). Zeigt die Konsole an, dass der Standardbenutzer nicht verfügbar ist, verwenden Sie das in Ihrem Image eingerichtete Konto.

Siehe: [Virtuelle Maschinen - Fehlerbehebung](../services/compute/troubleshooting.md)

---

## 5. Datenbanken und Messaging

### Verbindung von außen abgelehnt

**Lösungen:**
- Prüfen Sie, dass **External access** auf dem Cluster aktiviert ist (**Edit**);
- verwenden Sie die Adresse, die im Bereich **External** der Detailseite angezeigt wird. Solange sie nicht zugewiesen ist („Waiting for allocation…“), ist keine externe Verbindung möglich. Bei einem MongoDB-Replica-Set listet der Bereich die Adresse jedes Mitglieds auf: Verbinden Sie sich mit `directConnection=true` mit einem Mitglied;
- von einer VM oder einem Kubernetes-Cluster desselben Projekts aus benötigen Sie keinen externen Zugriff: Verwenden Sie den Host aus dem Bereich **Internal**;
- prüfen Sie Benutzer und Passwort, die in der Konsole angezeigt werden.

### Passwort abgelehnt

Prüfen Sie, dass Sie das Passwort des betreffenden Benutzers verwenden, das auf der Detailseite des Clusters angezeigt wird. Wenn Sie bei Redis und RabbitMQ das Passwort rotiert haben, aktualisieren Sie Ihre Anwendungen.

### Die Änderung eines Clusters wird abgelehnt

Die Version einer Datenbank kann nicht herabgestuft und die Größe ihrer Festplatte nicht verringert werden. Bei PostgreSQL, MariaDB, MongoDB und RabbitMQ bietet die Konsole nur die aktuelle und höhere Versionen an und zeigt zum Beispiel „The disk size cannot be reduced: 20 GB minimum.“ an. Ein Wechsel der Version oder des Presets startet die Instanzen des Clusters neu: Planen Sie ihn außerhalb von Spitzenzeiten.

Siehe: [PostgreSQL](../services/databases/postgresql/troubleshooting.md), [MariaDB](../services/databases/mariadb/troubleshooting.md), [MongoDB](../services/databases/mongodb/troubleshooting.md), [Redis](../services/databases/redis/troubleshooting.md), [RabbitMQ](../services/messaging/rabbitmq/troubleshooting.md)

---

## 6. Speicher

### Einen Bucket löschen, ohne Daten zu verlieren

Das Löschen eines Buckets ohne WORM ist endgültig und entfernt alle seine Objekte, auch wenn er nicht leer ist. Kopieren Sie zuerst die zu behaltenden Daten mit Ihrem S3-Client (zum Beispiel `aws s3 sync`). Schlägt das Löschen fehl, versuchen Sie es erneut und wenden Sie sich dann an den Support.

Ein gesperrter Bucket (WORM) wird aus der Konsole entfernt, seine Objekte werden jedoch nicht gelöscht: Jedes Objekt bleibt 365 Tage nach dem Schreiben gesperrt (COMPLIANCE-Modus).

### S3-Zugriff verweigert (`AccessDenied`)

Prüfen Sie, dass der verwendete Zugriffsschlüssel zu einem Benutzer des Buckets gehört und die passenden Rechte hat (nur Lesen oder Lesen/Schreiben).

Prüfen Sie auch den in Ihrem S3-Client konfigurierten Bucket-Namen: Verwenden Sie den tatsächlichen S3-Namen (`bucket-…`), der im Feld **Bucket name** der Bucket-Seite angezeigt wird, und nicht den bei der Erstellung eingegebenen Namen.

### Die Größe einer Disk lässt sich nicht verringern

Die Größe einer Disk kann über das Menü **Disks** erhöht (siehe [Die Größe einer Disk ändern](../services/storage/disks/how-to/resize.md)), aber nie verringert werden. Die Bearbeitungsseite einer VM ändert die Größe ihrer Disks nicht: Die Disks, die die VM bereits hat, sind dort schreibgeschützt. Für eine kleinere Disk erstellen Sie eine neue Disk und kopieren Ihre Daten dorthin.

### Eine Disk lässt sich nicht löschen

**Symptom:** Die Konsole verweigert das Löschen einer Disk.

**Lösungen:**
- Die Disk ist noch an eine VM angehängt: Trennen Sie sie auf der Seite **Edit** der VM (**Detach disk**) oder löschen Sie die VM. Die System-Disk einer VM lässt sich nicht trennen: Sie kann erst nach dem Löschen der VM gelöscht werden;
- Die Disk wurde getrennt, wird aber von ihrer VM noch verwendet: Die Konsole zeigt „This disk was detached, but its VM still uses it until its next restart. Restart the VM, then try again.“ Starten Sie die VM neu und löschen Sie die Disk dann erneut.

Siehe: [Buckets - Fehlerbehebung](../services/storage/buckets/troubleshooting.md), [Disks - Fehlerbehebung](../services/storage/disks/troubleshooting.md)

---

## Den Support kontaktieren

Wenn das Problem weiterhin besteht: Profilmenü → **Contact support** (der technische Kontext der Seite wird beigefügt) oder **support@hidora.io**. Geben Sie die Organisation, das Projekt und den Namen der betroffenen Ressourcen an.
