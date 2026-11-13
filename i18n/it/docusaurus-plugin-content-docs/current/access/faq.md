---
sidebar_position: 6
title: "FAQ — Gestione degli accessi"
sidebar_label: FAQ
description: "Domande frequenti sulla gestione degli accessi Hikube: tempi di rimozione di un accesso, garanzie della connessione SSO, MFA, super amministratore di emergenza, chiavi API."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# FAQ — Gestione degli accessi

### In quanto tempo ha effetto un accesso rimosso?

| Dove rimuove l'accesso | Tempo |
|---|---|
| **In Hikube**: rimozione di un livello, di un membro o di un role binding, eliminazione della connessione SSO | **5 minuti** al massimo |
| **Presso il suo provider**: persona che ha lasciato l'azienda, gruppo rimosso, assegnazione eliminata | La persona non può più accedere di nuovo. Una sessione Hikube già aperta dura fino alla sua fine: dopo un periodo di inattività, e al più tardi alla sua durata massima |

Hikube non utilizza la disconnessione avviata dal provider (*back-channel logout*). Microsoft Entra ID non la offre; Okta e Google non la dichiarano nel loro documento di discovery.

### Come interrompere subito l'accesso di una persona che lascia l'azienda?

La disattivi presso il suo provider **e** la rimuova in Hikube (vedere [Gestire i membri](./how-to/manage-members.md#rimuovere-laccesso-di-un-membro)). La rimozione in Hikube ha effetto entro 5 minuti al massimo. Revochi anche le chiavi API che ha creato.

### Cosa garantisce Hikube per la connessione SSO, e cosa resta a mio carico?

| Garantito da Hikube, qualunque sia la configurazione | Consigliato, sotto la sua responsabilità |
|---|---|
| L'emittente è quello del documento di discovery, in HTTPS, senza indirizzo interno | Un'applicazione dedicata a Hikube |
| Client confidenziale, flusso con codice di autorizzazione, firma del token verificata con le chiavi pubblicate dal suo provider | L'applicazione riservata alle persone o ai gruppi che hanno bisogno di Hikube (**Assignment required** di Entra ID, assegnazioni di Okta, schermata di consenso **Internal** di Google, Auth0 senza registrazione) |
| Il dominio ospitato di Google e l'emittente del tenant Entra ID | Un identificativo di persona (`sub`) stabile, mai riassegnato a un'altra persona |
| Un indirizzo e-mail presente nel token di identità, su un dominio verificato dell'organizzazione | Un indirizzo e-mail che la persona non può modificare da sé |
| L'indirizzo confermato tramite un link, a meno che non disattivi **Confirm the address by a link** | La disattivazione, presso il suo provider, delle persone che lasciano l'azienda |
| I claim letti solo nel token di identità | La sostituzione del secret client prima della sua scadenza |
| | Il secondo fattore (MFA), imposto dal suo provider |

### Hikube richiede un secondo fattore agli account SSO?

No. È il suo provider di identità a imporlo: attivi la MFA presso di lui per tutte le persone che accedono a Hikube. Gli account con una password Hikube hanno sempre un secondo fattore obbligatorio (vedere [Secondo fattore](./how-to/set-up-second-factor.md)).

### Perché mantenere un super amministratore con una password?

È il suo accesso di emergenza se il suo provider di identità non è disponibile o è configurato male. Hikube lo impone: **Super admin** va solo a un account con una password e un secondo fattore, e l'organizzazione ne mantiene sempre almeno uno.

### Un membro rimosso conserva le sue chiavi API?

Sì. Una chiave conserva i propri scope, anche se la persona che l'ha creata perde i suoi diritti. La revochi nella scheda **API keys** delle impostazioni del progetto (vedere [Autenticazione dell'API](../../api/authentication)).

### Una chiave API può gestire i membri?

No. Una chiave agisce sulle risorse di un progetto. I membri, gli inviti, i domini e la connessione SSO si gestiscono nella console.

### Una persona può essere membro di più organizzazioni?

Sì, con un account personale. Un account che appartiene a un'organizzazione (account dell'organizzazione o account SSO) non può, per impostazione predefinita, entrare in un'altra organizzazione (vedere [Membri esterni](./how-to/invite-members.md#membri-esterni)).

### Posso utilizzare SAML?

No. La connessione SSO utilizza OpenID Connect.

### Posso avere due connessioni SSO?

No, una sola per organizzazione. Per cambiare applicazione o provider, [sostituisca il provider](./how-to/manage-sso-connection.md#sostituire-il-provider): gli account SSO vengono conservati.

<NavigationFooter
  seeAlso={[
    {label: "Concetti", href: "../concepts"},
    {label: "Risoluzione dei problemi", href: "../troubleshooting"},
  ]}
/>
