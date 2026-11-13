---
title: Hikube API v1.7.0
authors: [hikube]
tags: [release]
---

API v1.7.0 brings access management to organizations: tiers on the organization and its projects, invitations, project-only members, account transfer, access review, verified domains, and a per-organization SSO connection with its role bindings. A second factor becomes mandatory for accounts with a password, and the web console opens the VNC console and the serial console of instances.

**Breaking changes**: a second factor is required, scripts can no longer sign in with a username and password, and the routes for organization members change their contract (see *Migration* at the end of this note).

:::warning Action required
- **Mandatory second factor** — Every account that signs in with a Hikube password must present a second factor: an authenticator app or a security key. An account that has none yet enrolls one at its next sign-in. A request made with a session opened without a second factor is refused with HTTP 401 and the code `10007`. SSO accounts use the second factor of their identity provider. See [Register your second factor](/access/how-to/set-up-second-factor/).
- **End of username-and-password sign-in** — The Hikube sign-in service no longer issues a token in exchange for a username and a password (the "password grant"). Scripts and tools that authenticated this way must switch to an [API key](/api/authentication/), created in the project settings.
- **Organization members** — If you call the `/iam/v1alpha1/organizations/{organization_id}/users` routes with a user session, adapt your calls before the update: see *Changed* and *Migration*.
:::

<!-- truncate -->

## Added

- **Access management** — A person receives a tier on the organization or on one of its projects: `read`, `write`, `admin` or `superadmin` (**Read**, **Use**, **Admin** and **Super admin** in the console). A tier on the organization applies to all its projects; a tier on a project adds to it. Nobody grants a tier above their own, and only a super admin grants super admin. A lowered or removed tier signs the person out and applies within 5 minutes. Access management happens in the console: an API key cannot call it. See [Access management](/access/overview/).

- **Invitations** — Administrators invite up to 50 addresses at once, to the organization or to a project, with the tiers they will receive. An invitation is valid for 7 days; it can be resent or cancelled. A person who already has a Hikube account finds it at their next sign-in; others receive an e-mail to create their account. They accept or decline it. The invitation names the organization and the person who sent it. See [Invite people](/access/how-to/invite-members/).

- **Project-only members** — A person can hold a tier on a project without being a member of the organization. They only see the projects where they hold a tier. An organization setting lets its project admins invite people to their project and manage the **Read**, **Use** and **Admin** tiers there. See [Manage members](/access/how-to/manage-members/).

- **External members and account transfer** — Each member has an account type: personal, organization or SSO. A member whose personal account belongs to another organization is external. A person can hand their account over to the organization if their verified address is on one of the organization's verified domains and they have no access in any other organization. Administrators can then block, unblock or delete that account, and reset its credentials. See [Hand an account over to the organization](/access/how-to/transfer-account/).

- **Leaving an organization or a project** — A member can leave an organization or a project. They lose the tiers concerned, their session is closed, and their account is kept with its access elsewhere.

- **Access review** — Administrators export the organization's access review: for each tier, the person, the scope, when and by whom it was granted, its source (console, invitation or identity provider), the account type, external membership, an address outside the verified domains, the last sign-in and inactivity. See [Export the access review](/access/how-to/export-access-review/).

- **Verified domains** — An organization proves it owns an e-mail domain by publishing a TXT record in its DNS zone within 7 days. A verified domain is checked again: if the record disappears, the operations that depend on it are refused until it is published again. An organization declares at most 20 domains; a public e-mail service or a public suffix is refused, as is a domain already verified by another organization. See [Verify a domain](/access/how-to/verify-domain/).

- **SSO connection** — An organization connects its OpenID Connect identity provider, from its discovery URL. People on the verified domains then sign in with their company account. The connection is validated with Okta and Microsoft Entra ID; Google Workspace is being validated. A connection can require an invitation and confirm each new address with a link. The provider can be replaced without losing the accounts. SAML is not supported (`60119`). See [Quick start: SSO connection](/access/quick-start/).

- **Role bindings** — When the SSO connection reads a roles claim, each value of that claim, for example a group of your directory, grants a tier on the organization or on a project, at each sign-in. Never super admin. The tiers of SSO accounts then come only from the provider: they can no longer be changed in Hikube (`60206`). See [Grant tiers from your provider](/access/how-to/sso-role-bindings/).

- **Instance console** — The web console opens the screen (VNC) and the serial console of a running instance. The ticket that opens it is reserved to the web console: an API key cannot request it.

- **Error codes** — Each new refusal has its own code. They are returned with HTTP 400 unless stated otherwise. The error format is described in [Errors](/api/errors/), and the access management codes in [Troubleshooting — Access management](/access/troubleshooting/).

| Code | Service | Meaning |
| --- | --- | --- |
| `10003` | All | Ticket expired (event stream, instance console): request a new one |
| `10007` | All | HTTP 401: second factor required, sign in again with your second factor |
| `60004`, `60010` to `60012` | Access management | Invitation, domain, SSO connection or role binding not found |
| `60013`, `60015` | Access management | Temporary failure (DNS, tier not ready yet): retry |
| `60110` to `60120` | Access management | Invalid domain, issuer, claim, scope, tier, role binding target or invitation, value out of bounds, SAML not supported |
| `60200` to `60205` | Domains | Domain not verified, record missing, verified by another organization, verification expired, or domain used by the SSO connection |
| `60206` | Access management | Tier granted by the identity provider: change it in your directory |
| `60207` to `60211` | Members | Last super admin with a password, target holds a higher tier than yours, self-demotion, tier refused to this account |
| `60212`, `60213` | Accounts | Account not owned by the organization, operation not possible on an SSO account |
| `60214` to `60217` | Invitations | Member limit, pending invitation limit, too many invitations at once, address already used |
| `60218` | SSO connection | The organization already has an SSO connection |
| `60219`, `60220` | Transfer | Access in another organization, or address outside the verified domains |
| `60221`, `60222` | Invitations | Invitation no longer pending, or external collaboration refused by the organization that owns the account |
| `60223` | Role bindings | Value already used on the connection |
| `210001` to `210200` | Instance console | Instance not found or stopped, console unavailable or at capacity, invalid console type |

## Changed

These changes alter an existing behavior. Check them if you call the API from your own tools.

- **Organization members** — The `/iam/v1alpha1/organizations/{organization_id}/users` routes change their contract. They are not part of the API key surface: only calls made with a user session are affected.
  - `{name}` is now the account id (the `id` field returned by the list), no longer its username;
  - responses no longer return `groups`. They return `tiers`, the list of the member's tiers (`projectId` empty for the organization, `tier`), along with `accountType` (`organization`, `sso` or `personal`), `owned`, `external` and `tiersFromIdentityProvider`;
  - `PATCH .../users/{name}` now only updates `tiers`, which replaces the member's tiers in the organization and its projects, and only there. The `enabled`, `email`, `firstname`, `lastname` and `groups` fields are no longer accepted. An empty list removes all access to the organization;
  - `DELETE .../users/{name}` removes the person's access to the organization and keeps their account; it used to delete it;
  - the list accepts the `tier`, `projectId` and `identitySource` (`local` or `federated`) filters.

- **Second factor** — A session opened without a second factor is refused with the code `10007` (HTTP 401), except for an SSO account.

## Removed

- **Direct user creation** — `POST /iam/v1alpha1/organizations/{organization_id}/users` is removed. Invitations replace it.

- **Username-and-password sign-in** — The sign-in service no longer issues a token in exchange for a username and a password. Use an API key.

## Fixed

- **VM instances** — A VM that starts normally no longer shows a blocking reason. The reason now only comes from an actual cause of failure, such as an insufficient quota or no server available.

- **Backups** — The first backup of a VM to a brand-new destination can no longer fail because its repository is not ready.

:::warning Migration
- **Scripts authenticated with a username and password**: create an API key in the project settings (**API keys** card), then call the API with the `X-Hikube-Api-Key` header. See [Authentication](/api/authentication/) and [Quick start](/api/quick-start/). Access management and key management cannot be called with an API key: do them in the console.
- **Second factor**: let the people of your organization who sign in with a password know; they will enroll their second factor at their next sign-in. See [Register your second factor](/access/how-to/set-up-second-factor/).
- **Member routes**: there is no transition period for these routes. Read a member's `id` from the list before changing or removing their access, replace `groups` with `tiers`, and use invitations to bring a person in.
:::
