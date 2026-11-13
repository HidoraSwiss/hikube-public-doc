---
sidebar_position: 6
title: "FAQ — Access management"
sidebar_label: FAQ
description: "Frequently asked questions about Hikube access management: delay for removed access, SSO connection guarantees, MFA, fallback super admin, API keys."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# FAQ — Access management

### How quickly does removed access take effect?

| Where you remove access | Delay |
|---|---|
| **In Hikube**: removal of a tier, a member or a role binding, deletion of the SSO connection | **5 minutes** at most |
| **At your provider**: person who left, group removed, assignment deleted | The person can no longer sign in again. A Hikube session already open lasts until it ends: after a period of inactivity, and at the latest at its maximum duration |

Hikube does not use provider-initiated sign-out (*back-channel logout*). Microsoft Entra ID does not offer it; Okta and Google do not announce it in their discovery document.

### How do I immediately cut off access for a person who is leaving?

Disable them at your provider **and** remove them in Hikube (see [Manage members](./how-to/manage-members.md#remove-a-members-access)). Removal in Hikube takes effect within 5 minutes at most. Also revoke the API keys they created.

### What does Hikube guarantee for the SSO connection, and what remains my responsibility?

| Guaranteed by Hikube, whatever the configuration | Recommended, under your responsibility |
|---|---|
| The issuer is the one of the discovery document, over HTTPS, without an internal address | An application dedicated to Hikube |
| Confidential client, authorization code flow, token signature checked with the keys published by your provider | The application restricted to the people or groups who need Hikube (Entra ID **Assignment required**, Okta assignments, Google **Internal** consent screen, Auth0 without sign-up) |
| Google's hosted domain and the Entra ID tenant's issuer | A stable person identifier (`sub`), never reassigned to another person |
| An e-mail address present in the ID token, on a verified domain of the organization | An e-mail address the person cannot change themselves |
| The address confirmed by a link, unless you turn off **Confirm the address by a link** | Disabling people who leave the company, at your provider |
| Claims read from the ID token only | Replacing the client secret before it expires |
| | The second factor (MFA), enforced by your provider |

### Does Hikube ask SSO accounts for a second factor?

No. Your identity provider enforces it: enable MFA there for everyone who accesses Hikube. Accounts with a Hikube password always have a mandatory second factor (see [Second factor](./how-to/set-up-second-factor.md)).

### Why keep a super admin with a password?

It is your fallback access if your identity provider is unavailable or misconfigured. Hikube enforces it: **Super admin** only goes to an account with a password and a second factor, and the organization always keeps at least one.

### Does a removed member keep their API keys?

Yes. A key keeps its scopes, even if the person who created it loses their rights. Revoke it in the **API keys** card of the project settings (see [API authentication](../../api/authentication)).

### Can an API key manage members?

No. A key acts on the resources of a project. Members, invitations, domains and the SSO connection are managed in the console.

### Can a person be a member of several organizations?

Yes, with a personal account. An account that belongs to an organization (organization account or SSO account) cannot, by default, join another organization (see [External members](./how-to/invite-members.md#external-members)).

### Can I use SAML?

No. The SSO connection uses OpenID Connect.

### Can I have two SSO connections?

No, only one per organization. To change application or provider, [replace the provider](./how-to/manage-sso-connection.md#replace-the-provider): SSO accounts are kept.

<NavigationFooter
  seeAlso={[
    {label: "Concepts", href: "../concepts"},
    {label: "Troubleshooting", href: "../troubleshooting"},
  ]}
/>
