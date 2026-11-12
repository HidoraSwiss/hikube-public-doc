---
sidebar_position: 3
title: Avvio rapido
description: "Configurare la connessione SSO della sua organizzazione Hikube in 7 passaggi: dominio verificato, connessione, URI di reindirizzamento, attivazione, test, risoluzione dei problemi e disattivazione."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Avvio rapido: connessione SSO

Questa guida configura la connessione SSO dell'organizzazione `acme`. Le persone con un indirizzo `@acme.com` accederanno poi a Hikube con l'account della loro azienda.

## Prima di iniziare

- Il livello **Super admin** sull'organizzazione.
- Un accesso di amministrazione al suo provider di identità.
- Un'applicazione web **confidenziale**, dedicata a Hikube, registrata presso il suo provider, con il relativo client id e secret: [Okta](./how-to/sso-okta.md), [Microsoft Entra ID](./how-to/sso-entra-id.md), [Google Workspace](./how-to/sso-google-workspace.md) o [Auth0](./how-to/sso-auth0.md).

### Lista di controllo

1. **Claim nel token di identità.** `email`, il nome, il cognome e, se lo utilizza, il claim dei ruoli devono trovarsi nel **token di identità**. Hikube non li legge da nessun'altra parte.
2. **Conferma dell'indirizzo.** Lasci attivato **Confirm the address by a link**, a meno che il suo provider non invii `email_verified` nel token di identità. Microsoft Entra ID non lo invia.
3. **PKCE.** Lo lasci attivo, a meno che il suo provider non lo rifiuti.
4. **Claim dei ruoli.** Lo compili solo se il suo provider deve decidere i livelli (vedere [role binding](./how-to/sso-role-bindings.md)).
5. **Secondo fattore.** La MFA degli account SSO è imposta dal suo provider, non da Hikube.
6. **Invito o no.** Per impostazione predefinita, ogni persona di un dominio consentito che il suo provider lascia passare ottiene un account. **Invitation required** ammette solo le persone invitate.
7. **Un super amministratore con password.** Ne mantenga almeno uno: è il suo accesso di emergenza se il suo provider non è disponibile.

I requisiti tecnici completi si trovano in [Concetti](./concepts.md#requisiti-tecnici).

## Passaggio 1: verificare il dominio

1. Menu del suo profilo → **Organization members**, scheda **Domains**.
2. **Add a domain**: `acme.com`, quindi **Add**.
3. Pubblichi il record `TXT` mostrato nella zona DNS di `acme.com`.
4. Faccia clic su **Verify**.

**Risultato atteso**: `acme.com` ha lo stato **Verified**. Dettagli: [Verificare un dominio](./how-to/verify-domain.md).

![Scheda Domains: acme.com in attesa, con il record TXT da pubblicare](/img/console/access/domain-pending.en.png)

## Passaggio 2: creare la connessione

1. Apra la scheda **SSO connection**, quindi faccia clic su **Create the connection**.
2. Compili almeno:
   - **Display name**: `Acme`;
   - **Discovery URL**: `https://acme.okta.com/oauth2/default/.well-known/openid-configuration`;
   - **Client id** e **Client secret**: quelli dell'applicazione;
   - **Allowed domains**: selezioni `acme.com`.
3. Faccia clic su **Create**.

**Risultato atteso**: **SSO connection created.** La connessione è **Disabled**. Tutti i campi sono descritti in [Configurare la connessione SSO](./how-to/configure-sso-connection.md).

![Modulo Create the SSO connection compilato per Okta](/img/console/access/sso-create.en.png)

## Passaggio 3: registrare l'URI di reindirizzamento e attivare

1. Nella scheda **SSO connection**, copi il **Redirect URI**.
2. Presso il suo provider, lo incolli così com'è nell'applicazione.
3. In Hikube, faccia clic su **Enable**.

**Risultato atteso**: **SSO connection enabled.** Lo stato passa a **Enabled**.

![Connessione SSO attiva: URI di reindirizzamento, impostazioni e role binding](/img/console/access/sso-connection.en.png)

## Passaggio 4: testare l'accesso

1. Apra una finestra di navigazione privata su [console.hikube.cloud](https://console.hikube.cloud).
2. Inserisca un indirizzo `@acme.com` che non ha una password Hikube.
3. Acceda presso il suo provider.
4. Apra il link di conferma ricevuto via e-mail.

**Risultato atteso**: la persona arriva nella console. Compare in **Organization members** con il badge **No tier**.

## Passaggio 5: conferire i livelli

- **Senza claim dei ruoli**: sulla riga della persona, **Edit**, quindi scelga il suo livello (vedere [Gestire i membri](./how-to/manage-members.md)).
- **Con un claim dei ruoli**: crei un role binding per gruppo (vedere [Conferire i livelli dal suo provider](./how-to/sso-role-bindings.md)).

**Risultato atteso**: dopo l'aggiornamento della pagina, la persona vede i progetti del suo livello.

## Passaggio 6: risoluzione rapida dei problemi

| Sintomo | Causa probabile |
|---|---|
| Creazione rifiutata, URL di discovery | Copi l'URL così come la mostra il suo provider; l'emittente deve corrispondere |
| **Enable** rifiutato | Il dominio non è verificato, oppure il suo record `TXT` è scomparso |
| Errore di URI di reindirizzamento presso il provider | L'URI registrato non è esattamente quello della console |
| Persona rifiutata | Indirizzo fuori dai domini consentiti, oppure persona non assegnata all'applicazione |
| Connessa senza accesso | Nessun livello conferito, oppure nessun role binding corrisponde al suo token |

Altri casi: [Risoluzione dei problemi](./troubleshooting.md).

## Passaggio 7: disattivare o eliminare

- **Disable**: nessuno accede più tramite il suo provider. Gli account SSO e i loro accessi vengono conservati.
- **Delete**: gli account SSO creati dalla connessione vengono eliminati.

Vedere [Gestire la connessione SSO](./how-to/manage-sso-connection.md).

<NavigationFooter
  nextSteps={[
    {label: "Conferire i livelli dal suo provider", href: "../how-to/sso-role-bindings"},
    {label: "Gestire la connessione SSO", href: "../how-to/manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Concetti", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
