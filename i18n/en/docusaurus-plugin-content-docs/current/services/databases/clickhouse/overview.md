---
sidebar_position: 1
title: Overview
---

# ClickHouse on Hikube

Hikube **ClickHouse databases** offer an open-source, high-performance, column-oriented SQL management system, designed for online analytical processing (OLAP). They guarantee rapid ingestion of massive data, execution of complex queries in near real-time, and the reliability necessary for critical enterprise analytical applications.

---

## 🏗️ Architecture and Operation

ClickHouse architecture is based on two essential parameters that allow adapting deployment to real needs:  

- **Shards** → they allow **distributing data into multiple pieces** across different nodes. The more shards there are, the more the load is distributed, which improves query execution speed on very large volumes.  
- **Replicas** → they create **redundant copies** of shards. This increases resilience and fault tolerance, while allowing read load distribution across multiple nodes.  

### 🔎 Illustrative Example

Imagine a database of **1 billion customer records**:  

- **1 shard – 1 replica**  
  All data is stored in a single space.  
  **Use cases:**  
  - Proof of concept (POC)  
  - Development environments  
  - Occasional analytical workloads  

- **2 shards – 1 replica**  
  Data is divided into two parts (e.g., customers A–M and N–Z). Queries are executed in parallel, which significantly speeds up analysis.  
  **Use cases:**  
  - Analysis on large data volumes  
  - Applications requiring better performance  
  - Regular reports on large customer bases or transactions  

- **2 shards – 2 replicas**  
  Each shard is duplicated on another node. You benefit from both speed (distributed data) and security (fault tolerance).  
  **Use cases:**  
  - Critical analytical applications in production  
  - High availability needs  
  - Multi-user platforms with high query concurrency  
  - Disaster recovery plans (DRP)  

