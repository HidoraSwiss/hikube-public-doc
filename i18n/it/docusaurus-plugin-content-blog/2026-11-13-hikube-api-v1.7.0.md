---
title: Hikube API v1.7.0
authors: [hikube]
tags: [release]
---

L'API v1.7.0 introduce la gestione degli accessi delle organizzazioni: livelli sull'organizzazione e sui suoi progetti, inviti, membri di un solo progetto, trasferimento di account, revisione degli accessi, domini verificati e connessione SSO per organizzazione con i suoi role binding. Il secondo fattore diventa obbligatorio per gli account con password, e la console web apre la console VNC e la console seriale delle istanze.

**Modifiche incompatibili**: il secondo fattore è richiesto, l'accesso con identificativo e password degli script termina, e le route dei membri di un'organizzazione cambiano contratto (vedi *Migrazione* in fondo alla nota).

:::warning Azione richiesta
- **Secondo fattore obbligatorio** — Ogni account che accede con una password Hikube deve presentare un secondo fattore: un'applicazione di autenticazione o una chiave di sicurezza. Un account che non ne ha ancora uno lo registra al successivo accesso. Una richiesta fatta con una sessione aperta senza secondo fattore viene rifiutata con HTTP 401 e il codice `10007`. Gli account SSO usano il secondo fattore del proprio provider di identità. Vedere [Registrare il proprio secondo fattore](/access/how-to/set-up-second-factor/).
- **Fine dell'accesso con identificativo e password** — Il servizio di accesso Hikube non rilascia più token a fronte di un identificativo e di una password («password grant»). Gli script e gli strumenti che si autenticavano così devono passare a una [chiave API](/api/authentication/), da creare nelle impostazioni del progetto.
- **Membri di un'organizzazione** — Se chiamate le route `/iam/v1alpha1/organizations/{organization_id}/users` con una sessione utente, adattate le vostre chiamate prima dell'aggiornamento: vedere *Modificato* e *Migrazione*.
:::

<!-- truncate -->

## Aggiunto

- **Gestione degli accessi** — Una persona riceve un livello sull'organizzazione o su uno dei suoi progetti: `read`, `write`, `admin` o `superadmin` (**Read**, **Use**, **Admin** e **Super admin** nella console). Un livello sull'organizzazione vale per tutti i suoi progetti; un livello su un progetto si aggiunge a esso. Nessuno può dare un livello superiore al proprio, e solo un super-amministratore può dare il livello super-amministratore. Un livello abbassato o rimosso disconnette la persona e si applica entro 5 minuti. La gestione degli accessi si fa nella console: una chiave API non può chiamarla. Vedere [Gestione degli accessi](/access/overview/).

- **Inviti** — Gli amministratori invitano fino a 50 indirizzi alla volta, sull'organizzazione o su un progetto, con i livelli che riceveranno. Un invito è valido 7 giorni; può essere reinviato o annullato. Una persona che ha già un account Hikube lo trova al successivo accesso, le altre ricevono un'e-mail per creare il proprio account. La persona lo accetta o lo rifiuta. L'invito indica l'organizzazione e la persona che lo ha inviato. Vedere [Invitare persone](/access/how-to/invite-members/).

- **Membri di un solo progetto** — Una persona può avere un livello su un progetto senza essere membro dell'organizzazione. Vede solo i progetti in cui ha un livello. Un'impostazione dell'organizzazione consente ai suoi amministratori di progetto di invitare sul proprio progetto e di gestirvi i livelli **Read**, **Use** e **Admin**. Vedere [Gestire i membri](/access/how-to/manage-members/).

- **Membri esterni e trasferimento di account** — Ogni membro ha un tipo di account: personale, dell'organizzazione o SSO. Un membro il cui account personale appartiene a un'altra organizzazione è esterno. Una persona può affidare il proprio account all'organizzazione se il suo indirizzo verificato appartiene a un dominio verificato dell'organizzazione e se non ha accessi in nessun'altra. Gli amministratori possono poi bloccare, sbloccare o eliminare questo account, e reimpostarne le credenziali. Vedere [Affidare un account all'organizzazione](/access/how-to/transfer-account/).

- **Lasciare un'organizzazione o un progetto** — Un membro può lasciare un'organizzazione o un progetto. Perde i livelli interessati, la sua sessione viene chiusa, e il suo account viene conservato con i suoi accessi altrove.

- **Revisione degli accessi** — Gli amministratori esportano la revisione degli accessi dell'organizzazione: per ogni livello, la persona, l'ambito, la data e l'autore dell'assegnazione, la sua origine (console, invito o provider di identità), il tipo di account, lo stato di membro esterno, un indirizzo fuori dai domini verificati, l'ultimo accesso e l'inattività. Vedere [Esportare la revisione degli accessi](/access/how-to/export-access-review/).

- **Domini verificati** — Un'organizzazione dimostra di possedere un dominio di posta pubblicando un record TXT nella sua zona DNS, entro 7 giorni. Un dominio verificato viene controllato di nuovo: se scompare, le operazioni che ne dipendono vengono rifiutate finché non viene ripubblicato. Un'organizzazione dichiara al massimo 20 domini; un servizio di posta pubblico o un suffisso pubblico vengono rifiutati, così come un dominio già verificato da un'altra organizzazione. Vedere [Verificare un dominio](/access/how-to/verify-domain/).

- **Connessione SSO** — Un'organizzazione collega il proprio provider di identità OpenID Connect, a partire dal suo URL di discovery. Le persone dei domini verificati accedono quindi con l'account della propria azienda. La connessione è validata con Okta e Microsoft Entra ID; Google Workspace è in corso di validazione. Una connessione può richiedere un invito e confermare ogni nuovo indirizzo con un link. Il provider si sostituisce senza perdere gli account. SAML non è supportato (`60119`). Vedere [Avvio rapido: connessione SSO](/access/quick-start/).

- **Role binding** — Quando la connessione SSO legge un claim dei ruoli, ogni valore di questo claim, ad esempio un gruppo della vostra directory, dà un livello sull'organizzazione o su un progetto, a ogni accesso. Mai il livello super-amministratore. I livelli degli account SSO provengono allora solo dal provider: non si modificano più in Hikube (`60206`). Vedere [Conferire i livelli dal suo provider](/access/how-to/sso-role-bindings/).

- **Console dell'istanza** — La console web apre lo schermo (VNC) e la console seriale di un'istanza in esecuzione. Il ticket di apertura è riservato alla console web: una chiave API non può richiederlo.

- **Codici di errore** — I nuovi rifiuti hanno ciascuno il proprio codice. Vengono restituiti in HTTP 400, salvo indicazione contraria. Il formato degli errori è descritto in [Errori](/api/errors/), e i codici della gestione degli accessi in [Risoluzione dei problemi — Gestione degli accessi](/access/troubleshooting/).

| Codice | Servizio | Significato |
| --- | --- | --- |
| `10003` | Tutti | Ticket scaduto (flusso di eventi, console dell'istanza): richiedetene uno nuovo |
| `10007` | Tutti | HTTP 401: secondo fattore richiesto, riconnettetevi con il vostro secondo fattore |
| `60004`, da `60010` a `60012` | Gestione degli accessi | Invito, dominio, connessione SSO o role binding non trovato |
| `60013`, `60015` | Gestione degli accessi | Errore temporaneo (DNS, livello non ancora pronto): riprovate |
| da `60110` a `60120` | Gestione degli accessi | Dominio, emittente, claim, scope, livello, destinazione di role binding o invito non validi, valore fuori dai limiti, SAML non supportato |
| da `60200` a `60205` | Domini | Dominio non verificato, record assente, verificato da un'altra organizzazione, verifica scaduta, o dominio usato dalla connessione SSO |
| `60206` | Gestione degli accessi | Livello dato dal provider di identità: si modifica nella vostra directory |
| da `60207` a `60211` | Membri | Ultimo super-amministratore con password, livello del destinatario superiore al vostro, auto-retrocessione, livello rifiutato a questo account |
| `60212`, `60213` | Account | Account che non appartiene all'organizzazione, operazione impossibile su un account SSO |
| da `60214` a `60217` | Inviti | Limite di membri, limite di inviti in sospeso, troppi inviti in una volta, indirizzo già usato |
| `60218` | Connessione SSO | L'organizzazione ha già una connessione SSO |
| `60219`, `60220` | Trasferimento | Accessi in un'altra organizzazione, o indirizzo fuori dai domini verificati |
| `60221`, `60222` | Inviti | Invito non più in sospeso, o collaborazione esterna rifiutata dall'organizzazione proprietaria dell'account |
| `60223` | Role binding | Valore già usato sulla connessione |
| da `210001` a `210200` | Console dell'istanza | Istanza non trovata o arrestata, console non disponibile o satura, tipo di console non valido |

## Modificato

Queste modifiche cambiano un comportamento esistente. Verificatele se chiamate l'API dai vostri strumenti.

- **Membri di un'organizzazione** — Le route `/iam/v1alpha1/organizations/{organization_id}/users` cambiano contratto. Non fanno parte della superficie delle chiavi API: sono interessate solo le chiamate fatte con una sessione utente.
  - `{name}` è ora l'identificativo dell'account (il campo `id` restituito dall'elenco), e non più il suo nome utente;
  - le risposte non restituiscono più `groups`. Restituiscono `tiers`, l'elenco dei livelli del membro (`projectId` vuoto per l'organizzazione, `tier`), nonché `accountType` (`organization`, `sso` o `personal`), `owned`, `external` e `tiersFromIdentityProvider`;
  - `PATCH .../users/{name}` modifica ormai solo `tiers`, che sostituisce i livelli del membro nell'organizzazione e nei suoi progetti, e solo lì. I campi `enabled`, `email`, `firstname`, `lastname` e `groups` non sono più accettati. Un elenco vuoto rimuove ogni accesso all'organizzazione;
  - `DELETE .../users/{name}` rimuove l'accesso della persona all'organizzazione e conserva il suo account; finora lo eliminava;
  - l'elenco accetta i filtri `tier`, `projectId` e `identitySource` (`local` o `federated`).

- **Secondo fattore** — Una sessione aperta senza secondo fattore viene rifiutata con il codice `10007` (HTTP 401), tranne che per un account SSO.

- **Progetti** — Un membro di un solo progetto elenca e legge i progetti in cui ha un livello. L'elenco restituisce tutti i progetti a un membro dell'organizzazione.

- **Rimozione di un accesso** — Abbassare o rimuovere un livello chiude le sessioni della persona: la modifica si applica entro 5 minuti.

## Rimosso

- **Creazione diretta di un utente** — `POST /iam/v1alpha1/organizations/{organization_id}/users` è rimosso. Gli inviti lo sostituiscono.

- **Accesso con identificativo e password** — Il servizio di accesso non rilascia più token a fronte di un identificativo e di una password. Usate una chiave API.

## Corretto

- **Istanze VM** — Una VM che si avvia normalmente non mostra più un motivo di blocco. Il motivo proviene ormai solo da una vera causa di errore, come una quota insufficiente o nessun server disponibile.

- **Backup** — Il primo backup di una VM verso una destinazione nuova di zecca non può più fallire per mancanza di un repository pronto.

:::warning Migrazione
- **Script autenticati con identificativo e password**: create una chiave API nelle impostazioni del progetto (scheda **API keys**), poi chiamate l'API con l'intestazione `X-Hikube-Api-Key`. Vedere [Autenticazione](/api/authentication/) e [Avvio rapido](/api/quick-start/). La gestione degli accessi e la gestione delle chiavi non si chiamano con una chiave API: fatele nella console.
- **Secondo fattore**: avvisate le persone della vostra organizzazione che accedono con una password; registreranno il proprio secondo fattore al successivo accesso. Vedere [Registrare il proprio secondo fattore](/access/how-to/set-up-second-factor/).
- **Route dei membri**: non c'è alcun periodo di transizione per queste route. Leggete l'`id` di un membro nell'elenco prima di modificarlo o di rimuovere il suo accesso, sostituite `groups` con `tiers`, e passate dagli inviti per far entrare una persona.
:::
