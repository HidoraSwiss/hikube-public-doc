---
title: "Comment programmer des sauvegardes et sauvegarder à la demande"
sidebar_position: 2
description: "Programmez la sauvegarde récurrente d'une base, d'une VM ou d'un disque Hikube, lancez une sauvegarde à la demande et repérez les ressources non protégées."
---

# Comment programmer des sauvegardes et sauvegarder à la demande

Ce guide programme la sauvegarde récurrente d'une ressource depuis la [console Hikube](https://console.hikube.cloud), lance une sauvegarde immédiate, et montre comment repérer les ressources qui ne sont pas protégées.

## Prérequis

- Une destination **Prête** dans le projet (voir [Créer une destination](./create-destination.md)).
- Une base PostgreSQL ou MariaDB, une VM ou un disque.

## Programmer une sauvegarde

1. Ouvrez la ressource (par exemple **PostgreSQL** > votre base, ou **Instances VM** > votre VM), puis son onglet **Sauvegardes**.
2. Dans la carte **Programmation**, cliquez sur **Programmer**.
3. Dans la fenêtre **Programmer une sauvegarde** :
   - **Nom du plan** : minuscules, chiffres et tirets, 40 caractères au plus ;
   - **Destination** : une destination **Prête** ;
   - l'horaire, de l'une des deux façons ci-dessous.
4. Cliquez sur **Programmer**.

### Horaire par préréglage

Onglet **Préréglage**, choisissez une **Fréquence** :

| Fréquence | Champs |
|-----------|--------|
| **Toutes les heures** | **Minute** |
| **Chaque jour** | **Heure**, **Minute** |
| **Chaque semaine** | **Jour**, **Heure**, **Minute** |

L'heure est saisie en **heure locale** et convertie en UTC à l'enregistrement. La console affiche l'expression obtenue suivie de **(UTC)**, et la **Prochaine exécution**.

### Horaire en expression cron

Onglet **Expression cron**, saisissez une expression à cinq champs (minute, heure, jour du mois, mois, jour de la semaine), **interprétée en UTC** :

| Expression | Signification |
|------------|---------------|
| `0 1 * * *` | Chaque jour à 01:00 UTC |
| `30 2 * * 0` | Chaque dimanche à 02:30 UTC |
| `0 3 1 * *` | Le 1er de chaque mois à 03:00 UTC |
| `@daily` | Chaque jour à 00:00 UTC |

Sont refusés : une expression qui se déclenche plus d'une fois par heure (par exemple `*/30 * * * *`), les intervalles `@every`, et les préfixes de fuseau horaire `CRON_TZ=` ou `TZ=`.

:::note Changement d'heure
Un horaire est fixe en UTC : il se décale d'une heure en heure locale à chaque changement d'heure. Une sauvegarde programmée à 02:00 en hiver à Zurich s'exécute à 03:00 en été.
:::

## Modifier ou supprimer une programmation

- **Modifier** : seul l'horaire se modifie. Le nom, la ressource et la destination sont fixés à la création ; pour changer de destination, supprimez la programmation et créez-en une autre.
- **Supprimer** : les exécutions futures s'arrêtent et les archives déjà prises sont conservées. L'historique des exécutions de cette programmation disparaît avec elle.

Une ressource peut avoir plusieurs programmations, par exemple une quotidienne et une mensuelle.

:::warning PostgreSQL : une seule destination
Toutes les programmations et sauvegardes d'une même base PostgreSQL doivent viser la **même** destination. Une seconde destination est refusée. Voir [Concepts](../concepts.md#postgresql--une-seule-destination).
:::

## Sauvegarder maintenant

1. Dans l'onglet **Sauvegardes** de la ressource, section **Sauvegarde à la demande**, choisissez la **Destination** si plusieurs sont prêtes.
2. Cliquez sur **Sauvegarder maintenant**.

La sauvegarde apparaît dans **État des exécutions**. Pour une VM ou un disque, la console affiche le pourcentage de données transférées.

Une sauvegarde à la demande est refusée pendant une restauration de la même ressource.

## Sauvegarder les disques d'une VM

L'archive d'une VM contient tous ses disques : il suffit de programmer la VM. Dans l'onglet **Sauvegardes** d'un disque attaché, la console indique alors **Sauvegardée avec une autre ressource**. Une programmation propre au disque reste possible (**Programmer une sauvegarde de cette ressource**), mais une telle archive ne se restaure pas sur le disque tant qu'il existe : voir [Restaurer une VM ou un disque](./restore-vm-or-disk.md).

## Repérer les ressources non protégées

Ouvrez **Sauvegardes** > **Protection**. Chaque ressource couverte du projet y figure avec son état :

| État | Signification |
|------|---------------|
| **Programmée** | Au moins une programmation valide. |
| **Couverte** | Pas de programmation propre, mais contenue dans les archives d'une autre ressource (disque d'une VM programmée). |
| **Programmation en erreur** | Toutes ses programmations sont en erreur. |
| **Non protégée** | Aucune programmation. |

Le bouton **Programmer** de cette page ouvre directement la fenêtre de programmation. Le widget **État des sauvegardes** du tableau de bord résume les applications sans protection, les derniers runs en échec et les destinations indisponibles.

## Vérification

- La carte **Programmation** affiche l'horaire, la **Prochaine** et la **Dernière** exécution.
- **Sauvegardes** > **Activité** liste chaque exécution avec son statut et sa durée.

## Pour aller plus loin

- [Gérer les archives](./manage-archives.md)
- [Annuler une sauvegarde ou une restauration](./cancel-backup-or-restore.md)
