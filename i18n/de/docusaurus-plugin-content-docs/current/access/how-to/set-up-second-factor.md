---
sidebar_position: 4
title: "Den zweiten Faktor einrichten"
description: "Der zweite Faktor (MFA) ist für jedes Hikube-Konto mit Passwort verpflichtend: Registrierung bei der Anmeldung, akzeptierte Faktoren, SSO-Konten und Verlust des zweiten Faktors."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Zweiter Faktor (MFA)

Jedes Konto, das sich mit einem Hikube-Passwort anmeldet, muss zusätzlich einen **zweiten Faktor** vorlegen. Es gibt keine Ausnahme.

## Akzeptierte Faktoren

- eine Authenticator-App (sechsstelliger Code, TOTP);
- ein Sicherheitsschlüssel;
- ein Wiederherstellungscode.

Hikube sendet keinen Code per E-Mail oder SMS.

## Den zweiten Faktor registrieren

Die Registrierung erfolgt bei der Anmeldung, nicht in der Konsole.

1. Melden Sie sich mit Ihrer Adresse und Ihrem Passwort an [console.hikube.cloud](https://console.hikube.cloud) an.
2. Hat Ihr Konto noch keinen zweiten Faktor, fordert die Anmeldeseite Sie auf, einen zu registrieren. Scannen Sie den QR-Code mit Ihrer Authenticator-App, oder registrieren Sie Ihren Sicherheitsschlüssel.
3. Geben Sie zum Abschluss den angezeigten Code ein.

Bei den folgenden Anmeldungen werden das Passwort und dann der zweite Faktor abgefragt.

Eine eingeladene Person ohne Konto registriert ihren zweiten Faktor beim Erstellen ihres Kontos, über die Einladungs-E-Mail.

## „A second factor is required“

Die Konsole zeigt diese Seite an, wenn Ihre Sitzung ohne zweiten Faktor geöffnet wurde. Klicken Sie auf **Sign in again** und melden Sie sich dann mit Ihrem Passwort und Ihrem zweiten Faktor an. Fragt die Anmeldung ihn nicht ab, wenden Sie sich an den Support.

## SSO-Konten

Ein Konto, das sich über die [SSO-Verbindung](../quick-start.md) seiner Organisation anmeldet, hat in Hikube weder Passwort noch zweiten Faktor. Sein zweiter Faktor ist der Ihres Identitätsanbieters: Erzwingen Sie ihn dort.

## Passwort oder zweiter Faktor verloren

- **Organisationskonto**: Ein Administrator der Organisation kann seine Zugangsdaten zurücksetzen (siehe [Ein Konto an die Organisation übertragen](./transfer-account.md#was-ihre-administratoren-tun-können)). Die Person erhält einen 24 Stunden gültigen Link, um ein neues Passwort und einen neuen zweiten Faktor zu wählen.
- **Persönliches Konto**: Wenden Sie sich an den Support.
- **Kein Super-Administrator kann sich mehr anmelden**: Wenden Sie sich an den Support. Nach Überprüfung Ihrer Identität setzt der Support die Zugangsdaten eines Super-Administrators zurück.

<NavigationFooter
  seeAlso={[
    {label: "Konzepte", href: "../../concepts"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
