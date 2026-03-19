---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Comment fonctionne Redis Sentinel sur Hikube ?

Redis auf Hikube est déployé via l'opérateur **Spotahome Redis Operator**, qui met en place une architecture **Redis Sentinel** pour la Hochverfügbarkeit :

- **Redis Sentinel** surveille les instances Redis et effectue un **basculement automatique** (failover) en cas de panne du primary.
- Un **quorum** est nécessaire pour décider du failover : il faut au minimum **3 réplicas** pour garantir un quorum fonctionnel (majorité de 2 sur 3).
- Les clients doivent se connecter via le **service Sentinel** pour bénéficier du failover automatique.

```yaml title="redis.yaml"
spec:
  replicas: 3    # Minimum recommandé pour le quorum Sentinel
```

:::tip
En production, utilisez toujours au moins 3 réplicas pour garantir le bon fonctionnement du quorum Sentinel.
:::

### Quelle est la différence entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources prédéterminé pour chaque réplica Redis. Si le champ `resources` (CPU/mémoire explicites) est défini, `resourcesPreset` est **entièrement ignoré**.

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

```yaml title="redis.yaml"
spec:
  # Utilisation d'un preset
  resourcesPreset: small

  # OU configuration explicite (le preset est alors ignoré)
  resources:
    cpu: 1000m
    memory: 1Gi
```

### Redis persiste-t-il les données ?

Oui. Redis auf Hikube utilise la **persistance RDB/AOF** combinée à des volumes persistants (PVC). Les données sont écrites sur disque et survivent aux redémarrages des pods.

Le choix de `storageClass` influence la durabilité :

- **`local`** : données persistées sur le nœud physique. Rapide mais vulnérables à la panne du nœud. Recommandé si `replicas` > 1 (la réplication Redis Sentinel assure déjà la HA).
- **`replicated`** : données répliquées sur plusieurs nœuds. Plus lent mais résilient aux pannes. Recommandé si `replicas` = 1 (le stockage répliqué compense l'absence de réplication applicative).

```yaml title="redis.yaml"
spec:
  size: 2Gi
  storageClass: local    # Si replicas > 1 (Sentinel assure la HA)
```

### À quoi sert le paramètre `authEnabled` ?

Lorsque `authEnabled` est à `true` (valeur par défaut), un mot de passe est **généré automatiquement** et stocké dans un Secret Kubernetes. Ce mot de passe est requis pour toute connexion à Redis.

```yaml title="redis.yaml"
spec:
  authEnabled: true    # Valeur par défaut
```

:::warning
Activez toujours `authEnabled: true` en production. Désaktiviertr l'authentification expose vos données à tout pod pouvant accéder au service Redis.
:::

### Skalierung von Redis ?

Pour augmenter le nombre de réplicas Redis, modifiez le champ `replicas` dans votre manifeste et appliquez la modification :

```yaml title="redis.yaml"
spec:
  replicas: 5    # Augmenter le nombre de réplicas
```

```bash
kubectl apply -f redis.yaml
```

Redis Sentinel **reconfigure automatiquement** le cluster pour intégrer les nouveaux réplicas. Aucune intervention manuelle n'est nécessaire.

### Comment se connecter à Redis depuis un pod ?

1. Récupérez le mot de passe depuis le Secret (si `authEnabled: true`) :
   ```bash
   kubectl get tenantsecret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```

2. Connectez-vous via le service **Sentinel** (recommandé pour le failover automatique) :
   ```bash
   # Service Sentinel
   redis-cli -h rfs-redis-<name> -p 26379 SENTINEL get-master-addr-by-name mymaster
   ```

3. Ou connectez-vous directement au service Redis :
   ```bash
   # Service direct
   redis-cli -h rfr-redis-<name> -p 6379 -a <password>
   ```

:::tip
Privilégiez la connexion via le service Sentinel (`rfs-redis-<name>`) pour que vos applications suivent automatiquement le primary en cas de failover.
:::
