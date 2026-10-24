---
title: "Comment annuler une sauvegarde ou une restauration"
sidebar_position: 6
description: "Annulez une sauvegarde en cours ou une restauration de VM bloquée sur Hikube : ce qui peut être interrompu, ce qui ne peut pas l'être, et ce qui reste après l'annulation."
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Comment annuler une sauvegarde ou une restauration

Ce guide arrête une sauvegarde en cours, ou une restauration de VM ou de disque qui ne se termine pas, depuis la [console Hikube](https://console.hikube.cloud).

## Prérequis

- Pour l'onglet **API** : une clé d'API du projet (`admin` pour créer, modifier, lancer, restaurer ou supprimer ; `read` pour consulter) et les variables `HIKUBE_API`, `HIKUBE_API_KEY` et `PROJECT_ID` (voir [Préparer l'environnement](../../../api/quick-start.md#environnement)) ; les exemples utilisent `curl` et `jq`.

## Ce qui peut être annulé

| Opération | Annulable |
|-----------|-----------|
| Sauvegarde pas encore démarrée | Oui |
| Sauvegarde PostgreSQL | Tant qu'elle attend de démarrer. Une fois commencée, elle ne s'interrompt pas : elle se termine ou échoue d'elle-même. |
| Sauvegarde MariaDB | Oui |
| Sauvegarde de VM ou de disque | Oui, sauf dans les toutes premières secondes |
| Restauration de VM ou de disque | Oui, sauf dans les toutes premières secondes |
| Restauration PostgreSQL ou MariaDB | Non. Elle échoue d'elle-même au bout de 30 minutes si elle n'aboutit pas. |
| Opération terminée ou sur le point de se terminer | Non |

## Annuler une sauvegarde

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Repérez la sauvegarde en cours : section **État des exécutions** de l'onglet **Sauvegardes** de la ressource, ou **Sauvegardes** > **Activité**.
2. Cliquez sur **Annuler**.
3. Dans la fenêtre **Annuler la sauvegarde de « … » ?**, cliquez sur **Annuler la sauvegarde** (ou **Laisser continuer** pour renoncer).

La sauvegarde apparaît **Annulée** dans l'activité, et ne produit pas d'archive.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PUT "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/jobs/<nom-du-job>/cancel" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

L'exécution se termine en `failed`, avec le message « Backup cancelled. », et ne produit pas d'archive.

</TabItem>
</Tabs>

## Annuler une restauration de VM ou de disque

<Tabs groupId="interface">
<TabItem value="console" label="Console" default>

1. Dans la section **Restaurations** de l'onglet **Sauvegardes**, ou dans **Sauvegardes** > **Activité**, cliquez sur **Annuler la restauration**.
2. Confirmez avec **Annuler la restauration**.

</TabItem>
<TabItem value="api" label="API">

```bash
curl -sS -X PUT "$HIKUBE_API/backup/v1alpha1/projects/$PROJECT_ID/restores/<restauration>/cancel" \
  -H "X-Hikube-Api-Key: $HIKUBE_API_KEY"
```

La restauration se termine en `failed`, et son `message` dit ce qu'elle laisse en place.

</TabItem>
</Tabs>

:::warning Rien n'est défait
Les transferts en cours s'arrêtent, mais ce que la restauration a déjà fait reste en l'état : la VM peut rester arrêtée et ses disques mis de côté sous le nom `<disque>-orig-<identifiant>`, comme après un échec. C'est une nouvelle restauration qui rétablit la VM.
:::

## Quand l'annulation est refusée ou incomplète

Avec l'API, un refus porte le code `180216` (sauvegarde) ou `180223` (restauration), et une annulation à terminer le code `180015` : renvoyez la même requête.

| Message | Signification | Que faire |
|---------|---------------|-----------|
| **Annulation pas encore possible** | La VM ou le disque en est à copier sa configuration ; aucun transfert n'a encore commencé. | Cliquez sur **Réessayer** quelques secondes plus tard. |
| **Annulation refusée** | L'opération ne peut pas être interrompue (sauvegarde PostgreSQL commencée, restauration de base de données, opération terminée). Le message en donne la raison. | Attendez la fin de l'opération. |
| **Annulation à terminer** | L'opération est bien arrêtée, mais une partie du travail commencé n'a pas pu être stoppée du premier coup. | Cliquez sur **Réessayer**. Sinon, Hikube termine le nettoyage de lui-même dans les minutes qui suivent. |

## Pour aller plus loin

- [Restaurer une VM ou un disque](./restore-vm-or-disk.md)
- [Concepts : annulation](../concepts.md#annulation)
