---
sidebar_position: 7
title: Dépannage
---

# Dépannage — RabbitMQ

### Le cluster reste « En création » ou passe en « Erreur »

**Cause** : le provisionnement est en cours, ou il a échoué (par exemple par manque de ressources disponibles).

**Solution** :

1. Patientez quelques minutes : la page de détail et la liste se mettent à jour automatiquement.
2. Si le statut reste **En création** anormalement longtemps ou passe à **Erreur** / **Échec**, [contactez le support](mailto:support@hidora.io) en indiquant le nom du projet, le nom du cluster et son identifiant (affiché sous le nom du cluster, avec un bouton de copie).

### « Quota de stockage dépassé pour ce projet » dans l'assistant

**Cause** : la taille du disque multipliée par le nombre de réplicas dépasse le stockage restant du quota du projet.

**Solution** :

1. Réduisez la **Taille du disque (Go)** ou le **Nombre de réplicas**.
2. Si besoin, libérez du stockage dans le projet ou faites augmenter le quota du projet.

### « Un cluster avec ce nom existe déjà »

**Cause** : un cluster RabbitMQ du projet porte déjà ce nom.

**Solution** : revenez à l'étape **Général** et choisissez un autre **Nom du cluster**.

### Le champ « Hôte (Host) » affiche « Non disponible / En création »

**Cause** : l'adresse publique n'est pas encore attribuée, ou l'**Accès externe** est désactivé.

**Solution** :

1. Vérifiez dans la section **Connexion** que **Accès externe** indique **Activé**. Sinon, activez-le (voir [Configurer l'accès externe](./how-to/configure-external-access.md)).
2. Si l'accès externe est activé, patientez puis rechargez la page.

### Connexion AMQP refusée (`ACCESS_REFUSED`)

**Cause** : identifiants incorrects, ou l'utilisateur n'a pas de droit sur le vhost demandé.

**Solution** :

1. Vérifiez dans le tableau **Utilisateurs** (colonne **VHosts**) que l'utilisateur a bien un droit sur le vhost utilisé par le client.
2. Si nécessaire, ajoutez l'accès avec **Gérer les accès**.
3. Si le mot de passe a été perdu ou est douteux, générez-en un nouveau avec **Changer le mot de passe** et mettez à jour le client.
4. Vérifiez que le client indique le bon vhost (nom exact, sensible à la casse).

### Connexion impossible (timeout, connexion refusée)

**Cause** : accès externe désactivé, mauvaise adresse ou mauvais port, ou filtrage réseau côté client.

**Solution** :

1. Vérifiez l'**Hôte (Host)** et l'état de l'**Accès externe** dans la section **Connexion**.
2. Utilisez le port **5672**.
3. Testez l'ouverture du port depuis la machine cliente :
   ```bash
   nc -zv <hôte> 5672
   ```
4. Vérifiez que votre réseau ou pare-feu local autorise les connexions sortantes vers ce port.

### Publications bloquées (flow control, alarme mémoire ou disque)

**Cause** : RabbitMQ bloque les publications lorsqu'il atteint son seuil de mémoire (high watermark) ou que l'espace disque est insuffisant, pour protéger le broker. Les clients reçoivent alors une notification `connection.blocked`.

**Solution** :

1. Côté applications, vérifiez que les consumers suivent le rythme des producers et purgez les queues qui accumulent des messages non consommés.
2. Augmentez la **Taille du disque (Go)** depuis **Modifier** si l'alarme concerne le disque (voir [Modifier la configuration d'un cluster](./how-to/scale-resources.md)).
3. La préconfiguration (mémoire) n'est pas modifiable après création : créez un cluster avec une préconfiguration supérieure, ou [contactez le support](mailto:support@hidora.io).

### Messages non routés

**Cause** : le producteur publie vers un exchange sans binding correspondant (mauvais type d'exchange, routing key incorrecte, binding manquant). Le message est alors abandonné.

**Solution** :

1. Vérifiez dans le code du producteur le nom de l'exchange et la routing key.
2. Vérifiez que le consumer déclare bien le binding entre la queue et l'exchange.
3. Publiez avec le flag `mandatory` pour être notifié des messages non routés, ou déclarez un *alternate exchange* pour les capturer.

### La suppression du cluster échoue

**Cause** : un conflit empêche la suppression (« Impossible de supprimer ce cluster (conflit). ») ou le service est momentanément indisponible.

**Solution** : réessayez quelques minutes plus tard. Si l'erreur persiste, [contactez le support](mailto:support@hidora.io).
