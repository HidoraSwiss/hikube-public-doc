---
sidebar_position: 9
title: "How to manage the SSO connection"
description: "Edit, disable, replace the provider of or delete your Hikube organization's SSO connection, and admit only invited people."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Manage the SSO connection

All these actions are done in **Organization members**, **SSO connection** tab, with the **Super admin** tier.

## Edit settings

1. Click **Edit settings**.
2. Change the fields you want, then click **Save**.

To change only the secret, enter the new one in **Client secret**. Left empty, the current secret is kept. Replace the secret before it expires at your provider: an expired secret blocks all SSO sign-ins.

Adding a domain to the **Allowed domains** checks its DNS record again.

## Invitation required

With **Invitation required**, a first sign-in creates no account. Only the people you invite sign in.

To admit someone, [invite them](./invite-members.md) as usual:

- for an address of an allowed domain, Hikube immediately creates their SSO account, with the invited tiers, **without sending an e-mail**. Tell the person to sign in through your provider;
- at their first sign-in, the person receives a link at their address. Once the link is opened, the account is theirs and the invitation shows as accepted;
- the account counts towards your member limit from the invitation onwards;
- an invitation that expires, or that you cancel before the first sign-in, deletes the account created. Resending it keeps the account;
- a person who was not invited sees that no account exists for their address;
- an address that already has an account is invited as usual.

With a roles claim, tiers come from the provider at sign-in, not from the invitation. Enabling or disabling the option changes no account.

## Disable and enable again

1. Click **Disable**, then confirm **Disable**.

Nobody signs in through your provider any more. SSO accounts and their access are kept. They can sign in again as soon as you click **Enable**.

:::note Removed domain
A domain named in the **Allowed domains** cannot be removed: first remove it from the connection. If the connection no longer serves any domain, it is disabled. To enable it again, choose its allowed domains again.
:::

## Replace the provider

Change application or provider without losing the accounts.

1. At the new provider, configure the application like the first one: same redirect URI, same assignments, same roles claim.
2. In Hikube, click **Replace the provider**.
3. Enter the new **Discovery URL**, the **Client id** and the **Client secret**, then click **Replace**.

What is kept: the connection's identifier, its redirect URI, its settings, the SSO accounts and their access.

At their next sign-in, SSO accounts link to the new provider after opening the link sent to their address. An account that kept a password links by entering that password. SSO accounts whose address was not confirmed yet are deleted.

:::warning Google Workspace
A Google connection cannot switch to another provider, nor the reverse. Delete the connection and create a new one.
:::

## Delete the connection

:::danger Accounts deleted
Deleting the connection deletes the SSO accounts it created, and the accounts handed over to the organization that signed in through it. Their access ends everywhere within 5 minutes. To change providers without losing the accounts, replace the provider.
:::

1. Click **Delete**.
2. The **Delete the SSO connection?** dialog gives the number of SSO accounts deleted.
3. Check **I understand that … account(s) will be deleted.**
4. Click **Delete**.

An account that kept a password is only unlinked from the connection. It keeps signing in with its password and its second factor.

<NavigationFooter
  seeAlso={[
    {label: "FAQ", href: "../../faq"},
    {label: "Invite people", href: "../invite-members"},
    {label: "Verify a domain", href: "../verify-domain"},
  ]}
/>
