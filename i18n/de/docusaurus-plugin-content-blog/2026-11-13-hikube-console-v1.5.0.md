---
title: Hikube-Konsole v1.5.0
authors: [hikube]
tags: [release]
---

Die Konsole begleitet die API v1.7.0 mit der Zugriffsverwaltung: Mitglieder und Ränge, Einladungen, Zugriff nur auf Projekte, Zugriffsüberprüfung, verifizierte Domains und die SSO-Verbindung der Organisation mit ihren Role Bindings. Die Anmeldung verlangt jetzt für Konten mit Passwort einen zweiten Faktor, und die Seite einer VM-Instanz öffnet ihre VNC-Konsole und ihre serielle Konsole.

:::warning Gut zu wissen
- **Verpflichtender zweiter Faktor** — Jedes Konto, das sich mit einem Passwort anmeldet, muss einen zweiten Faktor vorweisen: eine Authentifizierungs-App oder einen Sicherheitsschlüssel. Ein Konto, das noch keinen hat, registriert ihn bei seiner nächsten Anmeldung auf der Anmeldeseite. SSO-Konten verwenden den zweiten Faktor ihres Identitätsanbieters. Siehe [Den zweiten Faktor einrichten](/access/how-to/set-up-second-factor/).
- **Zweistufige Anmeldung** — Die Anmeldeseite fragt zuerst nach Ihrer E-Mail-Adresse, dann nach Ihrem Passwort. Eine Adresse, die von der SSO-Verbindung Ihrer Organisation bedient wird und kein Hikube-Passwort hat, wird an Ihren Identitätsanbieter weitergeleitet. Der Link **Forgot password?** erscheint unter dem Passwortfeld.
- **Skripte** — Skripte, die sich mit Benutzername und Passwort angemeldet haben, funktionieren nicht mehr: Stellen Sie sie auf einen [API-Schlüssel](/api/authentication/) um.
:::

<!-- truncate -->

## Hinzugefügt

- **Organisationsmitglieder** — Eine Seite **Organization members** im Profilmenü listet die Personen auf, die Zugriff auf die Organisation und ihre Projekte haben, mit ihrem **Organization tier** und ihren **Project tiers**: **Read**, **Use**, **Admin** oder **Super admin**. **Edit** ändert die Ränge eines Mitglieds, nie über Ihrem eigenen; ohne Rang verliert die Person den Zugriff auf die Organisation und behält ihr Konto. Das Senken eines Rangs meldet die Person ab, und die Änderung wirkt innerhalb von 5 Minuten. Vom Identitätsanbieter vergebene Ränge sind gesperrt. Siehe [Mitglieder verwalten](/access/how-to/manage-members/).

- **Einladungen** — **Invite people** sendet bis zu 50 Einladungen auf einmal, mit den Rängen, die auf der Organisation oder auf Projekten vergeben werden. Eine Einladung ist 7 Tage gültig. Die Liste **Pending invitations** erlaubt es, sie erneut zu senden (**Resend**) oder zurückzuziehen. Eine eingeladene Person findet ihre Einladungen bei der Anmeldung, jeweils mit der Organisation und dem Absender, und kann sie annehmen (**Accept**) oder ablehnen (**Decline**). Siehe [Personen einladen](/access/how-to/invite-members/).

- **Projektmitglieder** — Die Einstellungen eines Projekts listen seine **Project members** auf: die Personen, die direkt auf ihm einen Rang innehaben. Seine Admins können dort Personen einladen und die Ränge **Read**, **Use** und **Admin** ändern, wenn die Organisation **Delegation to project admins** aktiviert.

- **Zugriff nur auf Projekte** — Eine Person, die nur Zugriff auf Projekte hat, ohne Mitglied der Organisation zu sein, sieht nur diese Projekte. Die Konsole erklärt, warum die Mitglieder und die Einstellungen der Organisation für sie nicht zugänglich sind.

- **Verlassen** — **Leave the organization** oder **Leave the project** entzieht Ihnen Ihre Ränge und beendet Ihre Sitzung. Ihr Konto bleibt mit Ihren Zugriffen andernorts erhalten.

- **Zugriffsüberprüfung** — **Export the access review** lädt eine CSV-Datei herunter: für jeden Rang die Person, den Geltungsbereich, Datum und Urheber der Vergabe, ihre Quelle, den Kontotyp, den Status als externes Mitglied, eine Adresse außerhalb der verifizierten Domains, den Kontostatus, die **Last sign-in (UTC)** und die Inaktivität. Siehe [Die Zugriffsüberprüfung exportieren](/access/how-to/export-access-review/).

- **Verifizierte Domains** — Die Registerkarte **Domains** der **Organization settings** deklariert die E-Mail-Domains der Organisation. **Add a domain** zeigt den TXT-Eintrag, der in der DNS-Zone zu veröffentlichen ist, mit einer Kopierschaltfläche, und **Verify** prüft dann, ob er vorhanden ist. Jede Domain zeigt ihren Status (**Pending**, **Expired**, **Verified**) und ihre letzte Prüfung. Eine abgelaufene Domain wird mit **Issue a new record** neu gestartet. Siehe [Eine Domain verifizieren](/access/how-to/verify-domain/).

- **SSO-Verbindung** — Die Registerkarte **SSO connection** der **Organization settings** erstellt die Verbindung der Organisation zu ihrem OpenID-Connect-Identitätsanbieter, aus dessen **Discovery URL**, **Client id** und **Client secret**. Die Verbindung wird inaktiv erstellt und zeigt die **Redirect URI**, die beim Anbieter zu registrieren ist; danach wird sie eingeschaltet. Die Einstellungen bieten **Allowed domains**, **Invitation required** und die Bestätigung der Adresse mit einem Link. **Replace the provider** behält die SSO-Konten und ihre Zugriffe. Okta und Microsoft Entra ID sind validiert; Google Workspace wird derzeit validiert. Siehe [Schnellstart: SSO-Verbindung](/access/quick-start/), [Okta](/access/how-to/sso-okta/) und [Microsoft Entra ID](/access/how-to/sso-entra-id/).

- **Role Bindings** — Liest die SSO-Verbindung einen **Roles claim**, ordnet **Add a role binding** einen Wert dieses Claims, zum Beispiel eine Gruppe Ihres Verzeichnisses, einem Rang auf der Organisation oder auf einem Projekt zu. Die Ränge der SSO-Konten stammen dann nur noch von Ihrem Anbieter. Siehe [Ränge über Ihren Identitätsanbieter vergeben](/access/how-to/sso-role-bindings/).

- **Instanzkonsole** — Auf der Seite einer laufenden VM-Instanz erscheint eine Registerkarte **Console** mit dem **Screen (VNC)** und der **Serial console**. Die Symbolleiste bietet **Ctrl+Alt+Del**, **Paste clipboard**, **Full screen**, **New tab**, die Schriftgröße, **Reconnect** und, für die serielle Konsole, die Anpassung der VM an die Fenstergröße. Die Konsole verbindet sich nach einem Abbruch oder einem Umzug der Instanz von selbst neu, und eine Sitzung dauert höchstens 8 Stunden. Die serielle Konsole benötigt ein Konto mit Passwort in der Instanz; für längeres Arbeiten ist SSH vorzuziehen.

- **Zweiter Faktor** — Eine Sitzung, die ohne zweiten Faktor geöffnet wurde, zeigt die Seite **A second factor is required** mit **Sign in again**.

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten der Konsole.

- **Alle Ressourcen** — Aktionen zum Erstellen, Bearbeiten und Löschen erscheinen erst ab dem Rang, den sie erfordern. Eine Seite zum Erstellen oder Bearbeiten, die ohne diesen Rang geöffnet wird, zeigt **Read-only**, mit dem erforderlichen Rang und Ihrem.

- **Projekte** — Die Einstellungen eines Projekts öffnen sich schreibgeschützt für alle, die nicht Super-Administrator der Organisation sind: Nur ein Super-Administrator bearbeitet oder löscht ein Projekt.

## Behoben

- **Ressourcenlisten** — Zeilen flackern nicht mehr, wenn sich nichts Angezeigtes geändert hat.

- **VM-Instanzen** — Eine VM, die normal startet, zeigt keine Warnung mehr an, dass sie nicht starten kann.
