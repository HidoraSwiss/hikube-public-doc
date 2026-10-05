---
sidebar_position: 6
title: FAQ
---

# FAQ — Redis

### Comment fonctionne Redis Sentinel sur Hikube ?

Redis sur Hikube est déployé en architecture **Redis Sentinel** pour la haute disponibilité :

- **Redis Sentinel** surveille les instances Redis et effectue un **basculement automatique** (failover) en cas de panne du master.
- Un **quorum** est nécessaire pour décider du failover : il faut au minimum **3 réplicas** pour garantir un quorum fonctionnel (majorité de 2 sur 3).

:::tip
En production, choisissez au moins 3 réplicas à la création : ce nombre ne peut plus être modifié ensuite.
:::

### Quelles préconfigurations sont disponibles ?

La **Préconfiguration** fixe le CPU et la mémoire de chaque nœud. La liste affichée par l'assistant fait foi ; à titre indicatif :

| **Preset** | **CPU** | **Mémoire** |
|------------|---------|-------------|
| `nano`     | 250m    | 128Mi       |
| `micro`    | 500m    | 256Mi       |
| `small`    | 1       | 512Mi       |
| `medium`   | 1       | 1Gi         |
| `large`    | 2       | 2Gi         |
| `xlarge`   | 4       | 4Gi         |
| `2xlarge`  | 8       | 8Gi         |

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

Avec le réseau public activé, utilisez l'adresse du champ **Hôte** (section **Connexion** de la page du cluster) sur le port `6379` :

```bash
REDISCLI_AUTH='<mot de passe>' redis-cli -h <hôte> -p 6379 ping
```

Sans réseau public, la console n'affiche pas d'adresse interne. [Contactez le support](mailto:support@hidora.io) pour connaître l'adresse à utiliser depuis vos autres ressources du projet.

### Peut-on créer plusieurs utilisateurs Redis (ACL) ?

Non, la console ne propose pas de gestion d'utilisateurs Redis : l'accès repose sur un mot de passe global au cluster.
