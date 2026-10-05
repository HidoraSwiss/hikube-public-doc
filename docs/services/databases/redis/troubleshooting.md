---
sidebar_position: 7
title: Dépannage
---

# Dépannage — Redis

### Le cluster reste au statut « En création »

**Cause** : le provisionnement des nœuds Redis, des Sentinels et de leurs volumes est en cours.

**Solution** :

1. Patientez quelques minutes et actualisez la page du cluster.
2. Si le statut ne change pas après une quinzaine de minutes, ou passe à **Erreur** ou **Échec**, [contactez le support](mailto:support@hidora.io) en indiquant le projet et le nom du cluster.

### L'hôte affiche « En attente d'attribution... »

**Cause** : le réseau public est désactivé, ou l'adresse IP publique n'est pas encore attribuée.

**Solution** :

1. Ouvrez **Modifier** et vérifiez l'option **Accès externe**. Activez-la si vous devez vous connecter depuis Internet, puis cliquez sur **Enregistrer les modifications**.
2. Patientez quelques instants et actualisez la page du cluster.

### Connexion timeout

**Cause** : l'adresse ou le port utilisés sont incorrects, le cluster n'est pas prêt, ou un pare-feu bloque le port `6379`.

**Solution** :

1. Vérifiez que le **Statut** de la section **Connexion** est **Prêt**.
2. Copiez l'**Hôte** avec le bouton de copie pour éviter les erreurs de saisie.
3. Vérifiez qu'aucun pare-feu sortant de votre réseau ne bloque le port `6379`.

### Authentification échoue (`NOAUTH` ou `WRONGPASS`)

**Cause** : le client n'envoie pas de mot de passe, utilise un mot de passe erroné, ou un mot de passe révoqué par une rotation.

**Solution** :

1. Vérifiez la valeur fournie au client (`REDISCLI_AUTH`, option `-a` ou configuration applicative).
2. En cas de doute, générez un nouveau mot de passe depuis la section **Sécurité** (**Effectuer une rotation**) et mettez à jour vos applications. Voir [Renouveler le mot de passe](./how-to/rotate-password.md).
3. Si l'option **Authentification requise** a été modifiée, mettez à jour les clients en conséquence.

### Mémoire saturée (`OOM command not allowed`)

**Cause** : le jeu de données dépasse la mémoire allouée par la préconfiguration.

**Solution** :

1. Contrôlez l'utilisation mémoire :
   ```bash
   redis-cli -h <hôte> -p 6379 INFO memory
   ```
2. Passez à une **Préconfiguration** supérieure via **Modifier**. Voir [Modifier les ressources](./how-to/scale-resources.md).
3. Si Redis sert de cache, posez des durées d'expiration (`EXPIRE`) sur vos clés pour limiter la croissance du jeu de données.

### Le failover ne se produit pas

**Cause** : le cluster ne compte qu'un réplica ; aucun réplica ne peut être promu master.

**Solution** : le nombre de réplicas ne peut pas être modifié après la création. Créez un nouveau cluster avec au moins 2 réplicas (3 en production) et migrez vos données, ou [contactez le support](mailto:support@hidora.io). Voir [Configurer la haute disponibilité](./how-to/configure-ha.md).
