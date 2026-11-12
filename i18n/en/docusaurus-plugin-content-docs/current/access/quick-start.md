---
sidebar_position: 3
title: Quick start
description: "Set up the SSO connection of your Hikube organization in 7 steps: verified domain, connection, redirect URI, enabling, test, troubleshooting and disabling."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Quick start: SSO connection

This guide sets up the SSO connection of the `acme` organization. People whose address ends in `@acme.com` will then sign in to Hikube with their company account.

## Before you start

- The **Super admin** tier on the organization.
- Administrative access to your identity provider.
- A **confidential** web application, dedicated to Hikube, registered at your provider, with its client id and secret: [Okta](./how-to/sso-okta.md), [Microsoft Entra ID](./how-to/sso-entra-id.md), [Google Workspace](./how-to/sso-google-workspace.md) or [Auth0](./how-to/sso-auth0.md).

### Checklist

1. **Claims in the ID token.** `email`, the first name, the last name and, if you use it, the roles claim must be in the **ID token**. Hikube reads them nowhere else.
2. **Address confirmation.** Leave **Confirm the address by a link** enabled, unless your provider sends `email_verified` in the ID token. Microsoft Entra ID does not send it.
3. **PKCE.** Leave it enabled, unless your provider refuses it.
4. **Roles claim.** Set it only if your provider must decide the tiers (see [role bindings](./how-to/sso-role-bindings.md)).
5. **Second factor.** The MFA of SSO accounts is enforced by your provider, not by Hikube.
6. **Invitation or not.** By default, any person from an allowed domain whom your provider lets through gets an account. **Invitation required** only admits invited people.
7. **A super admin with a password.** Keep at least one: it is your fallback access if your provider is unavailable.

The full technical requirements are in [Concepts](./concepts.md#technical-requirements).

## Step 1: Verify the domain

1. Your profile menu → **Organization members**, **Domains** tab.
2. **Add a domain**: `acme.com`, then **Add**.
3. Publish the `TXT` record shown in the DNS zone of `acme.com`.
4. Click **Verify**.

**Expected result**: `acme.com` has the **Verified** status. Details: [Verify a domain](./how-to/verify-domain.md).

![Domains tab: acme.com pending, with the TXT record to publish](/img/console/access/domain-pending.en.png)

## Step 2: Create the connection

1. Open the **SSO connection** tab, then click **Create the connection**.
2. Fill in at least:
   - **Display name**: `Acme`;
   - **Discovery URL**: `https://acme.okta.com/oauth2/default/.well-known/openid-configuration`;
   - **Client id** and **Client secret**: those of the application;
   - **Allowed domains**: check `acme.com`.
3. Click **Create**.

**Expected result**: **SSO connection created.** The connection is **Disabled**. All the fields are described in [Configure the SSO connection](./how-to/configure-sso-connection.md).

![Create the SSO connection form filled in for Okta](/img/console/access/sso-create.en.png)

## Step 3: Register the redirect URI and enable

1. In the **SSO connection** card, copy the **Redirect URI**.
2. At your provider, paste it as is into the application.
3. In Hikube, click **Enable**.

**Expected result**: **SSO connection enabled.** The status changes to **Enabled**.

![Enabled SSO connection: redirect URI, settings and role bindings](/img/console/access/sso-connection.en.png)

## Step 4: Test the connection

1. Open a private browsing window on [console.hikube.cloud](https://console.hikube.cloud).
2. Enter an `@acme.com` address that has no Hikube password.
3. Sign in at your provider.
4. Open the confirmation link received by e-mail.

**Expected result**: the person reaches the console. They appear in **Organization members** with the **No tier** badge.

## Step 5: Grant tiers

- **Without a roles claim**: on the person's row, **Edit**, then choose their tier (see [Manage members](./how-to/manage-members.md)).
- **With a roles claim**: create one role binding per group (see [Grant tiers from your provider](./how-to/sso-role-bindings.md)).

**Expected result**: after a refresh, the person sees the projects of their tier.

## Step 6: Quick troubleshooting

| Symptom | Probable cause |
|---|---|
| Creation refused, discovery URL | Copy the URL as your provider shows it; the issuer must match |
| **Enable** refused | The domain is not verified, or its `TXT` record has disappeared |
| Redirect URI error at the provider | The registered URI is not exactly the console's |
| Person refused | Address outside the allowed domains, or person not assigned to the application |
| Signed in without access | No tier granted, or no role binding matches their token |

More cases: [Troubleshooting](./troubleshooting.md).

## Step 7: Disable or delete

- **Disable**: nobody signs in through your provider any more. SSO accounts and their access are kept.
- **Delete**: the SSO accounts created by the connection are deleted.

See [Manage the SSO connection](./how-to/manage-sso-connection.md).

<NavigationFooter
  nextSteps={[
    {label: "Grant tiers from your provider", href: "../how-to/sso-role-bindings"},
    {label: "Manage the SSO connection", href: "../how-to/manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Concepts", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
