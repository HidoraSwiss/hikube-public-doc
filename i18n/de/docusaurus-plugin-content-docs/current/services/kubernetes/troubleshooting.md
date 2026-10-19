---
sidebar_position: 7
title: "Fehlerbehebung — Kubernetes"
sidebar_label: Fehlerbehebung
description: "Beheben Sie häufige Kubernetes-Probleme auf Hikube: hängende Clustererstellung, Quota, abgelehnte oder abgelaufene kubeconfig, NotReady-Knoten, Pending-Pods."
---

# Fehlerbehebung — Kubernetes

### Der Cluster bleibt im Erstellungsstatus oder wechselt zu Error

**Ursache**: Das Provisioning der Control Plane oder der Nodes wird nicht abgeschlossen, oder die Plattform konnte die letzte Änderung des Clusters nicht anwenden. Im letzteren Fall wechselt der Cluster in den Status **Error**; er kann mit seiner vorherigen Konfiguration weiterlaufen.

**Lösung**:

1. Prüfen Sie unter **Infrastructure** > **Kubernetes** den Status des Clusters. Ein neu erstellter Cluster wechselt innerhalb weniger Minuten von **Creating** zu **Ready**. Mit dem Statusfilter der Liste lassen sich die Cluster im Status **Ready** oder **Error** anzeigen.
2. Prüfen Sie auf der Detailseite unter **Node Pools**, ob Nodes aktiv werden.
3. Wenn sich der Status nicht ändert oder der Cluster im Status **Error** ist, [wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie den Namen des Clusters und das Projekt an.

---

### Die Erstellung des ersten Clusters wartet auf „Preparing the Kubernetes environment“

**Ursache**: Der erste Cluster eines Projekts kann erst erstellt werden, wenn die Kubernetes-Umgebung des Projekts bereit ist, was einige Minuten dauert. Ein weiterer Cluster kann kurzzeitig dieselbe Wartezeit erleben, während einer Änderung des Projekts wie einer Quota-Anpassung.

**Lösung**:

1. Lassen Sie den Assistenten geöffnet: Er zeigt „Preparing the project's Kubernetes environment; creation will resume automatically.“ an und startet die Erstellung selbstständig neu, ohne dass Ihre Konfiguration verloren geht. Die Schaltfläche **Cancel** beendet das Warten.
2. Zeigt die Konsole „The project's Kubernetes environment is still not ready. Your configuration is kept: try again in a few minutes.“ an, klicken Sie einige Minuten später erneut auf **Create cluster**.
3. Zeigt die Konsole **Error during creation** mit einer Meldung an, die Sie auffordert, sich an den Support zu wenden (zum Beispiel „The project's Kubernetes environment failed to deploy. Contact support.“), versuchen Sie es nicht erneut: [Wenden Sie sich an den Support](mailto:support@hidora.io) und geben Sie das Projekt an.

Wenn Sie Ihre Cluster über die API erstellen, entsprechen diese Fälle den Fehlercodes `70205` (Umgebung in Vorbereitung: Senden Sie dieselbe Anfrage einige Minuten später erneut), `70207` und `70208` (nicht erneut versuchen, an den Support wenden).

---

### Der Assistent blockiert die Erstellung (Quota)

**Ursache**: Das Projekt hat nicht genügend Quota für CPU, Arbeitsspeicher oder Speicher. Die Quota wird anhand der Control Plane und der **maximalen Anzahl** an Nodes jeder Gruppe berechnet, einschließlich der Festplatte der Nodes („Storage quota exceeded for this project (including maximum auto-scaling)“).

**Lösung**:

1. Sehen Sie sich die Anzeigen **Project Quotas** des Assistenten an, um die überschrittene Ressource zu ermitteln.
2. Verringern Sie **Maximum nodes**, den Instanztyp oder die **Node disk size** der Gruppen.
3. Wenn der Bedarf tatsächlich besteht, beantragen Sie beim Support eine Erhöhung der Quota.

---

### Der Download der kubeconfig schlägt fehl

**Ursache**: Die Konsole zeigt „Could not download the kubeconfig file.“ an, wenn der Cluster noch nicht bereit ist oder der Service vorübergehend nicht verfügbar ist.

**Lösung**:

1. Warten Sie, bis der Cluster den Status **Ready** hat.
2. Klicken Sie im Abschnitt **Actions** der Detailseite erneut auf **Kubeconfig**.
3. Wenn der Fehler weiterhin auftritt, wenden Sie sich an den Support.

---

### Die Schaltfläche Kubeconfig ist deaktiviert oder der Download wird abgelehnt

**Ursache**: Die kubeconfig gewährt administrativen Zugriff auf den Cluster; ihr Download ist den Projektadministratoren vorbehalten. Für die übrigen Mitglieder ist die Schaltfläche **Kubeconfig** deaktiviert und mit dem Hinweis „Reserved for project administrators.“ versehen. Lehnt die Plattform die Anfrage ab, zeigt die Konsole „The kubeconfig grants administrator access to the cluster: it is reserved for project administrators.“ an.

**Lösung**:

1. Wenden Sie sich an einen Projektadministrator.
2. Für einen eingeschränkten Zugriff auf den Cluster kann ein Administrator Ihnen auch ein eigenes Konto mit RBAC im Cluster einrichten (siehe [Zugriff und Werkzeuge](./how-to/toolbox.md)).

---

### Kubeconfig abgelaufen oder ungültig

**Ursache**: `kubectl` gibt `x509: certificate has expired` oder `Unauthorized` zurück oder erreicht den Server nicht mehr (zum Beispiel die Datei eines gelöschten und neu erstellten Clusters).

**Lösung**:

1. Laden Sie über die Detailseite des Clusters eine neue kubeconfig herunter (Schaltfläche **Kubeconfig**).
2. Ersetzen Sie die alte Datei:
   ```bash
   export KUBECONFIG=~/Downloads/kubeconfig-<cluster-name>.yaml
   ```
3. Prüfen Sie die Konnektivität:
   ```bash
   kubectl cluster-info
   ```

---

### Nodes im Zustand NotReady

**Ursache**: Ein oder mehrere Nodes antworten der Control Plane nicht mehr. Das kann an unzureichenden Ressourcen, einer vollen Node-Festplatte oder einem Ausfall des kubelet liegen.

**Lösung**:

1. Prüfen Sie den Zustand der Nodes und ihre Conditions:
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Sehen Sie sich die Events an, um die Ursache zu ermitteln (`DiskPressure`, `MemoryPressure`, `PIDPressure`):
   ```bash
   kubectl get events -A --sort-by='.lastTimestamp'
   ```
3. Bei `DiskPressure` erhöhen Sie die **Node disk size** der Gruppe (**Edit** > **Node groups**).
4. Prüfen Sie, ob der Instanztyp genügend Ressourcen für die bereitgestellten Workloads bietet.
5. Wenn das Problem weiterhin besteht, wenden Sie sich an den Support.

---

### Pods im Status Pending (unzureichende Ressourcen)

**Ursache**: Kein Node verfügt über genügend CPU oder Arbeitsspeicher, um den Pod einzuplanen.

**Lösung**:

1. Ermitteln Sie den Grund für den Status Pending:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Suchen Sie in den Events nach der Meldung `FailedScheduling`.
2. Prüfen Sie die verfügbaren Ressourcen auf den Nodes:
   ```bash
   kubectl top nodes
   ```
3. Wenn die Nodes ausgelastet sind und die Gruppe ihr Maximum erreicht hat, erhöhen Sie **Maximum nodes** (**Edit** > **Node groups**) oder fügen Sie eine Gruppe mit einem größeren Instanztyp hinzu.
4. Wenn der Pod an einem PVC hängt, prüfen Sie, ob das PVC korrekt bereitgestellt wurde:
   ```bash
   kubectl get pvc
   ```

---

### Ingress gibt 404 zurück oder antwortet nicht

**Ursache**: Die Ingress-Ressource ist falsch konfiguriert, das Addon Ingress NGINX ist nicht aktiviert oder keine Node-Gruppe hostet den Controller.

**Lösung**:

1. Prüfen Sie auf der Detailseite des Clusters, ob **Ingress NGINX** im Abschnitt **Extensions** aufgeführt ist. Andernfalls aktivieren Sie es über **Edit** > **Extensions & Addons**.
2. Prüfen Sie, ob mindestens eine Node-Gruppe **Exposed on the internet (Public IP)** ist und der Controller eine externe IP hat:
   ```bash
   kubectl get svc -A | grep ingress-nginx-controller
   ```
3. Prüfen Sie, ob `ingressClassName` in Ihrem Ingress angegeben ist:
   ```yaml title="ingress.yaml"
   apiVersion: networking.k8s.io/v1
   kind: Ingress
   metadata:
     name: my-app
   spec:
     ingressClassName: nginx
     rules:
       - host: app.example.com
         http:
           paths:
             - path: /
               pathType: Prefix
               backend:
                 service:
                   name: my-app-svc
                   port:
                     number: 80
   ```
4. Prüfen Sie, ob das Backend (Service und Pods) funktioniert:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```
5. Prüfen Sie, ob Ihr DNS-Eintrag auf die externe IP des Controllers zeigt, sowie die Konfiguration von Host und Pfad in der Ingress-Regel.

---

### PVC im Zustand Pending

**Ursache**: Die angeforderte Speicherklasse existiert im Cluster nicht oder die Speicherkapazität reicht nicht aus.

**Lösung**:

1. Listen Sie die im Cluster verfügbaren Speicherklassen auf:
   ```bash
   kubectl get storageclass
   ```
2. Stellen Sie sicher, dass der in Ihrem PVC verwendete Name einer vorhandenen Klasse entspricht, zum Beispiel `replicated`:
   ```yaml title="pvc.yaml"
   apiVersion: v1
   kind: PersistentVolumeClaim
   metadata:
     name: my-data
   spec:
     accessModes:
       - ReadWriteOnce
     storageClassName: replicated
     resources:
       requests:
         storage: 10Gi
   ```
3. Prüfen Sie die Events des PVC:
   ```bash
   kubectl describe pvc my-data
   ```
4. Wenn die Kapazität nicht ausreicht, verringern Sie die angeforderte Größe oder wenden Sie sich an den Hikube-Support.

---

### Das Speichern der Änderungen schlägt fehl

**Ursache**: Die Konsole zeigt nach **Save** einen Fehler an, zum Beispiel „Conflict during the update (e.g. resource in use).“ oder eine Validierungsmeldung.

**Lösung**:

1. Lesen Sie die Meldung: Sie nennt das zu korrigierende Feld (zum Beispiel GPUs, die einer bestehenden Gruppe hinzugefügt wurden, ein Maximum unter dem Minimum, ungültiges Override-YAML, eine Version unterhalb der aktuellen Version).
   Eine Rückkehr zu einer niedrigeren Kubernetes-Version wird abgelehnt (`version downgrades are not supported`, Code `70206`): Wählen Sie die aktuelle oder eine höhere Version.
2. Bei einem Konflikt warten Sie, bis der laufende Vorgang auf dem Cluster abgeschlossen ist, laden Sie die Bearbeitungsseite neu und versuchen Sie es erneut.
3. Um GPUs hinzuzufügen, erstellen Sie eine neue Node-Gruppe, statt eine bestehende Gruppe ohne GPU zu ändern.
