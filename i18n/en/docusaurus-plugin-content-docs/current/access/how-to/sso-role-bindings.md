---
sidebar_position: 8
title: "How to grant tiers from your provider"
description: "Role bindings: a value of your identity provider's roles claim grants a Hikube tier on the organization or a project. A single source of rights per connection."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Grant tiers from your provider (role bindings)

With a roles claim, your directory decides who holds which tier in Hikube. A **role binding** associates a value of this claim (a group or role name of your directory) with a tier, on the organization or on one of its projects.

Example for the `acme` organization:

| Claim value | Scope | Tier |
|---|---|---|
| `acme-devs` | Organization | **Use** |
| `web-admins` | Project `web` | **Admin** |

A person in the `acme-devs` group receives **Use** on the whole organization at sign-in. A person in `web-admins` receives **Admin** on the `web` project.

## A single source of rights per connection

| Roles claim | Where the tiers of SSO accounts come from |
|---|---|
| **Set** (Entra ID app roles, Okta groups…) | From role bindings only. They are no longer granted, changed or removed in Hikube: change them in your directory |
| **Empty** (Google Workspace, whose token carries no groups) | From Hikube: an administrator grants them from the members page. The connection has no role binding |

When tiers come from the provider, the members page shows on these accounts: **Tiers granted by the identity provider: change them in your directory.** Such a person also cannot leave the organization or accept an invitation that would give them a tier.

Accounts that sign in with a Hikube password are never affected: their tiers are always granted in Hikube.

:::note Never Super admin
A role binding grants **Read**, **Use** or **Admin**. Never **Super admin**: this tier stays with accounts that sign in with a Hikube password and a second factor.
:::

## At every sign-in

A person receives the tier of each role binding whose value their ID token carries. They lose the tier of each role binding whose value has disappeared, unless another role binding grants the same tier.

- A person removed from a group at your provider loses the tier at their **next sign-in**.
- A token without the roles claim grants no tier.
- The value is compared as is, case and spaces included.

## Set up role bindings

Prerequisites: the **Super admin** tier, and an SSO connection created (see [Create the SSO connection](./configure-sso-connection.md)).

### 1. Set the roles claim

1. Open **Organization members**, **SSO connection** tab.
2. Click **Edit settings**.
3. In **Roles claim**, enter the name of the claim, for example `groups` (Okta) or `roles` (Entra ID app roles).
4. Click **Save**.

:::warning Immediate effect
Setting the roles claim removes the tiers granted in Hikube to the connection's SSO accounts. These accounts are signed out. Role bindings decide from then on. Create them right after, then ask people to sign in again.
:::

### 2. Add a role binding

1. In the **Role bindings** section, click **Add a role binding**.
2. **Claim value**: `acme-devs`.
3. **Scope**: **Organization**, or a project.
4. **Tier given**: **Use**.
5. Click **Add**.

The console shows **Role binding of “acme-devs” added. It applies at the next sign-in.**

Repeat for each group. A connection carries at most 256 role bindings, and a value appears only once in it.

![Add a role binding dialog: acme-devs, Organization, Use](/img/console/access/role-binding-add.en.png)

### 3. Edit or delete a role binding

- **Edit**: change the value, the scope or the tier, then **Save**.
- **Delete**: confirm **Delete**.

SSO accounts that held the former tier lose it, unless another role binding grants it. They are signed out: their access ends within **5 minutes** at most. Their next sign-in gives exactly what the remaining role bindings grant.

## Change source

- **Clearing the roles claim** deletes all role bindings and the tiers they granted. The accounts concerned are signed out. Tiers are then granted in Hikube.
- **Deleting a project** deletes the role bindings that target it, with the tiers they granted.
- **A person who hands an account with a password over to the organization** keeps their tiers until their first sign-in through the provider. Then, their tiers granted in Hikube are removed and role bindings decide.

## Access review

The [access review](./export-access-review.md) shows, for each tier of an SSO account, the **Identity provider** source, the connection and the role bindings that grant it.

<NavigationFooter
  nextSteps={[
    {label: "Manage the SSO connection", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Okta: groups claim", href: "../sso-okta"},
    {label: "Entra ID: app roles", href: "../sso-entra-id"},
    {label: "Concepts", href: "../../concepts"},
  ]}
/>
