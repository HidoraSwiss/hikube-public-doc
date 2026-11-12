---
sidebar_position: 7
title: "Come configurare la connessione SSO"
description: "Creare la connessione SSO della sua organizzazione nella console Hikube: URL di discovery, client id, secret, domini consentiti, claim, URI di reindirizzamento e attivazione."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Creare e attivare la connessione SSO

Questa guida crea la connessione SSO dell'organizzazione `acme`, per gli indirizzi `@acme.com`, quindi la attiva.

## Prerequisiti

- Il livello **Super admin** sull'organizzazione.
- Il dominio `acme.com` verificato (vedere [Verificare un dominio](./verify-domain.md)).
- Un'applicazione registrata presso il suo provider di identità, con il relativo client id e secret: [Okta](./sso-okta.md), [Microsoft Entra ID](./sso-entra-id.md), [Google Workspace](./sso-google-workspace.md) o [Auth0](./sso-auth0.md). Vi aggiungerà l'URI di reindirizzamento al passaggio 3.
- La [lista di controllo](../quick-start.md#lista-di-controllo) esaminata.

## 1. Aprire la pagina della connessione

1. Nel menu del suo profilo (in alto a destra), faccia clic su **Organization members**.
2. Apra la scheda **SSO connection**.

La pagina **Single sign-on (SSO)** mostra **No SSO connection**.

## 2. Creare la connessione

1. Faccia clic su **Create the connection**.
2. Compili il modulo **Create the SSO connection**:

| Campo | Esempio | Da sapere |
|---|---|---|
| **Display name** | `Acme` | Il nome che le persone vedono all'accesso, al massimo 64 caratteri |
| **Discovery URL** | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` | Così come la mostra il suo provider, in `https`. L'URL è l'emittente seguito da `/.well-known/openid-configuration` |
| **Client id** | `0oa1b2c3d4e5f6g7h8i9` | L'identificativo dell'applicazione presso il suo provider |
| **Client secret** | | Sola scrittura: non viene mai più mostrato |
| **Allowed domains** | `acme.com` selezionato | Nessuno selezionato: tutti i domini verificati dell'organizzazione. Un sottodominio è un dominio a sé |
| **Confirm the address by a link** | Attivato | Lo disattivi solo se il suo provider invia `email_verified` nel token di identità |
| **Invitation required** | Disattivato | Attivato: accedono solo le persone invitate (vedere [Gestire la connessione](./manage-sso-connection.md#invito-obbligatorio)) |
| **First name claim** / **Last name claim** | Vuoti | Vuoti: `given_name` e `family_name` |
| **Roles claim** | Vuoto, oppure `groups` | Vuoto: i livelli si conferiscono in Hikube. Compilato: i role binding decidono i livelli degli account SSO |

In **Advanced settings**:

| Campo | Da sapere |
|---|---|
| **PKCE** | Lo lasci attivo, a meno che il suo provider non lo rifiuti |
| **Additional scopes** | Separati da spazi. `openid`, `email` e `profile` vengono sempre richiesti. `offline_access` viene rifiutato |

3. Faccia clic su **Create**.

Hikube legge il documento di discovery e rifiuta una connessione il cui emittente, i cui endpoint o la cui firma non sono adeguati. La console mostra **SSO connection created. Register its redirect URI at your provider, then enable it.** La connessione è **Disabled**.

:::note Claim annidati
Un claim può essere un percorso puntato, ad esempio `hikube.roles` per il campo `roles` dell'oggetto `hikube`. Un punto all'interno di un nome si scrive `\.`: `https://acme\.com/roles`.
:::

![Modulo Create the SSO connection compilato per Okta](/img/console/access/sso-create.en.png)

## 3. Registrare l'URI di reindirizzamento

1. Nella scheda **SSO connection**, copi il **Redirect URI**.
2. Presso il suo provider, lo incolli nell'applicazione, così com'è.

## 4. Attivare la connessione

1. Faccia clic su **Enable**.
2. La console mostra **SSO connection enabled.** e lo stato passa a **Enabled**.

All'attivazione, Hikube controlla di nuovo il record DNS di ogni dominio servito. Se è scomparso, l'attivazione viene rifiutata: pubblichi di nuovo il record (vedere [Verificare un dominio](./verify-domain.md)).

## 5. Testare

1. Apra una finestra di navigazione privata su [console.hikube.cloud](https://console.hikube.cloud).
2. Inserisca un indirizzo `@acme.com` che non ha una password Hikube.
3. Viene reindirizzato presso il suo provider. Acceda.
4. Con **Confirm the address by a link**, apra il link ricevuto via e-mail.

## Primo accesso di una persona

- **Creazione dell'account.** Al suo primo accesso, Hikube crea l'account della persona, **senza alcun livello**. L'account appartiene all'organizzazione: è un **account SSO**.
- **Conferma.** Con **Confirm the address by a link**, la persona conferma il proprio indirizzo tramite il link ricevuto. L'account compare tra i membri una volta confermato. Viene eliminato se non è confermato entro 24 ore.
- **Livelli.** Un amministratore conferisce poi un livello dalla [pagina dei membri](./manage-members.md). Con un claim dei ruoli, i [role binding](./sso-role-bindings.md) conferiscono i livelli a ogni accesso.
- **Domini.** L'indirizzo del token di identità deve essere su un dominio consentito, confrontato esattamente. Con il solo `acme.com`, `bob@eu.acme.com` viene rifiutato.
- **Account con password.** Continuano ad accedere con la propria password e non vengono mai reindirizzati.
- **Numero di membri.** Si applica il limite di membri dell'organizzazione. Una persona oltre il limite può accedere, ma Hikube rifiuta le sue richieste finché un membro non viene rimosso.
- **Profilo.** Il nome e il cognome vengono ripresi dal token di identità a ogni accesso. Non si modificano in Hikube.

<NavigationFooter
  nextSteps={[
    {label: "Conferire i livelli dal suo provider", href: "../sso-role-bindings"},
    {label: "Gestire la connessione SSO", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Avvio rapido", href: "../../quick-start"},
    {label: "Risoluzione dei problemi", href: "../../troubleshooting"},
  ]}
/>
