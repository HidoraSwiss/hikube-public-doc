---
sidebar_position: 5
title: "How to export the access review"
description: "Export the access review of a Hikube organization: who holds which tier, since when, granted by whom, last sign-in, inactivity and external members."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Access review

The access review is a CSV export of all the tiers of all the members of the organization. It is used for periodic reviews and audits.

## Export the review

Prerequisite: the **Admin** tier or higher.

1. Open **Organization members**, **Members** tab.
2. Click **Export the access review**.

The console downloads `access-review-acme-2026-11-12.csv`. One row per tier and per scope, sorted by e-mail then by project.

## Columns

| Column | Content |
|---|---|
| **E-mail**, **First name**, **Last name** | The person |
| **Scope**, **Project id**, **Tier** | The tier, on the organization or on a project |
| **Granted on (UTC)**, **Granted by** | When and by whom the tier was granted. Empty for a tier granted before Hikube recorded this information |
| **Source** | **Console**, **Invitation** or **Identity provider** |
| **Account type** | **Organization account**, **SSO account** or **Personal account** |
| **External member** | **yes** for an account the organization does not own |
| **Address outside verified domains** | **yes** for an organization account whose address is on none of its verified domains |
| **Account enabled** | **no** for a blocked account |
| **Last sign-in (UTC)** | Empty if no sign-in has been recorded |
| **Inactive** | **yes** with no sign-in since the inactivity threshold |
| **SSO connection**, **Role bindings** | For a tier granted by the identity provider: the connection and the role bindings that grant it |
| **Other organization** | For your organization's accounts: the access they hold in another organization, on separate rows |

## Last sign-in and inactivity

Hikube records the first request of each sign-in to the console. A member is **inactive** when they have not signed in for **90 days**. An account with no recorded sign-in counts from its creation.

An organization can also automatically block its own inactive accounts:

- only the organization's accounts are blocked. External members are only flagged, and a super admin is never blocked this way;
- blocking happens at the next viewing of the member list or of the access review;
- days count at the earliest from when the setting was enabled: enabling it does not block anyone right away;
- an administrator unblocks the account.

:::info Availability
The inactivity threshold (from 1 to 3650 days) and the blocking of inactive accounts cannot be set in the console yet. To change them, contact support. The **Inactive** column uses the default 90-day threshold.
:::

## What to check

- **External members**: is their access still justified?
- **Inactive** accounts: remove access that is no longer used;
- the **Admin** and **Super admin** tiers: keep as few as possible, but at least one super admin with a password;
- **Addresses outside verified domains**;
- for SSO accounts, the **Role bindings** that grant each tier.

<NavigationFooter
  seeAlso={[
    {label: "Manage members", href: "../manage-members"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
