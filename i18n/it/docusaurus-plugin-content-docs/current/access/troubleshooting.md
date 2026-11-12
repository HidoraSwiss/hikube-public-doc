---
sidebar_position: 7
title: "Risoluzione dei problemi — Gestione degli accessi"
sidebar_label: Risoluzione dei problemi
description: "Codici di errore 60xxx della gestione degli accessi Hikube (membri, inviti, domini, connessione SSO, role binding): significato e azione da intraprendere."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Risoluzione dei problemi — Gestione degli accessi

La console mostra un messaggio per ogni rifiuto. Le tabelle seguenti indicano il codice dell'errore (`60xxx`), il suo significato e l'azione da intraprendere. Se contatta il supporto, indichi il messaggio mostrato e l'ora dell'operazione.

## Membri e livelli

| Codice | Messaggio | Cosa fare |
|---|---|---|
| `60003` | Non può conferire un livello superiore al suo | Si rivolga a un membro di livello sufficiente |
| `60206` | I livelli di questo account provengono dal provider di identità | Li modifichi nella sua directory (vedere [role binding](./how-to/sso-role-bindings.md)) |
| `60207` | L'organizzazione deve mantenere almeno un super amministratore che possa accedere con una password | Nomini prima un altro super amministratore |
| `60208` | Questo membro ha un livello superiore al suo | Si rivolga a un super amministratore |
| `60209` | Non può ridurre né rimuovere i propri livelli | Si rivolga a un altro amministratore, oppure [lasci l'organizzazione](./how-to/manage-members.md#lasciare-lorganizzazione-o-un-progetto) |
| `60210` | Il progetto deve mantenere almeno un amministratore diretto | Nomini prima un altro amministratore del progetto |
| `60211` | Un super amministratore deve avere una password e un secondo fattore, senza collegamento a un provider di identità | Registri un [secondo fattore](./how-to/set-up-second-factor.md), oppure scelga un account con password |
| `60115` | Livello sconosciuto, oppure **Super admin** richiesto su un progetto | Scelga **Read**, **Use** o **Admin** su un progetto |
| `60015` | Il livello non è ancora pronto su un progetto appena creato | Riprovi tra qualche secondo |
| `60005` | Servizio momentaneamente non disponibile | Riprovi |

## Inviti

| Codice | Messaggio | Cosa fare |
|---|---|---|
| `60004` | Invito non trovato | Acceda con l'account dell'indirizzo invitato, il cui indirizzo è verificato |
| `60221` | L'invito non è più in attesa | È scaduto, è stato annullato o è già stato accettato: ne richieda uno nuovo |
| `60214` | L'organizzazione ha raggiunto il numero massimo di membri | Rimuova un membro, oppure contatti il supporto |
| `60215` | Numero massimo di inviti in attesa raggiunto | Annulli alcuni inviti, oppure attenda che vengano accettati |
| `60216` | Troppi inviti inviati nell'ultima ora | Riprovi più tardi |
| `60222` | L'organizzazione che possiede il suo account non gli consente di entrare in altre organizzazioni | Si rivolga ai suoi amministratori (vedere [Membri esterni](./how-to/invite-members.md#membri-esterni)) |
| `60120` | Invito non valido: indirizzo, duplicato, nessun livello o progetto | Corregga i dati inseriti |

## Trasferimento dell'account

| Codice | Messaggio | Cosa fare |
|---|---|---|
| `60220` | L'indirizzo non è su alcun dominio verificato dell'organizzazione | Verifichi il dominio, oppure accetti senza trasferire l'account |
| `60219` | L'account ha accessi in un'altra organizzazione | Accetti senza trasferire l'account |
| `60212` | L'account non appartiene all'organizzazione | Può solo rimuovere i suoi accessi |
| `60213` | Azione impossibile su un account SSO: le sue credenziali si trovano presso il suo provider | Agisca presso il suo provider di identità |

## Domini

| Codice | Messaggio | Cosa fare |
|---|---|---|
| `60110` | Dominio non valido | Inserisca un nome host di almeno due etichette, al massimo 235 caratteri |
| `60111` | Servizio di posta pubblico o suffisso pubblico | Dichiari il dominio della sua azienda |
| `60118` | Limite superato, ad esempio un 21° dominio | Rimuova un dominio che non serve più |
| `60201` | Il record TXT è assente o non contiene il token | Lo pubblichi di nuovo; un record appena pubblicato può impiegare il TTL negativo della zona per essere visibile |
| `60013` | La consultazione DNS non è riuscita | Riprovi |
| `60202` | Il dominio è verificato da un'altra organizzazione | Contatti il supporto per trasferirlo |
| `60203` | La verifica è scaduta | **Restart the verification** |
| `60204` | Il dominio è già verificato | Pubblichi di nuovo il suo record anziché riavviare la verifica |
| `60205` | La connessione SSO consente questo dominio | Lo rimuova prima dai suoi **Allowed domains** |
| `60010` | Dominio non trovato nell'organizzazione | Aggiorni la pagina |

## Connessione SSO e role binding

| Codice | Messaggio | Cosa fare |
|---|---|---|
| `60112` | Documento di discovery rifiutato: irraggiungibile, emittente diverso, endpoint o firma mancanti; oppure passaggio da Google a un altro provider | Copi l'URL di discovery così come la mostra il suo provider (vedere [Requisiti tecnici](./concepts.md#requisiti-tecnici)) |
| `60119` | SAML non è supportato | Utilizzi OpenID Connect |
| `60113` | Nome di claim non valido | Un nome o un percorso puntato; un punto in un nome si scrive `\.` |
| `60114` | Scope non valido, oppure progetto del role binding non trovato | Rimuova `offline_access`; scelga un progetto dell'organizzazione |
| `60118` | Campo fuori dai limiti: connessione Google senza esattamente un dominio, valore di oltre 255 caratteri, 257° role binding… | Corregga il campo indicato nel messaggio |
| `60200` | Un dominio consentito, o quello richiesto per l'attivazione, non è verificato | [Verifichi il dominio](./how-to/verify-domain.md) |
| `60201` | Il record TXT di un dominio è scomparso | Lo pubblichi di nuovo, quindi riprovi |
| `60218` | L'organizzazione ha già una connessione SSO | Modifichi o sostituisca la connessione esistente |
| `60117` | Role binding su una connessione senza claim dei ruoli | Compili prima il **Roles claim** |
| `60116` | Questo progetto non può ricevere un livello separato | Conferisca il livello sull'organizzazione, oppure contatti il supporto |
| `60223` | Il valore è già associato sulla connessione | Modifichi il role binding esistente |
| `60011` / `60012` | Connessione o role binding non trovati | Aggiorni la pagina |

## Problemi di accesso SSO

### Una persona viene rifiutata all'accesso

- Il suo indirizzo non è su un dominio consentito (**Allowed domains**): `bob@eu.acme.com` non è `acme.com`.
- Il suo indirizzo non è nel token di identità (Entra ID: attributo di posta vuoto).
- Non è assegnata all'applicazione presso il suo provider.
- **Invitation required** è attivato e la persona non è stata invitata.

### Una persona accede ma non ha alcun accesso

- Senza claim dei ruoli: un amministratore deve conferirle un livello.
- Con un claim dei ruoli: nessun role binding corrisponde a un valore del suo token. Verifichi il valore esatto, maiuscole comprese. Con Entra ID e il claim `groups`, oltre 200 gruppi il claim è assente.
- Con **Confirm the address by a link**: non ha ancora aperto il link.
- Il limite di membri è stato raggiunto.

### Nessuno riesce più ad accedere tramite SSO

- Il secret client è scaduto presso il suo provider: inserisca quello nuovo in **Edit settings**.
- La connessione è **Disabled**: forse è stato rimosso un dominio consentito.
- Acceda con un super amministratore che ha una password.

<NavigationFooter
  seeAlso={[
    {label: "Errori dell'API", href: "../../api/errors"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
