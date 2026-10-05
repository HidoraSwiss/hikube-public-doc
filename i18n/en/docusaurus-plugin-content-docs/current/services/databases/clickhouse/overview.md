---
sidebar_position: 1
title: Overview
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# ClickHouse on Hikube

:::info Availability
ClickHouse is not yet available as self-service in the [Hikube console](https://console.hikube.cloud).
To provision an instance or change its configuration, [contact support](mailto:support@hidora.io).
:::

Hikube **ClickHouse databases** provide an open source, high-performance, column-oriented SQL management system designed for online analytical processing (OLAP). They ensure fast ingestion of massive data, execution of complex queries in near real time, and the reliability required by critical enterprise analytics applications.

---

## Architecture and operation

The ClickHouse architecture relies on two key parameters that let you adapt the deployment to your actual needs:

- **Shards** → they **split the data into several pieces** across different nodes. The more shards, the more the load is distributed, which improves query execution speed on very large volumes.
- **Replicas** → they create **redundant copies** of the shards. This increases resilience and fault tolerance, while allowing read load to be spread across several nodes.

### Illustrative example

Consider a database of **1 billion customer records**:

- **1 shard – 1 replica**
  All the data is stored in a single space.
  **Use cases:**
  - Pilot projects (POC)
  - Development environments
  - Occasional analytical workloads

- **2 shards – 1 replica**
  The data is split into two parts (e.g. customers A–M and N–Z). Queries run in parallel, which speeds up analysis considerably.
  **Use cases:**
  - Analysis of large data volumes
  - Applications requiring better performance
  - Regular reports on large customer or transaction bases

- **2 shards – 2 replicas**
  Each shard is duplicated on another node. You get both speed (distributed data) and safety (fault tolerance).
  **Use cases:**
  - Critical analytical applications in production
  - High availability requirements
  - Multi-user platforms with high query concurrency
  - Disaster recovery plans (DRP)

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "All databases", href: "../../"},
  ]}
/>
