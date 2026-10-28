---
title: Console Hikube v1.4.2
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.6.3 avec une carte **Control plane** sur la fiche d'un cluster Kubernetes, dont la taille et le nombre de réplicas se modifient désormais. Les fiches des cinq bases de données partagent une même mise en page, et plusieurs formulaires de création et d'édition sont corrigés.

<!-- truncate -->

## Ajouté

- **Kubernetes : état du control plane** — Une carte **Control plane** apparaît sur la fiche d'un cluster. Elle affiche l'état global (**Sain**, **Dégradé** ou **Critique**) et sa raison, les réplicas prêts, les membres etcd prêts, et pour chaque réplica son état, ses redémarrages avec la date et la cause du dernier, ainsi que sa mémoire et son CPU par rapport à leur limite. Quand le control plane manque de mémoire, un bouton **Augmenter la taille** ouvre l'édition du cluster.

- **Kubernetes : taille du control plane** — La taille et le nombre de réplicas du control plane se modifient sur un cluster existant. Dès qu'ils changent, un avertissement rappelle que le control plane redémarre progressivement, et qu'il lui faut temporairement de la marge dans le quota CPU du projet. Sous le champ de taille, à la création comme à l'édition, un avertissement signale une taille trop petite pour le control plane, ou trop juste pour les addons choisis (Monitoring Agents, GPU Operator), avec un bouton pour passer à la taille recommandée. Le même avertissement apparaît à l'étape Addons de l'assistant.

- **Bases de données** — Les fiches PostgreSQL, Redis et RabbitMQ affichent leur **Préconfiguration**, comme celle de MariaDB.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Bases de données** — Les fiches des cinq bases partagent une même mise en page en deux colonnes. La colonne principale présente les **Informations générales** en tuiles (**Version**, **Réplicas**, **Taille du volume**, **Préconfiguration**), puis les sections propres au moteur. La colonne latérale regroupe la carte **Connexion** et le statut.

- **Bases de données** — À la création d'un cluster MariaDB, MongoDB ou RabbitMQ, la console propose **1 nœud (instance unique)** ou **3 nœuds (cluster)**, avec une aide qui explique chaque mode et précise que le choix est définitif. À l'édition, un cluster en mode cluster peut changer son nombre de réplicas, de 2 à 8. Un cluster existant à 5 nœuds garde sa valeur.

- **Bases de données** — L'édition d'un cluster Redis ne propose plus que la version actuelle et les suivantes, et ne permet plus de réduire le volume. L'avertissement de redémarrage ne mentionne la préconfiguration que là où elle peut changer (PostgreSQL et Redis).

- **Kubernetes** — À la création, le control plane propose 1 ou 3 réplicas. À l'édition, le nom d'un node group existant est en lecture seule, et le dernier node group restant ne peut plus être supprimé. Retirer un node group existant affiche un avertissement : l'enregistrement le supprime avec ses nœuds.

- **Kubernetes** — L'option d'IP publique du premier node group s'intitule **Entrée du trafic Internet (IP publique)**. Une aide précise qu'elle reçoit le trafic des services que vous exposez, et qu'elle ne sert pas à joindre l'API du cluster.

- **Kubernetes** — Quand un projet n'est pas encore prêt à accueillir un cluster, le message invite à contacter le support en indiquant le nom du projet.

- **Instances VM** — Sur une VM Windows, l'ajout d'une clé SSH s'applique au prochain démarrage, sans perte du mot de passe administrateur. Le badge **Redémarrage requis** s'affiche dans la liste des VM et sur leur fiche tant que l'API signale un redémarrage en attente.

- **Projets** — À la création d'un projet, l'étape des quotas est facultative : un champ laissé vide n'impose aucune limite propre au projet, qui partage alors les ressources restantes de l'organisation (**Limité par l'organisation**). Un quota posé ne peut plus être retiré ensuite, et l'étape le précise. Les noms réservés `root` et `super` sont refusés dès la saisie du nom.

- **Unités** — Les tailles (disques, volumes, mémoire, quotas) s'affichent en Gio (GiB en anglais), l'unité de l'API.

## Corrigé

- **Bases de données** — Dans les assistants de création, un utilisateur refusé par l'API ne s'affiche plus avec le mot de passe « Error » : la console indique **Utilisateur non créé** et la raison. Les bases PostgreSQL et les vhosts RabbitMQ refusés sont listés avec leur raison. Le nom d'un vhost est vérifié dès la saisie, et un même nom d'utilisateur ne peut plus être saisi deux fois (MariaDB, MongoDB, buckets).
