---
sidebar_position: 3
title: Schnellstart
description: "Die SSO-Verbindung Ihrer Hikube-Organisation in 7 Schritten einrichten: verifizierte Domain, Verbindung, Redirect-URI, Aktivierung, Test, Fehlerbehebung und Deaktivierung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Schnellstart: SSO-Verbindung

Dieser Leitfaden richtet die SSO-Verbindung der Organisation `acme` ein. Personen mit einer Adresse unter `@acme.com` melden sich danach mit dem Konto ihres Unternehmens bei Hikube an.

## Bevor Sie beginnen

- Der Rang **Super admin** auf der Organisation.
- Ein Administrationszugang zu Ihrem Identitätsanbieter.
- Eine **vertrauliche** Webanwendung, die Hikube vorbehalten und bei Ihrem Anbieter registriert ist, mit ihrer Client-ID und ihrem Secret: [Okta](./how-to/sso-okta.md), [Microsoft Entra ID](./how-to/sso-entra-id.md), [Google Workspace](./how-to/sso-google-workspace.md) oder [Auth0](./how-to/sso-auth0.md).

### Checkliste

1. **Claims im ID-Token.** `email`, der Vorname, der Nachname und, falls Sie ihn verwenden, der Rollen-Claim müssen im **ID-Token** stehen. Hikube liest sie nirgendwo anders.
2. **Bestätigung der Adresse.** Lassen Sie **Confirm the address by a link** aktiviert, es sei denn, Ihr Anbieter sendet `email_verified` im ID-Token. Microsoft Entra ID sendet es nicht.
3. **PKCE.** Lassen Sie es aktiviert, es sei denn, Ihr Anbieter lehnt es ab.
4. **Rollen-Claim.** Setzen Sie ihn nur, wenn Ihr Anbieter über die Ränge entscheiden soll (siehe [Role Bindings](./how-to/sso-role-bindings.md)).
5. **Zweiter Faktor.** Die MFA der SSO-Konten wird von Ihrem Anbieter erzwungen, nicht von Hikube.
6. **Mit oder ohne Einladung.** Standardmäßig erhält jede Person einer zulässigen Domain, die Ihr Anbieter durchlässt, ein Konto. **Invitation required** lässt nur eingeladene Personen zu.
7. **Ein Super-Administrator mit Passwort.** Behalten Sie mindestens einen: Er ist Ihr Notfallzugang, falls Ihr Anbieter nicht verfügbar ist.

Die vollständigen technischen Anforderungen stehen in [Konzepte](./concepts.md#technische-anforderungen).

## Schritt 1: Die Domain verifizieren

1. Profilmenü → **Organization members**, Registerkarte **Domains**.
2. **Add a domain**: `acme.com`, dann **Add**.
3. Veröffentlichen Sie den angezeigten `TXT`-Eintrag in der DNS-Zone von `acme.com`.
4. Klicken Sie auf **Verify**.

**Erwartetes Ergebnis**: `acme.com` hat den Status **Verified**. Details: [Eine Domain verifizieren](./how-to/verify-domain.md).

![Registerkarte Domains: acme.com ausstehend, mit dem zu veröffentlichenden TXT-Eintrag](/img/console/access/domain-pending.en.png)

## Schritt 2: Die Verbindung erstellen

1. Öffnen Sie die Registerkarte **SSO connection** und klicken Sie dann auf **Create the connection**.
2. Füllen Sie mindestens Folgendes aus:
   - **Display name**: `Acme`;
   - **Discovery URL**: `https://acme.okta.com/oauth2/default/.well-known/openid-configuration`;
   - **Client id** und **Client secret**: die der Anwendung;
   - **Allowed domains**: Wählen Sie `acme.com` aus.
3. Klicken Sie auf **Create**.

**Erwartetes Ergebnis**: **SSO connection created.** Die Verbindung ist **Disabled**. Alle Felder sind in [Die SSO-Verbindung konfigurieren](./how-to/configure-sso-connection.md) beschrieben.

![Formular Create the SSO connection, für Okta ausgefüllt](/img/console/access/sso-create.en.png)

## Schritt 3: Die Redirect-URI registrieren und aktivieren

1. Kopieren Sie in der Karte **SSO connection** die **Redirect URI**.
2. Fügen Sie sie bei Ihrem Anbieter unverändert in die Anwendung ein.
3. Klicken Sie in Hikube auf **Enable**.

**Erwartetes Ergebnis**: **SSO connection enabled.** Der Status wechselt zu **Enabled**.

![Aktive SSO-Verbindung: Weiterleitungs-URI, Einstellungen und Role Bindings](/img/console/access/sso-connection.en.png)

## Schritt 4: Die Verbindung testen

1. Öffnen Sie ein privates Browserfenster auf [console.hikube.cloud](https://console.hikube.cloud).
2. Geben Sie eine Adresse `@acme.com` ein, die kein Hikube-Passwort hat.
3. Melden Sie sich bei Ihrem Anbieter an.
4. Öffnen Sie den Bestätigungslink, den Sie per E-Mail erhalten haben.

**Erwartetes Ergebnis**: Die Person gelangt in die Konsole. Sie erscheint unter **Organization members** mit dem Badge **No tier**.

## Schritt 5: Die Ränge vergeben

- **Ohne Rollen-Claim**: In der Zeile der Person **Edit**, dann wählen Sie ihren Rang (siehe [Mitglieder verwalten](./how-to/manage-members.md)).
- **Mit einem Rollen-Claim**: Erstellen Sie ein Role Binding pro Gruppe (siehe [Ränge über Ihren Identitätsanbieter vergeben](./how-to/sso-role-bindings.md)).

**Erwartetes Ergebnis**: Nach dem Aktualisieren sieht die Person die Projekte ihres Rangs.

## Schritt 6: Schnelle Fehlerbehebung

| Symptom | Wahrscheinliche Ursache |
|---|---|
| Erstellung abgelehnt, Discovery-URL | Kopieren Sie die URL so, wie Ihr Anbieter sie anzeigt; der Aussteller muss übereinstimmen |
| **Enable** abgelehnt | Die Domain ist nicht verifiziert, oder ihr `TXT`-Eintrag ist verschwunden |
| Fehler zur Redirect-URI beim Anbieter | Die registrierte URI ist nicht genau die der Konsole |
| Person abgelehnt | Adresse außerhalb der zulässigen Domains, oder Person der Anwendung nicht zugewiesen |
| Angemeldet ohne Zugriff | Kein Rang vergeben, oder kein Role Binding passt zu ihrem Token |

Weitere Fälle: [Fehlerbehebung](./troubleshooting.md).

## Schritt 7: Deaktivieren oder löschen

- **Disable**: Niemand meldet sich mehr über Ihren Anbieter an. Die SSO-Konten und ihre Zugriffe bleiben erhalten.
- **Delete**: Die von der Verbindung erstellten SSO-Konten werden gelöscht.

Siehe [Die SSO-Verbindung verwalten](./how-to/manage-sso-connection.md).

<NavigationFooter
  nextSteps={[
    {label: "Ränge über Ihren Identitätsanbieter vergeben", href: "../how-to/sso-role-bindings"},
    {label: "Die SSO-Verbindung verwalten", href: "../how-to/manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Konzepte", href: "../concepts"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
