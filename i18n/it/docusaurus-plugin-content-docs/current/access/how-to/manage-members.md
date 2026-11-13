---
sidebar_position: 2
title: "Come gestire i membri"
description: "Cambiare i livelli di un membro, rimuovere un accesso, lasciare un'organizzazione o un progetto, e delegare l'accesso a un progetto ai suoi amministratori nella console Hikube."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gestire i membri

## Aprire l'elenco dei membri

1. Nel menu del suo profilo (in alto a destra), faccia clic su **Organization members**.
2. La scheda **Members** elenca ogni persona con il suo **Organization tier** e i suoi **Project tiers**.

Badge possibili: **You**, **Account disabled**, **Projects only** (nessun livello sull'organizzazione), **No tier** (un account SSO a cui nessun role binding conferisce un livello).

![Membri dell’organizzazione e inviti in sospeso](/img/console/access/members.en.png)

## Cambiare i livelli di un membro

Prerequisito: il livello **Admin** o superiore.

1. Sulla riga del membro, faccia clic su **Edit**.
2. In **Tiers of …**:
   - **On the organization**: **None**, **Read**, **Use**, **Admin** o **Super admin**;
   - **On a project**: un livello per progetto, che si aggiunge a quello dell'organizzazione.
3. Faccia clic su **Save**.

Abbassare un livello disconnette la persona. La modifica si applica entro **5 minuti**.

Non può modificare:

- un membro di livello superiore al suo;
- i propri livelli;
- un account SSO i cui livelli provengono dal provider di identità (vedere [role binding](./sso-role-bindings.md)).

Solo un super amministratore conferisce **Super admin**, e solo a un account con una password e un secondo fattore, senza collegamento a un provider di identità.

## Rimuovere l'accesso di un membro

1. Sulla riga del membro, faccia clic sull'icona del cestino.
2. Confermi **Remove access**.

Tutti i suoi livelli nell'organizzazione e nei suoi progetti vengono rimossi, e la persona viene disconnessa entro **5 minuti**. Il suo account viene conservato, con i suoi accessi alle altre organizzazioni. Per tornare, avrà bisogno di un nuovo invito.

Rimuovere tutti i livelli in **Edit** (pulsante **Remove access**) ha lo stesso effetto.

:::warning Chiavi API
Rimuovere un membro non revoca le chiavi API che ha creato: una chiave conserva i propri scope. Le revochi nella scheda **API keys** delle impostazioni del progetto (vedere [Autenticazione dell'API](../../../api/authentication)).
:::

## Lasciare l'organizzazione o un progetto

Ogni membro può andarsene da sé.

1. Sulla sua riga (badge **You**), faccia clic su **Leave**.
2. Scelga **Leave the organization** o **Leave the project …**, quindi confermi.

- **Leave the organization** rimuove tutti i suoi livelli nell'organizzazione e nei suoi progetti, e chiude la sua sessione. Il suo account viene conservato. Per tornare serve un nuovo invito.
- **Leave the project** rimuove il livello che detiene direttamente su quel progetto. Un livello sull'organizzazione continua ad applicarvisi. Può anche lasciare un progetto dalle sue impostazioni, **Danger Zone** → **Leave the project**.

Due casi non possono andarsene:

- l'ultimo super amministratore che accede con una password: nomini prima un altro super amministratore;
- un account SSO i cui livelli provengono dal provider di identità: il suo accesso successivo glieli restituirebbe. Lo rimuova dal suo gruppo presso il suo provider.

## Membri di un progetto

Le impostazioni di un progetto (icona a forma di ingranaggio accanto al progetto, nel selettore di progetto) hanno una scheda **Project members**. Elenca le persone che detengono un livello **direttamente** su quel progetto. Gli accessi conferiti dall'organizzazione vi si applicano anch'essi, senza comparirvi.

Da questa scheda, un amministratore può:

- **Invite** una persona con un **Tier on the project**;
- **Change tier** di un membro su quel progetto;
- **Remove access** di un membro a quel progetto.

Queste azioni riguardano solo il livello detenuto direttamente su quel progetto. Un progetto non ha **Super admin**: scelga **Read**, **Use** o **Admin**.

### Delega agli amministratori di progetto

Per impostazione predefinita, solo gli amministratori dell'organizzazione gestiscono l'accesso ai progetti. Un super amministratore può affidarlo agli amministratori di ciascun progetto:

1. Apra **Organization members**, scheda **Members**.
2. Nella scheda **Delegation to project admins**, attivi **Let project admins manage access to their project**.

Un amministratore di progetto invita allora sul proprio progetto e vi cambia i livelli **Read**, **Use** e **Admin**, mai al di sopra del proprio. Non può né rimuovere né declassare l'ultimo amministratore diretto del progetto. Gli accessi conferiti dall'organizzazione restano gestiti dai suoi amministratori. Un invito inviato durante la delega resta valido dopo la sua disattivazione.

<NavigationFooter
  nextSteps={[
    {label: "Invitare persone", href: "../invite-members"},
  ]}
  seeAlso={[
    {label: "Concetti", href: "../../concepts"},
    {label: "Revisione degli accessi", href: "../export-access-review"},
  ]}
/>
