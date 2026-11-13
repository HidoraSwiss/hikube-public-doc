---
sidebar_position: 10
title: "Okta für SSO konfigurieren"
description: "Eine Okta-Anwendung für die SSO-Verbindung Ihrer Hikube-Organisation vorbereiten: OIDC-Integration, Zuweisungen, Discovery-URL und Claim groups für die Ränge."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Okta konfigurieren

:::tip Verifizierter Anbieter
Hikube hat diese Konfiguration auf einer Okta-Testorganisation verifiziert: vollständige Anmeldungen, Claim `groups`, Role Bindings und Wechsel der Anwendung.
:::

Diese Seite beschreibt den Teil bei Okta. Lesen Sie zuerst den [Schnellstart](../quick-start.md) und kehren Sie dann für den Teil in Hikube zu [Die SSO-Verbindung erstellen](./configure-sso-connection.md) zurück.

## 1. Die Anwendung erstellen

1. Öffnen Sie in der Admin Console von Okta **Applications → Create App Integration**.
2. Wählen Sie **OIDC - OpenID Connect** und dann **Web Application**.
3. **Sign-in redirect URIs**: Fügen Sie die von der Hikube-Konsole angezeigte Redirect-URI ein.
4. **Grant type**: **Authorization Code**.
5. **Client authentication**: **Client secret**. Sie können **Require PKCE as additional verification** aktivieren.
6. Speichern Sie und kopieren Sie dann die **Client ID** und das **Client secret**.

## 2. Die Personen zuweisen

Weisen Sie unter **Assignments** nur die Personen oder Gruppen zu, die Hikube benötigen. Eine Person, die nur über eine Gruppe zugewiesen ist, kann sich nicht mehr anmelden, sobald sie aus dieser Gruppe entfernt wurde.

## 3. Die Discovery-URL ermitteln

| Autorisierungsserver | Discovery-URL |
|---|---|
| Benutzerdefinierter Server `default` | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` |
| Anderer benutzerdefinierter Server | `https://acme.okta.com/oauth2/<Server-ID>/.well-known/openid-configuration` |
| Server der Okta-Organisation | `https://acme.okta.com/.well-known/openid-configuration` |

Bei einer benutzerdefinierten Domain ersetzen Sie `acme.okta.com` durch diese Domain.

## 4. Den Claim `groups` hinzufügen (optional)

Tun Sie dies nur, wenn Okta über die Ränge in Hikube entscheiden soll (siehe [Ränge über Ihren Identitätsanbieter vergeben](./sso-role-bindings.md)).

1. Öffnen Sie **Security → API → Authorization Servers**, dann den in Schritt 3 gewählten Server und die Registerkarte **Claims**.
2. Fügen Sie einen Claim namens `groups` hinzu:
   - im **ID Token** enthalten, **Always** (nicht nur für einen Scope);
   - **Value type**: **Groups**;
   - ein Filter, höchstens 100 Gruppen. Zum Beispiel **Starts with** `hikube-`, wenn Ihre Hikube-Gruppen dieses Präfix teilen.
3. Geben Sie in Hikube `groups` unter **Roles claim** ein.

Fügen Sie den Claim dem Autorisierungsserver hinzu, nicht der Anwendung. Ein Claim des Servers gilt für alle Anwendungen, die ihn verwenden.

## Zusammenfassung

| | Okta |
|---|---|
| E-Mail-Adresse, Vorname und Nachname | Standard-Claims der Scopes `email` und `profile` |
| `email_verified` | Gesendet |
| **Confirm the address by a link** deaktivierbar | Ja |
| Rollen-Claim | `groups` |
| PKCE | Unterstützt |

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung erstellen", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Ränge über Ihren Identitätsanbieter vergeben", href: "../sso-role-bindings"},
    {label: "Microsoft Entra ID", href: "../sso-entra-id"},
  ]}
/>
