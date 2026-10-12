---
title: Console Hikube v1.3.0
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.5.0 : elle ne propose plus les modifications que la plateforme refuserait, explique ce que font le détachement d'un disque et la suppression d'un bucket, et affiche les membres d'un replica set MongoDB exposé.

<!-- truncate -->

## Ajouté

- **MongoDB** — La fiche d'un replica set avec accès externe liste ses membres, chacun avec une adresse copiable, au lieu d'afficher « Non défini ». Elle propose une chaîne de connexion directe à un membre. Le membre choisi peut être un secondaire, qui n'accepte pas les écritures.

- **Kubernetes** — Pendant la préparation de l'environnement Kubernetes d'un projet, la création de son premier cluster est relancée automatiquement, sans perdre la configuration saisie. Un bandeau signale l'attente, avec un bouton **Annuler**. Si l'environnement ne peut pas être préparé, un message le dit et la console ne réessaie pas.

- **Projets** — Les paramètres du projet affichent son identifiant, avec un bouton de copie. L'identifiant de l'organisation, dans **Mon Compte**, se copie de la même façon.

- **Statuts** — La fiche d'un VPC affiche son statut. Un projet dont la dernière modification n'a pas pu être appliquée porte un badge **Erreur** dans le sélecteur de projet. Les filtres de statut des VPC et des clusters Kubernetes proposent **Prêt** et **Erreur**.

- **Instances VM** — Après **Recharger UserData**, la console indique qu'un redémarrage est nécessaire pour l'appliquer et que les clés d'hôte SSH seront régénérées. Un bouton **Redémarrer** est proposé.

- **Instances VM** — Quand un VPC est attaché à une VM Debian ou Ubuntu, un avertissement rappelle que l'interface doit être configurée dans le système. Voir [Comment relier une VM à un VPC](/services/networking/how-to/attach-vm-to-vpc/).

- **Projets** — Si la création d'un projet échoue, le message d'erreur affiche une référence de requête à transmettre au support.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Kubernetes** — Le bouton **Kubeconfig** est réservé aux administrateurs du projet. Pour les autres membres, il est désactivé avec la mention « Réservé aux administrateurs du projet. »

- **Bases de données** — La modification d'un cluster PostgreSQL, MariaDB, MongoDB ou RabbitMQ ne propose plus que la version actuelle et les versions supérieures. La taille du disque ne peut plus descendre sous la taille actuelle. Un avertissement signale qu'un changement de version ou de preset redémarre les instances et qu'une version mise à niveau ne peut plus être abaissée.

- **MariaDB et MongoDB** — L'assistant de création demande la base applicative de chaque utilisateur. Les bases système sont refusées : `mysql`, `information_schema`, `performance_schema` et `sys` pour MariaDB, `admin`, `local` et `config` pour MongoDB. Le champ « Rôle global », qui n'a jamais fonctionné, est supprimé.

- **Bases de données et RabbitMQ** — Les noms d'utilisateur, de base et de vhost suivent les règles de l'API : lettres minuscules, chiffres et tirets, en commençant par une lettre. Les erreurs de validation sont traduites. PostgreSQL n'est pas concerné.

- **Instances VM** — Retirer un disque d'une VM le détache sans le supprimer. La confirmation s'intitule désormais « Détacher », sans saisie du nom. Elle précise que le disque reste dans **Disques** avec ses données, et que le détachement ne prend effet qu'au prochain redémarrage de la VM.

- **Instances VM** — La taille minimale du disque système dépend de l'image choisie : 40 Go pour Oracle Linux, 28 Go pour Windows Server, 20 Go pour les autres images. Choisir une image plus exigeante relève la taille à son minimum.

- **Storage S3** — La confirmation de suppression d'un bucket dit ce qu'il advient des objets. Sans WORM, le bucket et tous ses objets sont supprimés, même s'il n'est pas vide. Avec WORM, le bucket quitte la console, mais ses objets sont conservés et restent verrouillés 365 jours après leur écriture, en mode COMPLIANCE. L'assistant de création annonce cette rétention.

- **Kubernetes** — Le champ « Taille du stockage éphémère » des groupes de nœuds devient « Taille du disque des nœuds » : ce disque est persistant. Le module Monitoring Agents ne propose plus de configuration Helm, qu'il n'appliquait pas. Les liens d'aide des modules mènent à cette documentation.

- **Instances VM** — Les jauges vCPU et RAM, qui ne reflétaient aucune mesure réelle, sont retirées de la fiche VM et du choix du type d'instance. La fiche affiche la série réelle du type d'instance : Standard (S), Universel (U) ou Mémoire (M).

## Corrigé

- **Storage S3** — La console n'affiche plus le nom de la ressource à la place du nom S3 du bucket. Elle affiche le nom réel (`bucket-…`) ou indique qu'il sera disponible dans quelques instants. Si vous avez configuré un client S3 avec le nom affiché à la création d'un utilisateur et qu'il reçoit « Access Denied », reprenez le nom S3 dans la fiche du bucket.

- **Storage S3** — Décocher « Lecture seule » sur un utilisateur de bucket le passe bien en lecture-écriture.

- **Instances VM** — L'enregistrement d'une VM dont un disque existant ne respecte pas les règles d'un disque neuf (nom de plus de 16 caractères, taille sous 20 Go) n'échoue plus sans message. Quand un enregistrement est refusé, la console dit pourquoi.

- **Instances VM** — Le bloc Connexion SSH affiche l'utilisateur par défaut que renvoie l'API : `Hikube` pour Windows, `opc` pour Oracle Linux. Quand il est inconnu, la console l'indique au lieu d'en deviner un.

- **Instances VM** — Le choix d'un disque **Existant** à la modification d'une VM n'offre plus les disques système ni les disques attachés à une autre VM.

- **Kubernetes** — La première surcharge Helm de Cilium, CoreDNS ou Vertical Pod Autoscaler saisie à la modification d'un cluster est bien enregistrée. Le coût horaire suit la langue de la console (« CHF/h »).

- **PostgreSQL** — La modification d'un cluster propose les mêmes nombres de réplicas que la création (1, 2 ou 3). Pour un cluster à 2 réplicas, ce choix ne s'affiche plus vide.

- **Bases de données** — **Gérer les accès** affiche son propre message de confirmation, et la colonne **Bases de données** des utilisateurs MariaDB et MongoDB indique le rôle sur chaque base. Les libellés anglais des écrans PostgreSQL, MariaDB, MongoDB et Redis ne reprennent plus le vocabulaire de RabbitMQ.

- **Navigation** — Le fil d'Ariane affiche le nom d'une ressource tel quel, même quand il correspond à un mot de l'interface : un cluster nommé `postgres` n'y apparaît plus comme « PostgreSQL ».

- **Instances VM** — La carte « Image perso » de l'assistant explique comment l'utiliser : créer d'abord un disque, puis le choisir.

## Sécurité

- **MariaDB et MongoDB** — L'assistant de création d'un cluster attribuait à chaque utilisateur un rôle sur la base système (`mysql` pour MariaDB, `admin` pour MongoDB). Ce n'est plus le cas. Pour les utilisateurs créés avant cette version, ouvrez **Gérer les accès** : la ligne de la base système y apparaît en erreur. Retirez-la.
