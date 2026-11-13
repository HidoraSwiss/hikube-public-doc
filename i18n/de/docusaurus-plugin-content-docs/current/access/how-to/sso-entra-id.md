---
sidebar_position: 11
title: "Microsoft Entra ID für SSO konfigurieren"
description: "Eine Microsoft-Entra-ID-Anwendung für die SSO-Verbindung Ihrer Hikube-Organisation vorbereiten: Single-Tenant-Registrierung, Claims, App-Rollen und verpflichtende Zuweisung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Microsoft Entra ID konfigurieren

:::tip Verifizierter Anbieter
Hikube hat diese Konfiguration auf einem Entra-ID-Testtenant verifiziert: vollständige Anmeldungen mit App-Rollen und Role Bindings, Ablehnung einer nicht zugewiesenen Person, Ablehnung der URL `/common`. Der Claim `groups` wurde nicht verifiziert: Bevorzugen Sie die App-Rollen.
:::

Diese Seite beschreibt den Teil bei Entra ID. Lesen Sie zuerst den [Schnellstart](../quick-start.md) und kehren Sie dann für den Teil in Hikube zu [Die SSO-Verbindung erstellen](./configure-sso-connection.md) zurück.

## 1. Die Anwendung registrieren

1. Öffnen Sie **App registrations → New registration**.
2. **Supported account types**: **Accounts in this organizational directory only** (ein einziger Tenant).
3. **Redirect URI**: Plattform **Web**, dann die von der Hikube-Konsole angezeigte Redirect-URI.

## 2. Das Secret erstellen

1. Öffnen Sie **Certificates & secrets → New client secret**.
2. Kopieren Sie den Wert des Secrets und die **Application (client) ID**.
3. Notieren Sie das Ablaufdatum des Secrets. Ersetzen Sie es in Hikube vor diesem Datum, sonst kann sich niemand mehr über die SSO-Verbindung anmelden.

## 3. Die Claims zum ID-Token hinzufügen

1. Öffnen Sie **Token configuration → Add optional claim**, Typ **ID**.
2. Aktivieren Sie `email`, `given_name` und `family_name`.

Entra ID sendet `email` nur für Personen, deren E-Mail-Attribut ausgefüllt ist. Ohne Adresse wird die Anmeldung abgelehnt.

## 4. Die Zustimmung erteilen

1. Öffnen Sie **API permissions**.
2. Fügen Sie die delegierten Microsoft-Graph-Berechtigungen `openid`, `email` und `profile` hinzu.
3. Klicken Sie auf **Grant admin consent**.

Ohne diese Zustimmung muss jede Person bei ihrer ersten Anmeldung zustimmen.

## 5. Die App-Rollen erstellen (optional)

Tun Sie dies nur, wenn Entra ID über die Ränge in Hikube entscheiden soll (siehe [Ränge über Ihren Identitätsanbieter vergeben](./sso-role-bindings.md)).

1. Öffnen Sie **App roles → Create app role** und erstellen Sie eine Rolle pro Zugriffsstufe, zum Beispiel `hikube-admins` und `hikube-devs`. **Allowed member types**: **Users/Groups**.
2. Weisen Sie unter **Enterprise applications → Users and groups** jeder Person oder Gruppe ihre Rolle zu.
3. Geben Sie in Hikube `roles` unter **Roles claim** ein. Der zu bindende Wert ist die **Value** der Rolle.

Sobald die Anwendung Rollen hat, erfordert jede Zuweisung eine: Entra ID bietet keine Rolle „Default Access“ mehr an. Um jemanden ohne Rang hereinzulassen, geben Sie der Person eine Rolle, die kein Role Binding nennt.

## 6. Den Zugriff einschränken

1. Öffnen Sie unter **Enterprise applications** die Anwendung.
2. Setzen Sie **Assignment required** auf **Yes**.
3. Weisen Sie die Personen oder Gruppen zu, die Hikube benötigen.

Eine nicht zugewiesene Person wird von Entra ID gestoppt (Fehler `AADSTS50105`). Sie erhält kein Hikube-Konto.

## Discovery-URL

```text
https://login.microsoftonline.com/<Tenant-ID>/v2.0/.well-known/openid-configuration
```

Verwenden Sie die Kennung Ihres Tenants. Die URLs `/common` und `/organizations` werden abgelehnt: Ihr Aussteller ist nicht Ihr Tenant.

## Gäste des Tenants

Ein Gast Ihres Tenants (persönliches Microsoft-Konto oder Konto eines anderen Unternehmens) meldet sich mit seiner eigenen Adresse an. Diese Adresse liegt nicht auf Ihren verifizierten Domains: Hikube lehnt sie ab.

## Zusammenfassung

| | Microsoft Entra ID |
|---|---|
| E-Mail-Adresse, Vorname und Nachname | Optionale Claims, die dem ID-Token hinzuzufügen sind |
| `email_verified` | Nicht gesendet |
| **Confirm the address by a link** deaktivierbar | Nein: Lassen Sie die Option aktiviert |
| Rollen-Claim | `roles` (App-Rollen, empfohlen). Oder `groups`: Objekt-IDs der Gruppen, entfällt ab mehr als 200 Gruppen |
| PKCE | Unterstützt |

:::warning Claim `groups` und mehr als 200 Gruppen
Eine Person, die Mitglied von mehr als 200 Gruppen ist, erhält keinen Claim `groups`. Sie meldet sich dann ohne jeden Rang an. Bevorzugen Sie die App-Rollen.
:::

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung erstellen", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Ränge über Ihren Identitätsanbieter vergeben", href: "../sso-role-bindings"},
    {label: "Okta", href: "../sso-okta"},
  ]}
/>
