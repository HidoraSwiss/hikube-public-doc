---
sidebar_position: 13
title: "Auth0 für SSO konfigurieren"
description: "Eine Auth0-Anwendung für die SSO-Verbindung Ihrer Hikube-Organisation vorbereiten: Regular Web Application, geschlossene Registrierungen und von einer Action geschriebener Rollen-Claim."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Auth0 konfigurieren

:::caution Nicht verifiziert
Diese Seite folgt der Dokumentation von Auth0. Hikube hat sie nicht auf einem Auth0-Testtenant verifiziert. Wenden Sie sich an den Support, bevor Sie sie produktiv einsetzen.
:::

Diese Seite beschreibt den Teil bei Auth0. Lesen Sie zuerst den [Schnellstart](../quick-start.md) und kehren Sie dann für den Teil in Hikube zu [Die SSO-Verbindung erstellen](./configure-sso-connection.md) zurück.

## 1. Die Anwendung erstellen

1. Öffnen Sie **Applications → Create Application → Regular Web Application**.
2. **Allowed Callback URLs**: die von der Hikube-Konsole angezeigte Redirect-URI.
3. **Token Endpoint Authentication Method**: eine Methode mit Client-Secret.
4. Kopieren Sie die **Client ID** und das **Client Secret**.

## 2. Die Registrierungen schließen

Deaktivieren Sie die Registrierungen (**sign-ups**) für die Datenbankverbindung, die die Anwendung verwendet. Nur die Personen, die Sie erstellt haben, können sich dann anmelden.

## 3. Den Rollen-Claim schreiben (optional)

Tun Sie dies nur, wenn Auth0 über die Ränge in Hikube entscheiden soll (siehe [Ränge über Ihren Identitätsanbieter vergeben](./sso-role-bindings.md)).

Schreiben Sie die Rollen mit einer **post-login**-Action in das ID-Token. Die Namen `roles` und `groups` sind von Auth0 reserviert: Verwenden Sie einen Namen mit Namespace, zum Beispiel `https://acme.com/roles`.

In Hikube wird ein Punkt innerhalb eines Claim-Namens als `\.` geschrieben. Geben Sie daher `https://acme\.com/roles` unter **Roles claim** ein.

## Discovery-URL

```text
https://acme.eu.auth0.com/.well-known/openid-configuration
```

Ersetzen Sie `acme.eu` durch Ihren Tenant und seine Region, oder verwenden Sie Ihre benutzerdefinierte Domain.

## Zusammenfassung

| | Auth0 |
|---|---|
| E-Mail-Adresse, Vorname und Nachname | Standard-Claims der Scopes `email` und `profile` |
| `email_verified` | Gesendet |
| **Confirm the address by a link** deaktivierbar | Ja |
| Rollen-Claim | Von einer post-login-Action geschrieben, mit einem Namen mit Namespace |
| PKCE | Mit dem Client-Secret unterstützt |

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung erstellen", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Ränge über Ihren Identitätsanbieter vergeben", href: "../sso-role-bindings"},
  ]}
/>
