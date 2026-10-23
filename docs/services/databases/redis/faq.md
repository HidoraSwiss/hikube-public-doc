---
sidebar_position: 6
title: "FAQ — Redis"
sidebar_label: FAQ
description: "Réponses aux questions courantes sur Redis Hikube : fonctionnement de Sentinel, persistance, authentification, mot de passe perdu, scaling, connexion et ACL."
---

# FAQ — Redis

### Comment fonctionne Redis Sentinel sur Hikube ?

Redis sur Hikube est déployé en architecture **Redis Sentinel** pour la haute disponibilité :

- **Redis Sentinel** surveille les instances Redis et effectue un **basculement automatique** (failover) en cas de panne du master.
- Un **quorum** de sentinelles décide du failover. Trois sentinelles sont toujours déployées, quel que soit le nombre de réplicas Redis : le basculement fonctionne dès **2 réplicas**.
- Les sentinelles comptent dans les quotas du projet (CPU et mémoire, à la taille de la préconfiguration du cluster).
- L'hôte de la zone **Interne**, comme l'adresse de la zone **Externe**, suit le master : après un basculement, il pointe automatiquement vers le nouveau master, sans changement d'adresse.

:::tip
En production, choisissez au moins 3 réplicas à la création : ce nombre ne peut plus être modifié ensuite.
:::

### Quelles préconfigurations sont disponibles ?

La **Préconfiguration** fixe le CPU et la mémoire de chaque nœud. Les presets reprennent les tailles des [machines virtuelles](../../compute/overview.md), séries `u1`, `s1` et `m1` : un preset a les mêmes ressources que la VM du même nom. La liste affichée par l'assistant fait foi :

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `u1.medium` | 1 | 4Gi |
| `u1.large` | 2 | 8Gi |
| `u1.xlarge` | 4 | 16Gi |
| `u1.2xlarge` | 8 | 32Gi |
| `u1.4xlarge` | 16 | 64Gi |
| `u1.8xlarge` | 32 | 128Gi |
| `s1.small` | 1 | 2Gi |
| `s1.medium` | 2 | 4Gi |
| `s1.large` | 4 | 8Gi |
| `s1.xlarge` | 8 | 16Gi |
| `s1.2xlarge` | 16 | 32Gi |
| `s1.4xlarge` | 32 | 64Gi |
| `m1.large` | 2 | 16Gi |
| `m1.xlarge` | 4 | 32Gi |
| `m1.2xlarge` | 8 | 64Gi |
| `m1.4xlarge` | 16 | 128Gi |
| `m1.8xlarge` | 32 | 256Gi |

Elle peut être changée après la création depuis **Modifier**.

### Redis persiste-t-il les données ?

Oui. Chaque nœud dispose d'un volume persistant (**Taille du volume (Go)**) sur lequel Redis écrit ses données via ses mécanismes natifs. Les données survivent aux redémarrages.

### À quoi sert l'option « Activer l'authentification » ?

Activée (valeur par défaut), elle protège le cluster par un mot de passe généré automatiquement, affiché une seule fois à la création avec l'utilisateur `default`. Ce mot de passe est requis pour toute connexion.

:::warning
Conservez toujours l'authentification activée, en particulier si le réseau public est activé.
:::

### J'ai perdu le mot de passe. Comment le récupérer ?

Il ne peut pas être relu. Générez-en un nouveau depuis la section **Sécurité** de la page du cluster (**Effectuer une rotation**). Voir [Renouveler le mot de passe](./how-to/rotate-password.md).

### Comment scaler Redis ?

- **Verticalement** : changez la **Préconfiguration** et la **Taille du volume (Go)** via **Modifier**. Voir [Modifier les ressources](./how-to/scale-resources.md).
- **Horizontalement** : le nombre de réplicas est fixé à la création. Pour le modifier, [contactez le support](mailto:support@hidora.io).

### Comment se connecter à Redis ?

Avec le réseau public activé, utilisez l'adresse de la zone **Externe** (section **Connexion** de la page du cluster) sur le port `6379` :

```bash
REDISCLI_AUTH='<mot de passe>' redis-cli -h <hôte> -p 6379 ping
```

Depuis une VM ou un cluster Kubernetes du projet, utilisez l'hôte de la zone **Interne**, avec ou sans réseau public. Il suit lui aussi le master.

### Peut-on créer plusieurs utilisateurs Redis (ACL) ?

Non, la console ne propose pas de gestion d'utilisateurs Redis : l'accès repose sur un mot de passe global au cluster.
