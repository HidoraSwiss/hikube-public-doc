---
sidebar_position: 12
title: "How to configure Google Workspace for SSO"
description: "Prepare a Google Workspace OAuth client for your Hikube organization's SSO connection: internal consent screen, redirect URI and primary domain."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configure Google Workspace

:::caution Not verified
This page follows Google's documentation. Hikube has not yet verified it on a real Workspace. Open point: the behavior for a person from a secondary domain of the Workspace. Contact support before putting it into production.
:::

This page describes the Google part. First read [Quick start](../quick-start.md), then come back to [Create the SSO connection](./configure-sso-connection.md) for the Hikube part.

## 1. Restrict the application to your Workspace

1. In the Google Cloud console of your Workspace, open **APIs & Services → OAuth consent screen**.
2. **User type**: **Internal**. Only the accounts of your Workspace can then use the application.

## 2. Create the OAuth client

1. Open **Credentials → Create credentials → OAuth client ID**.
2. **Application type**: **Web application**.
3. **Authorized redirect URIs**: the redirect URI shown by the Hikube console.
4. Copy the **Client ID** and the **Client secret**.

## 3. Prepare the connection in Hikube

- **Discovery URL**: `https://accounts.google.com/.well-known/openid-configuration`.
- **Allowed domains**: exactly one domain, the primary domain of your Workspace (for example `acme.com`). It must be verified in Hikube.
- **Roles claim**: leave it empty. Google's ID token carries no groups. Tiers are granted in Hikube.

Personal Google accounts and other Workspaces are refused.

## Summary

| | Google Workspace |
|---|---|
| Domains | Exactly one: the primary domain of the Workspace, verified in Hikube |
| E-mail address, first name and last name | Standard claims of the `email` and `profile` scopes |
| `email_verified` | Sent |
| **Confirm the address by a link** can be turned off | Yes |
| Roles claim | None: grant tiers in Hikube |
| PKCE | Supported |

:::warning No change of type
A Google connection cannot become a connection to another provider, nor the reverse. Delete the connection and create a new one.
:::

<NavigationFooter
  nextSteps={[
    {label: "Create the SSO connection", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Manage members", href: "../manage-members"},
  ]}
/>
