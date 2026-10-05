---
title: "Come avviare, arrestare, modificare ed eliminare una VM"
---

# Come avviare, arrestare, modificare ed eliminare una VM

Questa guida raccoglie le azioni più comuni su una VM esistente dalla console: avvio, arresto, riavvio, modifica delle risorse ed eliminazione.

## Prerequisiti

- Un account Hikube e un progetto
- Una VM esistente in **Infrastructure** > **VM Instances**

## Dove trovare le azioni

| Posizione | Azioni disponibili |
|-------------|---------------------|
| Elenco **VM Instances**, menu **Actions** (⋯) di una riga | **View details**, **Start**, **Stop**, **Restart**, **Reload UserData**, **Edit**, **Delete** |
| Pagina di dettaglio, intestazione | **Edit**, **Delete** |
| Pagina di dettaglio, sezione **Actions** | **Start** (VM arrestata), **Stop** e **Restart** (VM attiva), **Reload UserData** (VM attiva) |

L'elenco propone anche una ricerca (**Search instances...**) e un filtro per stato (**All statuses**, **Running**, **Stopped**).

## Passaggi

### 1. Arrestare una VM

1. Faccia clic su **Stop**.
2. Confermi nella finestra **Stop virtual machine?**: i servizi ospitati vengono interrotti fino al riavvio.

Lo stato passa a **Stopping**, poi a **Stopped**.

:::warning VM con GPU
L'arresto libera la GPU, che può essere assegnata a un altro carico di lavoro. Potrebbe non riuscire a riavviare subito la VM se in seguito non è disponibile alcuna GPU. Vedere [GPU non disponibile all'avvio](../troubleshooting.md#gpu-non-disponibile-allavvio).
:::

### 2. Avviare una VM

Faccia clic su **Start**. Lo stato passa a **Starting**, poi a **Running**.

### 3. Riavviare una VM

Faccia clic su **Restart** e confermi in **Restart virtual machine?**. Le applicazioni sono temporaneamente non disponibili. Lo stato passa per **Restarting**.

### 4. Modificare una VM

1. Nella pagina di dettaglio, faccia clic su **Edit** (oppure su **Edit** nel menu **Actions** dell'elenco, disponibile solo per una VM **Running**).
2. Modifichi le sezioni desiderate:
   - **Resources (CPU / RAM)**: serie e dimensione, GPU;
   - **Storage**: aggiunta o scollegamento di dischi;
   - **Network & Security**: IP pubblico, firewall, porte, VPC;
   - **Advanced Configuration**: chiavi SSH, script cloud-init, **Automatic Restart**.
3. Verifichi il riepilogo delle quote in cima alla pagina e faccia clic su **Save**.

Se cambiano il tipo di istanza, i dischi o le GPU, la console mostra **Restart required**: la VM si riavvia, il che può richiedere diversi minuti. Altrimenti, mostra **Instance updated**.

Il nome e l'immagine di sistema non sono modificabili.

### 5. Eliminare una VM

1. Faccia clic su **Delete**.
2. Inserisca il nome esatto della VM, quindi faccia clic su **Permanently delete**.

I dischi della VM vengono scollegati e restano nel menu **Disks**, dove può ricollegarli a un'altra VM o eliminarli (vedere [Dischi](../../storage/disks/overview.md)).

## Verifica

Lo stato mostrato nell'elenco e nella pagina di dettaglio si aggiorna senza ricaricare la pagina. I contatori in cima all'elenco (**Active Instances**, **Stopped Instances**, **Total CPU**, **Total RAM**) riflettono le modifiche.

## Per approfondire

- [Concetti: ciclo di vita](../concepts.md#ciclo-di-vita)
- [Risoluzione dei problemi](../troubleshooting.md)
