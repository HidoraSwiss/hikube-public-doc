---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Déployer Redis en 5 minutes

Ce guide vous accompagne dans la création de votre premier cluster **Redis** depuis la [console Hikube](https://console.hikube.cloud), jusqu'aux premiers tests avec `redis-cli`.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un cluster **Redis** déployé dans votre projet Hikube
- Un mot de passe d'accès généré par la plateforme
- Une connexion fonctionnelle avec `redis-cli`

---

## Prérequis

- Un **compte Hikube** et un **projet** disposant de quotas suffisants (CPU, mémoire, stockage)
- Le client **`redis-cli`** installé sur votre poste, si vous souhaitez tester une connexion depuis Internet

---

## Étape 1 : Créer le cluster

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **Redis**. La page **Clusters Redis** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster Redis** s'ouvre.

---

## Étape 2 : Configurer et valider

L'assistant comporte quatre étapes : **Général**, **Configuration**, **Vérification** et **Résumé**.

### Général

Saisissez le **Nom du cluster**, par exemple `demo-cache` (3 à 16 caractères : minuscules, chiffres et tirets ; commence par une lettre, se termine par une lettre ou un chiffre). Cliquez sur **Suivant**.

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|----------------------------------|----------|
| **Version** | `8 (Latest)` | Versions proposées : 8 et 7 |
| **Préconfiguration** | `Small (1 CPU, 512Mi)` | Capacité allouée à chaque nœud |
| **Taille du volume (Go)** | `10` | Stockage alloué à chaque nœud |
| **Nombre de réplicas** | `3` | 1 à 8 ; 3 minimum pour le failover automatique |
| **Réseau public** | Activé | Nécessaire pour vous connecter depuis votre poste |
| **Activer l'authentification** | Activé | Active par défaut ; à conserver |

Le bandeau en haut de l'assistant affiche le **Coût estimé** et l'impact sur les quotas du projet. Cliquez sur **Suivant**.

:::warning
Le **Nombre de réplicas** ne peut plus être modifié après la création.
:::

### Vérification

Relisez le récapitulatif (**Nom**, **Version**, **Préconfiguration**, **Réplicas**, **Taille de stockage**, **Réseau** : **Public** ou **Privé**), puis cliquez sur **Déployer**.

---

## Étape 3 : Vérifier l'état

L'étape **Résumé** affiche « Cluster créé avec succès ». Cliquez sur **Terminer** pour revenir à la liste **Clusters Redis**, puis ouvrez le cluster.

| Statut | Signification |
|--------|---------------|
| **En création** | Le cluster est en cours de provisionnement |
| **Prêt** / **Actif** | Le cluster est opérationnel |
| **Erreur** / **Échec** | Le provisionnement a échoué |

**Résultat attendu :** après quelques minutes, la section **Connexion** de la page du cluster affiche le **Statut** **Prêt** et l'**Hôte** du cluster.

---

## Étape 4 : Récupérer les identifiants

Lorsque l'authentification est activée, l'étape **Résumé** de l'assistant affiche, dans **Identifiants des utilisateurs** :

- l'utilisateur **`default`** ;
- son **Mot de passe** ;
- la **Chaîne de connexion interne** : l'adresse du cluster, lorsque le réseau public est activé.

:::warning
Copiez le mot de passe immédiatement : il ne sera plus affiché. En cas de perte, générez-en un nouveau depuis la section **Sécurité** de la page du cluster (**Effectuer une rotation**). Voir [Renouveler le mot de passe](./how-to/rotate-password.md).
:::

L'adresse reste consultable dans la page du cluster, section **Connexion**, champ **Hôte** (bouton de copie à droite).

---

## Étape 5 : Connexion et tests

```bash
export REDIS_HOST=<hôte>
export REDISCLI_AUTH='<mot de passe>'

# Test PING
redis-cli -h "$REDIS_HOST" -p 6379 ping
# PONG

# Créer une clé
redis-cli -h "$REDIS_HOST" -p 6379 SET hello "hikube"
# OK

# Lire la clé
redis-cli -h "$REDIS_HOST" -p 6379 GET hello
# "hikube"
```

:::tip
La variable `REDISCLI_AUTH` évite de faire apparaître le mot de passe dans l'historique du shell, contrairement à l'option `-a`.
:::

---

## Étape 6 : Dépannage rapide

### L'hôte affiche « En attente d'attribution... »

Le réseau public est désactivé, ou l'adresse IP publique n'est pas encore attribuée. Activez **Accès externe** via **Modifier** si nécessaire, puis patientez quelques instants.

### `NOAUTH Authentication required` ou `WRONGPASS`

Le mot de passe est absent ou erroné. Vérifiez la variable `REDISCLI_AUTH`, ou générez un nouveau mot de passe depuis la section **Sécurité**.

### Le bouton Suivant reste inactif

La configuration dépasse les quotas du projet. Réduisez la préconfiguration, la taille du volume ou le nombre de réplicas.

### Le cluster reste en Erreur

[Contactez le support](mailto:support@hidora.io) en indiquant le nom du projet et du cluster.

---

## Étape 7 : Nettoyage

1. Ouvrez la page du cluster (**DB & Messaging** → **Redis** → nom du cluster).
2. Cliquez sur **Supprimer**.
3. Saisissez le nom exact du cluster dans le champ **Nom de la ressource à confirmer**, puis cliquez sur **Supprimer définitivement**.

:::warning
Cette action supprime le cluster Redis et toutes les données associées. Elle est **irréversible**.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster **Redis** répliqué, supervisé par Sentinel
- Un mot de passe d'accès
- Une connexion `redis-cli` via le réseau public

<NavigationFooter
  nextSteps={[
    {label: "Haute disponibilité", href: "../how-to/configure-ha"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Toutes les bases de données", href: "../../"},
  ]}
/>
