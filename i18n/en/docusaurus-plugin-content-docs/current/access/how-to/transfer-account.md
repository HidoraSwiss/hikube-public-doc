---
sidebar_position: 3
title: "How to hand an account over to the organization"
description: "Transfer a personal Hikube account to the organization: conditions, effects, what administrators can then do, and the link with the SSO connection."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Hand an account over to the organization

Most people sign in with a **personal account**: it belongs to them, and the organization only gives it access. A person can also **hand** their account **over** to the organization. The account then becomes an **organization account**, managed by its administrators.

:::info Availability
Transferring an account is not offered in the console yet. To hand an account over to your organization, contact support.
:::

## Conditions

Nothing is transferred without the person's consent. The transfer requires:

- a **verified** e-mail address, on a [verified domain](./verify-domain.md) of the organization, whose DNS record is still in place;
- being a member of the organization, or accepting its invitation at the same time;
- **no access in another organization**, neither on it nor on one of its projects. Pending invitations do not count.

A person whose transfer is refused keeps their personal account and the access they were given. They can accept the invitation without transferring their account: they become an external member.

## Effects

- The account keeps its password and its second factor.
- The organization's super admins see the transfer.
- By default, the account can no longer join another organization (see [External members](./invite-members.md#external-members)).

### With an active SSO connection

If the organization's SSO connection is enabled and serves the address's domain, the transfer completes at the person's next sign-in through your provider, after their password and their second factor. The account then becomes an SSO account: its Hikube password and second factor are removed. With a roles claim, its tiers granted in Hikube are replaced by those of the [role bindings](./sso-role-bindings.md).

A super admin is never converted: they keep their password.

## What your administrators can do

On an organization account, an administrator can, in addition to managing its access:

- **block it**: the person is signed out and can no longer sign in; their access is kept for unblocking;
- **unblock it**;
- **reset its credentials**: its password and all its second factors are removed, the person is signed out and receives a link valid for 24 hours to choose new ones. An SSO account has no credentials in Hikube: reset them at your provider;
- **delete it**, with all its access.

:::info Availability
These actions are not in the console yet. Contact support.
:::

Nobody acts on a member with a higher tier than their own, nor blocks or deletes their own account. The organization always keeps an active super admin with a password. The profile (name, e-mail) belongs to the person: your administrators do not edit it.

<NavigationFooter
  seeAlso={[
    {label: "Concepts", href: "../../concepts"},
    {label: "Verify a domain", href: "../verify-domain"},
  ]}
/>
