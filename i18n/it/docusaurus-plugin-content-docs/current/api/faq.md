---
sidebar_position: 6
title: FAQ
---

# FAQ — API pubblica

### L'API è pronta per la produzione?

È in **anteprima** (`v1alpha1`): i percorsi, i campi e l'URL pubblico possono ancora evolvere. Può utilizzarla per le sue automazioni, a condizione di seguirne le evoluzioni nel [changelog](/blog).

---

### Come ottenere una chiave API?

Un amministratore del progetto o dell'organizzazione la crea nella console, scheda **API keys** delle impostazioni del progetto, scegliendone il nome, il livello di diritti e la durata di validità (vedere [Ottenere una chiave](./authentication.md#obtenir)).

---

### Dove trovo l'identificativo del mio progetto?

Nell'esempio di chiamata che la console mostra alla creazione di una chiave API: è l'UUID che segue `/projects/`. È distinto dal nome del progetto e dall'**Organization ID** visualizzato in **My Account**.

---

### Posso utilizzare la stessa chiave per più progetti?

No. Una chiave è associata a un solo progetto e qualsiasi richiesta destinata a un altro progetto viene rifiutata. Utilizzi una chiave per progetto.

---

### Posso creare una chiave API con un'altra chiave API?

No. La gestione delle chiavi è riservata agli amministratori, dalla loro sessione nella console: una chiave non può né creare né revocare chiavi. Questo impedisce a una chiave compromessa di ricrearsi degli accessi.

---

### Quale scope scegliere?

`read` per consultare (inventario, monitoraggio), `admin` per creare, modificare o eliminare risorse (distribuzione). Vedere [Scope](./authentication.md#scopes).

---

### Perché una chiave non può essere illimitata?

Così una chiave dimenticata o divulgata finisce per scadere da sola. La durata massima è di un anno (`365d`); preveda la sostituzione delle chiavi delle sue integrazioni prima della loro scadenza.

---

### Ho perso il segreto della mia chiave. Me lo potete rinviare?

No. Hikube conserva solo un'impronta del segreto, che viene mostrato solo alla creazione. Revochi la chiave persa e ne crei una nuova, oppure utilizzi **Renew** nella scheda **API keys**: la console crea una chiave con lo stesso nome e lo stesso livello, poi propone di revocare la vecchia.

---

### La mia chiave è trapelata. Cosa fare?

**La revochi immediatamente** nella scheda **API keys** delle impostazioni del progetto. Se passa dal supporto, fornisca il suo `keyId`, mai il segreto. La revoca ha effetto dalla richiesta successiva. Crei poi una nuova chiave e cerchi dove la vecchia può essere stata utilizzata.

---

### Tutte le mie richieste restituiscono `403` con il codice `10002`. Perché?

Questa risposta unica copre tutti i rifiuti: chiave assente, non valida, scaduta o revocata, identificativo di progetto errato, scope insufficiente, oppure operazione non accessibile alle chiavi. Verifichi innanzitutto che l'intestazione `X-Hikube-Api-Key` venga effettivamente inviata: anche una richiesta senza chiave riceve `403`, non `401`. Vedere [Accesso negato](./errors.md#acces-refuse).

---

### Tutte le operazioni della console sono disponibili nell'API?

No. L'API copre le risorse dei progetti (VM, dischi, bucket, Kubernetes, rete, database, RabbitMQ) e i cataloghi. La gestione dell'account, dell'organizzazione, dei progetti, dei membri e delle chiavi resta nella console. Il [riferimento dell'API](/api/reference/hikube-api/) elenca esattamente le operazioni disponibili.

---

### Esiste un client ufficiale o un provider Terraform?

Non ancora. Può generare un client nel suo linguaggio a partire dalla [specifica OpenAPI](pathname:///openapi/hikube-public.swagger.json). È allo studio un provider Terraform basato sull'API pubblica (vedere [Terraform](../../tools/terraform)).

---

### L'API impone un numero massimo di richieste?

Sì. Le richieste sono limitate per chiave API (oggi una raffica di 120 richieste, poi 300 al minuto) e per indirizzo IP (una raffica di 300, poi 600 al minuto). Questi valori possono cambiare. Oltre il limite, l'API risponde `429` con il codice `10008`: attenda il tempo dell'intestazione `Retry-After`, poi riprovi. Le intestazioni `X-RateLimit-Limit` e `X-RateLimit-Remaining` di ogni risposta indicano a che punto si trova. Vedere [Limiti di frequenza](./errors.md#limites-de-debit).

Per seguire una creazione, basta un intervallo di qualche secondo tra due `GET`.

---

### Cosa fornire al supporto per analizzare una richiesta?

L'identificativo della richiesta: l'intestazione `x-request-id`, presente in ogni risposta, e il campo `requestId` del corpo di un errore. Basta l'uno o l'altro; fornisca entrambi se li ha. Mai il segreto della chiave. Vedere [Identificativo della richiesta](./errors.md#identifiant-de-requete).
