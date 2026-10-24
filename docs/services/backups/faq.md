---
sidebar_position: 6
title: "FAQ — Sauvegardes"
sidebar_label: FAQ
description: "Réponses aux questions sur les sauvegardes Hikube : ressources couvertes, emplacement des archives, quota, fuseau horaire, PostgreSQL et destinations, restauration vers une copie, suppression."
---

# FAQ — Sauvegardes

### Quelles ressources peuvent être sauvegardées ?

Les bases **PostgreSQL** et **MariaDB**, les **machines virtuelles** (avec tous leurs disques) et les **disques**. MongoDB, Redis, RabbitMQ, les clusters Kubernetes et les buckets ne sont pas couverts par ce service. Les données d'un cluster [Kubernetes](../kubernetes/overview.md) se sauvegardent avec les outils installés dans ce cluster.

---

### Où sont stockées mes sauvegardes ?

Dans le bucket S3 de votre projet choisi pour la destination. Hikube n'en garde pas d'autre copie : supprimer le bucket supprime les archives.

---

### Les sauvegardes ont-elles un quota ?

Non, pas de quota propre. Les archives occupent l'espace de leur bucket, comptabilisé comme le reste du stockage objet.

---

### Dois-je créer une destination par ressource ?

Non. Une destination sert à toutes les ressources couvertes du projet. Créez-en plusieurs pour des rétentions ou des buckets différents.

---

### Puis-je sauvegarder une base PostgreSQL vers deux destinations ?

Non. Une base PostgreSQL archive ses journaux de transactions en continu vers une seule destination ; deux destinations se partageraient ce flux et aucune ne contiendrait d'historique complet. La seconde est refusée. Plusieurs programmations vers la même destination restent possibles. Voir [Concepts](./concepts.md#postgresql--une-seule-destination).

---

### Dans quel fuseau horaire sont les horaires ?

En UTC. Le préréglage de la console convertit votre heure locale en UTC ; l'expression cron se saisit directement en UTC. Une sauvegarde programmée se décale donc d'une heure en heure locale à chaque changement d'heure.

---

### Puis-je sauvegarder plus souvent qu'une fois par heure ?

Pas avec une programmation : la fréquence maximale est d'une exécution par heure. Pour PostgreSQL, ce n'est pas nécessaire : les journaux de transactions sont archivés en continu, et la [restauration à un instant précis](./how-to/restore-point-in-time.md) atteint n'importe quel instant entre deux sauvegardes.

---

### Comment obtenir une copie d'une base sans toucher à l'originale ?

Créez une base vide du même type (et de la même version majeure pour PostgreSQL), puis restaurez l'archive dessus avec **Sur une autre base de données**. Voir [Restaurer une base](./how-to/restore-database.md).

---

### Puis-je restaurer une VM sous un autre nom ?

Non. Une VM ou un disque se restaure uniquement sur lui-même. Pour récupérer des fichiers sans remplacer la VM entière, restaurez-la en choisissant **Les garder** : les anciens disques restent disponibles comme disques séparés. Voir [Restaurer une VM ou un disque](./how-to/restore-vm-or-disk.md).

---

### Puis-je restaurer un seul disque d'une VM ?

Non. L'archive d'une VM se restaure en entier, avec tous ses disques. L'archive d'un disque sauvegardé seul ne sert qu'à le recréer s'il a été supprimé.

---

### Supprimer une archive libère-t-il de l'espace dans mon bucket ?

Pour une **VM** ou un **disque**, oui : les données sont effacées peu après la suppression. Pour **PostgreSQL** et **MariaDB**, non : seule la fiche disparaît de la console, les données restent dans le bucket.

---

### Que deviennent mes archives si je supprime la ressource sauvegardée ?

Elles sont conservées et restent restaurables. Pour une VM ou un disque, la restauration recrée la ressource ; pour une base, choisissez une autre base comme cible.

---

### Que deviennent mes archives si je supprime la destination ?

Elles restent dans le bucket, mais ne sont plus restaurables depuis la console, même si vous recréez une destination du même nom. Pour PostgreSQL, leur rétention n'est plus appliquée.

---

### Pourquoi la taille de mes archives n'est-elle pas affichée ?

Elle n'est pas mesurée aujourd'hui. Pour une VM ou un disque, le pourcentage affiché pendant une sauvegarde mesure les données transférées, pas la place occupée. La place réelle se lit sur le bucket.

---

### Que se passe-t-il si une sauvegarde programmée tombe pendant une restauration ?

Une sauvegarde à la demande est refusée pendant une restauration, mais une sauvegarde programmée se déclenche quand même. Pour une base PostgreSQL restaurée en place, elle peut faire échouer la restauration : avant de restaurer, vérifiez qu'aucune exécution n'est prévue dans les 30 minutes.
