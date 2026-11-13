---
sidebar_position: 4
title: "How to register your second factor"
description: "The second factor (MFA) is mandatory for every Hikube account with a password: enrollment at sign-in, accepted factors, SSO accounts and loss of the second factor."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Second factor (MFA)

Every account that signs in with a Hikube password must also present a **second factor**. There is no exception.

## Accepted factors

- an authenticator app (six-digit code, TOTP);
- a security key;
- a recovery code.

Hikube does not send codes by e-mail or SMS.

## Register your second factor

Registration happens at sign-in, not in the console.

1. Sign in to [console.hikube.cloud](https://console.hikube.cloud) with your address and your password.
2. If your account does not have a second factor yet, the sign-in page asks you to register one. Scan the QR code with your authenticator app, or register your security key.
3. Enter the code shown to finish.

The following sign-ins ask for the password, then the second factor.

An invited person without an account registers their second factor while creating their account, from the invitation e-mail.

## "A second factor is required"

The console shows this page when your session was opened without a second factor. Click **Sign in again**, then sign in with your password and your second factor. If the sign-in does not ask for it, contact support.

## SSO accounts

An account that signs in through its organization's [SSO connection](../quick-start.md) has neither a password nor a second factor in Hikube. Its second factor is that of your identity provider: enforce it there.

## Lost password or second factor

- **Forgotten password**: on the sign-in page, enter your address, then click **Forgot Password?** below the password field. You receive an e-mail with a link. It asks for your second factor first, then a new password. Your second factor stays the same; an account that does not have one yet enrolls one during the reset. An SSO account only receives an e-mail that sends it to its organization's SSO connection: its password is managed at your identity provider.

Lost second factor:

- **Organization account**: an administrator of the organization can reset its credentials (see [Hand an account over to the organization](./transfer-account.md#what-your-administrators-can-do)). The person receives a link valid for 24 hours to choose a new password and a new second factor.
- **Personal account**: contact support.
- **No super admin can sign in any more**: contact support. After verifying your identity, support resets the credentials of a super admin.

<NavigationFooter
  seeAlso={[
    {label: "Concepts", href: "../../concepts"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
