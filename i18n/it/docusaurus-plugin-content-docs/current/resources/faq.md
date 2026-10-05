---
sidebar_position: 2
title: FAQ
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

```bash
export KUBECONFIG=~/.kube/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

Vedere: [Kubernetes - Avvio rapido](../services/kubernetes/quick-start.md)

---

## 4. Serve ancora un kubeconfig per gestire le risorse Hikube?

No. VM, dischi, bucket, reti, cluster Kubernetes e database si creano e si gestiscono dalla console. Il kubeconfig di progetto non viene più fornito per impostazione predefinita; resta disponibile su richiesta al supporto per gli usi legacy come [Terraform](../tools/terraform.md).

Il kubeconfig di un **cluster Kubernetes** (domanda 3) resta invece il modo normale per accedere a quel cluster.

---

## 5. Dove si trovano le credenziali del database?

Nella pagina di dettaglio del cluster di database nella console (**DB & Messaging** → servizio → cluster). Vi sono visualizzati gli utenti, le relative password e l'host di connessione.

Vedere: [PostgreSQL](../services/databases/postgresql/quick-start.md), [MariaDB](../services/databases/mariadb/quick-start.md), [MongoDB](../services/databases/mongodb/quick-start.md), [Redis](../services/databases/redis/quick-start.md), [RabbitMQ](../services/messaging/rabbitmq/quick-start.md)

---

## 6. Come si espone un database su Internet?

Attivi l'opzione **External access** alla creazione del cluster oppure in **Edit**. Viene quindi assegnato un IP pubblico, visualizzato nel campo **Host** della pagina di dettaglio.

:::warning
Esponga un database solo se necessario e utilizzi password robuste.
:::

---

## 7. Come si sceglie la dimensione delle risorse?

Le procedure guidate di creazione propongono modelli predefiniti:

- **VM e nodi Kubernetes**: tipi di istanza delle serie `s1`, `u1` e `m1` (da 1 a 64 vCPU). Vedere [Concetti Kubernetes](../services/kubernetes/concepts.md) e [Concetti macchine virtuali](../services/compute/concepts.md).
- **Database**: preset da `nano` a `2xlarge`. Vedere la pagina Concetti di ciascun servizio.

Ogni procedura guidata mostra l'impatto sulla quota del progetto e il costo stimato prima della creazione.

---

## 8. Come si aumentano le quota di un progetto?

Gli amministratori del progetto o dell'organizzazione modificano le quota nelle impostazioni del progetto. Una quota non può scendere al di sotto del consumo attuale. Se la capacità della sua organizzazione è insufficiente, contatti il supporto.

Vedere: [Concetti chiave - Quota](../getting-started/concepts.md#quota)

---

## 9. Come si scalano le risorse?

- **Cluster Kubernetes**: modifichi i limiti minimo e massimo dei gruppi di nodi in **Edit**. I nodi si adattano automaticamente al carico entro questi limiti. Vedere [Gestire i gruppi di nodi](../services/kubernetes/how-to/manage-node-groups.md).
- **Database**: a seconda del servizio, il preset e lo storage si modificano in **Edit**. Vedere la guida «scaling» di ciascun servizio.

---

## 10. Come funziona l'alta disponibilità dei database?

Con più repliche, ogni servizio gestito passa automaticamente a una replica integra in caso di guasto dell'istanza primaria. Il numero di repliche si sceglie alla creazione.

Vedere: [PostgreSQL - Concetti](../services/databases/postgresql/concepts.md), [Redis - Concetti](../services/databases/redis/concepts.md)

---

## 11. I backup dei database sono disponibili nella console?

Non ancora. La configurazione dei backup e il ripristino vengono effettuati oggi dal supporto. Vedere ad esempio [PostgreSQL - Backup](../services/databases/postgresql/how-to/configure-backups.md).

---

## 12. Come si contatta il supporto?

Dalla console, apra il menu del profilo e faccia clic su **Contact support**: il contesto tecnico della pagina viene allegato alla richiesta. Può anche scrivere a **support@hidora.io**.
