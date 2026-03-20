---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Kubernetes

### Nodi in stato NotReady

**Causa**: uno o più nodi non rispondono più al piano di controllo. Questo può essere legato a risorse insufficienti, un problema di archiviazione o un malfunzionamento del kubelet.

**Soluzione**:

1. Verificate lo stato dei nodi e le loro condizioni:
   ```bash
   kubectl get nodes
   kubectl describe node <node-name>
   ```
2. Consultate gli eventi per identificare la causa (DiskPressure, MemoryPressure, PIDPressure):
   ```bash
   kubectl get events --sort-by='.lastTimestamp'
   ```
3. Verificate che l'`instanceType` scelto fornisca risorse sufficienti per i workload distribuiti.
4. Se il problema persiste, aumentate il `maxReplicas` del nodeGroup per permettere al cluster di provisionare nuovi nodi sani.

---

### Pod in Pending (risorse insufficienti)

**Causa**: nessun nodo dispone di CPU o memoria sufficienti per pianificare il pod. Lo scheduler Kubernetes non riesce a trovare un posizionamento.

**Soluzione**:

1. Identificate la ragione del Pending:
   ```bash
   kubectl describe pod <pod-name>
   ```
   Cercate il messaggio `FailedScheduling` negli eventi.

2. Verificate le risorse disponibili sui nodi:
   ```bash
   kubectl top nodes
   ```

3. Se i nodi sono saturi, aumentate il `maxReplicas` del vostro nodeGroup:
   ```yaml title="cluster.yaml"
   spec:
     nodeGroups:
       workers:
         minReplicas: 2
         maxReplicas: 10
   ```

4. Se il pod e bloccato su un PVC, verificate che il PVC sia correttamente provisionato:
   ```bash
   kubectl get pvc
   ```

---

### Kubeconfig scaduto o non valido

**Causa**: il certificato client nel kubeconfig e scaduto (errore `x509: certificate has expired`) o le credenziali non sono valide (errore `Unauthorized`).

**Soluzione**:

1. Rigenerate il kubeconfig dal Secret sorgente:
   ```bash
   kubectl get tenantsecret <cluster-name>-admin-kubeconfig -o jsonpath='{.data.super-admin\.conf}' | base64 -d > kubeconfig.yaml
   ```

2. Sostituite il vostro vecchio file kubeconfig:
   ```bash
   export KUBECONFIG=kubeconfig.yaml
   ```

3. Verificate la connettività:
   ```bash
   kubectl cluster-info
   ```

---

### Ingress restituisce 404

**Causa**: la risorsa Ingress e mal configurata o l'addon ingressNginx non è attivato sul cluster.

**Soluzione**:

1. Verificate che l'addon `ingressNginx` sia attivato nella configurazione del cluster:
   ```yaml title="cluster.yaml"
   spec:
     addons:
       ingressNginx:
         enabled: true
   ```

2. Verificate che l'`ingressClassName` sia specificato nel vostro Ingress:
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

3. Verificate che il backend (Service + Pod) funzioni:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```

4. Verificate la configurazione dell'host e del path nella regola Ingress.

---

### PVC in stato Pending

**Causa**: la `storageClass` richiesta non esiste o la capacità di archiviazione e insufficiente.

**Soluzione**:

1. Le storageClass disponibili su Hikube sono: `local`, `replicated` e `replicated-async`.

2. Assicuratevi che il nome utilizzato nel vostro PVC corrisponda a una storageClass esistente:
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

3. Verificate gli eventi legati al PVC:
   ```bash
   kubectl describe pvc my-data
   ```

4. Se la capacità e insufficiente, riducete la dimensione richiesta o contattate il supporto Hikube.
