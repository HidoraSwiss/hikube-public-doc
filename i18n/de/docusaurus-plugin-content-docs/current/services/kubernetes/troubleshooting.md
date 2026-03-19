---
sidebar_position: 7
title: Fehlerbehebung
---

# Fehlerbehebung — Kubernetes

### Knoten im Zustand NotReady

**Ursache**: Ein oder mehrere Knoten antworten nicht mehr auf die Steuerungsebene. Dies kann auf unzureichende Ressourcen, ein Speicherproblem oder einen kubelet-Ausfall zurückzuführen sein.

**Lösung**:

1. Prüfen Sie den Zustand der Knoten und ihre Bedingungen:
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Konsultieren Sie die Events, um die Ursache zu identifizieren (DiskPressure, MemoryPressure, PIDPressure):
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```
3. Prüfen Sie, ob der gewählte `instanceType` ausreichend Ressourcen für die bereitgestellten Workloads bietet.
4. Wenn das Problem bestehen bleibt, erhöhen Sie `maxReplicas` der nodeGroup, um dem Cluster die Bereitstellung neuer gesunder Knoten zu ermöglichen.

---

### Pods im Zustand Pending (unzureichende Ressourcen)

**Ursache**: Kein Knoten verfügt über genügend CPU oder Speicher, um den Pod zu planen. Der Kubernetes-Scheduler findet keine Platzierung.

**Lösung**:

1. Identifizieren Sie den Grund für den Pending-Zustand:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Suchen Sie nach der Meldung `FailedScheduling` in den Events.

2. Prüfen Sie die verfügbaren Ressourcen auf den Knoten:
   ```bash
   kubectl top nodes
   ```

3. Wenn die Knoten ausgelastet sind, erhöhen Sie `maxReplicas` Ihrer nodeGroup:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       workers:
         minReplicas: 2
         maxReplicas: 10
   ```

4. Wenn der Pod an einem PVC hängt, prüfen Sie, ob das PVC ordnungsgemäß bereitgestellt wurde:
   ```bash
   kubectl get pvc
   ```

---

### Kubeconfig abgelaufen oder ungültig

**Ursache**: Das Client-Zertifikat in der kubeconfig ist abgelaufen (Fehler `x509: certificate has expired`) oder die Anmeldedaten sind ungültig (Fehler `Unauthorized`).

**Lösung**:

1. Generieren Sie die kubeconfig aus dem Quell-Secret neu:
   ```bash
   kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
   ```

2. Ersetzen Sie Ihre alte kubeconfig-Datei:
   ```bash
   export KUBECONFIG=kubeconfig.yaml
   ```

3. Prüfen Sie die Konnektivität:
   ```bash
   kubectl cluster-info
   ```

---

### Ingress gibt 404 zurück

**Ursache**: Die Ingress-Ressource ist falsch konfiguriert oder das Addon ingressNginx ist auf dem Cluster nicht aktiviert.

**Lösung**:

1. Prüfen Sie, ob das Addon `ingressNginx` in der Cluster-Konfiguration aktiviert ist:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       ingressNginx:
         enabled: true
   ```

2. Prüfen Sie, ob die `ingressClassName` in Ihrem Ingress korrekt angegeben ist:
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

3. Prüfen Sie, ob das Backend (Service + Pod) funktioniert:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```

4. Überprüfen Sie die Konfiguration von Host und Pfad in der Ingress-Regel.

---

### PVC im Zustand Pending

**Ursache**: Die angeforderte `storageClass` existiert nicht oder die Speicherkapazität ist unzureichend.

**Lösung**:

1. Die auf Hikube verfügbaren storageClasses sind: `local`, `replicated` und `replicated-async`.

2. Stellen Sie sicher, dass der in Ihrem PVC verwendete Name einer existierenden storageClass entspricht:
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

3. Prüfen Sie die Events zum PVC:
   ```bash
   kubectl describe pvc my-data
   ```

4. Wenn die Kapazität nicht ausreicht, reduzieren Sie die angeforderte Größe oder kontaktieren Sie den Hikube-Support.
