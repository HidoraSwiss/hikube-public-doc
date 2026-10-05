---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — Kubernetes

### Il cluster resta in creazione

**Causa**: il provisioning del control plane o dei nodi non va a buon fine.

**Soluzione**:

1. In **Infrastructure** > **Kubernetes**, verifichi lo stato del cluster. Un cluster appena creato passa da **Creating** a **Ready** in pochi minuti.
2. Nella pagina di dettaglio, verifichi in **Node Pools** che i nodi diventino attivi.
3. Se lo stato non cambia, [contatti il supporto](mailto:support@hidora.io) indicando il nome del cluster e il progetto.

---

### La procedura guidata blocca la creazione (quota)

**Causa**: il progetto non dispone di quota CPU, memoria o storage sufficiente. La quota è calcolata sul control plane e sul **numero massimo** di nodi di ogni gruppo, storage effimero compreso («Storage quota exceeded for this project (including maximum auto-scaling)»).

**Soluzione**:

1. Consulti gli indicatori **Project Quotas** della procedura guidata per identificare la risorsa superata.
2. Riduca i **Maximum nodes**, il tipo di istanza o la **Ephemeral storage size** dei gruppi.
3. Se l'esigenza è reale, chieda un aumento della quota al supporto.

---

### Il download del kubeconfig non riesce

**Causa**: la console mostra «Could not download the kubeconfig file.» quando il cluster non è ancora pronto o il servizio è momentaneamente non disponibile.

**Soluzione**:

1. Attenda che il cluster abbia lo stato **Ready**.
2. Faccia di nuovo clic su **Kubeconfig** nella sezione **Actions** della pagina di dettaglio.
3. Se l'errore persiste, contatti il supporto.

---

### Kubeconfig scaduto o non valido

**Causa**: `kubectl` restituisce `x509: certificate has expired`, `Unauthorized`, oppure non raggiunge più il server (ad esempio, file di un cluster eliminato e poi ricreato).

**Soluzione**:

1. Scarichi un nuovo kubeconfig dalla pagina di dettaglio del cluster (pulsante **Kubeconfig**).
2. Sostituisca il vecchio file:
   ```bash
   export KUBECONFIG=~/Downloads/kubeconfig-<nome-del-cluster>.yaml
   ```
3. Verifichi la connettività:
   ```bash
   kubectl cluster-info
   ```

---

### Nodi nello stato NotReady

**Causa**: uno o più nodi non rispondono più al control plane. Ciò può dipendere da risorse insufficienti, da un disco effimero saturo o da un malfunzionamento del kubelet.

**Soluzione**:

1. Verifichi lo stato dei nodi e le relative condizioni:
   ```bash
   kubectl get nodes
   kubectl describe node <nome-del-nodo>
   ```
2. Consulti gli eventi per identificare la causa (`DiskPressure`, `MemoryPressure`, `PIDPressure`):
   ```bash
   kubectl get events -A --sort-by='.lastTimestamp'
   ```
3. In caso di `DiskPressure`, aumenti la **Ephemeral storage size** del gruppo (**Edit** > **Node groups**).
4. Verifichi che il tipo di istanza fornisca risorse sufficienti per i workload distribuiti.
5. Se il problema persiste, contatti il supporto.

---

### Pod in Pending (risorse insufficienti)

**Causa**: nessun nodo dispone di CPU o memoria sufficienti per pianificare il pod.

**Soluzione**:

1. Identifichi il motivo del Pending:
   ```bash
   kubectl describe pod <nome-del-pod>
   ```
   Cerchi il messaggio `FailedScheduling` negli eventi.
2. Verifichi le risorse disponibili sui nodi:
   ```bash
   kubectl top nodes
   ```
3. Se i nodi sono saturi e il gruppo ha raggiunto il suo massimo, aumenti i **Maximum nodes** (**Edit** > **Node groups**), oppure aggiunga un gruppo con un tipo di istanza più grande.
4. Se il pod è bloccato su un PVC, verifichi che il PVC sia stato correttamente provisionato:
   ```bash
   kubectl get pvc
   ```

---

### L'Ingress restituisce 404 o non risponde

**Causa**: la risorsa Ingress è configurata in modo errato, l'addon Ingress NGINX non è attivato oppure nessun gruppo di nodi ospita il controller.

**Soluzione**:

1. Verifichi nella pagina di dettaglio del cluster che **Ingress NGINX** compaia nella sezione **Extensions**. In caso contrario, lo attivi tramite **Edit** > **Extensions & Addons**.
2. Verifichi che almeno un gruppo di nodi sia **Exposed on the internet (Public IP)** e che il controller abbia un IP esterno:
   ```bash
   kubectl get svc -A | grep ingress-nginx-controller
   ```
3. Verifichi che l'`ingressClassName` sia specificato nel suo Ingress:
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
4. Verifichi che il backend (Service e pod) funzioni:
   ```bash
   kubectl get pods -l app=my-app
   kubectl get svc my-app-svc
   ```
5. Verifichi che il suo record DNS punti all'IP esterno del controller, nonché la configurazione dell'host e del path nella regola Ingress.

---

### PVC nello stato Pending

**Causa**: la classe di storage richiesta non esiste nel cluster oppure la capacità di storage è insufficiente.

**Soluzione**:

1. Elenchi le classi di storage disponibili nel cluster:
   ```bash
   kubectl get storageclass
   ```
2. Si assicuri che il nome utilizzato nel PVC corrisponda a una classe esistente, ad esempio `replicated`:
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
3. Verifichi gli eventi relativi al PVC:
   ```bash
   kubectl describe pvc my-data
   ```
4. Se la capacità è insufficiente, riduca la dimensione richiesta o contatti il supporto Hikube.

---

### Il salvataggio delle modifiche non riesce

**Causa**: la console mostra un errore dopo **Save**, ad esempio «Conflict during the update (e.g. resource in use).» oppure un messaggio di convalida.

**Soluzione**:

1. Legga il messaggio: indica il campo da correggere (ad esempio, GPU aggiunte a un gruppo esistente, massimo inferiore al minimo, YAML di sovrascrittura non valido).
2. In caso di conflitto, attenda il termine dell'operazione in corso sul cluster, ricarichi la pagina di modifica e riprovi.
3. Per aggiungere GPU, crei un nuovo gruppo di nodi anziché modificare un gruppo esistente senza GPU.
