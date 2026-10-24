---
sidebar_position: 2
title: Authentification
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Authentification par clé d'API

Un client de l'API publique (script, pipeline CI/CD, outil d'automatisation) s'authentifie avec une **clé d'API**. Une clé appartient à un **projet** et donne, sur ce seul projet, les droits de ses **scopes**.

:::warning Préversion
Les clés d'API font partie de la préversion de l'API publique. Leur gestion depuis la console arrive bientôt ; en attendant, voir [Obtenir une clé](#obtenir).
:::

---

## Présenter la clé

La clé se transmet dans l'en-tête `X-Hikube-Api-Key`, à chaque requête :

```bash
curl -sS "$HIKUBE_API/instance/v1alpha1/projects/$PROJECT_ID/instances" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

N'utilisez pas l'en-tête `Authorization` : il est réservé aux sessions de la console. Si une requête porte les deux, c'est la clé d'API qui s'applique.

Une clé a la forme `sk_hk_<keyId>_<secret>` :

- `sk_hk_` est un préfixe fixe, qui permet aux outils de détection de secrets de reconnaître une clé Hikube oubliée dans un dépôt ou un journal ;
- `<keyId>` identifie la clé (32 caractères hexadécimaux) ; il figure dans la liste des clés du projet et sert à la révoquer ;
- `<secret>` est la partie secrète. Hikube n'en conserve qu'une empreinte : le secret n'est affiché **qu'une seule fois**, à la création de la clé, et ne peut pas être retrouvé ensuite.

---

## Scopes

Une clé porte un ou plusieurs scopes. Chaque scope correspond à un niveau de droits sur le projet, du plus faible au plus fort ; un scope inclut les droits des scopes inférieurs.

| Scope | Correspond au rôle | Usage |
|-------|--------------------|-------|
| `read` | Lecture | Toutes les opérations `GET` : ressources, état, catalogues |
| `write` | Utilisation | Les droits de `read`. Aucune opération de l'API publique ne demande aujourd'hui `write` seul |
| `admin` | Administration | Créer, modifier et supprimer des ressources ; démarrer, arrêter ou redémarrer une VM ; créer des utilisateurs et faire tourner leurs mots de passe |
| `superadmin` | Super-administration | Tous les droits sur le projet |

Pour un pipeline qui déploie des ressources, il faut donc une clé `admin`. Pour un outil de supervision ou d'inventaire, une clé `read` suffit.

:::warning Une clé `read` reste un secret
Toute clé d'API est un secret, quels que soient ses scopes : ne la partagez pas et conservez-la dans un gestionnaire de secrets.
:::

Une clé n'a jamais plus de droits que ses scopes, quels que soient les droits de la personne qui l'a créée. Inversement, une clé garde ses scopes si cette personne perd les siens : pour retirer un accès, révoquez la clé.

:::tip Moindre privilège
Donnez à chaque clé le scope le plus faible qui suffit à son usage, et une clé par usage (un pipeline, un outil) : vous pourrez révoquer l'une sans couper les autres.
:::

---

## Validité

Toute clé expire. Sa durée de validité est choisie à la création parmi :

| Valeur | Durée |
|--------|-------|
| `1d` | 1 jour |
| `7d` | 7 jours |
| `30d` | 30 jours |
| `90d` | 90 jours (par défaut) |
| `180d` | 180 jours |
| `365d` | 1 an (maximum) |

Il n'existe pas de clé sans date d'expiration. Une clé expirée est refusée comme une clé invalide. Une intégration de longue durée doit donc prévoir le remplacement de sa clé avant l'expiration : créez la nouvelle clé, déployez-la, puis révoquez l'ancienne.

La liste des clés d'un projet indique, pour chaque clé, sa date d'expiration (`expiresAt`) et sa dernière utilisation (`lastUsedAt`, à la minute près) : c'est le moyen de repérer une clé qui ne sert plus avant de la révoquer.

---

## Limites

- **Une clé, un projet.** Une clé n'agit que sur son projet. Une requête qui vise un autre projet, ou l'organisation, est refusée.
- **Opérations accessibles.** Une clé n'appelle que les opérations de la [référence de l'API](./reference/hikube-api.info.mdx). La gestion du compte, de l'organisation, des projets, des membres et des clés elles-mêmes reste réservée à la console : **une clé ne peut pas créer ni révoquer de clé**.
- **Nombre de clés par projet.** Le nombre de clés actives d'un projet est limité selon l'offre de l'organisation : **1** pour l'offre d'essai Starter, **16** pour l'offre Entreprise. Les clés expirées ne comptent pas. Au-delà, la création est refusée (code `60009`) ; révoquez une clé pour libérer une place, ou contactez le support pour adapter la limite.
- **Qui gère les clés.** Seuls les administrateurs du projet, ou de son organisation, créent, listent et révoquent les clés d'un projet. Personne ne peut créer une clé dont les scopes dépassent ses propres droits (code `60003`).

:::note Offre Starter
Avec une seule clé autorisée, le remplacement d'une clé impose une courte coupure : révoquez l'ancienne avant de créer la nouvelle.
:::

---

## Obtenir une clé {#obtenir}

La création et la révocation des clés seront bientôt disponibles dans la console, pour les administrateurs du projet ou de l'organisation.

En attendant, demandez la clé au [support](mailto:support@hidora.io) en précisant :

- l'organisation et le projet concernés ;
- un nom pour la clé (par exemple `ci-deploiement`) ;
- les scopes souhaités (`read`, `write`, `admin` ou `superadmin`) ;
- la durée de validité (`1d` à `365d`, `90d` par défaut).

La demande doit venir d'un administrateur du projet ou de l'organisation. Le support vous transmet la clé, affichée une seule fois, avec l'identifiant du projet (`projectId`) dont vous aurez besoin dans les chemins de l'API.

---

## Révoquer une clé

Une clé révoquée est refusée dès la requête suivante. Révoquez une clé :

- dès qu'elle a pu fuiter (commit, journal, capture d'écran, poste perdu) ;
- quand l'outil qui l'utilisait est retiré ;
- quand la personne ou l'équipe qui en avait la charge change.

En attendant l'écran de gestion des clés dans la console, la révocation se demande au [support](mailto:support@hidora.io), avec le `keyId` de la clé (la partie entre `sk_hk_` et le dernier `_`). Ne transmettez jamais le secret.

Les clés d'un projet supprimé sont refusées dès la suppression, puis effacées.

---

## Bonnes pratiques

- **Stockez la clé dans un gestionnaire de secrets** (Vault, gestionnaire de mots de passe d'équipe, secrets de votre plateforme CI/CD), jamais dans un dépôt Git, une image de conteneur, un fichier de configuration versionné ou un ticket.
- **En CI/CD**, déclarez la clé comme variable secrète masquée et protégée, limitée aux branches ou environnements qui en ont besoin. Exemple GitLab CI :

  ```yaml title=".gitlab-ci.yml"
  deploy:
    stage: deploy
    image: alpine:3.20
    # HIKUBE_API_KEY : variable CI/CD masquée et protégée, définie dans les
    # paramètres du projet GitLab. PROJECT_ID n'est pas un secret.
    variables:
      HIKUBE_API: "<URL de base de l'API>"   # voir « Vue d'ensemble »
      PROJECT_ID: "<project_id>"
    script:
      - apk add --no-cache curl jq
      - >
        curl -sS --fail-with-body
        "$HIKUBE_API/disk/v1alpha1/projects/$PROJECT_ID/disks"
        -H "X-Hikube-Api-Key: $HIKUBE_API_KEY" | jq '.totalCount'
  ```

- **Ne journalisez pas la clé** : évitez `curl -v` et `set -x` dans les scripts qui la manipulent, qui affichent les en-têtes.
- **Une clé par usage**, avec le scope minimal et la durée la plus courte compatible avec l'usage.
- **Surveillez l'expiration** et planifiez le remplacement des clés de longue durée.
- **Réagissez à une fuite** en révoquant la clé d'abord, puis en cherchant où elle a été utilisée.

<NavigationFooter
  nextSteps={[
    {label: "Démarrage rapide", href: "../quick-start"},
    {label: "Erreurs", href: "../errors"},
  ]}
  seeAlso={[
    {label: "Vue d'ensemble de l'API", href: "../overview"},
  ]}
/>
