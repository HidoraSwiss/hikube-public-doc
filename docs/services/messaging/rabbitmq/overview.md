---
sidebar_position: 1
title: Vue d'ensemble
---


# RabbitMQ sur Hikube

Les **clusters RabbitMQ** d’Hikube offrent une **infrastructure de messagerie fiable, distribuée et hautement disponible**, conçue pour la **communication asynchrone entre services et applications**.
Basé sur le protocole **AMQP (Advanced Message Queuing Protocol)**, RabbitMQ garantit un **acheminement sûr et ordonné des messages**, adapté aussi bien aux architectures **microservices** qu’aux systèmes d’intégration métier complexes.

---

## 🏗️ Architecture et Fonctionnement

Un déploiement RabbitMQ sur Hikube repose sur plusieurs concepts fondamentaux :

* **Producers** → envoient les messages à RabbitMQ via des **exchanges**, qui déterminent comment les messages sont routés vers les **queues**.
* **Exchanges** → appliquent une logique de routage (direct, fanout, topic ou headers) pour distribuer les messages selon des clés de routage.
* **Queues** → stockent les messages jusqu’à ce qu’ils soient consommés par les **consumers**.
* **Consumers** → récupèrent et traitent les messages, garantissant un flux de travail **asynchrone, fiable et découplé**.

Les clusters RabbitMQ sur Hikube sont configurés en **mode haute disponibilité (HA)**, avec une **réplication des files de messages** entre plusieurs nœuds pour assurer la continuité du service en cas de panne.

> ⚙️ Les clusters Hikube utilisent la **fonctionnalité quorum queues** pour offrir un comportement similaire à celui des consensus distribués (basé sur Raft), garantissant **intégrité et tolérance aux pannes**.

---

## 🚀 Cas d’usage typiques

### 💬 Communication inter-services

RabbitMQ est souvent utilisé comme **bus de messages interne** entre applications ou microservices.
Il permet de **décorréler les traitements**, réduire la latence perçue et améliorer la **résilience globale**.

**Exemples :**

* File d’attente de traitement pour des tâches longues (emails, rapports, notifications)
* Système d’événements métiers (commandes, paiements, inventaires)
* Communication fiable entre microservices distribués

---

### ⚙️ Gestion de flux asynchrones

RabbitMQ simplifie la mise en place de **workflows asynchrones** où chaque composant travaille indépendamment des autres.

**Exemples :**

* Orchestration de jobs en arrière-plan
* Traitement parallèle de lots de données
* Coordination de pipelines CI/CD ou d’automatisations internes

---

### 📡 Intégration d’applications et interconnexion de systèmes

RabbitMQ agit comme **pont de communication universel** entre applications, langages ou environnements hétérogènes.

**Exemples :**

* Intégration entre applications legacy et microservices modernes
* Connexion entre systèmes internes et plateformes externes via AMQP ou MQTT
* Centralisation des messages d’événements métiers dans un même bus

---

### 🔒 Fiabilité et persistance

RabbitMQ assure la **durabilité des messages** grâce à la persistance sur disque et à la gestion des **acknowledgements** (ACK/NACK).
Cela garantit qu’aucun message n’est perdu, même en cas de défaillance temporaire d’un nœud ou d’un réseau.

**Exemples :**

* File d’attente transactionnelle pour traitements critiques
* Traitement garanti des messages financiers ou logistiques
* Transfert de données entre services avec reprise automatique après erreur
