---
title: Hikube Console v1.5.0
authors: [hikube]
tags: [release]
---

The console accompanies API v1.7.0 with access management: members and tiers, invitations, project-only access, access review, verified domains, and the organization's SSO connection with its role bindings. Signing in now requires a second factor for accounts with a password, and the page of a VM instance opens its VNC console and its serial console.

:::warning Good to know
- **Mandatory second factor** — Every account that signs in with a password must present a second factor: an authenticator app or a security key. An account that has none yet enrolls one at its next sign-in, on the sign-in page. SSO accounts use the second factor of their identity provider. See [Register your second factor](/access/how-to/set-up-second-factor/).
- **Two-step sign-in** — The sign-in page first asks for your e-mail address, then your password. An address served by your organization's SSO connection, without a Hikube password, is sent to your identity provider. The **Forgot password?** link appears under the password field.
- **Scripts** — Scripts that signed in with a username and password no longer work: switch them to an [API key](/api/authentication/).
:::

<!-- truncate -->

## Added

- **Organization members** — An **Organization members** page, in your profile menu, lists the people who have access to the organization and its projects, with their **Organization tier** and **Project tiers**: **Read**, **Use**, **Admin** or **Super admin**. **Edit** changes a member's tiers, never above your own; without any tier, they lose access to the organization and keep their account. Lowering a tier signs the person out, and the change applies within 5 minutes. Tiers granted by the identity provider are locked. See [Manage members](/access/how-to/manage-members/).

- **Invitations** — **Invite people** sends up to 50 invitations at once, with the tiers to grant on the organization or on projects. An invitation is valid for 7 days. The **Pending invitations** list lets you **Resend** or cancel it. An invited person finds their invitations when they sign in, with the organization and the author of each, and can **Accept** or **Decline** them. See [Invite people](/access/how-to/invite-members/).

- **Project members** — A project's settings list its **Project members**: the people who hold a tier directly on it. Its admins can invite people there and change the **Read**, **Use** and **Admin** tiers if the organization turns on **Delegation to project admins**.

- **Project-only access** — A person who only has access to projects, without being a member of the organization, sees only those projects. The console explains why the organization's members and settings are not open to them.

- **Leave** — **Leave the organization** or **Leave the project** removes your tiers and closes your session. Your account is kept, with your access elsewhere.

- **Access review** — **Export the access review** downloads a CSV file: for each tier, the person, the scope, when and by whom it was granted, its source, the account type, external membership, an address outside the verified domains, the account status, the **Last sign-in (UTC)** and inactivity. See [Export the access review](/access/how-to/export-access-review/).

- **Verified domains** — The **Domains** tab of the **Organization settings** declares the organization's e-mail domains. **Add a domain** shows the TXT record to publish in the DNS zone, with a copy button, then **Verify** checks that it is there. Each domain shows its status (**Pending**, **Expired**, **Verified**) and its last check. An expired domain is restarted with **Issue a new record**. See [Verify a domain](/access/how-to/verify-domain/).

- **SSO connection** — The **SSO connection** tab of the **Organization settings** creates the organization's connection to its OpenID Connect identity provider, from its **Discovery URL**, **Client id** and **Client secret**. The connection is created inactive and shows the **Redirect URI** to register with the provider; it is then turned on. The settings offer **Allowed domains**, **Invitation required** and confirming the address with a link. **Replace the provider** keeps the SSO accounts and their access. Okta and Microsoft Entra ID are validated; Google Workspace is being validated. See [Quick start: SSO connection](/access/quick-start/), [Okta](/access/how-to/sso-okta/) and [Microsoft Entra ID](/access/how-to/sso-entra-id/).

- **Role bindings** — When the SSO connection reads a **Roles claim**, **Add a role binding** maps a value of that claim, for example a group of your directory, to a tier on the organization or on a project. The tiers of SSO accounts then come only from your provider. See [Grant tiers from your provider](/access/how-to/sso-role-bindings/).

- **Instance console** — A **Console** tab appears on the page of a running VM instance, with the **Screen (VNC)** and the **Serial console**. The toolbar offers **Ctrl+Alt+Del**, **Paste clipboard**, **Full screen**, **New tab**, the font size, **Reconnect** and, for the serial console, fitting the VM to the window size. The console reconnects by itself after a drop or a move of the instance, and a session lasts at most 8 hours. The serial console needs an account with a password in the instance; for sustained work, prefer SSH.

- **Second factor** — A session opened without a second factor shows the **A second factor is required** page, with **Sign in again**.

## Changed

These changes alter an existing behavior of the console.

- **All resources** — Create, edit and delete actions only appear from the tier they require. A create or edit page opened without that tier shows **Read-only**, with the required tier and yours.

- **Projects** — A project's settings open read-only to anyone who is not a super admin of the organization: only a super admin edits or deletes a project.

- **Sign-in** — When your organizations and projects cannot be loaded, the console shows **Access unavailable**, with **Refresh** and **Log out**, instead of loading forever.

- **VM instances** — Keys typed into the instance console count as activity: the console session no longer closes while you work in the instance.

## Fixed

- **Sign-in** — The confirmation link received by e-mail during a first SSO sign-in, opened in a new tab, now completes the sign-in instead of showing an error.

- **Invitations** — An invited person who does not belong to any organization yet lands on their invitations, instead of looping towards project creation.

- **Resource lists** — Rows no longer flash when nothing displayed has changed.

- **VM instances** — A VM that starts normally no longer shows a cannot-start warning.
