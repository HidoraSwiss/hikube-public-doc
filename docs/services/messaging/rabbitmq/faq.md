---
sidebar_position: 6
title: FAQ
---

# FAQ — RabbitMQ

### Quelle est la différence entre quorum queues et classic queues ?

RabbitMQ propose deux types principaux de queues :

- **Quorum queues** : basées sur le protocole **Raft**, les données sont répliquées sur plusieurs nœuds du cluster. Elles garantissent la **durabilité** et la **haute disponibilité** des messages. Recommandées pour la production.
- **Classic queues** : stockées sur un seul nœud, sans réplication entre nœuds. En cas de panne de ce nœud, les messages ne sont plus disponibles.

Le type de queue est choisi par l'application au moment de la déclaration (argument `x-queue-type: quorum`).

:::tip
Pour bénéficier de la réplication des quorum queues, créez le cluster avec **3 (Haute disponibilité max)** ou **5 (Très haute disponibilité)** réplicas.
:::

### À quoi servent les virtual hosts (vhosts) ?

Les **virtual hosts** (vhosts) fournissent une **isolation logique** au sein d'un même cluster RabbitMQ :

- Chaque vhost possède ses propres exchanges, queues et bindings
- Les droits sont gérés **par vhost**, ce qui permet de contrôler l'accès par application
- Un utilisateur peut avoir des droits différents selon le vhost (**Administrateur** sur l'un, **Lecture seule** sur l'autre)

Les vhosts se créent dans l'assistant de création (étape **VHosts**) ou ensuite avec **Ajouter un VHost** sur la page du cluster. Voir [Gérer les vhosts et utilisateurs](./how-to/manage-vhosts-users.md).

### Comment fonctionnent les exchanges dans RabbitMQ ?

Un **exchange** reçoit les messages des producteurs et les route vers les queues selon des règles de **binding** :

| **Type**    | **Comportement**                                                              |
| ----------- | ----------------------------------------------------------------------------- |
| `direct`    | Route le message vers la queue dont la **routing key** correspond exactement  |
| `fanout`    | Diffuse le message à **toutes les queues** liées, sans filtre                 |
| `topic`     | Route selon un **pattern** de routing key (ex. `orders.*`, `logs.#`)          |
| `headers`   | Route selon les **headers** du message plutôt que la routing key              |

Le producteur publie vers un exchange, jamais directement vers une queue. Les exchanges et bindings sont déclarés par vos applications.

### Sur quel port se connecter ?

Les clients AMQP se connectent sur le port **5672**, sur l'adresse affichée dans le champ **Hôte (Host)** de la section **Connexion** du cluster (lorsque l'**Accès externe** est activé).

### Peut-on changer le nombre de réplicas ou le preset après la création ?

Non. Le **Nombre de réplicas** (et donc le mode standalone ou cluster) et la **Préconfiguration (Preset)** sont fixés à la création. La version, la taille du disque et l'accès externe restent modifiables. Voir [Modifier la configuration d'un cluster](./how-to/scale-resources.md).

### J'ai perdu le mot de passe d'un utilisateur. Comment le récupérer ?

Le mot de passe n'est affiché qu'une seule fois et ne peut pas être relu. Générez-en un nouveau avec l'action **Changer le mot de passe** de l'utilisateur, puis mettez à jour vos applications : l'ancien mot de passe est révoqué immédiatement.

### Quels droits donnent « Administrateur » et « Lecture seule » ?

- **Administrateur** : lecture, écriture et configuration sur le vhost (déclarer des exchanges et des queues, publier, consommer).
- **Lecture seule** : lecture seule sur le vhost.

Un utilisateur sans accès à un vhost ne peut pas s'y connecter.

### Comment accéder à l'interface de management RabbitMQ ?

La console Hikube ne propose pas d'accès à l'interface web de management de RabbitMQ. Avec l'**Accès externe**, le port 15672 de cette interface est joignable sur l'adresse du cluster, en HTTP non chiffré, mais les utilisateurs créés depuis la console n'ont pas le tag d'administration RabbitMQ qu'elle exige : ils ne peuvent pas s'y connecter. Les vhosts et utilisateurs se gèrent depuis la console ; les exchanges et queues, depuis vos applications. Pour un besoin spécifique, [contactez le support](mailto:support@hidora.io).

### Comment le coût d'un cluster est-il estimé ?

L'assistant de création affiche un **Coût estimé** mensuel et horaire, calculé à partir de la préconfiguration, du nombre de réplicas, de la taille du disque et de l'accès externe. La facturation réelle est calculée à l'heure d'utilisation.
