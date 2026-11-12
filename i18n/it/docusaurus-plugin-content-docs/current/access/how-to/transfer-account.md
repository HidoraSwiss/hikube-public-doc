---
sidebar_position: 3
title: "Come affidare un account all'organizzazione"
description: "Trasferire un account Hikube personale all'organizzazione: condizioni, effetti, cosa possono fare poi gli amministratori, e legame con la connessione SSO."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Affidare un account all'organizzazione

La maggior parte delle persone accede con un **account personale**: appartiene a loro, e l'organizzazione si limita a conferirgli accessi. Una persona può anche **affidare** il proprio account all'organizzazione. L'account diventa allora un **account dell'organizzazione**, gestito dai suoi amministratori.

:::info Disponibilità
Il trasferimento di un account non è ancora disponibile nella console. Per affidare un account alla sua organizzazione, contatti il supporto.
:::

## Condizioni

Nulla viene trasferito senza il consenso della persona. Il trasferimento richiede:

- un indirizzo e-mail **verificato**, su un [dominio verificato](./verify-domain.md) dell'organizzazione, il cui record DNS è ancora presente;
- essere membro dell'organizzazione, oppure accettarne l'invito nello stesso momento;
- **nessun accesso in un'altra organizzazione**, né sull'organizzazione stessa né su uno dei suoi progetti. Gli inviti in attesa non contano.

Una persona il cui trasferimento viene rifiutato conserva il proprio account personale e gli accessi che le sono stati conferiti. Può accettare l'invito senza trasferire il proprio account: diventa un membro esterno.

## Effetti

- L'account conserva la propria password e il proprio secondo fattore.
- I super amministratori dell'organizzazione vedono il trasferimento.
- Per impostazione predefinita, l'account non può più entrare in un'altra organizzazione (vedere [Membri esterni](./invite-members.md#membri-esterni)).

### Con una connessione SSO attiva

Se la connessione SSO dell'organizzazione è attiva e serve il dominio dell'indirizzo, il trasferimento si completa al prossimo accesso della persona tramite il suo provider, dopo la password e il secondo fattore. L'account diventa allora un account SSO: la sua password e il suo secondo fattore Hikube vengono rimossi. Con un claim dei ruoli, i livelli conferiti in Hikube vengono sostituiti da quelli dei [role binding](./sso-role-bindings.md).

Un super amministratore non viene mai convertito: conserva la propria password.

## Cosa possono fare i suoi amministratori

Su un account dell'organizzazione, un amministratore può, oltre a gestirne gli accessi:

- **bloccarlo**: la persona viene disconnessa e non può più accedere; i suoi accessi vengono conservati per lo sblocco;
- **sbloccarlo**;
- **reimpostarne le credenziali**: la sua password e tutti i suoi secondi fattori vengono rimossi, la persona viene disconnessa e riceve un link valido 24 ore per sceglierne di nuovi. Un account SSO non ha credenziali in Hikube: le reimposti presso il suo provider;
- **eliminarlo**, con tutti i suoi accessi.

:::info Disponibilità
Queste azioni non sono ancora nella console. Contatti il supporto.
:::

Nessuno agisce su un membro di livello superiore al proprio, né blocca o elimina il proprio account. L'organizzazione mantiene sempre un super amministratore attivo con una password. Il profilo (nome, e-mail) appartiene alla persona: i suoi amministratori non lo modificano.

<NavigationFooter
  seeAlso={[
    {label: "Concetti", href: "../../concepts"},
    {label: "Verificare un dominio", href: "../verify-domain"},
  ]}
/>
