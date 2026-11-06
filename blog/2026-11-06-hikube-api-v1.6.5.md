---
title: Hikube API v1.6.5
authors: [hikube]
tags: [release]
---

Cette version corrective rétablit la consommation affichée et les vérifications de quota des projets qui n'ont pas de quota propre et partagent celui de leur organisation.

<!-- truncate -->

## Corrigé

- **Quotas** — Pour un projet sans quota propre, qui partage celui de son organisation, `GET .../projects/{name}/quota-usage` renvoyait `0` consommé sur un total de `0`, et la console affichait donc un projet vide. La consommation réelle est de nouveau renvoyée, et le total est la part du quota de l'organisation qui s'applique au projet. Les mises à jour en temps réel de la console suivent la même règle.

- **Quotas** — Pour ces mêmes projets, la création ou l'agrandissement d'un disque (`30202`, `20210`) et le changement de taille d'un control plane Kubernetes (`70209`) n'étaient pas vérifiés par rapport au quota. Une demande trop grande était acceptée, puis restait bloquée faute de place. Elle est de nouveau refusée d'emblée, et rien n'est créé.
