---
title: Console Hikube v1.4.2
authors: [hikube]
tags: [release]
---

La console accompagna l'API v1.6.3 con una scheda **Control plane** nella pagina di un cluster Kubernetes, di cui ora si possono modificare la dimensione del control plane e il numero di repliche. Le schede dei cinque database condividono un'unica impaginazione, e diversi moduli di creazione e modifica sono stati corretti.

<!-- truncate -->

## Aggiunto

- **Kubernetes: stato del control plane** — Nella pagina di un cluster compare una scheda **Control plane**. Mostra lo stato complessivo (**Healthy**, **Degraded** o **Critical**) e il relativo motivo, le repliche pronte, i membri etcd pronti e, per ogni replica, il suo stato, i suoi riavvii con data e causa dell'ultimo, nonché la memoria e la CPU rispetto al loro limite. Quando il control plane è a corto di memoria, un pulsante **Increase the size** apre la modifica del cluster.

- **Kubernetes: dimensione del control plane** — La dimensione e il numero di repliche del control plane si possono modificare su un cluster esistente. Non appena cambiano, un avviso ricorda che il control plane si riavvia progressivamente e che gli serve temporaneamente un margine nella quota CPU del progetto. Sotto il campo della dimensione, in creazione come in modifica, un avviso segnala una dimensione troppo piccola per il control plane, o troppo giusta per gli addon scelti (Monitoring Agents, GPU Operator), con un pulsante per passare alla dimensione consigliata. Lo stesso avviso compare al passo Addons della procedura guidata.

- **Database** — Le schede PostgreSQL, Redis e RabbitMQ mostrano il loro **Preset**, come quella di MariaDB.

## Modificato

Queste modifiche cambiano un comportamento esistente della console.

- **Database** — Le schede dei cinque database condividono un'unica impaginazione a due colonne. La colonna principale presenta le **General information** in riquadri (**Version**, **Replicas**, **Volume size**, **Preset**), seguite dalle sezioni proprie del motore. La colonna laterale raggruppa la scheda **Connection** e lo stato.

- **Database** — Alla creazione di un cluster MariaDB, MongoDB o RabbitMQ, la console propone **1 node (single instance)** o **3 nodes (cluster)**, con un aiuto che spiega ogni modalità e precisa che la scelta è definitiva. In modifica, un cluster in modalità cluster può cambiare il numero di repliche, da 2 a 8. Un cluster esistente a 5 nodi mantiene il suo valore.

- **Database** — La modifica di un cluster Redis propone ormai solo la versione attuale e quelle successive, e non consente più di ridurre il volume. L'avviso di riavvio menziona il preset solo dove può cambiare (PostgreSQL e Redis).

- **Kubernetes** — Alla creazione, il control plane propone 1 o 3 repliche. In modifica, il nome di un node group esistente è di sola lettura, e l'ultimo node group rimasto non può più essere eliminato. Rimuovere un node group esistente mostra un avviso: il salvataggio lo elimina insieme ai suoi nodi.

- **Kubernetes** — L'opzione dell'IP pubblico del primo node group si chiama ora **Internet traffic entry (public IP)**. Un testo di aiuto precisa che riceve il traffico dei servizi che esponete e che non serve a raggiungere l'API del cluster.

- **Kubernetes** — Quando un progetto non è ancora pronto ad accogliere un cluster, il messaggio invita a contattare il supporto indicando il nome del progetto.

- **Istanze VM** — Su una VM Windows, l'aggiunta di una chiave SSH si applica al prossimo avvio, senza perdita della password di amministratore. Il badge **Restart required** compare nell'elenco delle VM e nella loro scheda finché l'API segnala un riavvio in sospeso.

- **Progetti** — Alla creazione di un progetto, il passo delle quote è facoltativo: un campo lasciato vuoto non impone alcun limite proprio al progetto, che condivide allora le risorse rimanenti dell'organizzazione (**Limited by the organization**). Una quota impostata non può più essere rimossa in seguito, e il passo lo precisa. I nomi riservati `root` e `super` vengono rifiutati già durante l'inserimento del nome.

- **Unità** — Le dimensioni (dischi, volumi, memoria, quote) sono mostrate in GiB (Gio in francese), l'unità dell'API.

## Corretto

- **Database** — Nelle procedure guidate di creazione, un utente rifiutato dall'API non viene più mostrato con la password «Error»: la console indica **User not created** e il motivo. I database PostgreSQL e i vhost RabbitMQ rifiutati sono elencati con il loro motivo. Il nome di un vhost viene verificato già durante l'inserimento, e lo stesso nome utente non può più essere inserito due volte (MariaDB, MongoDB, bucket).
