---
title: Hikube API v1.6.5
authors: [hikube]
tags: [release]
---

This patch release restores the displayed usage and the quota checks of projects that have no quota of their own and share their organization's.

<!-- truncate -->

## Fixed

- **Quotas** — For a project without a quota of its own, which shares its organization's, `GET .../projects/{name}/quota-usage` returned `0` used out of a total of `0`, so the console showed an empty project. The actual usage is returned again, and the total is the share of the organization's quota that applies to the project. The console's real-time updates follow the same rule.

- **Quotas** — For these same projects, creating or growing a disk (`30202`, `20210`) and resizing a Kubernetes control plane (`70209`) were not checked against the quota. A request that was too large was accepted, then stayed stuck for lack of room. It is refused upfront again, and nothing is created.
