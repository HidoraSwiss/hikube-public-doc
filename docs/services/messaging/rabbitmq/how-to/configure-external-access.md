---
title: "Comment configurer l'accès externe"
---

# Comment configurer l'accès externe

Par défaut, un cluster RabbitMQ n'est pas exposé sur Internet. L'option **Accès externe** expose le cluster sur une adresse publique, pour que des applications situées hors de Hikube (ou votre poste de travail) puissent s'y connecter en AMQP.

## Prérequis

- Un **cluster RabbitMQ** créé dans votre projet, ou l'assistant de création ouvert
- Au moins un **utilisateur** RabbitMQ et son mot de passe

## Activer l'accès externe à la création

À l'étape **Configuration** de l'assistant **Créer un cluster RabbitMQ**, activez **Accès externe**. Le récapitulatif de l'étape **Vérification** indique alors **Public** dans la ligne **Réseau** (au lieu de **Privé**).

## Activer ou désactiver l'accès externe sur un cluster existant

1. Ouvrez la page du cluster et cliquez sur **Modifier**.
2. Activez ou désactivez l'interrupteur **Accès externe**.
3. Cliquez sur **Sauvegarder**.

## Récupérer l'adresse publique

1. Ouvrez la page du cluster.
2. Dans la section **Connexion**, vérifiez que **Accès externe** indique **Activé**.
3. Copiez la valeur du champ **Hôte (Host)**. Tant que l'adresse n'est pas attribuée, le champ affiche « Non disponible / En création ».

Vos clients se connectent ensuite sur cet hôte, port **5672** :

```text
amqp://<utilisateur>:<password>@<hôte>:5672/<vhost>
```

## Bonnes pratiques de sécurité

:::warning
Un cluster avec accès externe est joignable depuis Internet. Ne partagez pas un même utilisateur entre plusieurs applications et renouvelez son mot de passe avec **Changer le mot de passe** en cas de doute.
:::

- Désactivez l'**Accès externe** si seules des applications internes à votre projet utilisent le cluster.
- Attribuez le droit **Lecture seule** aux applications qui ne font que consommer.
- Supprimez les utilisateurs inutilisés.

## Vérification

Depuis un poste extérieur, testez l'ouverture du port AMQP :

```bash
nc -zv <hôte> 5672
```

Puis lancez le script de test de l'étape 5 du [démarrage rapide](../quick-start.md).

## Pour aller plus loin

- [Gérer les vhosts et utilisateurs](./manage-vhosts-users.md)
- [Modifier la configuration d'un cluster](./scale-resources.md)
