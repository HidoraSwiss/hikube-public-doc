---
sidebar_position: 1
title: "Come invitare persone"
description: "Invitare persone in un'organizzazione o in un progetto Hikube, inviare di nuovo o annullare un invito, accettare o rifiutare un invito ricevuto, membri esterni."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Invitare persone

Un invito è l'unico modo per aggiungere una persona a un'organizzazione. La persona riceve i livelli dell'invito quando lo **accetta**, non prima.

## Invitare

Prerequisito: il livello **Admin** o superiore sull'organizzazione.

1. Apra **Organization members**, scheda **Members**.
2. Nella scheda **Pending invitations**, faccia clic su **Invite people**.
3. **E-mail addresses**: ad esempio `ana@acme.com, bruno@acme.com`. Separi gli indirizzi con virgole o a capo, al massimo 50.
4. Scelga i livelli, **On the organization** e/o **On a project**. È obbligatorio almeno un livello, mai superiore al suo.
5. Faccia clic su **Invite … people**.

L'invito è valido **7 giorni**.

- **La persona ha già un account Hikube**: non riceve alcuna e-mail. Trova l'invito al suo prossimo accesso alla console.
- **La persona non ha un account**: riceve un'e-mail per creare il proprio account. Vi verifica il proprio indirizzo, sceglie una password e registra un [secondo fattore](./set-up-second-factor.md).

Invitare di nuovo un indirizzo che ha già un invito in attesa sostituisce quello precedente.

Per invitare su un solo progetto, utilizzi **Invite** nella scheda **Project members** delle impostazioni del progetto (vedere [Membri di un progetto](./manage-members.md#membri-di-un-progetto)).

![Finestra Invite people: due indirizzi, livello Use sull’organizzazione](/img/console/access/invite.en.png)

## Seguire, inviare di nuovo o annullare

La scheda **Pending invitations** elenca l'**E-mail**, gli **Invited tiers** e la data **Expires on**. Un invito scaduto porta il badge **Expired**.

- **Resend**: invia di nuovo l'invito e lo proroga di 7 giorni.
- **Annullare**: faccia clic sull'icona di annullamento, quindi su **Cancel the invitation**. L'invito non può più essere accettato. Può invitare di nuovo questo indirizzo.

All'accettazione, ogni livello dell'invito è limitato al livello che detiene in quel momento l'autore dell'invito. Se nel frattempo l'autore ha perso il proprio livello, questo livello non viene conferito.

### Limiti

Un'organizzazione ha un numero massimo di membri, di inviti in attesa e di inviti inviati all'ora (un nuovo invio conta). Oltre, la console mostra un messaggio: rimuova un membro, annulli alcuni inviti o riprovi più tardi. Per aumentare un limite, contatti il supporto.

## Rispondere a un invito

1. Acceda alla console.
2. Compare un badge su **Invitations**, nel menu del suo profilo. Vi faccia clic.
3. Ogni invito indica l'**Organization**, il suo autore (**Sent by …**), gli **Invited tiers** e la data di scadenza.
4. Faccia clic su **Accept**, oppure su **Decline** e poi su **Decline the invitation**.

Dopo **Accept**, i suoi accessi compaiono entro qualche minuto; aggiorni allora la pagina. Un invito rifiutato non può più essere accettato: occorrerà riceverne uno nuovo.

L'invito è legato al suo indirizzo e-mail **verificato**. Acceda con l'account dell'indirizzo invitato.

:::note Invito al livello Super admin
Un invito che conferisce **Super admin** si accetta solo con un account che ha una password e un secondo fattore, senza collegamento a un provider di identità. Registri prima il suo secondo fattore. Fino ad allora l'invito resta in attesa.
:::

## Membri esterni

Può invitare una persona che ha già un account, compreso un account che appartiene a un'altra organizzazione. Diventa un **membro esterno**: conserva il proprio account, le proprie credenziali e i propri accessi altrove. Lei può solo conferirle e rimuoverle accessi nella sua organizzazione.

:::info Collaborazione esterna rifiutata per impostazione predefinita
Un account che appartiene a un'organizzazione (account dell'organizzazione o account SSO) non può, per impostazione predefinita, entrare in un'altra organizzazione. Se accetta il suo invito, Hikube gli risponde che la sua organizzazione non lo consente. Da parte sua, l'invito resta in attesa fino alla scadenza.

L'organizzazione proprietaria può autorizzare la collaborazione esterna. Questa impostazione non è ancora nella console: il suo super amministratore si rivolge al supporto. Gli account personali non sono mai limitati.
:::

## Invito e connessione SSO

Se la sua connessione SSO ha l'opzione **Invitation required**, invitare un indirizzo di un dominio consentito crea subito il suo account SSO, senza e-mail. Vedere [Gestire la connessione SSO](./manage-sso-connection.md#invito-obbligatorio).

<NavigationFooter
  nextSteps={[
    {label: "Gestire i membri", href: "../manage-members"},
  ]}
  seeAlso={[
    {label: "Affidare un account all'organizzazione", href: "../transfer-account"},
    {label: "Secondo fattore", href: "../set-up-second-factor"},
  ]}
/>
