---
# Draft: rename to YYYY-MM-DD-hikube-api-vX.Y.Z.md, with the version as the
# title, when the release that ships members and invitations is tagged.
# Remove `draft: true` then.
title: Hikube API — members and invitations
authors: [hikube]
tags: [release]
draft: true
---

This release changes how an organization manages its members. You no longer add a member by creating an account for them: you invite them by e-mail, and they accept the invitation with their own account. Access is expressed as tiers (`read`, `write`, `admin`, `superadmin`) on the organization and on its projects.

**Breaking change**: several fields and one call of the members API are removed, and removing a member no longer deletes their account (see *Migration*).

<!-- truncate -->

## Added

- **IAM: invitations** — `POST /iam/v1alpha1/organizations/{organization_id}/invitations` invites up to 50 e-mail addresses, with the tiers to give them on the organization or on a project. The person receives an e-mail. Without an account yet, they create one by choosing their password and second factor. An invitation is valid for 7 days. An admin can list, resend and cancel the organization's invitations (`GET .../invitations`, `POST .../invitations/{invitation_id}/resend`, `DELETE .../invitations/{invitation_id}`). Inviting the same address again replaces the pending invitation.

- **IAM: my invitations** — `GET /iam/v1alpha1/me/invitations` lists the pending invitations of the caller's verified e-mail address. The caller accepts them (`POST /iam/v1alpha1/me/invitations/{invitation_id}/accept`) or declines them (`.../decline`). Accepting never lowers a tier already held.

- **IAM: leaving** — `POST /iam/v1alpha1/organizations/{organization_id}/leave` and `POST /iam/v1alpha1/projects/{project_id}/leave` remove every tier the caller holds on the organization and its projects, or on the project. The account is kept. The last superadmin with a password cannot leave the organization.

- **IAM: access review** — `GET /iam/v1alpha1/organizations/{organization_id}/access-review` lists every tier of every member, with when it was granted, by whom and how (console or invitation), and flags the members external to the organization.

- **IAM: accounts managed by the organization** — Block, unblock, reset the credentials of and delete an account (`POST .../accounts/{user_id}/block`, `/unblock`, `/reset-credentials`, `DELETE .../accounts/{user_id}`). These operations only apply to accounts the organization manages. An organization manages an account only once it has verified its e-mail domain, which is not available yet: until then, they answer `60212`.

- **IAM: organization limits** — The number of members, of pending invitations and of invitations sent per hour is limited according to the organization's plan. The support can raise these limits.

- **Error codes** — The error format is described in [Errors](/api/errors/).

| Code | HTTP | Meaning |
| --- | --- | --- |
| `60003` | 403 | Tier requested above your own |
| `60004` | 404 | Invitation not found, or addressed to another person |
| `60115` | 400 | Unknown tier (not `read`, `write`, `admin` or `superadmin`) |
| `60120` | 400 | Invalid invitation: address, duplicate, tiers or project |
| `60207` | 409 | Last superadmin with a password: name another one first |
| `60208` | 403 | The member holds a higher tier than yours |
| `60209` | 409 | You cannot lower your own tiers |
| `60211` | 409 | This account cannot become superadmin (no password, no second factor, or signed in through its company's SSO) |
| `60212` | 403 | Account not managed by the organization |
| `60213` | 409 | Not possible on an account that signs in through SSO |
| `60214` | 409 | Maximum number of members of the organization reached |
| `60215` | 409 | Maximum number of pending invitations reached |
| `60216` | 429 | Too many invitations sent in the hour: retry later |
| `60220` | 409 | Account transfer refused: the address is not in a verified domain of the organization |
| `60221` | 409 | The invitation is no longer pending (accepted, declined, expired or cancelled) |

## Changed

These changes alter an existing behavior. Check them if you call the API from your own tools.

- **IAM: updating a member** — `PATCH /iam/v1alpha1/organizations/{organization_id}/users/{name}` now only changes the member's tiers: `tiers`, with `updateMask: "tiers"`. The given tiers replace the member's on the organization and its projects. Lowering or removing access signs the member out.

- **IAM: removing a member** — `DELETE /iam/v1alpha1/organizations/{organization_id}/users/{name}` removes the member's access to the organization and its projects, and keeps their account. It used to delete the account.

- **IAM: member identifier** — `{name}` is the account's id, the one `GET .../users` returns in `id`, no longer its username.

- **IAM: responses** — A member is described by their tiers (`tiers`), their account type (`accountType`), and two flags: the account is managed by the organization (`owned`), or it is external to the organization (`external`). The `groups` field is removed.

## Removed

- **IAM: creating a user** — `POST /iam/v1alpha1/organizations/{organization_id}/users` is removed. Invite the person instead.

## Security

- **Accounts: second factor** — A second factor will become mandatory for every account that signs in with a password. Existing accounts without one will have to register one at their next sign-in. The date and any transition period will be announced before it is turned on. An account that signs in through its company's SSO follows its identity provider's rules.

:::warning Migration
- Replace user creation with invitations (`POST .../invitations`).
- In `PATCH .../users/{name}`, only send `tiers`, with `updateMask: "tiers"`. The fields `enabled`, `email`, `firstname`, `lastname` and `groups` are no longer accepted.
- Use the member's `id` in `{name}`, no longer their username.
- `DELETE .../users/{name}` no longer deletes the account: it only removes access to the organization.
- Read access from `tiers` rather than `groups`.
:::
