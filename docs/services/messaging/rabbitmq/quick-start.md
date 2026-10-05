---
sidebar_position: 3
title: Démarrage rapide
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Créer un cluster RabbitMQ en 5 minutes

Ce guide vous accompagne dans la création de votre premier **cluster RabbitMQ** depuis la [console Hikube](https://console.hikube.cloud), jusqu'à l'envoi d'un premier message.

---

## Objectifs

À la fin de ce guide, vous aurez :

- Un **cluster RabbitMQ** opérationnel dans votre projet
- Un **vhost** et un **utilisateur** avec ses droits
- Le **mot de passe** de cet utilisateur et l'**adresse de connexion** du cluster
- Un premier message publié avec un client AMQP

---

## Prérequis

- Un **compte Hikube** et un **projet** (voir le [démarrage rapide Hikube](../../../getting-started/quick-start.md))
- Un quota de projet suffisant pour le cluster (CPU, mémoire et stockage)
- **Python 3** avec le module `pika` installé, pour le test de l'étape 5 (`pip install pika`)

---

## Étape 1 : Ouvrir l'assistant de création

1. Connectez-vous à la [console Hikube](https://console.hikube.cloud) et sélectionnez votre projet.
2. Dans le menu latéral, ouvrez **DB & Messaging** → **RabbitMQ**. La page **Clusters RabbitMQ** s'affiche.
3. Cliquez sur **Créer un cluster**. L'assistant **Créer un cluster RabbitMQ** s'ouvre.

---

## Étape 2 : Configurer et créer le cluster

L'assistant comporte cinq étapes. Un bandeau affiche le coût estimé et, à l'étape **Configuration**, la consommation de quota du projet.

### Général

Saisissez le **Nom du cluster** (un nom est proposé par défaut). Il doit comporter 3 à 16 caractères : minuscules, chiffres et tirets, commencer par une lettre et se terminer par une lettre ou un chiffre. Exemple : `rabbit-demo`.

### Configuration

| Champ | Valeur conseillée pour ce guide | Remarque |
|-------|--------------------------------|----------|
| **Version RabbitMQ** | 4.2 | Versions proposées : 4.2, 4.1, 4.0, 3.13 |
| **Préconfiguration (Preset)** | Small | Non modifiable après création |
| **Taille du disque (Go)** | 10 | Capacité par nœud |
| **Nombre de réplicas** | 3 (Haute disponibilité max) | 1 (Standalone), 3 ou 5 ; non modifiable après création |
| **Accès externe** | Activé | Expose le cluster sur Internet ; nécessaire pour le test depuis votre poste |

:::note
Si le quota de stockage du projet est dépassé, la console affiche « Quota de stockage dépassé pour ce projet » et le bouton **Suivant** reste inactif. Réduisez la taille ou le nombre de réplicas, ou faites augmenter le quota du projet.
:::

### VHosts

Saisissez un **Nom du VHost** (par exemple `demo`) puis cliquez sur **Ajouter**. Au moins un vhost est nécessaire pour passer à l'étape suivante.

### Utilisateurs

1. Dans **Ajouter un nouvel utilisateur**, saisissez le **Nom de l'utilisateur** (par exemple `app-user` ; minuscules, chiffres et tirets).
2. Dans **Accès aux VHosts**, choisissez **Administrateur** pour le vhost `demo`.
3. Cliquez sur **Ajouter l'utilisateur**.

Au moins un utilisateur est nécessaire pour continuer.

### Vérification

Relisez le récapitulatif (nom, version, préconfiguration, réplicas, taille, réseau **Public** ou **Privé**, coût estimé, nombre de vhosts et d'utilisateurs à créer), puis cliquez sur **Déployer**.

### Résumé : copier le mot de passe

À la fin du déploiement, l'écran **Résumé** affiche **Création terminée !** et, pour chaque utilisateur créé, son **Mot de passe**.

:::warning Mot de passe affiché une seule fois
Copiez le mot de passe immédiatement et conservez-le dans un gestionnaire de mots de passe. Il ne sera plus affiché après avoir quitté cet écran. En cas de perte, générez-en un nouveau avec l'action **Changer le mot de passe** (voir [Gérer les vhosts et utilisateurs](./how-to/manage-vhosts-users.md)).
:::

Cliquez ensuite sur **Terminer** pour revenir à la liste des clusters.

---

## Étape 3 : Vérifier l'état du cluster

1. Dans la liste **Clusters RabbitMQ**, le cluster apparaît avec le statut **En création**, puis **Prêt** lorsqu'il est opérationnel.
2. Cliquez sur le cluster pour ouvrir sa page de détail :
   - **Informations générales** : **Version**, **Réplicas**, **Taille du volume** ;
   - **VHosts** et **Utilisateurs** : les éléments créés par l'assistant ;
   - **Connexion** : **Hôte (Host)**, **Statut** et **Accès externe** (**Activé** ou **Désactivé**).

---

## Étape 4 : Récupérer les identifiants

Pour vous connecter, il vous faut :

| Information | Où la trouver |
|-------------|---------------|
| **Nom d'utilisateur** | Section **Utilisateurs** de la page du cluster |
| **Mot de passe** | Copié à l'écran **Résumé** de l'assistant (étape 2) |
| **VHost** | Section **VHosts** de la page du cluster |
| **Hôte** | Champ **Hôte (Host)** de la section **Connexion** |
| **Port** | 5672 (AMQP) |

Tant que l'adresse n'est pas attribuée, le champ **Hôte (Host)** affiche « Non disponible / En création ». Une fois l'adresse attribuée, copiez-la avec le bouton de copie.

:::note
Le champ **Hôte (Host)** est renseigné lorsque l'**Accès externe** est activé. Si vous avez créé un cluster sans accès externe et souhaitez y connecter une application, [contactez le support](mailto:support@hidora.io) pour obtenir l'adresse à utiliser.
:::

L'écran **Résumé** de l'assistant affiche aussi, lorsque l'hôte est déjà connu, une chaîne de connexion de la forme :

```text
amqp://app-user:<password>@<hôte>:5672
```

---

## Étape 5 : Connexion et test

Créez le script suivant en remplaçant l'hôte et le mot de passe par vos valeurs :

```python title="test_rabbitmq.py"
import pika

credentials = pika.PlainCredentials('app-user', '<password>')
parameters = pika.ConnectionParameters(
    host='<hôte>',
    port=5672,
    virtual_host='demo',
    credentials=credentials,
)

connection = pika.BlockingConnection(parameters)
channel = connection.channel()

# Déclaration d'une quorum queue (répliquée sur les nœuds du cluster)
channel.queue_declare(queue='test', durable=True, arguments={'x-queue-type': 'quorum'})

# Envoi d'un message
channel.basic_publish(exchange='', routing_key='test', body='Hello Hikube!')
print("Message envoyé avec succès")

# Lecture du message
method, properties, body = channel.basic_get(queue='test', auto_ack=True)
print(f"Message reçu : {body.decode()}")

connection.close()
```

```bash
python test_rabbitmq.py
```

**Résultat attendu :**

```console
Message envoyé avec succès
Message reçu : Hello Hikube!
```

---

## Étape 6 : Dépannage rapide

| Symptôme | Causes fréquentes | Action |
|----------|-------------------|--------|
| Le cluster reste **En création** | Provisionnement en cours | Patientez quelques minutes ; si le statut ne change pas, consultez le [dépannage](./troubleshooting.md) |
| Statut **Erreur** | Échec du provisionnement | [Contactez le support](mailto:support@hidora.io) en indiquant le nom et l'identifiant du cluster |
| `ACCESS_REFUSED` à la connexion | Mot de passe erroné, ou utilisateur sans droit sur le vhost | Vérifiez le vhost dans **Gérer les accès** ; régénérez le mot de passe si nécessaire |
| Connexion impossible (timeout) | Accès externe désactivé, mauvais hôte ou port | Vérifiez **Accès externe** et **Hôte (Host)** dans la section **Connexion** ; le port AMQP est 5672 |
| `NOT_FOUND - no vhost` | Nom de vhost incorrect dans le client | Utilisez exactement le nom affiché dans la section **VHosts** |

---

## Étape 7 : Nettoyage

1. Ouvrez la page de détail du cluster et cliquez sur **Supprimer** (ou, depuis la liste, ouvrez le menu d'actions du cluster et choisissez **Supprimer le cluster**).
2. Dans la fenêtre de confirmation, saisissez le nom exact du cluster dans **Nom de la ressource à confirmer**.
3. Cliquez sur **Supprimer définitivement**.

:::warning
Cette action est irréversible : le cluster, ses vhosts, ses utilisateurs et tous les messages stockés sont définitivement supprimés.
:::

---

## Résumé

Vous avez créé depuis la console :

- Un cluster RabbitMQ de **3 nœuds** en haute disponibilité
- Un **vhost** et un **utilisateur administrateur** de ce vhost
- Une **connexion AMQP** fonctionnelle depuis votre poste

<NavigationFooter
  nextSteps={[
    {label: "Gérer les vhosts et utilisateurs", href: "../how-to/manage-vhosts-users"},
    {label: "FAQ", href: "../faq"},
  ]}
  seeAlso={[
    {label: "Tous les services de messagerie", href: "../../"},
  ]}
/>
