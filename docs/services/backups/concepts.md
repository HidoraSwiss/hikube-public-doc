---
sidebar_position: 2
title: "Concepts — Sauvegardes"
sidebar_label: Concepts
description: "Comprenez les sauvegardes Hikube : destinations, rétention, buckets verrouillés, programmations en UTC, exécutions, archives restaurables, restauration en place ou vers une autre base, PITR PostgreSQL."
---

# Concepts — Sauvegardes

## Terminologie

| Terme | Description |
|-------|-------------|
| **Destination** | Un bucket S3 du projet, l'utilisateur de bucket dont elle emprunte les identifiants, et une durée de rétention en jours. Toute sauvegarde s'écrit dans une destination. |
| **Rétention** | Durée pendant laquelle une archive est conservée, de 1 à 3 650 jours. Passé ce délai, l'archive est supprimée automatiquement. |
| **Programmation** (plan) | Sauvegarde récurrente d'une ressource vers une destination, selon un horaire. |
| **Exécution** | Une sauvegarde en train de se faire, déclenchée par une programmation ou **à la demande**. Une exécution réussie produit une archive. |
| **Archive** | Copie stockée de l'état d'une ressource à un moment donné, d'où l'on restaure. |
| **Restauration** | Réécriture d'une ressource à partir d'une archive. |
| **Ressource source** | La base, la VM ou le disque sur lequel l'archive a été prise. |
| **Cible** | La ressource dans laquelle une restauration écrit : la source elle-même (restauration **en place**), ou une autre base du même type. |

---

## Ressources couvertes

| Type | Restauration en place | Restauration vers une autre ressource | Restauration à un instant précis | Supprimer une archive efface les données |
|------|:---:|:---:|:---:|:---:|
| PostgreSQL | Oui | Oui, vers une base PostgreSQL de la même version majeure | Oui | Non |
| MariaDB | Oui | Oui, vers une autre base MariaDB | Non | Non |
| Machine virtuelle | Oui | Non | Non | Oui |
| Disque | Seulement si le disque a été supprimé | Non | Non | Oui |

Les autres services (MongoDB, Redis, RabbitMQ, clusters Kubernetes, buckets) ne sont pas couverts.

### Une VM emporte ses disques

L'archive d'une machine virtuelle contient **tous les disques** de la VM. Ces disques n'ont donc pas besoin d'une programmation propre : dans l'onglet **Sauvegardes** d'un tel disque, la console indique **Sauvegardée avec une autre ressource**, et dans **Sauvegardes** > **Protection**, l'état **Couverte**. L'archive de la VM apparaît aussi dans la liste des archives du disque.

Restaurer cette archive réécrit la VM **et** tous ses disques : on ne peut pas n'en restaurer qu'une partie.

---

## Destinations

Une destination se crée dans **Sauvegardes** > **Destinations** > **Créer une destination**. Elle porte :

| Élément | Règle |
|---------|-------|
| **Nom** | 1 à 40 caractères : minuscules, chiffres et tirets, sans commencer ni finir par un tiret. Unique dans le projet. |
| **Bucket** | Un bucket S3 du **même projet**. Il faut en créer un avant la première destination. |
| **Identifiants** | Un utilisateur du bucket. La console propose d'en **créer un dédié** (recommandé : ses identifiants ne servent qu'aux sauvegardes et se révoquent sans toucher au reste) ou d'en réutiliser un. |
| **Rétention** | Nombre entier de jours, de 1 à 3 650. 30 jours par défaut dans la console. |

Une destination sert à toutes les ressources couvertes du projet. Seule la rétention se modifie après la création ; pour changer de bucket, créez une autre destination.

### États d'une destination

| État | Signification |
|------|---------------|
| **En préparation** | La destination est en cours de mise en place, ou de suppression. |
| **Prête** | La destination accepte programmations, sauvegardes et restaurations. |
| **En erreur** | Le bucket ou son utilisateur n'est plus lisible, ou une suppression n'a pas abouti. Le message indique la cause. |
| **Inconnu** | L'état n'a pas pu être lu ; réessayez dans un moment. |

Seule une destination **Prête** accepte une programmation, une sauvegarde ou une restauration. Des identifiants simplement erronés ne sont pas détectés à la création : pour les bases de données, l'erreur apparaît sur la première sauvegarde.

### Rétention

- Pour **MariaDB, les VM et les disques**, chaque archive garde la rétention en vigueur au moment où elle a été écrite. Modifier la rétention d'une destination ne change que les archives suivantes.
- Pour **PostgreSQL**, la rétention s'applique à tout l'historique de la base : l'abaisser peut supprimer des archives déjà écrites, dès la sauvegarde suivante.
- Une archive dont la rétention est écoulée est supprimée automatiquement, avec la ligne d'exécution qui l'a produite. La **dernière archive restaurable** d'une ressource est toujours conservée, quel que soit son âge. Une archive en cours de lecture par une restauration n'est jamais supprimée.
- Une archive de VM ou de disque arrivée en fin de rétention devient non restaurable dès son expiration, avant même d'être retirée de la liste.

### Bucket verrouillé (WORM)

Quand le bucket d'une destination a été créé avec le verrouillage d'objets, la console affiche **WORM · 365 j** à côté de la destination. Conséquences :

- chaque archive est verrouillée 365 jours après son écriture : personne ne peut la supprimer avant, pas même le support. La console affiche **Verrouillée (WORM) jusqu'au** sur l'archive ;
- la rétention de la destination ne peut pas être inférieure à la durée du verrou (365 jours) ;
- une archive verrouillée reste restaurable pendant toute la durée du verrou.

### PostgreSQL : une seule destination

Une base PostgreSQL archive ses journaux de transactions en continu, entre deux sauvegardes, vers **une seule** destination. Deux destinations sur une même base se partageraient ce flux : aucune des deux ne contiendrait d'historique complet, donc restaurable. Hikube refuse donc de sauvegarder une base PostgreSQL vers une seconde destination, que ce soit par programmation ou à la demande.

Pour garder des archives à des rythmes différents (par exemple quotidiennes et mensuelles), utilisez plusieurs programmations vers la **même** destination. Pour MariaDB, les VM et les disques, plusieurs destinations sont possibles.

---

## Programmations

Une programmation associe une ressource, une destination et un horaire. Le nom, la ressource et la destination sont fixés à la création ; seul l'horaire se modifie.

| Élément | Règle |
|---------|-------|
| **Nom du plan** | 1 à 40 caractères : minuscules, chiffres et tirets, sans commencer ni finir par un tiret. Unique dans le projet. |
| **Horaire** | Un préréglage (**Toutes les heures**, **Chaque jour**, **Chaque semaine**) ou une expression cron à cinq champs. |
| **Fréquence maximale** | Une exécution par heure. |

### Horaires et fuseau horaire

L'horaire d'une programmation est **enregistré en UTC**.

- Avec l'onglet **Préréglage**, vous choisissez une heure **locale** ; la console la convertit en UTC au moment de l'enregistrement.
- Avec l'onglet **Expression cron**, vous saisissez directement une expression **en UTC**, par exemple `30 1 * * *` pour 01:30 UTC chaque jour. `@hourly`, `@daily`, `@weekly`, `@monthly` et `@yearly` sont acceptés ; les intervalles (`@every`) et les préfixes de fuseau horaire (`CRON_TZ=`, `TZ=`) sont refusés.
- L'horaire étant fixe en UTC, une sauvegarde programmée **se décale d'une heure en heure locale** à chaque changement d'heure. La console l'indique et affiche la **Prochaine exécution** en heure locale.

### États d'une programmation

| État | Signification |
|------|---------------|
| **Prête** | L'horaire est valide, la ressource et la destination existent. |
| **En erreur** | L'horaire n'est pas valide, ou la ressource ou la destination n'existe plus. Le message indique laquelle. |
| **Inconnu** | L'état n'a pas pu être lu. |

Supprimer une programmation arrête les exécutions futures et **conserve les archives** déjà prises. L'historique des exécutions de cette programmation disparaît avec elle.

---

## Exécutions

Une exécution passe par les états **En attente**, **En cours**, puis **Réussie** ou **Échouée**. Une exécution que vous avez annulée s'affiche **Annulée**.

- Pour une VM ou un disque, la console affiche le pourcentage de **données transférées**. Ce chiffre mesure les données lues, pas la place occupée dans le bucket : les blocs déjà présents dans une archive précédente ne sont pas réécrits.
- Pour PostgreSQL et MariaDB, aucune progression n'est disponible.

---

## Archives

### États d'une archive

| État | Signification |
|------|---------------|
| **En attente** | L'archive est en cours d'écriture. |
| **Prête** | L'archive est complète. |
| **Échouée** | La sauvegarde n'a pas abouti ; l'archive n'est pas restaurable. |

### Archive restaurable ou non

Une archive **Prête** n'est restaurable que si sa destination existe encore, n'est pas en cours de suppression et est bien celle où l'archive a été écrite. Quand ce n'est pas le cas, la console affiche la raison :

| Raison affichée | Ce qu'il faut faire |
|-----------------|---------------------|
| L'archive n'est pas prête | Attendre la fin de l'écriture, ou utiliser une autre archive si la sauvegarde a échoué. |
| Sa destination a été supprimée | L'archive ne redevient pas restaurable, même en recréant une destination du même nom. Utilisez une archive plus récente. |
| Sa destination est en cours de suppression | Utilisez une autre archive. |
| La destination de ce nom a été recréée après la sauvegarde | Ce n'est plus la destination où l'archive a été écrite, même si elle pointe vers le même bucket. Utilisez une archive prise depuis. |
| Les destinations n'ont pas pu être lues | Réessayez dans un moment. |
| Les données de l'archive ne sont plus stockées | VM et disques : l'archive a été effacée, par exemple en fin de rétention. |

Restaurable signifie que la restauration sera acceptée ; Hikube ne relit pas le contenu du bucket pour le vérifier.

### Supprimer une archive

| Type | Effet | Confirmation |
|------|-------|--------------|
| PostgreSQL, MariaDB | Retire l'archive de la liste ; ses données **restent dans votre bucket**. | Simple |
| Machine virtuelle, disque | Retire l'archive **et efface ses données**. C'est irréversible. | Saisie du nom de l'archive |

Une archive en cours de lecture par une restauration ne peut pas être supprimée. Une archive verrouillée par un bucket WORM non plus, jusqu'à la fin de son verrou.

---

## Restaurations

### Restauration en place ou vers une autre base

- **En place** : l'archive est restaurée sur sa ressource source, dont le contenu actuel est écrasé. La console demande de saisir le nom de la ressource pour confirmer.
- **Vers une autre base** (PostgreSQL et MariaDB uniquement) : l'archive est restaurée dans une autre base **existante** du projet, du même type. Pour obtenir une copie, créez d'abord une base vide, puis restaurez-y l'archive.
  - **PostgreSQL** : la base cible est entièrement remplacée par le contenu de l'archive. Elle doit avoir la **même version majeure** de PostgreSQL que la base sauvegardée.
  - **MariaDB** : l'archive est un export rejoué dans la base cible. Chaque table qu'elle contient remplace la table du même nom ; les tables et bases qu'elle ne contient pas sont conservées.

Une restauration à la fois par ressource. Pendant une restauration, aucune sauvegarde à la demande de cette ressource n'est acceptée.

### Ressource source supprimée ou recréée

| Situation | PostgreSQL, MariaDB | VM, disque |
|-----------|---------------------|------------|
| La source a été supprimée | Choisissez une autre base comme cible. | La restauration **recrée** la ressource à partir de l'archive. |
| Une nouvelle ressource porte le nom de la source, créée après la sauvegarde | Elle est traitée comme une autre base : la restauration est acceptée après confirmation. | Refusé : supprimez d'abord la ressource recréée, puis restaurez. |

### Restauration d'une VM : les disques remplacés

Restaurer une VM en place remplace chacun de ses disques par sa copie de l'archive. Le choix **Les disques actuels de cette machine** décide du sort de ce qu'ils contenaient jusqu'ici :

- **Les supprimer** (par défaut) : leur ancien contenu est supprimé une fois la restauration réussie et vérifiée.
- **Les garder** : leur ancien contenu devient un disque à part, nommé `<disque>-orig-<identifiant>`, détaché de toute VM, listé dans **Disques** et facturé comme tout disque jusqu'à ce que vous le supprimiez.

Une restauration qui échoue ou qui est annulée ne supprime **rien**, même avec **Les supprimer** : les anciens disques sont alors gardés sous ce même nom `<disque>-orig-<identifiant>`, et le message de la restauration le dit. Supprimez-les quand vous n'en avez plus besoin.

Avant de passer à **Réussie**, une restauration de VM ou de disque vérifie que chaque disque de l'archive a bien été réécrit. Pendant cette vérification (quelques secondes), elle reste **En cours**. Si un disque n'a pas été restauré, la restauration passe à **Échouée** en le nommant ; relancer la restauration peut réussir.

### Un disque ne se restaure pas sur lui-même

L'archive d'un disque sauvegardé seul ne peut pas être restaurée sur ce disque tant qu'il existe. Pour revenir à un état antérieur d'un disque attaché à une VM, restaurez une archive **de la VM** : elle réécrit tous ses disques. Un disque supprimé, lui, est recréé par la restauration de son archive.

### Annulation

| Opération | Annulable | Remarques |
|-----------|-----------|-----------|
| Sauvegarde pas encore démarrée | Oui, tous types | |
| Sauvegarde PostgreSQL | Tant qu'elle attend de démarrer | Une sauvegarde PostgreSQL commencée ne s'interrompt pas : elle se termine ou échoue d'elle-même. |
| Sauvegarde MariaDB | Oui | |
| Sauvegarde de VM ou de disque | Oui | Dans les premières secondes, pendant la copie de la configuration, l'annulation est refusée : réessayez quelques secondes plus tard. |
| Restauration PostgreSQL ou MariaDB | Non | Une restauration de base qui n'aboutit pas échoue d'elle-même au bout de 30 minutes. |
| Restauration de VM ou de disque | Oui | Rien n'est défait : la VM peut rester arrêtée et ses disques mis de côté. Une nouvelle restauration la rétablit. |

Une sauvegarde annulée s'affiche **Annulée** dans l'activité, pas comme un échec, et ne produit pas d'archive.

---

## Restauration à un instant précis (PostgreSQL)

Une base PostgreSQL sauvegardée archive en continu ses **journaux de transactions** vers sa destination. Une restauration peut donc ramener la base :

| Choix | Résultat |
|-------|----------|
| **État de la sauvegarde** (par défaut) | L'état exact de l'archive choisie. |
| **État le plus récent** | L'archive, puis tous les journaux archivés depuis : l'état le plus récent connu. |
| **Un instant** | L'état de la base juste avant la première transaction postérieure à l'instant choisi. |

### Fenêtre de restauration

Chaque archive PostgreSQL a une **fenêtre** d'instants atteignables, que la console affiche sur une frise :

- elle commence à la **fin** de la sauvegarde (pas à son début : la base n'est cohérente qu'une fois la sauvegarde terminée) ;
- elle se termine **avant la dernière transaction** présente dans les journaux archivés. Un instant postérieur à la dernière transaction ne peut pas être atteint, car la restauration s'arrête sur la première transaction qui le suit : choisissez alors **État le plus récent**, qui inclut cette dernière transaction ;
- les journaux sont archivés avec un léger décalage : les toutes dernières minutes ne sont pas encore restaurables.

### Branches de l'historique

Restaurer une base PostgreSQL **en place** démarre une nouvelle **branche** de son historique. Les archives prises avant cette restauration appartiennent à l'ancienne branche. Si, depuis une archive, l'état le plus récent ou un instant donné devait partir d'une archive d'une autre branche, il ne rendrait pas les données de l'archive choisie : la console ne propose pas ces instants, et la restauration est refusée. Choisissez un instant plus ancien, ou une archive de la branche voulue.

---

## Cycle de vie

| Action | Comportement |
|--------|--------------|
| Créer une destination | **En préparation**, puis **Prête**. |
| Modifier la rétention | Voir [Rétention](#rétention). Impossible sous la durée du verrou d'un bucket WORM. |
| Supprimer une destination | Refusé tant qu'une programmation, une sauvegarde ou une restauration l'utilise. Les archives restent dans le bucket mais ne sont plus restaurables ; pour PostgreSQL, leur rétention cesse d'être appliquée. |
| Supprimer une programmation | Les exécutions futures s'arrêtent ; les archives sont conservées. |
| Supprimer une archive | Voir [Supprimer une archive](#supprimer-une-archive). |
| Supprimer une ressource sauvegardée | Ses archives sont conservées et restent restaurables. |

---

## Pour aller plus loin

- [Vue d'ensemble](./overview.md)
- [Démarrage rapide](./quick-start.md)
- [Restaurer une base à un instant précis](./how-to/restore-point-in-time.md)
