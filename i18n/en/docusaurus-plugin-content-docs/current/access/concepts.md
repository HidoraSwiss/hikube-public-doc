---
sidebar_position: 2
title: Concepts
description: "Organizations, projects, tiers, who does what, member types, verified domains, SSO connection and role bindings: the notions of Hikube access management."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Access management concepts

## Organization and projects

- The **organization** represents your company. It groups your members and your projects.
- A **project** is an isolated space of the organization: your VMs, clusters and databases live there.
- A tier on the organization applies to all its projects. A tier on a project adds to it.

## The four tiers

| Tier | Value | What it allows |
|---|---|---|
| **Read** | `read` | View resources |
| **Use** | `write` | Read, plus using resources |
| **Admin** | `admin` | Create, edit and delete resources; manage members |
| **Super admin** | `superadmin` | All rights, including granting this tier; manage the SSO connection |

A tier includes the rights of the lower tiers. A member who holds several tiers on the same scope is shown with the highest one.

:::note No project super admin
**Super admin** is an organization tier only. On a project, the highest tier is **Admin**.
:::

## Who can do what in the organization

| Action | Read | Use | Admin | Super admin |
|---|:-:|:-:|:-:|:-:|
| See the members, their e-mail and their tier | yes | yes | yes | yes |
| Invite; cancel and resend invitations | no | no | yes | yes |
| Grant or remove **Read**, **Use**, **Admin** | no | no | yes | yes |
| Remove a member's access | no | no | yes | yes |
| Export the access review; manage domains | no | no | yes | yes |
| Act on a member with a higher tier than their own | no | no | no | yes |
| Grant or remove **Super admin** | no | no | no | yes |
| Manage the SSO connection and its role bindings | no | no | no | yes |
| Lower their own tier | no | no | no | no |
| Leave the organization | yes | yes | yes | yes |

Rules that protect the organization:

- nobody grants a tier higher than their own;
- nobody lowers or removes their own tier: to go, you [leave the organization](./how-to/manage-members.md#leave-the-organization-or-a-project);
- the organization always keeps at least one super admin who signs in with a password;
- **Super admin** only goes to an account with a password and a second factor, not linked to an identity provider. This way the organization keeps access if its SSO connection goes down.

## Member types

| Member | Who owns the account | What your administrators can do |
|---|---|---|
| **Organization account** | Your organization, after a [transfer](./how-to/transfer-account.md) | Grant and remove its access; the rest with support |
| **SSO account** | Your organization, created by your SSO connection | Grant and remove its access (or your role bindings) |
| **Personal account** (external member) | The person | Grant and remove their access in your organization, nothing else |
| **Account of another organization** (external member) | The other organization | Grant and remove their access in your organization, nothing else |

An external member keeps their account, their credentials and their access elsewhere. Removing their access in your organization does not affect the rest.

A **member of a single project** holds tiers on one or more projects, and none on the organization. The members page shows them with the **Projects only** badge. They see the name of the organization and its projects, nothing else. Their access ends with the project.

By default, an account that belongs to an organization cannot join another organization: **external collaboration** is refused.

## Second factor

Every account that signs in with a Hikube password also presents a second factor. An SSO account has neither a password nor a second factor in Hikube: its MFA is that of your identity provider. See [Second factor](./how-to/set-up-second-factor.md).

## Verified domain

A verified domain proves that the organization owns a domain, for example `acme.com`, through a DNS `TXT` record named `_hikube-challenge.acme.com`. A domain belongs to one organization only. A subdomain is a domain of its own. The record must stay published. See [Verify a domain](./how-to/verify-domain.md).

## SSO connection

With single sign-on (SSO), the people of your organization sign in with their company account, at your **identity provider**, instead of a Hikube password.

- **One connection per organization**, using OpenID Connect. SAML is not supported.
- **Verified domains only.** Only the addresses of the connection's allowed domains, all verified, can use it.
- **An SSO account** is created at a person's first sign-in. It belongs to the organization.
- **Accounts with a password** keep signing in with it and are never redirected to your provider.

### Technical requirements

| Setting at your provider | Value |
|---|---|
| Application type | Web application, confidential, authorization code flow |
| Redirect URI | The one shown by the console, ending in `/broker/org-<organization>/endpoint` |
| Client authentication | Client secret |
| Scopes | `openid`, `email`, `profile` |
| Claims | `email`, first name, last name and, if you use it, the roles claim, in the **ID token** |
| ID token signature | Asymmetric (RS256, ES256…). HS256 alone is refused |
| PKCE | S256, enabled by default |

### Providers

| Provider | Status |
|---|---|
| [Okta](./how-to/sso-okta.md) | Verified by Hikube |
| [Microsoft Entra ID](./how-to/sso-entra-id.md) | Verified by Hikube |
| [Google Workspace](./how-to/sso-google-workspace.md) | Not verified |
| [Auth0](./how-to/sso-auth0.md) | Not verified |

Any other OpenID Connect provider that meets the requirements above may work. It has not been verified by Hikube: contact support before putting it into production.

## Role bindings: a single source of rights

A **role binding** associates a value of your provider's roles claim (a group or a role of your directory) with a Hikube tier, on the organization or on a project. Each SSO connection has a single source of rights:

| Roles claim | Where the tiers of SSO accounts come from |
|---|---|
| **Set** | From role bindings only, at every sign-in. They can no longer be changed in Hikube |
| **Empty** | From Hikube: an administrator grants them from the members page |

A role binding never grants **Super admin**. See [Grant tiers from your provider](./how-to/sso-role-bindings.md).

<NavigationFooter
  nextSteps={[
    {label: "Quick start: SSO connection", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Invite people", href: "../how-to/invite-members"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
