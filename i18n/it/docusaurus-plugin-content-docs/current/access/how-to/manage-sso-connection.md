---
sidebar_position: 9
title: "Come gestire la connessione SSO"
description: "Modificare, disattivare, sostituire il provider o eliminare la connessione SSO della sua organizzazione Hikube, e ammettere solo le persone invitate."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Gestire la connessione SSO

Tutte queste azioni si eseguono in **Organization members**, scheda **SSO connection**, con il livello **Super admin**.

## Modificare le impostazioni

1. Faccia clic su **Edit settings**.
2. Modifichi i campi desiderati, quindi faccia clic su **Save**.

Per cambiare solo il secret, inserisca quello nuovo in **Client secret**. Se lasciato vuoto, viene conservato il secret attuale. Sostituisca il secret prima della sua scadenza presso il suo provider: un secret scaduto blocca tutti gli accessi SSO.

Aggiungere un dominio agli **Allowed domains** controlla di nuovo il suo record DNS.

## Invito obbligatorio

Con **Invitation required**, un primo accesso non crea alcun account. Accedono solo le persone che lei invita.

Per ammettere qualcuno, lo [inviti](./invite-members.md) come di consueto:

- per un indirizzo di un dominio consentito, Hikube crea subito il suo account SSO, con i livelli dell'invito, **senza inviare e-mail**. Dica alla persona di accedere tramite il suo provider;
- al suo primo accesso, la persona riceve un link al proprio indirizzo. Una volta aperto il link, l'account è suo e l'invito risulta accettato;
- l'account conta nel suo limite di membri fin dall'invito;
- un invito che scade, o che lei annulla prima del primo accesso, elimina l'account creato. Inviarlo di nuovo conserva l'account;
- una persona non invitata vede che non esiste alcun account per il suo indirizzo;
- un indirizzo che ha già un account viene invitato come di consueto.

Con un claim dei ruoli, i livelli provengono dal provider all'accesso, non dall'invito. Attivare o disattivare l'opzione non modifica alcun account.

## Disattivare e riattivare

1. Faccia clic su **Disable**, quindi confermi **Disable**.

Nessuno accede più tramite il suo provider. Gli account SSO e i loro accessi vengono conservati. Possono accedere di nuovo non appena lei fa clic su **Enable**.

:::note Dominio rimosso
Un dominio indicato negli **Allowed domains** non può essere rimosso: lo rimuova prima dalla connessione. Se la connessione non serve più alcun dominio, viene disattivata. Per riattivarla, scelga di nuovo i suoi domini consentiti.
:::

## Sostituire il provider

Cambi applicazione o provider senza perdere gli account.

1. Presso il nuovo provider, configuri l'applicazione come la prima: stesso URI di reindirizzamento, stesse assegnazioni, stesso claim dei ruoli.
2. In Hikube, faccia clic su **Replace the provider**.
3. Inserisca la nuova **Discovery URL**, il **Client id** e il **Client secret**, quindi faccia clic su **Replace**.

Vengono conservati: l'identificativo della connessione, il suo URI di reindirizzamento, le sue impostazioni, gli account SSO e i loro accessi.

Al loro accesso successivo, gli account SSO si collegano al nuovo provider dopo aver aperto il link inviato al loro indirizzo. Un account che ha conservato una password si collega inserendo quella password. Gli account SSO il cui indirizzo non era ancora confermato vengono eliminati.

:::warning Google Workspace
Una connessione Google non può passare a un altro provider, né viceversa. Elimini la connessione e ne crei una nuova.
:::

## Eliminare la connessione

:::danger Account eliminati
Eliminare la connessione elimina gli account SSO che ha creato, e gli account affidati all'organizzazione che accedevano tramite essa. Il loro accesso termina ovunque entro 5 minuti. Per cambiare provider senza perdere gli account, sostituisca il provider.
:::

1. Faccia clic su **Delete**.
2. La finestra **Delete the SSO connection?** indica il numero di account SSO eliminati.
3. Selezioni **I understand that … account(s) will be deleted.**
4. Faccia clic su **Delete**.

Un account che ha conservato una password viene solo scollegato dalla connessione. Continua ad accedere con la propria password e il proprio secondo fattore.

<NavigationFooter
  seeAlso={[
    {label: "FAQ", href: "../../faq"},
    {label: "Invitare persone", href: "../invite-members"},
    {label: "Verificare un dominio", href: "../verify-domain"},
  ]}
/>
