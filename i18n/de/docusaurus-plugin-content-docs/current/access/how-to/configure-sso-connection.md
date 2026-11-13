---
sidebar_position: 7
title: "Die SSO-Verbindung konfigurieren"
description: "Die SSO-Verbindung Ihrer Organisation in der Hikube-Konsole erstellen: Discovery-URL, Client-ID, Secret, zulässige Domains, Claims, Redirect-URI und Aktivierung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Die SSO-Verbindung erstellen und aktivieren

Dieser Leitfaden erstellt die SSO-Verbindung der Organisation `acme` für die Adressen `@acme.com` und aktiviert sie anschließend.

## Voraussetzungen

- Der Rang **Super admin** auf der Organisation.
- Die verifizierte Domain `acme.com` (siehe [Eine Domain verifizieren](./verify-domain.md)).
- Eine bei Ihrem Identitätsanbieter registrierte Anwendung, mit ihrer Client-ID und ihrem Secret: [Okta](./sso-okta.md), [Microsoft Entra ID](./sso-entra-id.md), [Google Workspace](./sso-google-workspace.md) oder [Auth0](./sso-auth0.md). Dort fügen Sie in Schritt 3 die Redirect-URI hinzu.
- Die [Checkliste](../quick-start.md#checkliste) durchgegangen.

## 1. Die Seite der Verbindung öffnen

1. Klicken Sie im Profilmenü (oben rechts) auf **Organization members**.
2. Öffnen Sie die Registerkarte **SSO connection**.

Die Seite **Single sign-on (SSO)** zeigt **No SSO connection** an.

## 2. Die Verbindung erstellen

1. Klicken Sie auf **Create the connection**.
2. Füllen Sie das Formular **Create the SSO connection** aus:

| Feld | Beispiel | Gut zu wissen |
|---|---|---|
| **Display name** | `Acme` | Der Name, den die Personen bei der Anmeldung sehen, höchstens 64 Zeichen |
| **Discovery URL** | `https://acme.okta.com/oauth2/default/.well-known/openid-configuration` | So, wie Ihr Anbieter sie anzeigt, mit `https`. Ihr Aussteller muss die URL vor `/.well-known/openid-configuration` sein |
| **Client id** | `0oa1b2c3d4e5f6g7h8i9` | Die Kennung der Anwendung bei Ihrem Anbieter |
| **Client secret** | | Nur schreibbar: Es wird nie wieder angezeigt |
| **Allowed domains** | `acme.com` ausgewählt | Keine ausgewählt: alle verifizierten Domains der Organisation. Eine Subdomain ist eine eigene Domain |
| **Confirm the address by a link** | Aktiviert | Deaktivieren Sie es nur, wenn Ihr Anbieter `email_verified` im ID-Token sendet |
| **Invitation required** | Deaktiviert | Aktiviert: Nur eingeladene Personen melden sich an (siehe [Die Verbindung verwalten](./manage-sso-connection.md#einladung-erforderlich)) |
| **First name claim** / **Last name claim** | Leer | Leer: `given_name` und `family_name` |
| **Roles claim** | Leer, oder `groups` | Leer: Die Ränge werden in Hikube vergeben. Gesetzt: Die Role Bindings entscheiden über die Ränge der SSO-Konten |

Unter **Advanced settings**:

| Feld | Gut zu wissen |
|---|---|
| **PKCE** | Lassen Sie es aktiviert, es sei denn, Ihr Anbieter lehnt es ab |
| **Additional scopes** | Durch Leerzeichen getrennt. `openid`, `email` und `profile` werden immer angefordert. `offline_access` wird abgelehnt |

3. Klicken Sie auf **Create**.

Hikube liest das Discovery-Dokument und lehnt eine Verbindung ab, deren Aussteller, Endpunkte oder Signatur nicht passen. Die Konsole zeigt **SSO connection created. Register its redirect URI at your provider, then enable it.** an. Die Verbindung ist **Disabled**.

:::note Verschachtelte Claims
Ein Claim kann ein Pfad mit Punkten sein, zum Beispiel `hikube.roles` für das Feld `roles` des Objekts `hikube`. Ein Punkt innerhalb eines Namens wird als `\.` geschrieben: `https://acme\.com/roles`.
:::

![Formular Create the SSO connection, für Okta ausgefüllt](/img/console/access/sso-create.en.png)

## 3. Die Redirect-URI registrieren

1. Kopieren Sie in der Karte **SSO connection** die **Redirect URI**.
2. Fügen Sie sie bei Ihrem Anbieter unverändert in die Anwendung ein.

## 4. Die Verbindung aktivieren

1. Klicken Sie auf **Enable**.
2. Die Konsole zeigt **SSO connection enabled.** an, und der Status wechselt zu **Enabled**.

Bei der Aktivierung prüft Hikube den DNS-Eintrag jeder bedienten Domain erneut. Ist er verschwunden, wird die Aktivierung abgelehnt: Veröffentlichen Sie den Eintrag erneut (siehe [Eine Domain verifizieren](./verify-domain.md)).

## 5. Testen

1. Öffnen Sie ein privates Browserfenster auf [console.hikube.cloud](https://console.hikube.cloud).
2. Geben Sie eine Adresse `@acme.com` ein, die kein Hikube-Passwort hat.
3. Sie werden zu Ihrem Anbieter weitergeleitet. Melden Sie sich an.
4. Mit **Confirm the address by a link** öffnen Sie den per E-Mail erhaltenen Link.

## Erste Anmeldung einer Person

- **Erstellung des Kontos.** Bei ihrer ersten Anmeldung erstellt Hikube das Konto der Person, **ohne jeden Rang**. Das Konto gehört der Organisation: Es ist ein **SSO-Konto**.
- **Bestätigung.** Mit **Confirm the address by a link** bestätigt die Person ihre Adresse über den erhaltenen Link. Das Konto erscheint nach der Bestätigung unter den Mitgliedern. Es wird gelöscht, wenn es nicht innerhalb von 24 Stunden bestätigt wird.
- **Ränge.** Ein Administrator vergibt anschließend einen Rang auf [der Mitgliederseite](./manage-members.md). Mit einem Rollen-Claim vergeben die [Role Bindings](./sso-role-bindings.md) die Ränge bei jeder Anmeldung.
- **Domains.** Die Adresse im ID-Token muss auf einer zulässigen Domain liegen, exakt verglichen. Mit `acme.com` allein wird `bob@eu.acme.com` abgelehnt.
- **Konten mit Passwort.** Sie melden sich weiterhin mit ihrem Passwort an und werden nie weitergeleitet.
- **Anzahl der Mitglieder.** Die Mitgliedergrenze der Organisation gilt. Eine Person darüber hinaus kann sich anmelden, aber Hikube lehnt ihre Anfragen ab, bis ein Mitglied entfernt wurde.
- **Profil.** Vorname und Nachname werden bei jeder Anmeldung aus dem ID-Token übernommen. Sie lassen sich in Hikube nicht ändern.

<NavigationFooter
  nextSteps={[
    {label: "Ränge über Ihren Identitätsanbieter vergeben", href: "../sso-role-bindings"},
    {label: "Die SSO-Verbindung verwalten", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Schnellstart", href: "../../quick-start"},
    {label: "Fehlerbehebung", href: "../../troubleshooting"},
  ]}
/>
