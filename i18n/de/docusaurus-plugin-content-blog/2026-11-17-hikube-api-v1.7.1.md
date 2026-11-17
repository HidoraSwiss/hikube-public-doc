---
title: Hikube API v1.7.1
authors: [hikube]
tags: [release]
---

Diese Korrekturversion macht die NVIDIA-L4-GPU verfügbar. Eine neu gewählte Größe für eine Datenbank oder eine Kubernetes-Control-Plane wird jetzt tatsächlich angewendet, und die Größe eines MariaDB-, MongoDB- oder RabbitMQ-Clusters lässt sich ändern, ohne ihn neu anzulegen.

<!-- truncate -->

## Hinzugefügt

- **GPU** — Die NVIDIA-L4-GPU mit 24 GB Grafikspeicher ist unter dem Namen `l4` verfügbar. Sie erscheint in `GET /gpu/v1alpha1/gpus` und kann für eine VM-Instanz ebenso wie für eine Kubernetes-Node-Group angefordert werden.

## Behoben

- **PostgreSQL, Redis, Kubernetes** — Eine geänderte Größe einer Datenbank oder der Control-Plane eines Clusters konnte wirkungslos bleiben: Die neue Größe wurde gespeichert und wieder ausgelesen, die Datenbank lief aber mit ihren bisherigen Ressourcen weiter. Die neue Größe wird jetzt angewendet, und die Datenbank startet neu, um sie zu übernehmen.

- **MariaDB, MongoDB, RabbitMQ** — Die Größe eines Clusters konnte nur bei der Erstellung gewählt werden. Sie lässt sich jetzt per Update über das Feld `preset` ändern, ohne den Cluster neu anzulegen. Wie bei PostgreSQL und Redis startet der Cluster neu, um seine neue Größe zu übernehmen.
