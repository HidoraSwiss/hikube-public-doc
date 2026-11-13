---
sidebar_position: 13
title: "How to configure Auth0 for SSO"
description: "Prepare an Auth0 application for your Hikube organization's SSO connection: Regular Web Application, sign-ups closed and roles claim written by an Action."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configure Auth0

:::caution Not verified
This page follows Auth0's documentation. Hikube has not verified it on a test Auth0 tenant. Contact support before putting it into production.
:::

This page describes the Auth0 part. First read [Quick start](../quick-start.md), then come back to [Create the SSO connection](./configure-sso-connection.md) for the Hikube part.

## 1. Create the application

1. Open **Applications → Create Application → Regular Web Application**.
2. **Allowed Callback URLs**: the redirect URI shown by the Hikube console.
3. **Token Endpoint Authentication Method**: a client secret method.
4. Copy the **Client ID** and the **Client Secret**.

## 2. Close sign-ups

Disable sign-ups (**sign-ups**) on the database connection the application uses. Only the people you have created can then sign in.

## 3. Write the roles claim (optional)

Do this only if Auth0 must decide the tiers in Hikube (see [Grant tiers from your provider](./sso-role-bindings.md)).

Write the roles into the ID token with a **post-login** Action. The names `roles` and `groups` are reserved by Auth0: use a namespaced name, for example `https://acme.com/roles`.

In Hikube, a dot within a claim name is written `\.`. So enter `https://acme\.com/roles` in **Roles claim**.

## Discovery URL

```text
https://acme.eu.auth0.com/.well-known/openid-configuration
```

Replace `acme.eu` with your tenant and its region, or use your custom domain.

## Summary

| | Auth0 |
|---|---|
| E-mail address, first name and last name | Standard claims of the `email` and `profile` scopes |
| `email_verified` | Sent |
| **Confirm the address by a link** can be turned off | Yes |
| Roles claim | Written by a post-login Action, with a namespaced name |
| PKCE | Supported with the client secret |

<NavigationFooter
  nextSteps={[
    {label: "Create the SSO connection", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Grant tiers from your provider", href: "../sso-role-bindings"},
  ]}
/>
