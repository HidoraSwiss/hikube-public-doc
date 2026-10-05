---
title: "Comment scaler le cluster"
---

# Comment scaler le cluster Kafka

:::info Disponibilité
Kafka n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide présente les paramètres de dimensionnement d'un cluster Kafka sur Hikube (nombre de brokers, ressources CPU/mémoire, stockage, ZooKeeper) et les points à vérifier avant et après un changement.

Le dimensionnement fait partie de la configuration de l'instance. Cette option n'est pas proposée dans la console ; contactez le support.

## Prérequis

- Un cluster **Kafka** provisionné sur Hikube et l'adresse de ses serveurs bootstrap (`<bootstrap-servers>`)
- Les scripts clients Kafka installés sur votre poste (pour la vérification)

## Presets disponibles

Les presets s'appliquent séparément aux brokers Kafka et aux nœuds ZooKeeper :

| Preset | CPU | Mémoire |
|--------|-----|---------|
| `nano` | 250m | 128Mi |
| `micro` | 500m | 256Mi |
| `small` | 1 | 512Mi |
| `medium` | 1 | 1Gi |
| `large` | 2 | 2Gi |
| `xlarge` | 4 | 4Gi |
| `2xlarge` | 8 | 8Gi |

:::note
Des valeurs CPU/mémoire explicites peuvent être demandées à la place d'un preset ; elles remplacent alors le preset.
:::

## Étapes

### 1. Identifier le besoin

| Symptôme | Levier |
|----------|--------|
| Débit insuffisant, consumer lag sur toutes les partitions | Plus de brokers et/ou plus de partitions |
| Brokers redémarrés par manque de mémoire | Preset supérieur pour les brokers |
| Espace disque insuffisant sur les brokers | Stockage des brokers plus grand |
| Instabilité de la coordination | Ressources ou stockage ZooKeeper |

### 2. Préparer la demande

Indiquez au support, pour le projet et l'instance concernés :

- **Brokers** : nombre de brokers, preset (ou CPU/mémoire explicites), taille du stockage par broker ;
- **ZooKeeper** : nombre d'instances (impair : 1, 3, 5), preset, taille du stockage.

:::warning
Réduire le nombre de brokers sur un cluster existant peut entraîner une perte de données si des partitions ne sont pas redistribuées au préalable. Privilégiez l'augmentation du nombre de brokers.
:::

:::tip
En production, 3 instances ZooKeeper suffisent dans la majorité des cas. 5 instances ne se justifient que pour des clusters très larges (10 brokers et plus).
:::

### 3. Adapter les topics si nécessaire

Le nombre de réplicas d'un topic ne peut pas dépasser le nombre de brokers. Après une augmentation du nombre de brokers, vous pouvez demander l'augmentation du facteur de réplication ou du nombre de partitions de vos topics (voir [Comment créer et gérer les topics](./manage-topics.md)).

### 4. Transmettre la demande

Envoyez la demande au [support](mailto:support@hidora.io). L'application des changements peut entraîner le redémarrage successif des brokers ; prévoyez des clients capables de se reconnecter.

## Vérification

Une fois le changement appliqué, vérifiez que le cluster répond et que les topics ont tous leurs réplicas synchronisés :

```bash
kafka-topics.sh --bootstrap-server <bootstrap-servers> --list
kafka-topics.sh --bootstrap-server <bootstrap-servers> --describe --under-replicated-partitions
```

La seconde commande ne doit rien renvoyer lorsque toutes les partitions sont répliquées.

## Pour aller plus loin

- **[Concepts](../concepts.md)** : architecture, ZooKeeper et presets
- **[Comment créer et gérer les topics](./manage-topics.md)** : configurer les topics après le scaling
