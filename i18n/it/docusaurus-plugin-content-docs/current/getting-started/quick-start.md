---
sidebar_position: 3
title: Avvio rapido
---

# Avvio rapido con Hikube

Questa guida la accompagna dal primo accesso al primo cluster Kubernetes, interamente dalla [console Hikube](https://console.hikube.cloud). Occorrono una decina di minuti.

---

## Prerequisiti

- **Un account Hikube.** Se non ne dispone ancora, contatti il nostro team all'indirizzo **sales@hidora.io**.
- **Un browser web recente.**
- **kubectl**, solo per il passaggio finale che interroga il cluster Kubernetes. Vedere [Install kubectl](https://kubernetes.io/docs/tasks/tools/#kubectl).

:::note
La console è disponibile in francese e in inglese. Questa documentazione cita le etichette in inglese: selezioni l'inglese nel menu del profilo → **Language**.
:::

---

## Passaggio 1: Accedere alla console

1. Apra [https://console.hikube.cloud](https://console.hikube.cloud).
2. Acceda con le credenziali fornite da Hidora.
3. Arriva nella sua **organizzazione**. Il suo nome è visualizzato nel menu del profilo, sotto **Current Organization**.

:::note Nessuna organizzazione?
Se la console mostra **No organization**, il suo account non è ancora associato a un'organizzazione. Aggiorni la pagina se ne ha appena ricevuta una, altrimenti [contatti il supporto](mailto:support@hidora.io).
:::

---

## Passaggio 2: Creare un progetto

Un **progetto** è uno spazio isolato che raggruppa le sue risorse (VM, cluster, database…) e dispone di quota proprie.

1. Apra il selettore di progetto e faccia clic su **Create a project**. Al primo accesso, la procedura guidata **Welcome to Hikube** si apre direttamente.
2. Passaggio **General**: inserisca il **Project Name**. Deve iniziare con una lettera e contenere solo lettere minuscole e cifre, senza trattino, tra 3 e 16 caratteri (esempio: `demo01`).
3. Passaggio **Quotas** (facoltativo): imposti i limiti di **CPU** (vCPU), **Memory** (GB) e **Storage** (GB) del progetto.
4. Passaggio **Summary**: rilegga il riepilogo, quindi faccia clic su **Create project**.

La dashboard mostra **Setting up your project…** durante la preparazione del progetto, quindi si apre automaticamente.

---

## Passaggio 3: Creare un cluster Kubernetes

1. Nel menu laterale, apra **Infrastructure** → **Kubernetes**, quindi faccia clic su **Create cluster**.
2. Passaggio **General**: scelga un **Cluster name**, una **Kubernetes Version** e la **Control Plane Instance Size**. Lasci vuoto **API Endpoint (Host)**: la piattaforma lo genera al posto suo.
3. Passaggio **Nodes**: configuri almeno un gruppo di nodi (tipo di istanza, numero di nodi, storage effimero).
4. Passaggio **Addons**: attivi le estensioni necessarie (ad esempio cert-manager o ingress-nginx).
5. Passaggio **Summary**: controlli il riepilogo e il costo stimato, quindi avvii la creazione.

Il dettaglio di ogni campo è descritto nell'[avvio rapido Kubernetes](../services/kubernetes/quick-start.md).

---

## Passaggio 4: Seguire la distribuzione

L'elenco **Kubernetes Clusters** mostra lo stato del cluster:

- **Creating**: il control plane e i nodi sono in fase di provisioning;
- **Ready** / **Running**: il cluster è operativo.

Il passaggio a **Ready** richiede generalmente alcuni minuti.

---

## Passaggio 5: Recuperare il kubeconfig del cluster

1. Faccia clic sul cluster per aprire la sua pagina di dettaglio.
2. Faccia clic su **Kubeconfig**. La console scarica un file `kubeconfig-<nome-del-cluster>.yaml`.

:::warning File sensibile
Questo file conferisce un accesso amministratore al cluster. Non lo inserisca nel controllo di versione e lo conservi in una posizione protetta (ad esempio `~/.kube/`).
:::

---

## Passaggio 6: Interrogare il cluster

```bash
export KUBECONFIG=~/.kube/kubeconfig-<nome-del-cluster>.yaml
kubectl get nodes
```

**Risultato atteso:**

```console
NAME                       STATUS   ROLES    AGE   VERSION
<nome-del-cluster>-<gruppo>-xxxxx   Ready    <none>   3m    v1.xx.x
```

I nodi worker possono impiegare qualche minuto in più per comparire dopo il passaggio del cluster a **Ready**.

---

## Riepilogo

Lei ha:

- creato un **progetto** isolato, con le sue quota;
- distribuito un **cluster Kubernetes gestito** dalla console;
- recuperato il relativo kubeconfig e verificato l'accesso con `kubectl`.

## Serve aiuto?

- **[FAQ](../resources/faq.md)**: risposte alle domande comuni
- **[Risoluzione dei problemi](../resources/troubleshooting.md)**: soluzioni ai problemi frequenti
- **Supporto**: pulsante **Contact support** nel menu del profilo della console, oppure **support@hidora.io**

**Prossimo passo consigliato:** [Concetti chiave](./concepts.md)
