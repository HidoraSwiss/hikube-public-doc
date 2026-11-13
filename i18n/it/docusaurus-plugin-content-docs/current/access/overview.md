---
sidebar_position: 1
title: Presentazione della gestione degli accessi
description: "Gestione degli accessi Hikube: chi accede a cosa nella sua organizzazione, inviti, livelli, secondo fattore, revisione degli accessi e connessione SSO con il suo provider di identità."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gestione degli accessi

La gestione degli accessi decide **chi** entra nella sua organizzazione Hikube e **cosa può farvi ciascuna persona**. Si gestisce dalla [console](https://console.hikube.cloud), menu del suo profilo → **Organization members**.

## Cosa copre

| Esigenza | Cosa offre Hikube |
|---|---|
| Far entrare qualcuno | Un invito, sull'organizzazione o su un solo progetto |
| Decidere i suoi diritti | Quattro livelli: **Read**, **Use**, **Admin**, **Super admin** |
| Proteggere gli accessi | Un secondo fattore obbligatorio per ogni account con una password |
| Controllare gli accessi | Una revisione degli accessi esportabile, con ultimo accesso e inattività |
| Dimostrare il possesso di un dominio | Domini verificati tramite un record DNS |
| Utilizzare gli account della sua azienda | Una connessione SSO con il suo provider di identità (Okta, Microsoft Entra ID…) |
| Lasciare che la sua directory decida i diritti | Dei role binding: un gruppo della sua directory conferisce un livello |

## Per chi

- **I membri** consultano l'elenco dei membri, rispondono ai propri inviti e possono lasciare un'organizzazione.
- **Gli amministratori** invitano, cambiano i livelli, rimuovono accessi, gestiscono i domini ed esportano la revisione degli accessi.
- **I super amministratori** conferiscono il livello **Super admin** e gestiscono la connessione SSO.

## Gli accessi rimossi hanno effetto rapidamente

Un livello abbassato, un membro rimosso, un role binding eliminato: la persona viene disconnessa e la modifica si applica entro **5 minuti** al massimo.

:::info Console e API
La gestione degli accessi avviene nella console. Una [chiave API](../../api/authentication) non può utilizzarla: una chiave agisce sulle risorse di un progetto, mai sugli accessi.
:::

<NavigationFooter
  nextSteps={[
    {label: "Concetti", href: "../concepts"},
    {label: "Avvio rapido: connessione SSO", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Invitare persone", href: "../how-to/invite-members"},
  ]}
/>
