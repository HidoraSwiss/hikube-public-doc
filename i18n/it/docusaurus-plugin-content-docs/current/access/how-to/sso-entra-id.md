---
sidebar_position: 11
title: "Come configurare Microsoft Entra ID per l'SSO"
description: "Preparare un'applicazione Microsoft Entra ID per la connessione SSO della sua organizzazione Hikube: registrazione single-tenant, claim, ruoli dell'applicazione e assegnazione obbligatoria."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurare Microsoft Entra ID

:::tip Provider verificato
Hikube ha verificato questa configurazione su un tenant Entra ID di test: accessi completi con ruoli dell'applicazione e role binding, rifiuto di una persona non assegnata, rifiuto dell'URL `/common`. Il claim `groups` non è stato verificato: preferisca i ruoli dell'applicazione.
:::

Questa pagina descrive la parte Entra ID. Legga prima [Avvio rapido](../quick-start.md), quindi torni a [Creare la connessione SSO](./configure-sso-connection.md) per la parte Hikube.

## 1. Registrare l'applicazione

1. Apra **App registrations → New registration**.
2. **Supported account types**: **Accounts in this organizational directory only** (un solo tenant).
3. **Redirect URI**: piattaforma **Web**, quindi l'URI di reindirizzamento mostrato dalla console Hikube.

## 2. Creare il secret

1. Apra **Certificates & secrets → New client secret**.
2. Copi il valore del secret e l'**Application (client) ID**.
3. Annoti la data di scadenza del secret. Lo sostituisca in Hikube prima di questa data, altrimenti nessuno potrà più accedere tramite la connessione SSO.

## 3. Aggiungere i claim al token di identità

1. Apra **Token configuration → Add optional claim**, tipo **ID**.
2. Selezioni `email`, `given_name` e `family_name`.

Entra ID invia `email` solo per le persone il cui attributo di posta è compilato. Senza indirizzo, l'accesso viene rifiutato.

## 4. Concedere il consenso

1. Apra **API permissions**.
2. Aggiunga le autorizzazioni delegate Microsoft Graph `openid`, `email` e `profile`.
3. Faccia clic su **Grant admin consent**.

Senza questo consenso, ogni persona deve dare il proprio consenso al primo accesso.

## 5. Creare i ruoli dell'applicazione (facoltativo)

Lo faccia solo se Entra ID deve decidere i livelli in Hikube (vedere [Conferire i livelli dal suo provider](./sso-role-bindings.md)).

1. Apra **App roles → Create app role** e crei un ruolo per livello di accesso, ad esempio `hikube-admins` e `hikube-devs`. **Allowed member types**: **Users/Groups**.
2. In **Enterprise applications → Users and groups**, assegni a ogni persona o gruppo il proprio ruolo.
3. In Hikube, inserisca `roles` in **Roles claim**. Il valore da associare è il **Value** del ruolo.

Non appena l'applicazione ha dei ruoli, ogni assegnazione ne richiede uno: Entra ID non propone più il ruolo «Default Access». Per far entrare qualcuno senza livello, gli assegni un ruolo che nessun role binding nomina.

## 6. Limitare l'accesso

1. In **Enterprise applications**, apra l'applicazione.
2. Imposti **Assignment required** su **Yes**.
3. Assegni le persone o i gruppi che hanno bisogno di Hikube.

Una persona non assegnata viene fermata da Entra ID (errore `AADSTS50105`). Non ottiene un account Hikube.

## URL di discovery

```text
https://login.microsoftonline.com/<id del tenant>/v2.0/.well-known/openid-configuration
```

Utilizzi l'identificativo del suo tenant. Le URL `/common` e `/organizations` vengono rifiutate: il loro emittente non è il suo tenant.

## Ospiti del tenant

Un ospite del suo tenant (account Microsoft personale o account di un'altra azienda) accede con il proprio indirizzo. Questo indirizzo non è sui suoi domini verificati: Hikube lo rifiuta.

## Riepilogo

| | Microsoft Entra ID |
|---|---|
| Indirizzo e-mail, nome e cognome | Claim facoltativi da aggiungere al token di identità |
| `email_verified` | Non inviato |
| **Confirm the address by a link** disattivabile | No: lasci l'opzione attivata |
| Claim dei ruoli | `roles` (ruoli dell'applicazione, consigliato). Oppure `groups`: identificativi degli oggetti dei gruppi, omessi oltre 200 gruppi |
| PKCE | Supportato |

:::warning Claim `groups` e più di 200 gruppi
Una persona membro di più di 200 gruppi non riceve alcun claim `groups`. Accede allora senza alcun livello. Preferisca i ruoli dell'applicazione.
:::

<NavigationFooter
  nextSteps={[
    {label: "Creare la connessione SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Conferire i livelli dal suo provider", href: "../sso-role-bindings"},
    {label: "Okta", href: "../sso-okta"},
  ]}
/>
