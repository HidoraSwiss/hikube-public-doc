---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Comment fonctionne Redis Sentinel sur Hikube ?

Redis sur Hikube est deploye via l'operateur **Spotahome Redis Operator**, qui met en place une architecture **Redis Sentinel** pour la haute disponibilite :

- **Redis Sentinel** surveille les instances Redis et effectue un **basculement automatique** (failover) en cas de panne du primary.
- Un **quorum** est necessaire pour decider du failover : il faut au minimum **3 replicas** pour garantir un quorum fonctionnel (majorite de 2 sur 3).
- Les clients doivent se connecter via le **service Sentinel** pour beneficier du failover automatique.

```yaml title="redis.yaml"
spec:
  replicas: 3    # Minimum recommande pour le quorum Sentinel
```

:::tip
En production, utilisez toujours au moins 3 replicas pour garantir le bon fonctionnement du quorum Sentinel.
:::

### Quelle est la difference entre `resourcesPreset` et `resources` ?

Le champ `resourcesPreset` permet de choisir un profil de ressources predetermine pour chaque replica Redis. Si le champ `resources` (CPU/memoire explicites) est defini, `resourcesPreset` est **entierement ignore**.

| **Preset** | **CPU** | **Memoire** |
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

  # OU configuration explicite (le preset est alors ignore)
  resources:
    cpu: 1000m
    memory: 1Gi
```

### Redis persiste-t-il les donnees ?

Oui. Redis sur Hikube utilise la **persistance RDB/AOF** combinee a des volumes persistants (PVC). Les donnees sont ecrites sur disque et survivent aux redemarrages des pods.

Le choix de `storageClass` influence la durabilite :

- **`local`** : donnees persistees sur le noeud physique. Rapide mais vulnerables a la panne du noeud.
- **`replicated`** : donnees repliquees sur plusieurs noeuds. Plus lent mais resilient aux pannes.

```yaml title="redis.yaml"
spec:
  size: 2Gi
  storageClass: replicated    # Recommande en production
```

### A quoi sert le parametre `authEnabled` ?

Lorsque `authEnabled` est a `true` (valeur par defaut), un mot de passe est **genere automatiquement** et stocke dans un Secret Kubernetes. Ce mot de passe est requis pour toute connexion a Redis.

```yaml title="redis.yaml"
spec:
  authEnabled: true    # Valeur par defaut
```

:::warning
Activez toujours `authEnabled: true` en production. Desactiver l'authentification expose vos donnees a tout pod pouvant acceder au service Redis.
:::

### Comment scaler Redis ?

Pour augmenter le nombre de replicas Redis, modifiez le champ `replicas` dans votre manifeste et appliquez la modification :

```yaml title="redis.yaml"
spec:
  replicas: 5    # Augmenter le nombre de replicas
```

```bash
kubectl apply -f redis.yaml
```

Redis Sentinel **reconfigure automatiquement** le cluster pour integrer les nouveaux replicas. Aucune intervention manuelle n'est necessaire.

### Comment se connecter a Redis depuis un pod ?

1. Recuperez le mot de passe depuis le Secret (si `authEnabled: true`) :
   ```bash
   kubectl get secret redis-<name>-auth -o jsonpath='{.data.password}' | base64 -d
   ```

2. Connectez-vous via le service **Sentinel** (recommande pour le failover automatique) :
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
Privilegiez la connexion via le service Sentinel (`rfs-redis-<name>`) pour que vos applications suivent automatiquement le primary en cas de failover.
:::
