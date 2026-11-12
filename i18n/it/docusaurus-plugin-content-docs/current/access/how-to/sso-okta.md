---
sidebar_position: 10
title: "Come configurare Okta per l'SSO"
description: "Preparare un'applicazione Okta per la connessione SSO della sua organizzazione Hikube: integrazione OIDC, assegnazioni, URL di discovery e claim groups per i livelli."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurare Okta

:::tip Provider verificato
Hikube ha verificato questa configurazione su un'organizzazione Okta di test: accessi completi, claim `groups`, role binding e cambio di applicazione.
:::

Questa pagina descrive la parte Okta. Legga prima [Avvio rapido](../quick-start.md), quindi torni a [Creare la connessione SSO](./configure-sso-connection.md) per la parte Hikube.

## 1. Creare l'applicazione

1. Nella Admin Console di Okta, apra **Applications → Create App Integration**.
2. Scelga **OIDC - OpenID Connect**, quindi **Web Application**.
3. **Sign-in redirect URIs**: incolli l'URI di reindirizzamento mostrato dalla console Hikube.
4. **Grant type**: **Authorization Code**.
5. **Client authentication**: **Client secret**. Può selezionare **Require PKCE as additional verification**.
6. Salvi, quindi copi il **Client ID** e il **Client secret**.

## 2. Assegnare le persone

In **Assignments**, assegni solo le persone o i gruppi che hanno bisogno di Hikube. Una persona assegnata solo tramite un gruppo non può più accedere una volta rimossa da quel gruppo.

## 3. Trovare l'URL di discovery

| Server di autorizzazione | URL di discovery |
|---|---|
| Server personalizzato `default` | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` |
| Altro server personalizzato | `https://acme.okta.com/oauth2/<id del server>/.well-known/openid-configuration` |
| Server dell'organizzazione Okta | `https://acme.okta.com/.well-known/openid-configuration` |

Con un dominio personalizzato, sostituisca `acme.okta.com` con quel dominio.

## 4. Aggiungere il claim `groups` (facoltativo)

Lo faccia solo se Okta deve decidere i livelli in Hikube (vedere [Conferire i livelli dal suo provider](./sso-role-bindings.md)).

1. Apra **Security → API → Authorization Servers**, quindi il server scelto al passaggio 3 e la scheda **Claims**.
2. Aggiunga un claim denominato `groups`:
   - incluso nell'**ID Token**, **Always** (non solo per uno scope);
   - **Value type**: **Groups**;
   - un filtro, al massimo 100 gruppi. Ad esempio **Starts with** `hikube-`, se i suoi gruppi Hikube condividono questo prefisso.
3. In Hikube, inserisca `groups` in **Roles claim**.

Aggiunga il claim al server di autorizzazione, non all'applicazione. Un claim del server si applica a tutte le applicazioni che lo utilizzano.

## Riepilogo

| | Okta |
|---|---|
| Indirizzo e-mail, nome e cognome | Claim standard degli scope `email` e `profile` |
| `email_verified` | Inviato |
| **Confirm the address by a link** disattivabile | Sì |
| Claim dei ruoli | `groups` |
| PKCE | Supportato |

<NavigationFooter
  nextSteps={[
    {label: "Creare la connessione SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Conferire i livelli dal suo provider", href: "../sso-role-bindings"},
    {label: "Microsoft Entra ID", href: "../sso-entra-id"},
  ]}
/>
