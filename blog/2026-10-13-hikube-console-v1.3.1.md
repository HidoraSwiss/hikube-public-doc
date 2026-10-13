---
title: Console Hikube v1.3.1
authors: [hikube]
tags: [release]
---

La console accompagne l'API v1.5.1 : les formulaires proposent les tailles servies par la plateforme, avec leurs nouveaux prix. Les disques d'une VM existante ne se remplacent plus depuis la page de modification, et les écrans PostgreSQL suivent les nouvelles règles des bases.

<!-- truncate -->

## Ajouté

- **Bases de données et Kubernetes** — Les listes de tailles viennent de la plateforme, avec leurs ressources, par exemple « u1.medium — 1 CPU / 4Gi ». Pour le control plane Kubernetes, la console propose `u1.small` et `u1.2xmedium`. Si la liste ne peut pas être chargée, un message le dit au lieu d'afficher une liste périmée.

- **Kubernetes** — La page de modification d'un cluster affiche, en lecture seule, la taille de chacun des quatre composants du control plane.

- **Ressources forcées** — Quand les ressources d'une instance sont fixées hors de sa taille, le formulaire l'indique par la mention « (forcé) », avec une phrase d'explication.

## Modifié

Ces changements modifient un comportement existant de la console.

- **Bases de données et Kubernetes** — À la création, aucune taille n'est présélectionnée : vous devez en choisir une. En modification, la taille actuelle reste affichée et renvoyée telle quelle, même si elle ne figure plus dans la liste.

- **Prix** — Les coûts estimés suivent les nouveaux prix : une application managée coûte 10 CHF par mois par vCPU et par Gio, et le control plane Kubernetes reste au forfait de 32 CHF. Une base qui garde une ancienne taille affiche « Prix indisponible », et le tableau de bord du projet indique combien de bases sont exclues du total.

- **Redis** — L'aperçu du quota compte les trois sentinelles du cluster, à la taille choisie. Elles ne sont pas facturées.

- **Instances VM** — Dans la page de modification d'une VM, les disques qu'elle possède déjà s'affichent en lecture seule. Le disque système n'a plus aucune action, avec l'explication « Le disque système d'une VM existante ne se remplace pas : la VM démarre dessus. » Un disque de données ne propose plus que **Détacher le disque**. Le choix **Nouveau** / **Existant** reste disponible pour les disques ajoutés dans le formulaire.

- **Disques** — Supprimer un disque détaché que la VM utilise encore est refusé avec un message clair : « Ce disque a été détaché, mais sa VM l'utilise encore jusqu'à son prochain redémarrage. Redémarrez la VM, puis réessayez. » La suppression d'un disque attaché affiche, elle aussi, un message explicite au lieu d'une erreur technique.

- **PostgreSQL** — Les bases système ne sont plus proposées dans les assistants d'utilisateur, et leur création est refusée. Dans la liste des bases, **Gérer les extensions** et **Supprimer** sont désactivés sur une base système. Un rôle existant sur une base système s'affiche verrouillé dans **Gérer les accès**, avec un avertissement : vous pouvez le retirer, pas le modifier.

- **PostgreSQL** — Les noms de base suivent la règle de la plateforme : minuscules, chiffres, tirets bas et tirets, 54 caractères au plus, en commençant par une lettre ou un tiret bas, mais pas par `pg_`. Les tirets ne sont plus supprimés à la saisie.

## Corrigé

- **PostgreSQL** — Dans la page **Créer un utilisateur**, le nom d'utilisateur garde ses tirets bas : `u_app` n'est plus transformé en `uapp`.

- **PostgreSQL** — L'assistant de création ne présélectionne plus la base système `postgres` pour les utilisateurs. Sans base applicative, l'utilisateur est créé sans droit. Si la plateforme refuse un utilisateur, l'étape finale affiche « Utilisateur non créé » et la raison, au lieu d'un faux mot de passe.

- **Kubernetes et bases de données** — Un cluster dont la taille ne figure pas dans la liste s'enregistre à nouveau : la modification d'un addon ou d'une autre option n'est plus bloquée.

## Sécurité

- **Instances VM** — Dans la page de modification d'une VM, le choix **Nouveau** / **Existant** permettait de remplacer ou de détacher le disque système d'une VM en service. Ce choix n'est plus proposé pour les disques existants, et la plateforme refuse désormais ce changement.
