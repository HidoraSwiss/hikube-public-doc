---
sidebar_position: 1
title: Vue d'ensemble
---

# ClickHouse sur Hikube

Les **bases de données ClickHouse** d’Hikube offrent un système de gestion SQL open source, haute performance et orienté colonnes, conçu pour le traitement analytique en ligne (OLAP). Elles garantissent l’ingestion rapide de données massives, l’exécution de requêtes complexes en temps quasi réel et la fiabilité nécessaire aux applications analytiques critiques des entreprises.

---

## 🏗️ Architecture et Fonctionnement

L’architecture de ClickHouse repose sur deux paramètres essentiels qui permettent d’adapter le déploiement aux besoins réels :  

- **Shards** → ils permettent de **répartir les données en plusieurs morceaux** sur différents nœuds. Plus il y a de shards, plus la charge est distribuée, ce qui améliore la vitesse d’exécution des requêtes sur de très grands volumes.  
- **Réplicas** → ils créent des **copies redondantes** des shards. Cela augmente la résilience et la tolérance aux pannes, tout en permettant de répartir la charge de lecture entre plusieurs nœuds.  

### 🔎 Exemple illustratif

Imaginons une base de **1 milliard d’enregistrements clients** :  

- **1 shard – 1 réplica**  
  Toutes les données sont stockées dans un seul espace.  
  **Cas d’usage :**  
  - Projets pilotes (POC)  
  - Environnements de développement  
  - Charges analytiques ponctuelles  

- **2 shards – 1 réplica**  
  Les données sont divisées en deux parties (par ex. clients A–M et N–Z). Les requêtes sont exécutées en parallèle, ce qui accélère considérablement l’analyse.  
  **Cas d’usage :**  
  - Analyses sur de grands volumes de données  
  - Applications nécessitant de meilleures performances  
  - Rapports réguliers sur de larges bases clients ou transactions  

- **2 shards – 2 réplicas**  
  Chaque shard est dupliqué sur un autre nœud. On bénéficie à la fois de la rapidité (données distribuées) et de la sécurité (tolérance aux pannes).  
  **Cas d’usage :**  
  - Applications analytiques critiques en production  
  - Besoins de haute disponibilité  
  - Plateformes multi-utilisateurs avec forte concurrence de requêtes  
  - Plans de reprise après sinistre (DRP)  
