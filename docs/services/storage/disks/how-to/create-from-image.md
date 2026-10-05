---
title: "Comment créer un disque système à partir d'une image"
---

# Comment créer un disque système à partir d'une image

Un **disque système** contient un système d'exploitation pré-installé et peut servir de disque de démarrage à une VM. Ce guide explique comment le créer depuis la [console Hikube](https://console.hikube.cloud), à partir d'une image du catalogue ou de votre propre image.

## Prérequis

- Un **projet** avec un quota de stockage suffisant
- Pour une image personnalisée : une **URL HTTPS** publique vers un fichier ISO ou QCOW2

## Étapes

### 1. Ouvrir l'assistant

Ouvrez **Infrastructure** → **Disques** et cliquez sur **Créer un disque**. À l'étape **Général**, saisissez le **Nom du disque**.

### 2. Choisir la source

À l'étape **Source**, sélectionnez **Disque Système**. Le sélecteur **Image Système / Source** s'affiche :

- **Image du catalogue** : choisissez le système d'exploitation, puis sa **Version** ;
- **Image personnalisée** : cliquez sur **Image perso** et renseignez l'**URL de l'image (ISO/QCOW2)**. L'URL doit pointer vers un fichier brut ou compressé reconnu par le système.

Règles de validation de l'URL :

| Règle | Message de la console |
|-------|-----------------------|
| URL obligatoire | « L'URL est requise » |
| HTTPS uniquement | « L'URL doit utiliser le protocole HTTPS » |
| Pas d'adresse privée ou locale | « Les adresses IP privées ou locales ne sont pas autorisées » |

### 3. Configurer la taille et la sécurité

À l'étape **Configuration** :

- **Taille (Go)** : au moins 20 Go, et au moins **50 Go pour une image Windows** (la console ajuste la valeur automatiquement) ;
- **Type de réplication** : **Réplication Asynchrone** (Recommandé) ou **Réplication Synchrone** ;
- **Chiffrement du disque** : activez-le si nécessaire.

### 4. Vérifier et créer

À l'étape **Vérification**, la rubrique **Source & Contenu** indique **Disque Système** et l'image choisie (**Image Cloud : …** ou **Image personnalisée (ISO/QCOW2)** avec l'URL). Le **Coût estimé** inclut la licence pour une image Windows. Cliquez sur **Créer le disque**.

### 5. Suivre le téléchargement

Après la création, le disque passe par le statut **Téléchargement** : la plateforme importe l'image et la page du disque affiche la progression en pourcentage. Le disque passe ensuite à **Prêt**.

La page du disque indique l'image d'origine dans la section **Source**.

## Utiliser le disque système

Pour démarrer une VM sur ce disque, sélectionnez **Existant** sur le **Disque Système (Boot)** à l'étape **Stockage** de l'assistant de création de VM (voir [Attacher un disque à une VM](./attach-to-vm.md)).

:::note
L'image personnalisée (ISO) n'est possible que lors de la création d'un disque.
:::

## Vérification

- Le disque est au statut **Prêt**.
- Sa page affiche l'image d'origine (**Image système d'origine**) dans la section **Source**.

## Pour aller plus loin

- [Concepts](../concepts.md)
- [Dépannage](../troubleshooting.md)
