---
sidebar_position: 7
title: "How to configure the SSO connection"
description: "Create the SSO connection of your organization in the Hikube console: discovery URL, client id, secret, allowed domains, claims, redirect URI and enabling."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Create and enable the SSO connection

This guide creates the SSO connection of the `acme` organization, for `@acme.com` addresses, then enables it.

## Prerequisites

- The **Super admin** tier on the organization.
- The `acme.com` domain verified (see [Verify a domain](./verify-domain.md)).
- An application registered at your identity provider, with its client id and secret: [Okta](./sso-okta.md), [Microsoft Entra ID](./sso-entra-id.md), [Google Workspace](./sso-google-workspace.md) or [Auth0](./sso-auth0.md). You will add the redirect URI to it in step 3.
- The [checklist](../quick-start.md#checklist) reviewed.

## 1. Open the connection page

1. In your profile menu (top right), click **Organization members**.
2. Open the **SSO connection** tab.

The **Single sign-on (SSO)** page shows **No SSO connection**.

## 2. Create the connection

1. Click **Create the connection**.
2. Fill in the **Create the SSO connection** form:

| Field | Example | Good to know |
|---|---|---|
| **Display name** | `Acme` | The name people see at sign-in, 64 characters at most |
| **Discovery URL** | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` | As your provider shows it, over `https`. The URL is the issuer followed by `/.well-known/openid-configuration` |
| **Client id** | `0oa1b2c3d4e5f6g7h8i9` | The application's identifier at your provider |
| **Client secret** | | Write only: it is never shown again |
| **Allowed domains** | `acme.com` checked | None checked: every verified domain of the organization. A subdomain is a domain of its own |
| **Confirm the address by a link** | Enabled | Turn it off only if your provider sends `email_verified` in the ID token |
| **Invitation required** | Disabled | Enabled: only invited people sign in (see [Manage the connection](./manage-sso-connection.md#invitation-required)) |
| **First name claim** / **Last name claim** | Empty | Empty: `given_name` and `family_name` |
| **Roles claim** | Empty, or `groups` | Empty: tiers are granted in Hikube. Set: role bindings decide the tiers of SSO accounts |

Under **Advanced settings**:

| Field | Good to know |
|---|---|
| **PKCE** | Leave it enabled, unless your provider refuses it |
| **Additional scopes** | Separated by spaces. `openid`, `email` and `profile` are always requested. `offline_access` is refused |

3. Click **Create**.

Hikube reads the discovery document and refuses a connection whose issuer, endpoints or signature are not suitable. The console shows **SSO connection created. Register its redirect URI at your provider, then enable it.** The connection is **Disabled**.

:::note Nested claims
A claim can be a dotted path, for example `hikube.roles` for the `roles` field of the `hikube` object. A dot within a name is written `\.`: `https://acme\.com/roles`.
:::

![Create the SSO connection form filled in for Okta](/img/console/access/sso-create.en.png)

## 3. Register the redirect URI

1. In the **SSO connection** card, copy the **Redirect URI**.
2. At your provider, paste it into the application, as is.

## 4. Enable the connection

1. Click **Enable**.
2. The console shows **SSO connection enabled.** and the status changes to **Enabled**.

When enabling, Hikube checks the DNS record of each domain served again. If it has disappeared, enabling is refused: publish the record again (see [Verify a domain](./verify-domain.md)).

## 5. Test

1. Open a private browsing window on [console.hikube.cloud](https://console.hikube.cloud).
2. Enter an `@acme.com` address that has no Hikube password.
3. You are sent to your provider. Sign in.
4. With **Confirm the address by a link**, open the link received by e-mail.

## A person's first sign-in

- **Account creation.** At their first sign-in, Hikube creates the person's account, **without any tier**. The account belongs to the organization: it is an **SSO account**.
- **Confirmation.** With **Confirm the address by a link**, the person confirms their address with the link received. The account appears in the members once confirmed. It is deleted if it is not confirmed within 24 hours.
- **Tiers.** An administrator then grants a tier from [the members page](./manage-members.md). With a roles claim, [role bindings](./sso-role-bindings.md) grant the tiers at every sign-in.
- **Domains.** The address in the ID token must be on an allowed domain, compared exactly. With `acme.com` alone, `bob@eu.acme.com` is refused.
- **Accounts with a password.** They keep signing in with their password and are never redirected.
- **Number of members.** The organization's member limit applies. A person beyond it can sign in, but Hikube refuses their requests until a member has been removed.
- **Profile.** The first name and last name are taken from the ID token at every sign-in. They cannot be edited in Hikube.

<NavigationFooter
  nextSteps={[
    {label: "Grant tiers from your provider", href: "../sso-role-bindings"},
    {label: "Manage the SSO connection", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Quick start", href: "../../quick-start"},
    {label: "Troubleshooting", href: "../../troubleshooting"},
  ]}
/>
