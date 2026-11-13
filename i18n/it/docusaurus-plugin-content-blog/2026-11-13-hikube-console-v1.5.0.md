---
title: Console Hikube v1.5.0
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.7.0 con la gestione degli accessi: membri e livelli, inviti, accesso a un solo progetto, revisione degli accessi, domini verificati e connessione SSO dell'organizzazione con i suoi role binding. L'accesso richiede ora un secondo fattore per gli account con password, e la scheda di un'istanza VM apre la sua console VNC e la sua console seriale.

:::warning Da sapere
- **Secondo fattore obbligatorio** — Ogni account che accede con una password deve presentare un secondo fattore: un'applicazione di autenticazione o una chiave di sicurezza. Un account che non ne ha ancora uno lo registra al successivo accesso, nella pagina di accesso. Gli account SSO usano il secondo fattore del proprio provider di identità. Vedere [Registrare il proprio secondo fattore](/access/how-to/set-up-second-factor/).
- **Accesso in due fasi** — La pagina di accesso chiede prima il vostro indirizzo e-mail, poi la vostra password. Un indirizzo servito dalla connessione SSO della vostra organizzazione, senza password Hikube, viene inviato al vostro provider di identità. Il link **Forgot password?** compare sotto il campo della password.
- **Script** — Gli script che accedevano con un identificativo e una password non funzionano più: passateli a una [chiave API](/api/authentication/).
:::

<!-- truncate -->

## Aggiunto

- **Membri dell'organizzazione** — Una pagina **Organization members**, nel menu del vostro profilo, elenca le persone che hanno accesso all'organizzazione e ai suoi progetti, con il loro **Organization tier** e i loro **Project tiers**: **Read**, **Use**, **Admin** o **Super admin**. **Edit** modifica i livelli di un membro, senza superare il vostro; senza alcun livello, il membro perde l'accesso all'organizzazione e conserva il proprio account. Abbassare un livello disconnette la persona, e la modifica si applica entro 5 minuti. I livelli dati dal provider di identità sono bloccati. Vedere [Gestire i membri](/access/how-to/manage-members/).

- **Inviti** — **Invite people** invia fino a 50 inviti alla volta, con i livelli da dare sull'organizzazione o su progetti. Un invito è valido 7 giorni. L'elenco **Pending invitations** permette di **Resend** l'invito o di annullarlo. Una persona invitata trova i propri inviti all'accesso, con l'organizzazione e l'autore di ciascuno, e può **Accept** o **Decline**. Vedere [Invitare persone](/access/how-to/invite-members/).

- **Membri del progetto** — Le impostazioni di un progetto elencano i **Project members**: le persone che hanno un livello direttamente su di esso. I suoi amministratori possono invitare persone e modificare i livelli **Read**, **Use** e **Admin** se l'organizzazione attiva **Delegation to project admins**.

- **Accesso a un solo progetto** — Una persona che ha accesso solo a dei progetti, senza essere membro dell'organizzazione, vede soltanto quei progetti. La console le spiega perché i membri e le impostazioni dell'organizzazione non le sono accessibili.

- **Uscire** — **Leave the organization** o **Leave the project** rimuove i vostri livelli e chiude la vostra sessione. Il vostro account viene conservato, con i vostri accessi altrove.

- **Revisione degli accessi** — **Export the access review** scarica un file CSV: per ogni livello, la persona, l'ambito, la data e l'autore dell'assegnazione, la sua origine, il tipo di account, lo stato di membro esterno, un indirizzo fuori dai domini verificati, lo stato dell'account, il **Last sign-in (UTC)** e l'inattività. Vedere [Esportare la revisione degli accessi](/access/how-to/export-access-review/).

- **Domini verificati** — La scheda **Domains** delle **Organization settings** dichiara i domini di posta dell'organizzazione. **Add a domain** mostra il record TXT da pubblicare nella zona DNS, con un pulsante di copia, poi **Verify** controlla che sia presente. Ogni dominio mostra il proprio stato (**Pending**, **Expired**, **Verified**) e il suo ultimo controllo. Un dominio scaduto si riavvia con **Issue a new record**. Vedere [Verificare un dominio](/access/how-to/verify-domain/).

- **Connessione SSO** — La scheda **SSO connection** delle **Organization settings** crea la connessione dell'organizzazione al proprio provider di identità OpenID Connect, a partire dal suo **Discovery URL**, dal suo **Client id** e dal suo **Client secret**. La connessione viene creata inattiva e mostra il **Redirect URI** da registrare presso il provider; viene poi attivata. Le impostazioni offrono **Allowed domains**, **Invitation required** e la conferma dell'indirizzo con un link. **Replace the provider** conserva gli account SSO e i loro accessi. Okta e Microsoft Entra ID sono validati; Google Workspace è in corso di validazione. Vedere [Avvio rapido: connessione SSO](/access/quick-start/), [Okta](/access/how-to/sso-okta/) e [Microsoft Entra ID](/access/how-to/sso-entra-id/).

- **Role binding** — Quando la connessione SSO legge un **Roles claim**, **Add a role binding** associa un valore di questo claim, ad esempio un gruppo della vostra directory, a un livello sull'organizzazione o su un progetto. I livelli degli account SSO provengono allora solo dal vostro provider. Vedere [Conferire i livelli dal suo provider](/access/how-to/sso-role-bindings/).

- **Console dell'istanza** — Una scheda **Console** compare nella scheda di un'istanza VM in esecuzione, con lo **Screen (VNC)** e la **Serial console**. La barra degli strumenti offre **Ctrl+Alt+Del**, **Paste clipboard**, **Full screen**, **New tab**, la dimensione del carattere, **Reconnect** e, per la console seriale, l'adattamento della VM alla dimensione della finestra. La console si riconnette da sola dopo un'interruzione o uno spostamento dell'istanza, e una sessione dura al massimo 8 ore. La console seriale richiede un account con password nell'istanza; per un lavoro prolungato, preferite SSH.

- **Secondo fattore** — Una sessione aperta senza secondo fattore mostra la pagina **A second factor is required**, con **Sign in again**.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Tutte le risorse** — Le azioni di creazione, modifica ed eliminazione compaiono solo a partire dal livello che richiedono. Una pagina di creazione o di modifica aperta senza questo livello mostra **Read-only**, con il livello richiesto e il vostro.

- **Progetti** — Le impostazioni di un progetto si aprono in sola lettura per chi non è super-amministratore dell'organizzazione: solo un super-amministratore modifica o elimina un progetto.

## Corretto

- **Elenchi di risorse** — Le righe non lampeggiano più quando nulla di ciò che è mostrato è cambiato.

- **Istanze VM** — Una VM che si avvia normalmente non mostra più un avviso di avvio impossibile.
