---
sidebar_position: 7
title: "Troubleshooting — Access management"
sidebar_label: Troubleshooting
description: "60xxx error codes of Hikube access management (members, invitations, domains, SSO connection, role bindings): meaning and action."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Troubleshooting — Access management

The console shows a message for every refusal. The tables below give the error code (`60xxx`), its meaning and the action to take. If you contact support, give the message shown and the time of the operation.

## Members and tiers

| Code | Message | What to do |
|---|---|---|
| `60003` | You cannot grant a tier higher than your own | Ask a member with a high enough tier |
| `60206` | This account's tiers come from the identity provider | Change them in your directory (see [role bindings](./how-to/sso-role-bindings.md)) |
| `60207` | The organization must keep at least one super admin who can sign in with a password | First appoint another super admin |
| `60208` | This member has a higher tier than yours | Ask a super admin |
| `60209` | You cannot lower or remove your own tiers | Ask another administrator, or [leave the organization](./how-to/manage-members.md#leave-the-organization-or-a-project) |
| `60210` | The project must keep at least one direct administrator | First appoint another administrator of the project |
| `60211` | A super admin must have a password and a second factor, not linked to an identity provider | Register a [second factor](./how-to/set-up-second-factor.md), or choose an account with a password |
| `60115` | Unknown tier, or **Super admin** requested on a project | Choose **Read**, **Use** or **Admin** on a project |
| `60015` | The tier is not ready yet on a newly created project | Try again in a few seconds |
| `60005` | Service temporarily unavailable | Try again |

## Invitations

| Code | Message | What to do |
|---|---|---|
| `60004` | Invitation not found | Sign in with the account of the invited address, whose address is verified |
| `60221` | The invitation is no longer pending | It expired, was cancelled or was already accepted: ask for a new one |
| `60214` | The organization has reached its maximum number of members | Remove a member, or contact support |
| `60215` | Maximum number of pending invitations reached | Cancel invitations, or wait for them to be accepted |
| `60216` | Too many invitations sent within the hour | Try again later |
| `60222` | The organization that owns your account does not allow it to join other organizations | Ask its administrators (see [External members](./how-to/invite-members.md#external-members)) |
| `60120` | Invalid invitation: address, duplicate, no tier or project | Correct the input |

## Account transfer

| Code | Message | What to do |
|---|---|---|
| `60220` | The address is on no verified domain of the organization | Verify the domain, or accept without transferring the account |
| `60219` | The account has access in another organization | Accept without transferring the account |
| `60212` | The account does not belong to the organization | You can only remove its access |
| `60213` | Action not possible on an SSO account: its credentials are at your provider | Act at your identity provider |

## Domains

| Code | Message | What to do |
|---|---|---|
| `60110` | Invalid domain | Enter a host name of at least two labels, 235 characters at most |
| `60111` | Public mail service or public suffix | Declare your company's domain |
| `60118` | Limit exceeded, for example a 21st domain | Remove a domain that is no longer used |
| `60201` | The TXT record is missing or does not carry the token | Publish it again; a freshly published record can take the zone's negative TTL to become visible |
| `60013` | The DNS lookup failed | Try again |
| `60202` | The domain is verified by another organization | Contact support to transfer it |
| `60203` | The verification has expired | **Restart the verification** |
| `60204` | The domain is already verified | Publish its record again rather than restarting |
| `60205` | The SSO connection allows this domain | First remove it from its **Allowed domains** |
| `60010` | Domain not found in the organization | Refresh the page |

## SSO connection and role bindings

| Code | Message | What to do |
|---|---|---|
| `60112` | Discovery document refused: unreachable, different issuer, missing endpoint or signature; or switching from Google to another provider | Copy the discovery URL as your provider shows it (see [Technical requirements](./concepts.md#technical-requirements)) |
| `60119` | SAML is not supported | Use OpenID Connect |
| `60113` | Invalid claim name | A name or a dotted path; a dot within a name is written `\.` |
| `60114` | Invalid scope, or role binding project not found | Remove `offline_access`; choose a project of the organization |
| `60118` | Field out of bounds: Google connection without exactly one domain, value longer than 255 characters, 257th role binding… | Correct the field named in the message |
| `60200` | An allowed domain, or the one required to enable, is not verified | [Verify the domain](./how-to/verify-domain.md) |
| `60201` | A domain's TXT record has disappeared | Publish it again, then try again |
| `60218` | The organization already has an SSO connection | Edit or replace the existing connection |
| `60117` | Role binding on a connection without a roles claim | First set the **Roles claim** |
| `60116` | This project cannot receive a tier of its own | Grant the tier on the organization, or contact support |
| `60223` | The value is already bound on the connection | Edit the existing role binding |
| `60011` / `60012` | Connection or role binding not found | Refresh the page |

## SSO sign-in problems

### A person is refused at sign-in

- Their address is not on an **Allowed domain**: `bob@eu.acme.com` is not `acme.com`.
- Their address is not in the ID token (Entra ID: empty mail attribute).
- They are not assigned to the application at your provider.
- **Invitation required** is enabled and they were not invited.

### A person signs in but has no access

- Without a roles claim: an administrator must grant them a tier.
- With a roles claim: no role binding matches a value of their token. Check the exact value, including case. With Entra ID and the `groups` claim, beyond 200 groups the claim is missing.
- With **Confirm the address by a link**: they have not opened the link yet.
- The member limit has been reached.

### Nobody can sign in through SSO any more

- The client secret has expired at your provider: enter the new one in **Edit settings**.
- The connection is **Disabled**: an allowed domain may have been removed.
- Sign in with a super admin who has a password.

<NavigationFooter
  seeAlso={[
    {label: "API errors", href: "../../api/errors"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
