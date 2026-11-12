---
sidebar_position: 13
title: "Come configurare Auth0 per l'SSO"
description: "Preparare un'applicazione Auth0 per la connessione SSO della sua organizzazione Hikube: Regular Web Application, registrazioni chiuse e claim dei ruoli scritto da una Action."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurare Auth0

:::caution Non verificato
Questa pagina segue la documentazione di Auth0. Hikube non l'ha verificata su un tenant Auth0 di test. Contatti il supporto prima di metterla in produzione.
:::

Questa pagina descrive la parte Auth0. Legga prima [Avvio rapido](../quick-start.md), quindi torni a [Creare la connessione SSO](./configure-sso-connection.md) per la parte Hikube.

## 1. Creare l'applicazione

1. Apra **Applications → Create Application → Regular Web Application**.
2. **Allowed Callback URLs**: l'URI di reindirizzamento mostrato dalla console Hikube.
3. **Token Endpoint Authentication Method**: un metodo basato su secret client.
4. Copi il **Client ID** e il **Client Secret**.

## 2. Chiudere le registrazioni

Disattivi le registrazioni (**sign-ups**) sulla connessione di database che l'applicazione utilizza. Solo le persone che lei ha creato possono allora accedere.

## 3. Scrivere il claim dei ruoli (facoltativo)

Lo faccia solo se Auth0 deve decidere i livelli in Hikube (vedere [Conferire i livelli dal suo provider](./sso-role-bindings.md)).

Scriva i ruoli nel token di identità con una Action **post-login**. I nomi `roles` e `groups` sono riservati da Auth0: utilizzi un nome con namespace, ad esempio `https://acme.com/roles`.

In Hikube, un punto all'interno di un nome di claim si scrive `\.`. Inserisca quindi `https://acme\.com/roles` in **Roles claim**.

## URL di discovery

```text
https://acme.eu.auth0.com/.well-known/openid-configuration
```

Sostituisca `acme.eu` con il suo tenant e la relativa regione, oppure utilizzi il suo dominio personalizzato.

## Riepilogo

| | Auth0 |
|---|---|
| Indirizzo e-mail, nome e cognome | Claim standard degli scope `email` e `profile` |
| `email_verified` | Inviato |
| **Confirm the address by a link** disattivabile | Sì |
| Claim dei ruoli | Scritto da una Action post-login, con un nome con namespace |
| PKCE | Supportato con il secret client |

<NavigationFooter
  nextSteps={[
    {label: "Creare la connessione SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Conferire i livelli dal suo provider", href: "../sso-role-bindings"},
  ]}
/>
