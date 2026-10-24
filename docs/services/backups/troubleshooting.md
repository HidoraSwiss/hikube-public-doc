---
sidebar_position: 7
title: "Dépannage — Sauvegardes"
sidebar_label: Dépannage
description: "Résolvez les problèmes courants des sauvegardes Hikube : destination en erreur, programmation refusée, sauvegarde échouée, archive non restaurable, restauration refusée, et signification des codes 180xxx."
---

# Dépannage — Sauvegardes

### La destination est en erreur

**Cause** : le bucket ou son utilisateur n'est plus lisible (supprimé, ou identifiants révoqués), ou une suppression de la destination n'a pas abouti.

**Solution** :

1. Lisez le message de la destination dans l'onglet **Destinations**.
2. Vérifiez dans **Buckets S3** que le bucket et l'utilisateur existent toujours.
3. Si une suppression n'a pas abouti, le message indique ce qui n'a pas pu être libéré : supprimez la destination à nouveau.
4. Si le problème persiste, contactez le [support](mailto:support@hidora.io) en indiquant le nom de la destination.

---

### La destination reste En préparation

**Cause** : la mise en place n'est pas terminée.

**Solution** : patientez quelques instants, la liste se met à jour d'elle-même. Si l'état ne passe pas à **Prête** après quelques minutes, contactez le [support](mailto:support@hidora.io).

---

### La rétention est refusée

**Cause** : la valeur n'est pas un nombre entier de jours entre 1 et 3 650, ou elle est plus courte que le verrou d'un bucket WORM.

**Solution** : sur un bucket WORM, saisissez au moins 365 jours ; la console indique le minimum exact.

---

### La programmation est refusée

| Cause | Solution |
|-------|----------|
| L'expression cron n'a pas cinq champs, ou utilise `@every`, `CRON_TZ=` ou `TZ=` | Utilisez une expression à cinq champs en UTC, ou un préréglage. |
| L'horaire se déclenche plus d'une fois par heure | Espacez les exécutions d'au moins une heure. |
| **Aucune destination prête dans ce projet** | Créez une destination, ou attendez qu'elle soit **Prête**. |
| La destination est en cours de suppression | Choisissez une autre destination. |
| Une base PostgreSQL est déjà sauvegardée vers une autre destination | Utilisez la même destination que ses programmations existantes. |
| Le nom du plan existe déjà, ou ne respecte pas les règles | Choisissez un autre nom : minuscules, chiffres et tirets, 40 caractères au plus. |

---

### La programmation est en erreur

**Cause** : l'horaire n'est plus valide, ou la ressource ou la destination a été supprimée. Le message de la programmation indique laquelle.

**Solution** : supprimez la programmation et créez-en une nouvelle avec une destination **Prête**.

---

### Une sauvegarde échoue

**Solution** :

1. Ouvrez **Sauvegardes** > **Activité** et lisez le **Message** de l'exécution.
2. Vérifiez que la destination est **Prête** et que l'utilisateur du bucket a toujours accès au bucket.
3. Vérifiez qu'il reste de la place dans le bucket et dans le quota de stockage objet du projet.
4. Relancez avec **Sauvegarder maintenant**.
5. Si l'échec se répète, contactez le [support](mailto:support@hidora.io) avec le nom de l'exécution.

---

### La première sauvegarde d'une base PostgreSQL échoue

**Cause** : lors de sa toute première sauvegarde, et de la première après une restauration en place, la base est reconfigurée pour l'archivage de ses journaux et redémarre brièvement. Cette sauvegarde peut échouer.

**Solution** : relancez la sauvegarde avec **Sauvegarder maintenant** ; les suivantes réussissent.

---

### Une sauvegarde à la demande est refusée

| Cause | Solution |
|-------|----------|
| Une restauration de la ressource est en cours | Attendez la fin de la restauration. |
| La base PostgreSQL n'est pas encore prête après une restauration qui a échoué | Attendez que la base soit prête, ou restaurez-la à nouveau : c'est ce qui la rétablit. |
| La destination n'est pas **Prête**, ou est en cours de suppression | Choisissez une autre destination. |
| Une base PostgreSQL est déjà sauvegardée vers une autre destination | Choisissez la destination de ses programmations. |

---

### Une archive n'est pas restaurable

Voir [Savoir si une archive est restaurable](./how-to/manage-archives.md#savoir-si-une-archive-est-restaurable).

---

### Une restauration est refusée

| Cause | Solution |
|-------|----------|
| Une restauration de cette ressource est déjà en cours | Attendez qu'elle se termine. |
| La base d'origine n'existe plus | Choisissez une autre base comme cible. |
| La VM ou le disque a été recréé sous le même nom depuis la sauvegarde (ou l'un des disques de la VM) | Supprimez la ressource recréée, puis restaurez : la restauration la recrée depuis l'archive. |
| Disque sauvegardé seul, restauré sur lui-même alors qu'il existe | Restaurez une archive de la VM qui porte le disque. |
| Versions majeures PostgreSQL différentes | Restaurez vers une base PostgreSQL de la même version majeure que la base sauvegardée. |
| **Aucune transaction après cet instant** | Restaurez l'état le plus récent : l'état obtenu est le même. |
| Instant hors de la fenêtre de restauration | Choisissez un instant dans les bornes affichées. |
| La restauration partirait d'une autre branche de l'historique | Choisissez un instant plus ancien, ou une archive de la branche voulue. |
| Ce que rendrait la restauration ne peut pas être garanti | Réessayez plus tard. |
| L'archivage des journaux ne fonctionne pas sur la base | Restaurez l'état de la sauvegarde, sans instant. |

---

### La restauration de la VM ne se termine pas

**Cause** : un transfert est bloqué. Une restauration de VM ne s'arrête pas d'elle-même.

**Solution** : annulez-la avec **Annuler la restauration** (voir [Annuler une sauvegarde ou une restauration](./how-to/cancel-backup-or-restore.md)), puis relancez une restauration. Si la VM reste arrêtée, c'est cette nouvelle restauration qui la rétablit.

---

### La restauration de la VM a échoué en nommant un disque

**Cause** : un disque de l'archive n'a pas été réécrit. Le message indique ce que contient ce disque.

**Solution** : relancez la restauration. Les disques mis de côté ont été gardés sous le nom `<disque>-orig-<identifiant>` : supprimez-les depuis **Disques** une fois la restauration réussie.

---

### Des disques `-orig-` apparaissent dans la liste des disques

**Cause** : une restauration de VM avec **Les garder**, ou une restauration qui a échoué ou a été annulée, a conservé l'ancien contenu des disques.

**Solution** : ces disques sont facturés comme tous les autres. Récupérez-en ce qui vous est utile, puis supprimez-les depuis **Disques**. La section **Restaurations** indique quelle restauration les a créés.

---

### Une archive ne peut pas être supprimée

| Cause | Solution |
|-------|----------|
| **« … » est verrouillée** (destination WORM) | Attendez la date de fin du verrou affichée. |
| Une restauration lit cette archive | Attendez la fin de la restauration. |

---

### La destination ne peut pas être supprimée

**Cause** : **Cette destination est encore utilisée par un plan, un run ou une restauration.**

**Solution** : supprimez les programmations qui l'utilisent, et attendez la fin des sauvegardes et restaurations en cours.

---

## Codes de refus

Chaque refus du service de sauvegarde porte un code à six chiffres commençant par `180`. Si vous contactez le support, indiquez-le avec le message.

| Code | Signification | Que faire |
|------|---------------|-----------|
| 180001 | Destination introuvable | Vérifiez le nom de la destination. |
| 180002 | Programmation introuvable | Vérifiez le nom de la programmation. |
| 180003 | Exécution introuvable | Elle a pu être supprimée avec sa programmation ou à la fin de sa rétention. |
| 180004 | Archive introuvable | Elle a pu être supprimée, ou retirée à la fin de sa rétention. |
| 180005 | Restauration introuvable | Vérifiez le nom de la restauration. |
| 180006 | Une destination porte déjà ce nom | Choisissez un autre nom. |
| 180007 | Une programmation porte déjà ce nom | Choisissez un autre nom. |
| 180008 | Conflit avec une modification simultanée | Réessayez. |
| 180009 | Service momentanément indisponible | Réessayez dans un moment. |
| 180010 | La mise en place a échoué | Réessayez ; contactez le support si l'erreur persiste. |
| 180011 | Bucket introuvable dans le projet | Choisissez un bucket du même projet. |
| 180012 | Utilisateur introuvable sur ce bucket | Choisissez un utilisateur de ce bucket, ou créez-en un. |
| 180013 | Ressource introuvable | Vérifiez que la base, la VM ou le disque existe. |
| 180014 | Suppression de la destination incomplète | Supprimez-la à nouveau. |
| 180015 | Annulation incomplète | Annulez à nouveau pour terminer. |
| 180101 | Nom de destination invalide | Minuscules, chiffres et tirets, 40 caractères au plus. |
| 180102 | Nom de programmation invalide | Minuscules, chiffres et tirets, 40 caractères au plus. |
| 180103 | Rétention hors limites | De 1 à 3 650 jours. |
| 180105 | Horaire illisible, intervalle ou fuseau horaire | Expression cron à cinq champs ou `@hourly`, `@daily`, `@weekly`, `@monthly`, `@yearly`, en UTC. |
| 180106 | Horaire trop fréquent | Au plus une exécution par heure. |
| 180107 | Type de ressource non couvert | Seules PostgreSQL, MariaDB, les VM et les disques se sauvegardent. |
| 180109 | Confirmation manquante | Confirmez l'opération destructive. |
| 180200 | Destination pas prête | Attendez qu'elle soit **Prête**. |
| 180201 | Destination encore utilisée | Supprimez d'abord ses programmations ; attendez la fin des opérations en cours. |
| 180204 | Archive non restaurable | Le message indique la raison. |
| 180205 | Restauration en cours sur cette ressource | Attendez sa fin. |
| 180206 | La cible n'est pas du même type que l'archive | Choisissez une base du même type. |
| 180207 | Instant précis ou état le plus récent demandé hors PostgreSQL | Réservé à PostgreSQL. |
| 180208 | Restauration vers une autre ressource impossible pour une VM ou un disque | Restaurez sur la ressource d'origine. |
| 180209 | Destination en cours de suppression | Choisissez une autre destination. |
| 180210 | Archive en cours de lecture par une restauration | Attendez la fin de la restauration. |
| 180211 | La ressource d'origine n'existe plus | Choisissez une autre base comme cible. |
| 180212 | Base PostgreSQL déjà sauvegardée vers une autre destination | Utilisez la même destination. |
| 180213 | Aucun disque d'origine à garder | **Les garder** ne s'applique qu'à une VM restaurée sur elle-même. |
| 180214 | Instant hors de la fenêtre de restauration | Choisissez un instant dans les bornes affichées. |
| 180215 | Archivage des journaux interrompu | Restaurez l'état de la sauvegarde. |
| 180216 | Sauvegarde non annulable | Attendez sa fin. |
| 180217 | Archive verrouillée par un bucket WORM | Attendez la fin du verrou. |
| 180218 | Rétention plus courte que le verrou du bucket | Au moins 365 jours. |
| 180219 | Aucune transaction après l'instant demandé | Restaurez l'état le plus récent : c'est le même. |
| 180220 | L'état de l'archive ne peut pas être vérifié maintenant | Réessayez plus tard. |
| 180221 | La restauration partirait d'une autre branche de l'historique | Choisissez un instant plus ancien ou une autre archive. |
| 180222 | La VM ou l'un de ses disques a été recréé depuis la sauvegarde | Supprimez d'abord la ressource recréée. |
| 180223 | Restauration non annulable | Attendez qu'elle se termine d'elle-même. |
| 180224 | Versions majeures PostgreSQL différentes | Restaurez vers une base de la même version majeure. |
| 180225 | Un disque ne se restaure pas sur lui-même | Restaurez une archive de la VM qui le porte. |
| 180226 | Base PostgreSQL pas encore prête après une restauration | Attendez qu'elle soit prête, ou restaurez-la à nouveau. |
| 180227 | Rien à annuler pour l'instant | Annulez à nouveau dans quelques secondes. |
