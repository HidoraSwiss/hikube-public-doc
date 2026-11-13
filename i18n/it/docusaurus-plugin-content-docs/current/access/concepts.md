---
sidebar_position: 2
title: Concetti
description: "Organizzazioni, progetti, livelli, chi fa cosa, tipi di membri, domini verificati, connessione SSO e role binding: le nozioni della gestione degli accessi Hikube."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Concetti della gestione degli accessi

## Organizzazione e progetti

- L'**organizzazione** rappresenta la sua azienda. Raggruppa i suoi membri e i suoi progetti.
- Un **progetto** è uno spazio isolato dell'organizzazione: vi risiedono le sue VM, i suoi cluster e i suoi database.
- Un livello sull'organizzazione vale per tutti i suoi progetti. Un livello su un progetto vi si aggiunge.

## I quattro livelli

| Livello | Valore | Cosa consente |
|---|---|---|
| **Read** | `read` | Consultare le risorse |
| **Use** | `write` | Lettura, più l'utilizzo delle risorse |
| **Admin** | `admin` | Creare, modificare ed eliminare le risorse; gestire i membri |
| **Super admin** | `superadmin` | Tutti i diritti, incluso conferire questo livello; gestire la connessione SSO |

Un livello include i diritti dei livelli inferiori. Un membro che detiene più livelli su uno stesso ambito viene mostrato con il più elevato.

:::note Nessun Super admin di progetto
**Super admin** è un livello della sola organizzazione. Su un progetto, il livello più elevato è **Admin**.
:::

## Chi può fare cosa nell'organizzazione

| Azione | Read | Use | Admin | Super admin |
|---|:-:|:-:|:-:|:-:|
| Vedere i membri, il loro indirizzo e-mail e il loro livello | sì | sì | sì | sì |
| Invitare; annullare e inviare di nuovo gli inviti | no | no | sì | sì |
| Conferire o rimuovere **Read**, **Use**, **Admin** | no | no | sì | sì |
| Rimuovere l'accesso di un membro | no | no | sì | sì |
| Esportare la revisione degli accessi; gestire i domini | no | no | sì | sì |
| Agire su un membro di livello superiore al proprio | no | no | no | sì |
| Conferire o rimuovere **Super admin** | no | no | no | sì |
| Gestire la connessione SSO e i suoi role binding | no | no | no | sì |
| Abbassare il proprio livello | no | no | no | no |
| Lasciare l'organizzazione | sì | sì | sì | sì |

Regole che proteggono l'organizzazione:

- nessuno conferisce un livello superiore al proprio;
- nessuno abbassa né rimuove il proprio livello: per andarsene, si [lascia l'organizzazione](./how-to/manage-members.md#lasciare-lorganizzazione-o-un-progetto);
- l'organizzazione mantiene sempre almeno un super amministratore che accede con una password;
- **Super admin** va solo a un account con una password e un secondo fattore, senza collegamento a un provider di identità. L'organizzazione conserva così un accesso se la sua connessione SSO non funziona.

## Tipi di membri

| Membro | A chi appartiene l'account | Cosa possono fare i suoi amministratori |
|---|---|---|
| **Account dell'organizzazione** | Alla sua organizzazione, dopo un [trasferimento](./how-to/transfer-account.md) | Conferire e rimuovere i suoi accessi; il resto con il supporto |
| **Account SSO** | Alla sua organizzazione, creato dalla sua connessione SSO | Conferire e rimuovere i suoi accessi (o i suoi role binding) |
| **Account personale** (membro esterno) | Alla persona | Conferire e rimuovere i suoi accessi nella sua organizzazione, nient'altro |
| **Account di un'altra organizzazione** (membro esterno) | All'altra organizzazione | Conferire e rimuovere i suoi accessi nella sua organizzazione, nient'altro |

Un membro esterno conserva il proprio account, le proprie credenziali e i propri accessi altrove. Rimuovere il suo accesso nella sua organizzazione non tocca il resto.

Un **membro di un solo progetto** detiene livelli su uno o più progetti, e nessuno sull'organizzazione. La pagina dei membri lo mostra con il badge **Projects only**. Vede il nome dell'organizzazione e i suoi progetti, nient'altro. Il suo accesso termina con il progetto.

Per impostazione predefinita, un account che appartiene a un'organizzazione non può entrare in un'altra organizzazione: la **collaborazione esterna** è rifiutata.

## Secondo fattore

Ogni account che accede con una password Hikube presenta anche un secondo fattore. Un account SSO non ha né password né secondo fattore in Hikube: la sua MFA è quella del suo provider di identità. Vedere [Secondo fattore](./how-to/set-up-second-factor.md).

## Dominio verificato

Un dominio verificato dimostra che l'organizzazione possiede un dominio, ad esempio `acme.com`, grazie a un record DNS `TXT` denominato `_hikube-challenge.acme.com`. Un dominio appartiene a una sola organizzazione. Un sottodominio è un dominio a sé. Il record deve restare pubblicato. Vedere [Verificare un dominio](./how-to/verify-domain.md).

## Connessione SSO

Con l'accesso unico (SSO), le persone della sua organizzazione accedono con l'account della loro azienda, presso il suo **provider di identità**, anziché con una password Hikube.

- **Una sola connessione per organizzazione**, in OpenID Connect. SAML non è supportato.
- **Solo i domini verificati.** Solo gli indirizzi dei domini consentiti della connessione, tutti verificati, possono utilizzarla.
- **Un account SSO** viene creato al primo accesso di una persona. Appartiene all'organizzazione.
- **Gli account con una password** continuano ad accedere con essa e non vengono mai reindirizzati al suo provider.

### Requisiti tecnici

| Impostazione presso il suo provider | Valore |
|---|---|
| Tipo di applicazione | Applicazione web, confidenziale, flusso con codice di autorizzazione |
| URI di reindirizzamento | Quella mostrata dalla console, che termina con `/broker/org-<organizzazione>/endpoint` |
| Autenticazione del client | Secret client |
| Scope | `openid`, `email`, `profile` |
| Claim | `email`, nome, cognome e, se lo utilizza, il claim dei ruoli, nel **token di identità** (*ID token*) |
| Firma del token di identità | Asimmetrica (RS256, ES256…). Il solo HS256 viene rifiutato |
| PKCE | S256, attivato per impostazione predefinita |

### Provider

| Provider | Stato |
|---|---|
| [Okta](./how-to/sso-okta.md) | Verificato da Hikube |
| [Microsoft Entra ID](./how-to/sso-entra-id.md) | Verificato da Hikube |
| [Google Workspace](./how-to/sso-google-workspace.md) | Non verificato |
| [Auth0](./how-to/sso-auth0.md) | Non verificato |

Qualsiasi altro provider OpenID Connect che rispetti i requisiti sopra indicati può essere adatto. Non è stato verificato da Hikube: contatti il supporto prima di metterlo in produzione.

## Role binding: una sola fonte di diritti

Un **role binding** associa un valore del claim dei ruoli del suo provider (un gruppo o un ruolo della sua directory) a un livello Hikube, sull'organizzazione o su un progetto. Ogni connessione SSO ha una sola fonte di diritti:

| Claim dei ruoli | Da dove provengono i livelli degli account SSO |
|---|---|
| **Compilato** | Solo dai role binding, a ogni accesso. Non si modificano più in Hikube |
| **Vuoto** | Da Hikube: un amministratore li conferisce dalla pagina dei membri |

Un role binding non conferisce mai **Super admin**. Vedere [Conferire i livelli dal suo provider](./how-to/sso-role-bindings.md).

<NavigationFooter
  nextSteps={[
    {label: "Avvio rapido: connessione SSO", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Invitare persone", href: "../how-to/invite-members"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
