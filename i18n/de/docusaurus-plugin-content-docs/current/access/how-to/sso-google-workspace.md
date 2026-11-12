---
sidebar_position: 12
title: "Google Workspace für SSO konfigurieren"
description: "Einen OAuth-Client von Google Workspace für die SSO-Verbindung Ihrer Hikube-Organisation vorbereiten: interner Zustimmungsbildschirm, Redirect-URI und primäre Domain."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Google Workspace konfigurieren

:::caution Nicht verifiziert
Diese Seite folgt der Dokumentation von Google. Hikube hat sie noch nicht auf einem echten Workspace verifiziert. Offener Punkt: das Verhalten bei einer Person einer sekundären Domain des Workspace. Wenden Sie sich an den Support, bevor Sie sie produktiv einsetzen.
:::

Diese Seite beschreibt den Teil bei Google. Lesen Sie zuerst den [Schnellstart](../quick-start.md) und kehren Sie dann für den Teil in Hikube zu [Die SSO-Verbindung erstellen](./configure-sso-connection.md) zurück.

## 1. Die Anwendung auf Ihren Workspace beschränken

1. Öffnen Sie in der Google Cloud Console Ihres Workspace **APIs & Services → OAuth consent screen**.
2. **User type**: **Internal**. Nur die Konten Ihres Workspace können die Anwendung dann verwenden.

## 2. Den OAuth-Client erstellen

1. Öffnen Sie **Credentials → Create credentials → OAuth client ID**.
2. **Application type**: **Web application**.
3. **Authorized redirect URIs**: die von der Hikube-Konsole angezeigte Redirect-URI.
4. Kopieren Sie die **Client ID** und das **Client secret**.

## 3. Die Verbindung in Hikube vorbereiten

- **Discovery URL**: `https://accounts.google.com/.well-known/openid-configuration`.
- **Allowed domains**: genau eine Domain, die primäre Domain Ihres Workspace (zum Beispiel `acme.com`). Sie muss in Hikube verifiziert sein.
- **Roles claim**: Lassen Sie ihn leer. Das ID-Token von Google enthält keine Gruppen. Die Ränge werden in Hikube vergeben.

Persönliche Google-Konten und andere Workspaces werden abgelehnt.

## Zusammenfassung

| | Google Workspace |
|---|---|
| Domains | Genau eine: die primäre Domain des Workspace, in Hikube verifiziert |
| E-Mail-Adresse, Vorname und Nachname | Standard-Claims der Scopes `email` und `profile` |
| `email_verified` | Gesendet |
| **Confirm the address by a link** deaktivierbar | Ja |
| Rollen-Claim | Keiner: Vergeben Sie die Ränge in Hikube |
| PKCE | Unterstützt |

:::warning Kein Typwechsel
Eine Google-Verbindung kann nicht zu einer Verbindung mit einem anderen Anbieter werden, und umgekehrt. Löschen Sie die Verbindung und erstellen Sie eine neue.
:::

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung erstellen", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Mitglieder verwalten", href: "../manage-members"},
  ]}
/>
