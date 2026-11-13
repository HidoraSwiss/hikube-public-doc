---
sidebar_position: 6
title: "FAQ — Zugriffsverwaltung"
sidebar_label: FAQ
description: "Häufige Fragen zur Hikube-Zugriffsverwaltung: Fristen beim Entziehen eines Zugriffs, Garantien der SSO-Verbindung, MFA, Notfall-Super-Administrator, API-Schlüssel."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# FAQ — Zugriffsverwaltung

### Wie schnell wirkt ein entzogener Zugriff?

| Wo Sie den Zugriff entziehen | Frist |
|---|---|
| **In Hikube**: Entzug eines Rangs, eines Mitglieds oder eines Role Bindings, Löschen der SSO-Verbindung | Höchstens **5 Minuten** |
| **Bei Ihrem Anbieter**: ausgeschiedene Person, entfernte Gruppe, gelöschte Zuweisung | Die Person kann sich nicht mehr erneut anmelden. Eine bereits geöffnete Hikube-Sitzung läuft bis zu ihrem Ende: nach einer Zeit der Inaktivität und spätestens bei Erreichen ihrer maximalen Dauer |

Hikube verwendet keine vom Anbieter ausgelöste Abmeldung (*back-channel logout*). Microsoft Entra ID bietet sie nicht an; Okta und Google geben sie in ihrem Discovery-Dokument nicht an.

### Wie sperre ich den Zugriff einer Person, die geht, sofort?

Deaktivieren Sie sie bei Ihrem Anbieter **und** entfernen Sie sie in Hikube (siehe [Mitglieder verwalten](./how-to/manage-members.md#den-zugriff-eines-mitglieds-entziehen)). Das Entfernen in Hikube wirkt nach höchstens 5 Minuten. Widerrufen Sie auch die API-Schlüssel, die sie erstellt hat.

### Was garantiert Hikube für die SSO-Verbindung, und was bleibt in meiner Verantwortung?

| Von Hikube garantiert, unabhängig von der Konfiguration | Empfohlen, in Ihrer Verantwortung |
|---|---|
| Der Aussteller ist der des Discovery-Dokuments, über HTTPS, ohne interne Adresse | Eine Hikube vorbehaltene Anwendung |
| Vertraulicher Client, Authorization-Code-Flow, Signatur des Tokens geprüft mit den von Ihrem Anbieter veröffentlichten Schlüsseln | Die Anwendung ist den Personen oder Gruppen vorbehalten, die Hikube benötigen (**Assignment required** bei Entra ID, Zuweisungen bei Okta, Zustimmungsbildschirm **Internal** bei Google, Auth0 ohne Registrierung) |
| Die gehostete Domain von Google und der Aussteller des Entra-ID-Tenants | Eine stabile Personenkennung (`sub`), die nie einer anderen Person neu zugewiesen wird |
| Eine E-Mail-Adresse im ID-Token, auf einer verifizierten Domain der Organisation | Eine E-Mail-Adresse, die die Person nicht selbst ändern kann |
| Die per Link bestätigte Adresse, sofern Sie **Confirm the address by a link** nicht deaktivieren | Die Deaktivierung von Personen, die das Unternehmen verlassen, bei Ihrem Anbieter |
| Claims, die ausschließlich aus dem ID-Token gelesen werden | Das Ersetzen des Client-Secrets vor seinem Ablauf |
| | Der zweite Faktor (MFA), von Ihrem Anbieter erzwungen |

### Verlangt Hikube von SSO-Konten einen zweiten Faktor?

Nein. Ihr Identitätsanbieter erzwingt ihn: Aktivieren Sie die MFA dort für alle Personen, die auf Hikube zugreifen. Konten mit einem Hikube-Passwort haben immer einen verpflichtenden zweiten Faktor (siehe [Zweiter Faktor](./how-to/set-up-second-factor.md)).

### Warum einen Super-Administrator mit Passwort behalten?

Er ist Ihr Notfallzugang, falls Ihr Identitätsanbieter nicht verfügbar oder falsch konfiguriert ist. Hikube erzwingt dies: **Super admin** geht nur an ein Konto mit Passwort und zweitem Faktor, und die Organisation behält immer mindestens eines.

### Behält ein entferntes Mitglied seine API-Schlüssel?

Ja. Ein Schlüssel behält seine Scopes, auch wenn die Person, die ihn erstellt hat, ihre Rechte verliert. Widerrufen Sie ihn in der Karte **API keys** der Projekteinstellungen (siehe [Authentifizierung der API](../../api/authentication)).

### Kann ein API-Schlüssel die Mitglieder verwalten?

Nein. Ein Schlüssel wirkt auf die Ressourcen eines Projekts. Mitglieder, Einladungen, Domains und die SSO-Verbindung werden in der Konsole verwaltet.

### Kann eine Person Mitglied mehrerer Organisationen sein?

Ja, mit einem persönlichen Konto. Ein Konto, das einer Organisation gehört (Organisationskonto oder SSO-Konto), kann standardmäßig keiner anderen Organisation beitreten (siehe [Externe Mitglieder](./how-to/invite-members.md#externe-mitglieder)).

### Kann ich SAML verwenden?

Nein. Die SSO-Verbindung verwendet OpenID Connect.

### Kann ich zwei SSO-Verbindungen haben?

Nein, nur eine pro Organisation. Um die Anwendung oder den Anbieter zu wechseln, [ersetzen Sie den Anbieter](./how-to/manage-sso-connection.md#den-anbieter-ersetzen): Die SSO-Konten bleiben erhalten.

<NavigationFooter
  seeAlso={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Fehlerbehebung", href: "../troubleshooting"},
  ]}
/>
