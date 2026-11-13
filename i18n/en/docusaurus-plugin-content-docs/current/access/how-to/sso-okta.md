---
sidebar_position: 10
title: "How to configure Okta for SSO"
description: "Prepare an Okta application for your Hikube organization's SSO connection: OIDC integration, assignments, discovery URL and groups claim for tiers."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Configure Okta

:::tip Verified provider
Hikube has verified this configuration on a test Okta organization: complete sign-ins, `groups` claim, role bindings and change of application.
:::

This page describes the Okta part. First read [Quick start](../quick-start.md), then come back to [Create the SSO connection](./configure-sso-connection.md) for the Hikube part.

## 1. Create the application

1. In Okta's Admin Console, open **Applications → Create App Integration**.
2. Choose **OIDC - OpenID Connect**, then **Web Application**.
3. **Sign-in redirect URIs**: paste the redirect URI shown by the Hikube console.
4. **Grant type**: **Authorization Code**.
5. **Client authentication**: **Client secret**. You can check **Require PKCE as additional verification**.
6. Save, then copy the **Client ID** and the **Client secret**.

## 2. Assign people

In **Assignments**, assign only the people or groups who need Hikube. A person assigned only through a group can no longer sign in once removed from that group.

## 3. Find the discovery URL

| Authorization server | Discovery URL |
|---|---|
| `default` custom server | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` |
| Other custom server | `https://acme.okta.com/oauth2/<server id>/.well-known/openid-configuration` |
| Okta organization server | `https://acme.okta.com/.well-known/openid-configuration` |

With a custom domain, replace `acme.okta.com` with that domain.

## 4. Add the `groups` claim (optional)

Do this only if Okta must decide the tiers in Hikube (see [Grant tiers from your provider](./sso-role-bindings.md)).

1. Open **Security → API → Authorization Servers**, then the server chosen in step 3 and the **Claims** tab.
2. Add a claim named `groups`:
   - included in the **ID Token**, **Always** (not only for a scope);
   - **Value type**: **Groups**;
   - a filter, 100 groups at most. For example **Starts with** `hikube-`, if your Hikube groups share this prefix.
3. In Hikube, enter `groups` in **Roles claim**.

Add the claim to the authorization server, not to the application. A server claim applies to all the applications that use it.

## Summary

| | Okta |
|---|---|
| E-mail address, first name and last name | Standard claims of the `email` and `profile` scopes |
| `email_verified` | Sent |
| **Confirm the address by a link** can be turned off | Yes |
| Roles claim | `groups` |
| PKCE | Supported |

<NavigationFooter
  nextSteps={[
    {label: "Create the SSO connection", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Grant tiers from your provider", href: "../sso-role-bindings"},
    {label: "Microsoft Entra ID", href: "../sso-entra-id"},
  ]}
/>
