---
sidebar_position: 2
title: Concepts
---

# Concepts — PostgreSQL

## Architecture

PostgreSQL sur Hikube est un service managé. Chaque cluster créé depuis la console est un ensemble d'instances PostgreSQL répliquées, avec failover automatique et réplication streaming. Il appartient à un **projet** et consomme les quotas de ce projet (CPU, mémoire, stockage).

```mermaid
graph TB
    subgraph "Console Hikube"
        UI[Projet → DB & Messaging → PostgreSQL]
    end

    subgraph "Cluster PostgreSQL"
        P[Primary - R/W]
        R1[Réplica 1 - RO]
        R2[Réplica 2 - RO]
    end

    subgraph "Stockage"
        PV1[Volume primary]
        PV2[Volume réplica 1]
        PV3[Volume réplica 2]
    end

    UI -->|création / modification| P
    P -->|streaming replication| R1
    P -->|streaming replication| R2
    P --> PV1
    R1 --> PV2
    R2 --> PV3
```

---

## Terminologie

| Terme | Description |
|-------|-------------|
| **Cluster PostgreSQL** | Instance managée créée depuis la console, composée d'un primary et de réplicas éventuels. |
| **Projet** | Espace isolé qui regroupe vos ressources et porte les quotas. |
| **Primary** | Instance principale qui accepte les lectures et écritures. |
| **Réplica** | Instance en lecture seule, synchronisée par streaming replication depuis le primary. |
| **Preset d'instance** | Gabarit de ressources (CPU, mémoire) alloué à chaque nœud du cluster. |
| **Accès externe** | Option qui expose le cluster sur Internet via une adresse IP publique. |
| **Extension** | Module PostgreSQL (par exemple `pgcrypto`, `vector`) activé par base de données. |
| **WAL** | Write-Ahead Log — journal des transactions PostgreSQL, base de la réplication. |

---

## Réplication et haute disponibilité

La haute disponibilité repose sur :

1. **Streaming replication** : les réplicas reçoivent les WAL en continu depuis le primary
2. **Failover automatique** : si le primary tombe, un réplica est promu automatiquement

```mermaid
sequenceDiagram
    participant Client
    participant Primary
    participant Replica1
    participant Replica2

    Client->>Primary: INSERT INTO ...
    Primary->>Primary: Écriture WAL
    Primary->>Replica1: WAL streaming
    Primary->>Replica2: WAL streaming
    Primary-->>Client: COMMIT OK
```

Le nombre de réplicas se choisit à la création, dans le champ **Nombre de réplicas** :

| Valeur proposée | Usage |
|-----------------|-------|
| **1 (Standalone)** | Développement, tests |
| **2 (Haute disponibilité)** | Production avec un standby |
| **3 (Haute disponibilité max)** | Production critique |

:::warning
Le nombre de réplicas ne peut pas être modifié après la création (« Le mode ne peut pas être modifié après création »). Choisissez-le en fonction de votre besoin de disponibilité. Pour le changer, [contactez le support](mailto:support@hidora.io).
:::

La réplication synchrone (quorum) n'est pas proposée dans la console ; contactez le support.

---

## Bases de données, utilisateurs et droits

Chaque cluster dispose :

- d'une base système **`postgres`**, créée automatiquement et réservée à la plateforme (voir ci-dessous) ;
- des **bases de données** que vous ajoutez, à la création ou ensuite (onglet **Bases de données**), avec leurs **extensions** ;
- des **utilisateurs** que vous créez (onglet **Utilisateurs**). Chaque utilisateur reçoit, base par base, l'un des deux droits suivants :
  - **Administrateur (Admin)** : lecture et écriture ;
  - **Lecture seule (Read-only)** : lecture uniquement.

Le mot de passe d'un utilisateur est généré par la plateforme et affiché **une seule fois**, à la création ou après une rotation. Il n'est plus consultable ensuite : en cas de perte, générez-en un nouveau avec **Changer le mot de passe**.

### Bases système

`postgres`, `template0` et `template1` sont des bases système, réservées à la plateforme :

- les assistants d'utilisateur ne les proposent pas, et aucun droit ne peut y être attribué ;
- leur création est refusée : « « postgres » est une base système : choisissez une base applicative. » ;
- dans la liste des bases, **Gérer les extensions** et **Supprimer la base de données** sont désactivés sur une base système : « Base système : elle ne peut être ni modifiée ni supprimée. »

Un utilisateur qui détient déjà un droit sur une base système le conserve tel quel. Dans **Gérer les accès**, ce droit s'affiche verrouillé, avec un avertissement : vous pouvez retirer la ligne, mais pas la modifier. Donnez à vos utilisateurs leurs droits sur des bases applicatives.

### Règles de nommage

| Élément | Règle |
|---------|-------|
| Nom du cluster | 3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre |
| Nom d'utilisateur | 3 à 16 caractères : minuscules, chiffres et tirets bas (`_`) ; commence par une lettre minuscule ou un tiret bas. Pas de tiret (`-`). |
| Nom de base de données | 1 à 54 caractères : minuscules, chiffres, tirets bas (`_`) et tirets (`-`) ; commence par une lettre ou un tiret bas, mais pas par `pg_` |

Les noms d'utilisateur `postgres`, `admin`, `root`, `owner`, `superuser`, `streaming_replica` ainsi que ceux commençant par `pg_` sont réservés.

---

## Presets d'instance

Le **Preset d'instance** définit la capacité allouée à **chaque nœud** du cluster. Les presets reprennent les tailles des [machines virtuelles](../../compute/overview.md), séries `u1`, `s1` et `m1` : un preset a les mêmes ressources que la VM du même nom. La liste affichée par l'assistant fait foi :

| Preset | CPU | Mémoire |
|--------|-----|---------|
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

L'assistant ne présélectionne aucun preset : choisissez-en un pour continuer. Chaque option indique ses ressources, par exemple « u1.medium — 1 CPU / 4Gi ». Si la liste ne peut pas être chargée, l'assistant affiche « La liste des presets n'a pas pu être chargée. Réessayez plus tard ou contactez le support. »

Un cluster créé avec un ancien preset (`nano`, `micro`, `small`, `medium`, `large`, `xlarge` ou `2xlarge`) le conserve et fonctionne comme avant : le formulaire **Modifier** l'affiche tel quel et l'enregistre sans changement. Si les ressources d'un cluster ont été fixées hors de son preset, le formulaire l'indique par la mention « (forcé) ».

La définition de ressources CPU/mémoire libres (hors preset) n'est pas proposée dans la console ; contactez le support.

---

## Accès réseau

- **Accès externe désactivé** (par défaut) : le cluster n'est pas exposé sur Internet. Le champ **Hôte (Host)** de la page du cluster affiche **Non défini**.
- **Accès externe activé** : la plateforme attribue une adresse IP publique, affichée dans le champ **Hôte (Host)**. Le port est le port PostgreSQL standard, `5432`.

L'accès externe peut être activé ou désactivé après la création, depuis **Modifier**. Son coût (adresse IP publique) est inclus dans le **Coût estimé** de l'assistant.

---

## Sauvegarde et restauration

La configuration des sauvegardes et la restauration ne sont pas proposées dans la console ; contactez le support. Voir [Configurer les sauvegardes](./how-to/configure-backups.md).

---

## Quotas et coût

L'assistant de création affiche, dès l'étape **Configuration**, le **Coût estimé** (mensuel et horaire) et l'impact du cluster sur les quotas du projet (CPU, mémoire, stockage). La consommation tient compte du preset, du nombre de réplicas et de la taille du disque. Si le cluster dépasse les quotas disponibles, le bouton **Suivant** reste inactif.

| Paramètre | Valeur |
|-----------|--------|
| Taille du disque | 1 à 4 096 Go, dans la limite du quota de stockage du projet ; augmentation uniquement après création |
| Réplicas | 1, 2 ou 3 |

---

## Pour aller plus loin

- [Vue d'ensemble](./overview.md) : présentation du service
- [Démarrage rapide](./quick-start.md) : créer votre premier cluster
