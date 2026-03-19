---
sidebar_position: 1
title: Panoramica
---

# NATS sur Hikube

Les **clusters NATS** d’Hikube offrent une **plateforme de messagerie moderne, ultra-légère et performante**, conçue pour la **communication en temps réel** entre services, applications et appareils connectés.  
Pensé pour les **architectures cloud natives et microservices**, NATS combine **simplicité, rapidité et résilience** dans un système unique et facile à opérer.

---

## 🏗️ Architecture et Fonctionnement

NATS adopte une architecture **pub/sub** (publish–subscribe) sans broker complexe : chaque message est envoyé à un **sujet** (`subject`) que d’autres applications peuvent **écouter**.

* **Publishers** → publient des messages sur un sujet (`orders.created`, `user.login`, etc.)  
* **Subscribers** → s’abonnent à ces sujets pour recevoir les messages correspondants  
* **Subjects** → définissent les canaux logiques de communication, hiérarchisés et dynamiques  
* **JetStream** → ajoute la **persistance**, la **relecture (replay)** et les **garanties de livraison**

---

## 🌿 Légèreté et performance

NATS est reconnu pour sa **vitesse exceptionnelle** et son **empreinte minimale**, ce qui en fait un composant idéal pour les architectures distribuées.

**Caractéristiques clés :**

* Temps de démarrage inférieur à la seconde  
* Moins de **10 Mo de mémoire** consommée par instance  
* Gestion de **millions de messages par seconde**  
* Communication directe entre services, sans intermédiaire lourd  
* Architecture **stateless** et facilement **scalable horizontalement**

> NATS offre un débit élevé avec une latence moyenne mesurée en **microsecondes**, même sous forte charge.

---

## 🧩 Conçu pour les architectures microservices

Chaque service peut publier ou consommer des événements sans dépendre du reste du système, favorisant un **découplage fort** et une **meilleure résilience**.

**Exemples d’utilisation :**

* Diffusion d’événements applicatifs en temps réel  
* Communication entre microservices distribués  
* Requêtes légères entre services (pattern **request/reply**)  
* Gestion d’événements métier (création de commande, notification, mise à jour de profil)

---

## 🔗 Protocoles supportés

NATS est un protocole **binaire optimisé** mais reste compatible avec de nombreux environnements et standards :

* **NATS Core** → messagerie légère (pub/sub, request/reply)  
* **NATS JetStream** → persistance, replay et contrôle de flux  
* **NATS WebSocket** → intégration directe avec des applications web  
* **NATS MQTT** → support des objets connectés (IoT)  
* **NATS gRPC** → interopérabilité avec des API modernes  
* **Clients** disponibles dans plus de **40 langages** : Go, Python, Node.js, Java, Rust, C#, etc.

---

## 🚀 Cas d’usage typiques

### ⚡ Communication temps réel

NATS excelle dans la **transmission instantanée d’événements** entre applications distribuées.

**Exemples :**

* Notifications en direct et mises à jour d’état  
* Monitoring applicatif et collecte de métriques  
* Synchronisation de données entre microservices

---

### 📦 Streaming d’événements et persistance

Avec **JetStream**, NATS devient un **système de streaming durable** :

* Stockage temporaire ou persistant des messages  
* Relecture des événements pour l’audit ou la reprise après incident  
* Contrôle de flux pour ne jamais surcharger les consommateurs

---

### 🔒 Sécurité et fiabilité

Les clusters NATS Hikube intègrent des mécanismes de sécurité avancés :

* **Chiffrement TLS/mTLS**  
* **Authentification par NKeys et JWT**  
* **Contrôle d’accès par sujet (subject-level ACL)**  

Cela garantit une **communication fiable, sécurisée et isolée** entre services, même dans des environnements multi-tenant.

---

### 🧠 Simplicité d’administration

Grâce à son **design minimaliste** et à ses **outils intégrés (CLI, dashboards, métriques Prometheus)**, NATS est simple à exploiter et à superviser, même à grande échelle.

**Exemples :**

* Bus d’événements internes pour plateformes distribuées  
* Orchestration d’automatisations internes  
* Système de messagerie centralisé et léger pour Kubernetes
