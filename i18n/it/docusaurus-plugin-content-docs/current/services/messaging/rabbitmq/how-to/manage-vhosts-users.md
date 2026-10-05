---
title: "Come gestire vhost e utenti"
---

# Come gestire vhost e utenti

Questa guida spiega come aggiungere ed eliminare virtual host (vhost), creare utenti RabbitMQ, gestirne i diritti per vhost e rinnovarne la password dalla [console Hikube](https://console.hikube.cloud).

## Prerequisiti

- Un **cluster RabbitMQ** creato nel suo progetto (vedere l'[avvio rapido](../quick-start.md))
- Accesso alla pagina di dettaglio del cluster: menu **DB & Messaging** → **RabbitMQ**, quindi clic sul cluster

## Aggiungere un vhost

1. Nella pagina del cluster, nella sezione **VHosts**, faccia clic su **Add a VHost**.
2. Nella finestra **Create a VHost**, inserisca il **VHost Name** (lettere, cifre, `_`, `.` e `-`, ad esempio `production`).
3. Faccia clic su **Create**. Il messaggio « VHost created » conferma l'operazione e il vhost compare nell'elenco.

## Eliminare un vhost

1. Nella sezione **VHosts**, apra il menu delle azioni del vhost.
2. Scelga **Delete VHost**.
3. Inserisca il nome esatto del vhost per confermare, quindi faccia clic su **Permanently delete**.

:::warning
L'eliminazione di un vhost elimina i suoi exchange, le sue queue e i suoi messaggi. Il vhost predefinito `/`, se presente, non può essere eliminato.
:::

## Creare un utente

1. Nella sezione **Users**, faccia clic su **Create a user**.
2. Inserisca lo **Username** (lettere, cifre, `_`, `.` e `-`).
3. In **Specific Access (VHosts)**, faccia clic su **Add** per ciascun vhost a cui l'utente deve accedere, quindi scelga:
   - il **VHost name** nell'elenco;
   - i **Rights**: **Administrator (Admin)** o **Read-only**.
4. Faccia clic su **Create user**.

La console mostra la password generata per l'utente.

:::warning Password mostrata una sola volta
Copi subito la password: non verrà più mostrata dopo aver lasciato questa schermata. Faccia quindi clic su **Done**.
:::

:::tip
Crei un utente per ciascuna applicazione, con il diritto **Read-only** per le applicazioni che si limitano a consumare messaggi. In questo modo si limita l'impatto di una fuga di credenziali.
:::

## Modificare i diritti di un utente

1. Nella sezione **Users**, apra il menu delle azioni dell'utente e scelga **Manage Access**.
2. La pagina **Edit user** elenca i suoi accessi per vhost. Lo **Username** non può essere modificato.
3. Aggiunga un accesso con **Add**, cambi i **Rights** di un vhost oppure rimuova un accesso con l'icona di eliminazione della riga.
4. Faccia clic su **Save**.

La password dell'utente non viene modificata da questa operazione.

## Rinnovare la password di un utente

1. Nel menu delle azioni dell'utente, scelga **Change Password**.
2. La finestra **Rotate password** chiede una conferma. Faccia clic su **Perform rotation**.
3. Copi la nuova password mostrata, quindi faccia clic su **Done**.

:::warning
La vecchia password viene revocata immediatamente. Aggiorni senza indugio le applicazioni che utilizzano questo account, altrimenti le loro connessioni verranno rifiutate.
:::

## Eliminare un utente

1. Nel menu delle azioni dell'utente, scelga **Delete user**.
2. Inserisca il nome esatto dell'utente per confermare, quindi faccia clic su **Permanently delete**.

I suoi diritti su tutti i vhost vengono rimossi contemporaneamente.

## Verifica

- La sezione **VHosts** elenca tutti i vhost del cluster.
- La colonna **VHosts** della tabella **Users** mostra, per ciascun utente, i suoi vhost e il diritto associato.
- Un test di connessione con un client AMQP (vedere il passo 5 dell'[avvio rapido](../quick-start.md)) conferma che l'utente accede al vhost previsto.

## Per approfondire

- [Concetti](../concepts.md): vhost, utenti e diritti
- [Modificare la configurazione di un cluster](./scale-resources.md)
- [Configurare l'accesso esterno](./configure-external-access.md)
