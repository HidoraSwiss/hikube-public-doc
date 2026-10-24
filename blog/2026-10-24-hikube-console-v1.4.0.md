---
title: Console Hikube v1.4.0
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.6.0 avec un nouvel écran **Sauvegardes** : destinations, programmations, sauvegardes à la demande, archives et restaurations des VM, des disques et des bases PostgreSQL et MariaDB. Les paramètres du projet gèrent ses clés d'API, les bases managées se redémarrent depuis leur fiche, et les fiches des VM et des bases séparent les adresses internes des adresses externes.

<!-- truncate -->

## Ajouté

- **Sauvegardes** — Une entrée **Sauvegardes** apparaît dans le menu du projet, avec quatre onglets :
  - **Destinations** : un bucket S3 du projet, l'utilisateur dont la destination emprunte les identifiants, et une durée de rétention. Une destination sur un bucket WORM affiche la durée de son verrou ;
  - **Protection** : chaque application du projet, avec son état (**Programmée**, **Couverte**, **Non protégée**) et sa dernière sauvegarde. Le filtre **Sans protection** liste celles qui n'ont aucune sauvegarde, et le bouton **Programmer** en crée une ;
  - **Activité** : les sauvegardes et les restaurations, avec leur statut, leur durée et leur message ;
  - **Archives** : toutes les archives du projet.

- **Sauvegardes sur les fiches** — Les fiches des instances VM, des disques et des clusters PostgreSQL et MariaDB ont un onglet **Sauvegardes**. Il propose **Sauvegarder maintenant**, la programmation de l'application, l'état des exécutions en cours, ses archives et ses restaurations. L'onglet signale une ressource non protégée ou une dernière sauvegarde en échec.

- **Programmation** — Une sauvegarde se programme toutes les heures, chaque jour ou chaque semaine, ou avec une expression cron. L'horaire est en UTC, et la console affiche la prochaine exécution. Un avertissement rappelle que l'horaire se décale d'une heure au changement d'heure. Un cluster PostgreSQL ne peut être sauvegardé que vers une seule destination : la console l'explique quand un plan existe déjà.

- **Restauration** — **Restaurer** propose la cible de la restauration : **Sur la base d'origine**, ou **Sur une autre base de données** pour PostgreSQL et MariaDB. Une restauration qui écrase des données demande de saisir le nom de la cible. Pour une VM, vous choisissez ce que deviennent ses disques actuels : **Les supprimer** une fois la restauration réussie, ou **Les garder** dans des disques à part. Les sauvegardes et les restaurations de VM en cours affichent leur progression.

- **Restauration PostgreSQL à un instant** — Le champ **Restaurer jusqu'à** propose l'état exact de la sauvegarde, l'**État le plus récent**, ou un instant choisi sur une frise, à l'échelle d'une heure à sept jours, ou saisi en date et heure. Un instant hors de la période restaurable est ramené à la borne la plus proche, et la console l'indique.

- **Archives** — Une archive qui ne peut pas être restaurée dit pourquoi : archive pas encore prête, destination supprimée, en cours de suppression ou recréée depuis, données effacées en fin de rétention. Plusieurs archives d'une application se suppriment en une fois : la confirmation demande de saisir leur nombre. La console précise si la suppression détruit les données (VM et disques) ou laisse l'archive dans votre bucket (bases de données). Les archives verrouillées par un bucket WORM sont écartées, avec leur date de fin de verrou.

- **Annulation** — Une sauvegarde en cours et la restauration d'une VM peuvent être annulées. Quand l'annulation n'est pas encore possible ou reste à terminer, la console le dit et propose **Réessayer**.

- **Clés d'API** — Une carte **Clés d'API** apparaît dans les paramètres du projet, pour ses administrateurs. **Créer une clé** demande un nom, un **Niveau de droits** (**Lecture**, **Utilisation**, **Administration** ou **Super-administration**, jamais au-dessus du vôtre) et une **Validité** de 1 jour à 1 an. La clé s'affiche une seule fois, avec un exemple d'appel. La liste indique le niveau, la création, l'expiration (**Expire bientôt** dans les 7 derniers jours, puis **Expirée**) et la dernière utilisation de chaque clé. **Renouveler** crée une nouvelle clé de même nom et de même niveau, et propose ensuite de révoquer l'ancienne. La révocation se confirme par le nom de la clé. Voir [Authentification](/api/authentication/).

- **Bases de données managées** — Un bouton **Redémarrer** apparaît sur la fiche des clusters PostgreSQL, MariaDB, MongoDB, RabbitMQ et Redis. La confirmation précise l'interruption : redémarrage progressif pour PostgreSQL, interruption brève pour les autres. Les données sont conservées.

- **Redis** — Un bandeau **Redémarrage requis** s'affiche tant qu'un changement d'authentification ou une rotation de mot de passe attend un redémarrage, avec un bouton **Redémarrer maintenant**. Après un tel changement, la console propose de redémarrer tout de suite ou plus tard.

- **Adresses** — Les fiches des instances VM et des clusters PostgreSQL, MariaDB, MongoDB, Redis et RabbitMQ présentent leurs adresses en deux zones. **Interne** : joignable depuis les ressources du projet, avec l'adresse de la VM sur le réseau du projet, étiquetée **mgmt**, ou l'adresse interne de la base et son port. **Externe** : joignable depuis Internet, avec l'IP publique de la VM ou l'adresse externe de la base. Une VM sans IP publique affiche enfin son adresse, et une base sans accès externe son adresse interne. Quand l'accès externe est coupé, la zone le dit au lieu d'afficher « Non défini ».

## Modifié

Ces changements modifient un comportement existant de la console.

- **Instances VM** — La commande SSH proposée vise l'IP publique, sinon l'adresse **mgmt**. L'IP publique est celle que renvoie la plateforme, même quand elle appartient à une plage privée.

- **Projets** — Les champs de quota laissés vides gardent la valeur actuelle. Un quota à 0, négatif ou décimal est refusé. Quand un quota dépasse ce qu'il reste à l'organisation, le champ concerné l'indique, avec la valeur maximale possible.

- **Projets** — Le refus d'un quota inférieur à la consommation affiche ses valeurs dans l'unité de la console : vCPU, et Go ou GiB selon la langue. Les champs mémoire et stockage du formulaire affichent « GiB » en anglais.

## Corrigé

- **Instances VM** — Retirer le dernier VPC d'une VM le détache bien. Jusqu'ici, le VPC restait attaché.

- **PostgreSQL** — Retirer tous les accès d'un utilisateur ne retire plus son privilège de réplication.

- **Kubernetes** — Vider une surcharge Cilium, CoreDNS, Vertical Pod Autoscaler ou d'un addon la retire bien du cluster.

- **Redis** — Les textes qui annonçaient une révocation immédiate de l'ancien mot de passe sont corrigés : le nouveau mot de passe s'applique après le redémarrage du cluster.
