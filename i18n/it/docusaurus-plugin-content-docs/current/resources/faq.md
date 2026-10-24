---
sidebar_position: 2
title: "Domande frequenti"
sidebar_label: FAQ
---

# Domande frequenti

Qui trova le risposte alle domande più comuni sull'utilizzo di Hikube. Ogni servizio dispone inoltre di una propria FAQ.

---

## 1. Come si accede a Hikube?

Acceda alla console: [https://console.hikube.cloud](https://console.hikube.cloud), con le credenziali fornite da Hidora. Se non dispone ancora di un account, contatti **sales@hidora.io**.

Vedere: [Avvio rapido](../getting-started/quick-start.md)

---

## 2. Qual è la differenza tra organizzazione e progetto?

L'**organizzazione** rappresenta la sua azienda; viene creata da Hidora. I **progetti** sono gli spazi isolati che lei crea nell'organizzazione per raggruppare le sue risorse, con quota proprie. Nelle versioni precedenti della documentazione, un progetto era chiamato **tenant**.

Vedere: [Concetti chiave](../getting-started/concepts.md)

---

## 3. Come si recupera il kubeconfig del proprio cluster Kubernetes?

Apra **Infrastructure** → **Kubernetes**, faccia clic sul cluster, quindi su **Kubeconfig**. La console scarica il file `kubeconfig-<nome-del-cluster>.yaml`.

Questo file conferisce un accesso amministratore al cluster: il suo download è riservato agli amministratori del progetto. Per gli altri membri, il pulsante **Kubeconfig** è disattivato con la dicitura «Reserved for project administrators.»

```bash
export KUBECONFIG=~/.kube/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

Vedere: [Kubernetes - Avvio rapido](../services/kubernetes/quick-start.md)

---

## 4. Serve ancora un kubeconfig per gestire le risorse Hikube?

No. VM, dischi, bucket, reti, cluster Kubernetes e database si creano e si gestiscono dalla console, e si automatizzano con l'[API pubblica](../../api/overview). Il kubeconfig di progetto non è più disponibile; il metodo [Terraform legacy](../tools/terraform.md) che ne dipendeva è dismesso.

Il kubeconfig di un **cluster Kubernetes** (domanda 3) resta invece il modo normale per accedere a quel cluster.

---

## 5. Dove si trovano le credenziali del database?

Nella pagina di dettaglio del cluster di database nella console (**DB & Messaging** → servizio → cluster). Vi sono visualizzati gli utenti, le relative password e l'host di connessione.

Vedere: [PostgreSQL](../services/databases/postgresql/quick-start.md), [MariaDB](../services/databases/mariadb/quick-start.md), [MongoDB](../services/databases/mongodb/quick-start.md), [Redis](../services/databases/redis/quick-start.md), [RabbitMQ](../services/messaging/rabbitmq/quick-start.md)

---

## 6. Come si espone un database su Internet?

Attivi l'opzione **External access** alla creazione del cluster oppure in **Edit**. Viene quindi assegnato un IP pubblico, visualizzato nella zona **External** della pagina di dettaglio. Per un replica set MongoDB, la zona elenca l'indirizzo di ogni membro.

Per connettersi da una VM o da un cluster Kubernetes dello stesso progetto, l'accesso esterno non è necessario: utilizzi l'host della zona **Internal**, sempre visualizzato.

:::warning
Esponga un database solo se necessario e utilizzi password robuste.
:::

---

## 7. Come si sceglie la dimensione delle risorse?

Le procedure guidate di creazione propongono modelli predefiniti:

- **VM e nodi Kubernetes**: tipi di istanza delle serie `s1`, `u1` e `m1` (da 1 a 64 vCPU). Vedere [Concetti Kubernetes](../services/kubernetes/concepts.md) e [Concetti macchine virtuali](../services/compute/concepts.md).
- **Database gestiti e RabbitMQ** (PostgreSQL, MariaDB, MongoDB, Redis, RabbitMQ): le dimensioni delle VM, serie `u1`, `s1` e `m1`, da `s1.small` (1 vCPU, 2 GB) a `m1.8xlarge` (32 vCPU, 256 GB). Una dimensione ha le stesse risorse della VM con lo stesso nome: `u1.medium` corrisponde a 1 vCPU e 4 GB. Vedere la pagina Concetti di ciascun servizio.
- **Control plane Kubernetes**: `s1.small` (1 vCPU, 2 GB) o `s1.medium` (2 vCPU, 4 GB), applicata a ciascuno dei suoi quattro componenti. Vedere [Concetti Kubernetes](../services/kubernetes/concepts.md#control-plane-instance-size).

Alla creazione nessuna dimensione è preselezionata: ne scelga una. Una risorsa creata con una dimensione precedente (`small`, `medium`…) la conserva e resta modificabile.

Ogni procedura guidata mostra l'impatto sulla quota del progetto e il costo stimato prima della creazione.

---

## 8. Come si aumentano le quota di un progetto?

Gli amministratori del progetto o dell'organizzazione modificano le quota nelle impostazioni del progetto. Una quota non può scendere al di sotto del consumo attuale. Se la capacità della sua organizzazione è insufficiente, contatti il supporto.

Vedere: [Concetti chiave - Quota](../getting-started/concepts.md#quota)

---

## 9. Come si scalano le risorse?

- **Cluster Kubernetes**: modifichi i limiti minimo e massimo dei gruppi di nodi in **Edit**. I nodi si adattano automaticamente al carico entro questi limiti. Vedere [Gestire i gruppi di nodi](../services/kubernetes/how-to/manage-node-groups.md).
- **Database**: a seconda del servizio, il preset e lo storage si modificano in **Edit**. La dimensione del disco non può essere ridotta e la versione non può essere abbassata; un cambio di versione o di preset riavvia le istanze. Vedere la guida «scaling» di ciascun servizio.

---

## 10. Come funziona l'alta disponibilità dei database?

Con più repliche, ogni servizio gestito passa automaticamente a una replica integra in caso di guasto dell'istanza primaria. Il numero di repliche si sceglie alla creazione.

Vedere: [PostgreSQL - Concetti](../services/databases/postgresql/concepts.md), [Redis - Concetti](../services/databases/redis/concepts.md)

---

## 11. I backup dei database sono disponibili nella console?

Sì. I database PostgreSQL e MariaDB, così come le macchine virtuali e i dischi, si salvano e si ripristinano dalla console, menu **Infrastructure** > **Backups** e scheda **Backups** di ogni risorsa. Vedere [Backup](../services/backups/overview.md).

---

## 12. Come si contatta il supporto?

Dalla console, apra il menu del profilo e faccia clic su **Contact support**: il contesto tecnico della pagina viene allegato alla richiesta. Può anche scrivere a **support@hidora.io**.
