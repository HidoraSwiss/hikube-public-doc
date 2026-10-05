---
sidebar_position: 1
title: Vue d'ensemble
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# RabbitMQ sur Hikube

Les **clusters RabbitMQ** d'Hikube offrent une **infrastructure de messagerie managée et fiable**, conçue pour la **communication asynchrone entre services et applications**.
Basé sur le protocole **AMQP (Advanced Message Queuing Protocol)**, RabbitMQ garantit un **acheminement sûr et ordonné des messages**, adapté aussi bien aux architectures **microservices** qu'aux systèmes d'intégration métier complexes.

Vous créez et gérez vos clusters en libre-service depuis la [console Hikube](https://console.hikube.cloud), dans le menu **DB & Messaging** → **RabbitMQ** de votre projet.

---

## Ce que la console vous permet de faire

- **Créer un cluster** avec un assistant guidé : version de RabbitMQ, préconfiguration de ressources, taille du disque, nombre de réplicas et accès externe ;
- **Définir les virtual hosts (vhosts)** et les **utilisateurs** dès la création, puis les gérer depuis la page du cluster ;
- **Attribuer des droits par vhost** à chaque utilisateur (**Administrateur** ou **Lecture seule**) ;
- **Générer un nouveau mot de passe** pour un utilisateur ;
- **Modifier** la version, la taille du disque et l'accès externe d'un cluster existant ;
- **Supprimer** un cluster, un vhost ou un utilisateur.

---

## Architecture et fonctionnement

Un déploiement RabbitMQ repose sur quelques concepts fondamentaux :

* **Producers** : envoient les messages à RabbitMQ via des **exchanges**, qui déterminent comment les messages sont routés vers les **queues**.
* **Exchanges** : appliquent une logique de routage (direct, fanout, topic ou headers) pour distribuer les messages selon des clés de routage.
* **Queues** : stockent les messages jusqu'à ce qu'ils soient consommés par les **consumers**.
* **Consumers** : récupèrent et traitent les messages, garantissant un flux de travail **asynchrone, fiable et découplé**.

Un cluster peut fonctionner en **mode standalone** (1 réplica) ou en **mode cluster** (3 ou 5 réplicas). En mode cluster, les **quorum queues** (basées sur le protocole Raft) répliquent les messages entre les nœuds pour assurer la continuité du service en cas de panne. Le détail est présenté dans les [concepts](./concepts.md).

---

## Cas d'usage typiques

### Communication inter-services

RabbitMQ est souvent utilisé comme **bus de messages interne** entre applications ou microservices.
Il permet de **décorréler les traitements**, réduire la latence perçue et améliorer la **résilience globale**.

**Exemples :**

* File d'attente de traitement pour des tâches longues (emails, rapports, notifications)
* Système d'événements métiers (commandes, paiements, inventaires)
* Communication fiable entre microservices distribués

---

### Gestion de flux asynchrones

RabbitMQ simplifie la mise en place de **workflows asynchrones** où chaque composant travaille indépendamment des autres.

**Exemples :**

* Orchestration de jobs en arrière-plan
* Traitement parallèle de lots de données
* Coordination de pipelines CI/CD ou d'automatisations internes

---

### Intégration d'applications et interconnexion de systèmes

RabbitMQ agit comme **pont de communication** entre applications, langages ou environnements hétérogènes.

**Exemples :**

* Intégration entre applications legacy et microservices modernes
* Connexion entre systèmes internes et plateformes externes via AMQP
* Centralisation des messages d'événements métiers dans un même bus

---

### Fiabilité et persistance

RabbitMQ assure la **durabilité des messages** grâce à la persistance sur disque et à la gestion des **acknowledgements** (ACK/NACK).
Combinées à des quorum queues sur un cluster de 3 réplicas ou plus, ces mécanismes évitent la perte de messages en cas de défaillance d'un nœud.

**Exemples :**

* File d'attente transactionnelle pour traitements critiques
* Traitement garanti des messages financiers ou logistiques
* Transfert de données entre services avec reprise automatique après erreur

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Démarrage rapide", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Tous les services de messagerie", href: "../../"},
  ]}
/>
