---
title: Console Hikube v1.4.4
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.6.4. Une ressource supprimée reste affichée tant que sa suppression n'est pas terminée, et le disque système d'une VM se change depuis une vue dédiée. Une VM bloquée au démarrage peut désormais être arrêtée, et la carte de topologie du tableau de bord se charge plus vite.

<!-- truncate -->

## Ajouté

- **Instances VM : changer le disque système** — Une vue dédiée permet de remplacer le disque système d'une VM arrêtée par un disque existant non attaché, ou par un nouveau disque vide. Un récapitulatif rappelle que l'ancien disque est détaché et conservé, puis une confirmation est demandée. Sur une VM allumée, la vue invite à l'arrêter d'abord et propose de le faire. On y accède depuis la fiche de la VM et depuis son édition.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Toutes les ressources** — Une ressource supprimée reste dans la liste avec le statut **Suppression en cours** jusqu'à sa disparition. Ses actions de modification sont désactivées, et la raison est indiquée. Créer une ressource sous le nom d'une ressource encore en suppression affiche un message dédié : réessayez une fois la suppression terminée.

- **Instances VM** — Juste après une modification, ou quelques secondes après un arrêt, le démarrage peut être temporairement refusé. La console affiche **Modification en cours d'application** et réessaie d'elle-même ; un bouton **Réessayer** apparaît si l'attente se prolonge.

- **Instances VM** — Une VM bloquée au démarrage ou en erreur, par exemple faute de quota, peut être arrêtée depuis sa fiche, la liste des VM et la vue du disque système. La raison du blocage s'affiche sur la fiche.

- **Tableau de bord** — La carte de topologie charge les sous-réseaux de tous les VPC du projet en une seule requête, et limite le nombre de VM affichées par sous-réseau.

## Corrigé

- **Instances VM** — Dans la liste des VM, la colonne **Réseau** affiche en tête l'adresse publique d'une VM, marquée « publique », ou **Pas d'IP publique**. Elle affichait « IP Publique : Oui » au-dessus de toutes les adresses, privées comprises.

- **Disques** — La couleur du statut distingue de nouveau un disque **Prêt** d'un disque **En cours d'utilisation**.

- **Images** — Une carte d'image ISO s'ouvre d'un clic.

- **Navigation** — Revenir sur une page restaure sa position de défilement.
