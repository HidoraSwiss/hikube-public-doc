---
title: "Come creare un disco di sistema a partire da un'immagine"
---

# Come creare un disco di sistema a partire da un'immagine

Un **disco di sistema** contiene un sistema operativo preinstallato e può fungere da disco di avvio per una VM. Questa guida spiega come crearlo dalla [console Hikube](https://console.hikube.cloud), a partire da un'immagine del catalogo o da una sua immagine.

## Prerequisiti

- Un **progetto** con una quota di storage sufficiente
- Per un'immagine personalizzata: un **URL HTTPS** pubblico verso un file ISO o QCOW2

## Passaggi

### 1. Aprire la procedura guidata

Apra **Infrastructure** → **Disks** e faccia clic su **Create a disk**. Al passaggio **General**, inserisca il nome nel campo **Disk Name**.

### 2. Scegliere l'origine

Al passaggio **Source**, selezioni **System Disk**. Viene visualizzato il selettore **OS Image / Source**:

- **Immagine del catalogo**: scelga il sistema operativo, poi la relativa **Version**;
- **Immagine personalizzata**: faccia clic su **Custom Image** e compili il campo **Image URL (ISO/QCOW2)**. L'URL deve puntare a un file grezzo o compresso riconosciuto dal sistema.

Regole di convalida dell'URL:

| Regola | Messaggio della console |
|-------|-----------------------|
| URL obbligatorio | «URL is required» |
| Solo HTTPS | «URL must use the HTTPS protocol» |
| Nessun indirizzo privato o locale | «Private or local IP addresses are not allowed» |

### 3. Configurare la dimensione e la sicurezza

Al passaggio **Configuration**:

- **Size (GB)**: almeno 20 GB, e almeno **50 GB per un'immagine Windows** (la console adatta il valore automaticamente);
- **Replication Type**: **Asynchronous Replication** (Recommended) o **Synchronous Replication**;
- **Disk Encryption**: la attivi se necessario.

### 4. Verificare e creare

Al passaggio **Summary**, la sezione **Source & Content** indica **System Disk** e l'immagine scelta (**Cloud Image: …** o **Custom image (ISO/QCOW2)** con l'URL). L'**Estimated Cost** include la licenza per un'immagine Windows. Faccia clic su **Create disk**.

### 5. Seguire il download

Dopo la creazione, il disco passa per lo stato **Downloading**: la piattaforma importa l'immagine e la pagina del disco mostra l'avanzamento in percentuale. Il disco passa poi a **Ready**.

La pagina del disco indica l'immagine di origine nella sezione **Source**.

## Utilizzare il disco di sistema

Per avviare una VM su questo disco, selezioni **Existing** sul **System Disk (Boot)** al passaggio **Storage** della procedura guidata di creazione della VM (vedere [Collegare un disco a una VM](./attach-to-vm.md)).

:::note
L'immagine personalizzata (ISO) è disponibile solo durante la creazione di un disco.
:::

## Verifica

- Il disco è in stato **Ready**.
- La sua pagina mostra l'immagine di origine (**Source system image**) nella sezione **Source**.

## Per approfondire

- [Concetti](../concepts.md)
- [Risoluzione dei problemi](../troubleshooting.md)
