---
sidebar_position: 7
title: Risoluzione dei problemi
---

# Risoluzione dei problemi — GPU

### La sezione GPU non compare nella procedura guidata

**Causa**: la sezione **Hardware Acceleration (GPU)** (VM) o **GPU** (gruppo di nodi Kubernetes) viene mostrata solo se la piattaforma offre almeno un modello.

**Soluzione**: ricarichi la pagina. Se la sezione resta assente, contatti il [supporto](mailto:support@hidora.io).

---

### Tutti i modelli sono Unavailable

**Causa**: nessuna unità libera per questi modelli al momento della creazione.

**Soluzione**: riprovi più tardi o contatti [sales@hidora.io](mailto:sales@hidora.io) per un'esigenza di capacità.

---

### «The following GPUs are not available: …» alla creazione o al salvataggio

**Causa**: le GPU richieste non sono libere contemporaneamente su uno stesso server fisico, oppure sono state assegnate tra l'apertura della procedura guidata e la creazione. Una VM, così come un nodo Kubernetes, viene eseguita su un unico server.

**Soluzione**:

1. Riduca il numero di GPU per VM o per nodo.
2. Eviti di combinare più modelli su una stessa VM.
3. Scelga un altro modello disponibile.

---

### La VM con GPU non si riavvia

**Causa**: l'arresto ha liberato la GPU, che è stata assegnata a un altro carico di lavoro. La console mostra **These GPUs are no longer available, they may have been claimed by another workload: …**.

**Soluzione**:

1. Nella finestra **Select an alternative GPU**, scelga un modello in **Available GPU**.
2. Faccia clic su **Update and Start**: la configurazione della VM viene aggiornata, quindi la VM si avvia.
3. Se la finestra indica **No GPUs are currently available.**, riprovi più tardi.

---

### GPU non rilevata nella VM

**Causa**: la GPU non è collegata alla VM, oppure la VM non è stata riavviata dopo l'aggiunta.

**Soluzione**:

1. Nella pagina di dettaglio, verifichi che la GPU compaia in **GPUs** (sezione **Resources & Characteristics**). Altrimenti la aggiunga tramite **Edit** > **Resources (CPU / RAM)**, quindi **Save**.
2. Dopo un'aggiunta, attenda che la VM sia tornata allo stato **Running**.
3. Nella VM:
   ```bash
   lspci | grep -i nvidia
   ```
4. Se la GPU compare in `lspci` ma non in `nvidia-smi`, mancano i driver: vedere la sezione seguente.

---

### Driver NVIDIA mancanti nella VM

**Causa**: le immagini Hikube non contengono i driver NVIDIA, oppure gli header del kernel non corrispondono alla versione del kernel.

**Soluzione**:

1. Installi i driver seguendo [Installare CUDA e i driver GPU](../compute/how-to/install-cuda-drivers.md). Su Ubuntu, verifichi che gli header del kernel siano presenti:
   ```bash
   sudo apt-get install -y linux-headers-$(uname -r)
   ```
2. Riavvii la VM (`sudo reboot` o **Restart** nella console).
3. Verifichi:
   ```bash
   nvidia-smi
   ```

---

### Pod GPU in stato Pending

**Causa**: nessun nodo del cluster ha una GPU libera, il gruppo GPU è a 0 nodi, oppure il GPU Operator non è pronto.

**Soluzione**:

1. Consulti gli eventi del pod:
   ```bash
   kubectl describe pod <pod>
   ```
   Il messaggio `Insufficient nvidia.com/gpu` indica che nessun nodo ha una GPU libera.
2. Verifichi le GPU allocabili:
   ```bash
   kubectl get nodes -o custom-columns=NAME:.metadata.name,GPU:.status.allocatable.'nvidia\.com/gpu'
   ```
3. Nella console, apra il cluster e verifichi il gruppo di nodi GPU (**Node Pools**): numero di nodi attivi, modello di GPU. Aumenti **Maximum nodes** tramite **Edit** se tutte le GPU sono occupate.
4. Verifichi che l'addon **GPU Operator** sia attivo (lo è automaticamente non appena un gruppo dispone di GPU).

---

### `nvidia-smi` non riesce in un pod

**Causa**: i componenti del GPU Operator non sono ancora pronti sul nodo, oppure il pod non richiede una GPU.

**Soluzione**:

1. Verifichi che il pod dichiari `nvidia.com/gpu` in `resources.limits`.
2. Verifichi lo stato dei pod del GPU Operator:
   ```bash
   kubectl get pods -A | grep -i gpu-operator
   ```
3. Se alcuni pod sono in `CrashLoopBackOff`, ne consulti i log:
   ```bash
   kubectl logs -n <namespace> <pod>
   ```
4. Una volta pronto l'operator, ricrei il suo pod. Se il problema persiste, contatti il [supporto](mailto:support@hidora.io).

---

### Impossibile aggiungere una GPU a un gruppo di nodi esistente

**Causa**: un gruppo creato senza GPU non può riceverne (**GPUs cannot be added to an existing node group: add a new node group for GPUs**). Al contrario, un gruppo GPU deve mantenere almeno una GPU.

**Soluzione**: in **Edit** > **Node groups**, faccia clic su **Add node group** e configuri la GPU su questo nuovo gruppo.
