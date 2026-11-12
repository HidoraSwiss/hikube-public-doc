---
sidebar_position: 12
title: "Come configurare Google Workspace per l'SSO"
description: "Preparare un client OAuth Google Workspace per la connessione SSO della sua organizzazione Hikube: schermata di consenso interna, URI di reindirizzamento e dominio principale."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configurare Google Workspace

:::caution Non verificato
Questa pagina segue la documentazione di Google. Hikube non l'ha ancora verificata su un Workspace reale. Punto aperto: il comportamento per una persona di un dominio secondario del Workspace. Contatti il supporto prima di metterla in produzione.
:::

Questa pagina descrive la parte Google. Legga prima [Avvio rapido](../quick-start.md), quindi torni a [Creare la connessione SSO](./configure-sso-connection.md) per la parte Hikube.

## 1. Limitare l'applicazione al suo Workspace

1. Nella console Google Cloud del suo Workspace, apra **APIs & Services → OAuth consent screen**.
2. **User type**: **Internal**. Solo gli account del suo Workspace possono allora utilizzare l'applicazione.

## 2. Creare il client OAuth

1. Apra **Credentials → Create credentials → OAuth client ID**.
2. **Application type**: **Web application**.
3. **Authorized redirect URIs**: l'URI di reindirizzamento mostrato dalla console Hikube.
4. Copi il **Client ID** e il **Client secret**.

## 3. Preparare la connessione in Hikube

- **Discovery URL**: `https://accounts.google.com/.well-known/openid-configuration`.
- **Allowed domains**: esattamente un dominio, il dominio principale del suo Workspace (ad esempio `acme.com`). Deve essere verificato in Hikube.
- **Roles claim**: lo lasci vuoto. Il token di identità di Google non contiene gruppi. I livelli si conferiscono in Hikube.

Gli account Google personali e gli altri Workspace vengono rifiutati.

## Riepilogo

| | Google Workspace |
|---|---|
| Domini | Esattamente uno: il dominio principale del Workspace, verificato in Hikube |
| Indirizzo e-mail, nome e cognome | Claim standard degli scope `email` e `profile` |
| `email_verified` | Inviato |
| **Confirm the address by a link** disattivabile | Sì |
| Claim dei ruoli | Nessuno: conferisca i livelli in Hikube |
| PKCE | Supportato |

:::warning Nessun cambio di tipo
Una connessione Google non può diventare una connessione verso un altro provider, né viceversa. Elimini la connessione e ne crei una nuova.
:::

<NavigationFooter
  nextSteps={[
    {label: "Creare la connessione SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Gestire i membri", href: "../manage-members"},
  ]}
/>
