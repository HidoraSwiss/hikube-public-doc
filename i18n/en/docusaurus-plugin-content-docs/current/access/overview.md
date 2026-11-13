---
sidebar_position: 1
title: Access management overview
description: "Hikube access management: who accesses what in your organization, invitations, tiers, second factor, access review and SSO connection with your identity provider."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Access management

Access management decides **who** enters your Hikube organization and **what each person can do there**. It is driven from the [console](https://console.hikube.cloud), your profile menu → **Organization members**.

## What it covers

| Need | What Hikube offers |
|---|---|
| Let someone in | An invitation, on the organization or on a single project |
| Decide their rights | Four tiers: **Read**, **Use**, **Admin**, **Super admin** |
| Protect sign-ins | A mandatory second factor for every account with a password |
| Control access | An exportable access review, with last sign-in and inactivity |
| Prove ownership of a domain | Domains verified by a DNS record |
| Use your company's accounts | An SSO connection with your identity provider (Okta, Microsoft Entra ID…) |
| Let your directory decide rights | Role bindings: a group of your directory grants a tier |

## Who it is for

- **Members** view the member list, answer their invitations and can leave an organization.
- **Administrators** invite, change tiers, remove access, manage domains and export the access review.
- **Super admins** grant **Super admin** and manage the SSO connection.

## Removed access takes effect quickly

A lowered tier, a removed member, a deleted role binding: the person is signed out and the change applies within **5 minutes** at most.

:::info Console and API
Access management is done in the console. An [API key](../../api/authentication) cannot call it: a key acts on the resources of a project, never on access.
:::

<NavigationFooter
  nextSteps={[
    {label: "Concepts", href: "../concepts"},
    {label: "Quick start: SSO connection", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Invite people", href: "../how-to/invite-members"},
  ]}
/>
