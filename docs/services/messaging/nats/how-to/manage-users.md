---
title: "Comment gérer les utilisateurs"
---

# Comment gérer les utilisateurs NATS

:::info Disponibilité
NATS n'est pas encore disponible en libre-service dans la [console Hikube](https://console.hikube.cloud).
Pour en provisionner une instance ou modifier sa configuration, [contactez le support](mailto:support@hidora.io).
:::

Ce guide explique comment organiser les utilisateurs d'un cluster NATS sur Hikube et comment vérifier leurs accès depuis le CLI `nats`.

Les utilisateurs (nom et mot de passe) font partie de la configuration de l'instance. Leur création, leur suppression ou le renouvellement de leur mot de passe se demandent au support. Cette option n'est pas proposée dans la console ; contactez le support.

## Prérequis

- Un cluster **NATS** provisionné sur Hikube et son URL (`<nats-url>`)
- Le CLI **nats** installé localement

## Étapes

### 1. Définir les comptes nécessaires

Créez des utilisateurs distincts par usage pour un contrôle d'accès granulaire, par exemple :

| Utilisateur | Usage |
|-------------|-------|
| `admin` | Administration (création de streams, rapports serveur) |
| `appuser` | Compte applicatif, un par service |
| `monitoring` | Supervision |

### 2. Demander la création des utilisateurs

Envoyez la liste des utilisateurs au [support](mailto:support@hidora.io), en précisant le projet et le nom de l'instance. Le support vous transmet les mots de passe ; conservez-les dans un gestionnaire de mots de passe.

### 3. Tester la connexion avec le CLI nats

Enregistrez un contexte par utilisateur, puis testez la publication :

```bash
nats context save hikube-admin --server <nats-url> --user admin --password <mot-de-passe-admin>
nats --context hikube-admin pub test "Hello from admin"
```

**Résultat attendu :**

```console
Published 16 bytes to "test"
```

**Test d'un mot de passe incorrect :**

```bash
nats pub test "This should fail" --server <nats-url> --user admin --password wrongpassword
```

**Résultat attendu :**

```console
nats: error: Authorization Violation
```

:::warning
Si l'accès externe est activé sur l'instance, le cluster NATS est joignable depuis Internet. Assurez-vous que tous les utilisateurs disposent de mots de passe robustes.
:::

### 4. Vérifier les connexions actives

Avec un compte disposant des droits suffisants, consultez les connexions actives :

```bash
nats --context hikube-admin server report connections
```

:::note
Les rapports `nats server …` nécessitent un accès au compte système du serveur NATS. Si la commande est refusée, demandez au support l'état des connexions.
:::

## Vérification

La configuration est correcte si :

- Chaque utilisateur peut se connecter avec son mot de passe
- Un mot de passe incorrect est rejeté (`Authorization Violation`)

## Pour aller plus loin

- **[Concepts](../concepts.md)** : gestion des utilisateurs et JetStream
- **[Comment configurer JetStream](./configure-jetstream.md)** : activer la persistance des messages et le streaming
