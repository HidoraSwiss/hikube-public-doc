---
title: Hikube API v1.7.1
authors: [hikube]
tags: [release]
---

Cette version corrective rend disponible le GPU NVIDIA L4. Une nouvelle taille choisie pour une base de données ou un control plane Kubernetes s'applique désormais vraiment, et la taille d'un cluster MariaDB, MongoDB ou RabbitMQ se change sans le recréer.

<!-- truncate -->

## Ajouté

- **GPU** — Le GPU NVIDIA L4, avec 24 Go de mémoire vidéo, est disponible sous le nom `l4`. Il apparaît dans `GET /gpu/v1alpha1/gpus` et se demande pour une instance VM comme pour un node group Kubernetes.

## Corrigé

- **PostgreSQL, Redis, Kubernetes** — Changer la taille d'une base ou du control plane d'un cluster pouvait rester sans effet : la nouvelle taille était enregistrée et relue, mais la base continuait de tourner avec ses anciennes ressources. La nouvelle taille s'applique désormais, et la base redémarre pour la prendre.

- **MariaDB, MongoDB, RabbitMQ** — La taille d'un cluster ne pouvait être choisie qu'à sa création. Elle se change désormais par une mise à jour, avec le champ `preset`, sans recréer le cluster. Comme pour PostgreSQL et Redis, le cluster redémarre pour prendre sa nouvelle taille.
