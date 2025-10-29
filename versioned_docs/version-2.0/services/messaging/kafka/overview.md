---
sidebar_position: 1
title: Vue d'ensemble
---

# Kafka sur Hikube

Les **clusters Kafka** d’Hikube offrent une plateforme de **streaming de données distribuée, scalable et hautement disponible**, conçue pour la **collecte, le traitement et la distribution d’événements en temps réel**.
Grâce à son intégration native avec **ZooKeeper**, chaque cluster Kafka sur Hikube bénéficie d’une **gestion coordonnée et résiliente des brokers**, assurant la **stabilité et la cohérence** des métadonnées du cluster.

---

## 🏗️ Architecture et Fonctionnement

Un déploiement Kafka sur Hikube repose sur deux composants clés :

* **Kafka** → assure la **publication, le stockage et la diffusion** des messages via un modèle *publish / subscribe*.
  Les messages sont organisés en **topics**, divisés en **partitions** réparties entre plusieurs **brokers**.
  Cela permet d’obtenir un **haut débit**, une **faible latence** et une **scalabilité horizontale**.

* **ZooKeeper** → agit comme un **registre central de coordination**.
  Il gère la **configuration des brokers**, le **suivi des partitions et des leaders**, ainsi que la **synchronisation entre les nœuds**.
  En cas de défaillance d’un broker, ZooKeeper élit automatiquement un nouveau leader pour maintenir la continuité du service.

> ⚙️ Les futurs déploiements Kafka sur Hikube évolueront vers la nouvelle génération **KRaft (Kafka Raft Metadata Mode)**, qui remplace progressivement ZooKeeper tout en conservant la compatibilité ascendante.

---

## 🚀 Cas d’usage typiques

### 📡 Intégration et synchronisation de systèmes

Kafka joue le rôle de **bus d’événements central** entre les différentes applications d’une organisation.
**Exemples :**

* Synchroniser les données entre microservices ou systèmes distants
* Connecter des bases de données et outils analytiques via **Kafka Connect**
* Décorréler les échanges entre applications pour une architecture plus robuste

---

### ⚙️ Traitement temps réel et analytics

Kafka permet d’analyser et de transformer les données **au moment où elles sont produites**.
**Exemples :**

* Détection de fraude en temps réel
* Calcul de métriques ou génération d’alertes instantanées
* Alimentation continue de dashboards analytiques (ClickHouse, Elasticsearch, Grafana, etc.)

---

### 🛰️ Collecte de données IoT et logs

Kafka simplifie la **collecte massive de données hétérogènes** provenant de capteurs, d’applications ou de serveurs.
**Exemples :**

* Centralisation de télémétrie IoT pour des milliers d’appareils
* Agrégation de logs applicatifs dans un pipeline de monitoring
* Transmission de flux vers plusieurs destinations simultanément

---

### 💬 Communication inter-services

Kafka permet une **communication asynchrone** entre microservices, améliorant la résilience et réduisant la dépendance entre composants.
**Exemples :**

* Gestion d’événements métiers (commandes, paiements, notifications)
* File d’attente distribuée pour tâches ou workflows complexes
* Intégration avec des workers ou consumers spécialisés