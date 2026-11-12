---
sidebar_position: 4
title: "Come registrare il proprio secondo fattore"
description: "Il secondo fattore (MFA) è obbligatorio per ogni account Hikube con una password: registrazione all'accesso, fattori accettati, account SSO e perdita del secondo fattore."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Secondo fattore (MFA)

Ogni account che accede con una password Hikube deve presentare anche un **secondo fattore**. Non ci sono eccezioni.

## Fattori accettati

- un'applicazione di autenticazione (codice a sei cifre, TOTP);
- una chiave di sicurezza;
- un codice di recupero.

Hikube non invia codici via e-mail né via SMS.

## Registrare il proprio secondo fattore

La registrazione avviene all'accesso, non nella console.

1. Acceda a [console.hikube.cloud](https://console.hikube.cloud) con il suo indirizzo e la sua password.
2. Se il suo account non ha ancora un secondo fattore, la pagina di accesso le chiede di registrarne uno. Scansioni il codice QR con la sua applicazione di autenticazione, oppure registri la sua chiave di sicurezza.
3. Inserisca il codice mostrato per terminare.

Gli accessi successivi richiedono la password, poi il secondo fattore.

Una persona invitata senza account registra il proprio secondo fattore creando il proprio account, dall'e-mail di invito.

## «A second factor is required»

La console mostra questa pagina quando la sua sessione è stata aperta senza secondo fattore. Faccia clic su **Sign in again**, quindi acceda con la sua password e il suo secondo fattore. Se l'accesso non glielo richiede, contatti il supporto.

## Account SSO

Un account che accede tramite la [connessione SSO](../quick-start.md) della propria organizzazione non ha né password né secondo fattore in Hikube. Il suo secondo fattore è quello del suo provider di identità: lo imponga presso di lui.

## Secondo fattore perso

- **Account dell'organizzazione**: un amministratore dell'organizzazione può reimpostarne le credenziali (vedere [Affidare un account all'organizzazione](./transfer-account.md#cosa-possono-fare-i-suoi-amministratori)). La persona riceve un link valido 24 ore per scegliere una nuova password e un nuovo secondo fattore.
- **Account personale**: contatti il supporto.
- **Nessun super amministratore riesce più ad accedere**: contatti il supporto. Dopo la verifica della sua identità, il supporto reimposta le credenziali di un super amministratore.

La pagina di accesso propone **Forgot Password?** solo per la password.

<NavigationFooter
  seeAlso={[
    {label: "Concetti", href: "../../concepts"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
