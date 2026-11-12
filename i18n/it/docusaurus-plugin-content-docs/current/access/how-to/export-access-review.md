---
sidebar_position: 5
title: "Come esportare la revisione degli accessi"
description: "Esportare la revisione degli accessi di un'organizzazione Hikube: chi detiene quale livello, da quando, conferito da chi, ultimo accesso, inattività e membri esterni."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Revisione degli accessi

La revisione degli accessi è un'esportazione CSV di tutti i livelli di tutti i membri dell'organizzazione. Serve per le revisioni periodiche e per gli audit.

## Esportare la revisione

Prerequisito: il livello **Admin** o superiore.

1. Apra **Organization members**, scheda **Members**.
2. Faccia clic su **Export the access review**.

La console scarica `access-review-acme-2026-11-12.csv`. Una riga per livello e per ambito, ordinata per e-mail e poi per progetto.

## Colonne

| Colonna | Contenuto |
|---|---|
| **E-mail**, **First name**, **Last name** | La persona |
| **Scope**, **Project id**, **Tier** | Il livello, sull'organizzazione o su un progetto |
| **Granted on (UTC)**, **Granted by** | Quando e da chi è stato conferito il livello. Vuoto per un livello conferito prima che Hikube registrasse queste informazioni |
| **Source** | **Console**, **Invitation** o **Identity provider** |
| **Account type** | **Organization account**, **SSO account** o **Personal account** |
| **External member** | **yes** per un account che l'organizzazione non possiede |
| **Address outside verified domains** | **yes** per un account dell'organizzazione il cui indirizzo non è su alcuno dei suoi domini verificati |
| **Account enabled** | **no** per un account bloccato |
| **Last sign-in (UTC)** | Vuoto se non è stato registrato alcun accesso |
| **Inactive** | **yes** senza accesso dalla soglia di inattività |
| **SSO connection**, **Role bindings** | Per un livello conferito dal provider di identità: la connessione e i role binding che lo conferiscono |
| **Other organization** | Per gli account della sua organizzazione: gli accessi che detengono in un'altra organizzazione, su righe separate |

## Ultimo accesso e inattività

Hikube registra la prima richiesta di ogni accesso alla console. Un membro è **inattivo** quando non accede da **90 giorni**. Per un account senza accessi registrati, il conteggio parte dalla sua creazione.

Un'organizzazione può anche bloccare automaticamente i propri account inattivi:

- vengono bloccati solo gli account dell'organizzazione. I membri esterni vengono solo segnalati, e un super amministratore non viene mai bloccato in questo modo;
- il blocco avviene alla consultazione successiva dell'elenco dei membri o della revisione degli accessi;
- i giorni si contano al più presto dall'attivazione dell'impostazione: attivarla non blocca nessuno subito;
- un amministratore sblocca l'account.

:::info Disponibilità
La soglia di inattività (da 1 a 3650 giorni) e il blocco degli account inattivi non si configurano ancora nella console. Per modificarli, contatti il supporto. La colonna **Inactive** utilizza la soglia predefinita di 90 giorni.
:::

## Cosa verificare

- i **membri esterni** (**External member**): i loro accessi sono ancora giustificati?
- gli account **Inactive**: rimuova gli accessi che non servono più;
- i livelli **Admin** e **Super admin**: ne mantenga il meno possibile, ma almeno un super amministratore con una password;
- gli indirizzi fuori dai domini verificati (**Address outside verified domains**);
- per gli account SSO, i **Role bindings** che conferiscono ciascun livello.

<NavigationFooter
  seeAlso={[
    {label: "Gestire i membri", href: "../manage-members"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
