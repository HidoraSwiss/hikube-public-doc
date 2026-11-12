---
sidebar_position: 11
title: "How to configure Microsoft Entra ID for SSO"
description: "Prepare a Microsoft Entra ID application for your Hikube organization's SSO connection: single-tenant registration, claims, app roles and required assignment."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configure Microsoft Entra ID

:::tip Verified provider
Hikube has verified this configuration on a test Entra ID tenant: complete sign-ins with app roles and role bindings, refusal of an unassigned person, refusal of the `/common` URL. The `groups` claim has not been verified: prefer app roles.
:::

This page describes the Entra ID part. First read [Quick start](../quick-start.md), then come back to [Create the SSO connection](./configure-sso-connection.md) for the Hikube part.

## 1. Register the application

1. Open **App registrations → New registration**.
2. **Supported account types**: **Accounts in this organizational directory only** (a single tenant).
3. **Redirect URI**: **Web** platform, then the redirect URI shown by the Hikube console.

## 2. Create the secret

1. Open **Certificates & secrets → New client secret**.
2. Copy the secret's value and the **Application (client) ID**.
3. Note the secret's expiry date. Replace it in Hikube before that date, otherwise nobody will be able to sign in through the SSO connection.

## 3. Add the claims to the ID token

1. Open **Token configuration → Add optional claim**, type **ID**.
2. Check `email`, `given_name` and `family_name`.

Entra ID only sends `email` for people whose mail attribute is set. Without an address, the sign-in is refused.

## 4. Grant consent

1. Open **API permissions**.
2. Add the Microsoft Graph delegated permissions `openid`, `email` and `profile`.
3. Click **Grant admin consent**.

Without this consent, each person must consent at their first sign-in.

## 5. Create the app roles (optional)

Do this only if Entra ID must decide the tiers in Hikube (see [Grant tiers from your provider](./sso-role-bindings.md)).

1. Open **App roles → Create app role** and create one role per access level, for example `hikube-admins` and `hikube-devs`. **Allowed member types**: **Users/Groups**.
2. In **Enterprise applications → Users and groups**, assign each person or group their role.
3. In Hikube, enter `roles` in **Roles claim**. The value to bind is the role's **Value**.

As soon as the application has roles, each assignment requires one: Entra ID no longer offers a "Default Access" role. To let someone in without a tier, give them a role that no role binding names.

## 6. Restrict access

1. In **Enterprise applications**, open the application.
2. Set **Assignment required** to **Yes**.
3. Assign the people or groups who need Hikube.

An unassigned person is stopped by Entra ID (error `AADSTS50105`). They do not get a Hikube account.

## Discovery URL

```text
https://login.microsoftonline.com/<tenant id>/v2.0/.well-known/openid-configuration
```

Use your tenant's identifier. The `/common` and `/organizations` URLs are refused: their issuer is not your tenant.

## Tenant guests

A guest of your tenant (personal Microsoft account or account of another company) signs in with their own address. This address is not on your verified domains: Hikube refuses it.

## Summary

| | Microsoft Entra ID |
|---|---|
| E-mail address, first name and last name | Optional claims to add to the ID token |
| `email_verified` | Not sent |
| **Confirm the address by a link** can be turned off | No: leave the option enabled |
| Roles claim | `roles` (app roles, recommended). Or `groups`: object identifiers of the groups, omitted beyond 200 groups |
| PKCE | Supported |

:::warning `groups` claim and more than 200 groups
A person who is a member of more than 200 groups receives no `groups` claim. They then sign in without any tier. Prefer app roles.
:::

<NavigationFooter
  nextSteps={[
    {label: "Create the SSO connection", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Grant tiers from your provider", href: "../sso-role-bindings"},
    {label: "Okta", href: "../sso-okta"},
  ]}
/>
