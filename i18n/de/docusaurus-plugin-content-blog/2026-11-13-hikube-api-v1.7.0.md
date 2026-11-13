---
title: Hikube API v1.7.0
authors: [hikube]
tags: [release]
---

Die API v1.7.0 bringt die Zugriffsverwaltung für Organisationen: Ränge auf der Organisation und ihren Projekten, Einladungen, Mitglieder eines einzelnen Projekts, Kontoübertragung, Zugriffsüberprüfung, verifizierte Domains und eine SSO-Verbindung pro Organisation mit ihren Role Bindings. Der zweite Faktor wird für Konten mit Passwort verpflichtend, und die Web-Konsole öffnet die VNC-Konsole und die serielle Konsole von Instanzen.

**Inkompatible Änderungen**: Der zweite Faktor ist erforderlich, die Anmeldung von Skripten mit Benutzername und Passwort entfällt, und die Routen der Mitglieder einer Organisation ändern ihren Vertrag (siehe *Migration* am Ende dieser Notiz).

:::warning Handlungsbedarf
- **Verpflichtender zweiter Faktor** — Jedes Konto, das sich mit einem Hikube-Passwort anmeldet, muss einen zweiten Faktor vorweisen: eine Authentifizierungs-App oder einen Sicherheitsschlüssel. Ein Konto, das noch keinen hat, registriert ihn bei seiner nächsten Anmeldung. Eine Anfrage mit einer Sitzung, die ohne zweiten Faktor geöffnet wurde, wird mit HTTP 401 und dem Code `10007` abgelehnt. SSO-Konten verwenden den zweiten Faktor ihres Identitätsanbieters. Siehe [Den zweiten Faktor einrichten](/access/how-to/set-up-second-factor/).
- **Ende der Anmeldung mit Benutzername und Passwort** — Der Anmeldedienst von Hikube stellt kein Token mehr gegen einen Benutzernamen und ein Passwort aus („Password Grant“). Skripte und Werkzeuge, die sich so authentifizierten, müssen auf einen [API-Schlüssel](/api/authentication/) umsteigen, der in den Projekteinstellungen erstellt wird.
- **Mitglieder einer Organisation** — Wenn Sie die Routen `/iam/v1alpha1/organizations/{organization_id}/users` mit einer Benutzersitzung aufrufen, passen Sie Ihre Aufrufe vor der Aktualisierung an: siehe *Geändert* und *Migration*.
:::

<!-- truncate -->

## Hinzugefügt

- **Zugriffsverwaltung** — Eine Person erhält einen Rang auf der Organisation oder auf einem ihrer Projekte: `read`, `write`, `admin` oder `superadmin` (**Read**, **Use**, **Admin** und **Super admin** in der Konsole). Ein Rang auf der Organisation gilt für alle ihre Projekte; ein Rang auf einem Projekt kommt hinzu. Niemand vergibt einen höheren Rang als den eigenen, und nur ein Super-Administrator vergibt die Super-Administration. Ein gesenkter oder entzogener Rang meldet die Person ab und wirkt innerhalb von 5 Minuten. Die Zugriffsverwaltung erfolgt in der Konsole: Ein API-Schlüssel kann sie nicht aufrufen. Siehe [Zugriffsverwaltung](/access/overview/).

- **Einladungen** — Administratoren laden bis zu 50 Adressen auf einmal ein, in die Organisation oder in ein Projekt, mit den Rängen, die sie erhalten. Eine Einladung ist 7 Tage gültig; sie kann erneut gesendet oder zurückgezogen werden. Eine Person, die bereits ein Hikube-Konto hat, findet sie bei ihrer nächsten Anmeldung, die anderen erhalten eine E-Mail, um ihr Konto zu erstellen. Sie nimmt die Einladung an oder lehnt sie ab. Die Einladung nennt die Organisation und die Person, die sie gesendet hat. Siehe [Personen einladen](/access/how-to/invite-members/).

- **Mitglieder eines einzelnen Projekts** — Eine Person kann einen Rang auf einem Projekt innehaben, ohne Mitglied der Organisation zu sein. Sie sieht nur die Projekte, auf denen sie einen Rang hat. Eine Einstellung der Organisation erlaubt ihren Projekt-Admins, Personen in ihr Projekt einzuladen und dort die Ränge **Read**, **Use** und **Admin** zu verwalten. Siehe [Mitglieder verwalten](/access/how-to/manage-members/).

- **Externe Mitglieder und Kontoübertragung** — Jedes Mitglied hat einen Kontotyp: persönlich, der Organisation oder SSO. Ein Mitglied, dessen persönliches Konto zu einer anderen Organisation gehört, ist extern. Eine Person kann ihr Konto der Organisation übertragen, wenn ihre verifizierte Adresse zu einer verifizierten Domain der Organisation gehört und sie in keiner anderen Organisation Zugriff hat. Die Administratoren können dieses Konto danach sperren, entsperren oder löschen und seine Zugangsdaten zurücksetzen. Siehe [Ein Konto an die Organisation übertragen](/access/how-to/transfer-account/).

- **Eine Organisation oder ein Projekt verlassen** — Ein Mitglied kann eine Organisation oder ein Projekt verlassen. Es verliert die betroffenen Ränge, seine Sitzung wird beendet, und sein Konto bleibt mit seinen Zugriffen andernorts erhalten.

- **Zugriffsüberprüfung** — Administratoren exportieren die Zugriffsüberprüfung der Organisation: für jeden Rang die Person, den Geltungsbereich, Datum und Urheber der Vergabe, ihre Quelle (Konsole, Einladung oder Identitätsanbieter), den Kontotyp, den Status als externes Mitglied, eine Adresse außerhalb der verifizierten Domains, die letzte Anmeldung und die Inaktivität. Siehe [Die Zugriffsüberprüfung exportieren](/access/how-to/export-access-review/).

- **Verifizierte Domains** — Eine Organisation weist nach, dass ihr eine E-Mail-Domain gehört, indem sie innerhalb von 7 Tagen einen TXT-Eintrag in ihrer DNS-Zone veröffentlicht. Eine verifizierte Domain wird erneut geprüft: Verschwindet der Eintrag, werden die davon abhängigen Vorgänge abgelehnt, bis er wieder veröffentlicht ist. Eine Organisation deklariert höchstens 20 Domains; ein öffentlicher E-Mail-Dienst oder ein öffentliches Suffix werden abgelehnt, ebenso eine Domain, die bereits von einer anderen Organisation verifiziert wurde. Siehe [Eine Domain verifizieren](/access/how-to/verify-domain/).

- **SSO-Verbindung** — Eine Organisation verbindet ihren OpenID-Connect-Identitätsanbieter über dessen Discovery-URL. Die Personen der verifizierten Domains melden sich dann mit ihrem Firmenkonto an. Die Verbindung ist mit Okta und Microsoft Entra ID validiert; Google Workspace wird derzeit validiert. Eine Verbindung kann eine Einladung verlangen und jede neue Adresse mit einem Link bestätigen. Der Anbieter lässt sich ersetzen, ohne die Konten zu verlieren. SAML wird nicht unterstützt (`60119`). Siehe [Schnellstart: SSO-Verbindung](/access/quick-start/).

- **Role Bindings** — Liest die SSO-Verbindung einen Rollen-Claim, vergibt jeder Wert dieses Claims, zum Beispiel eine Gruppe Ihres Verzeichnisses, bei jeder Anmeldung einen Rang auf der Organisation oder auf einem Projekt. Nie die Super-Administration. Die Ränge der SSO-Konten stammen dann nur noch vom Anbieter: Sie lassen sich in Hikube nicht mehr ändern (`60206`). Siehe [Ränge über Ihren Identitätsanbieter vergeben](/access/how-to/sso-role-bindings/).

- **Instanzkonsole** — Die Web-Konsole öffnet den Bildschirm (VNC) und die serielle Konsole einer laufenden Instanz. Das Ticket zum Öffnen ist der Web-Konsole vorbehalten: Ein API-Schlüssel kann es nicht anfordern.

- **Fehlercodes** — Jede neue Ablehnung hat ihren eigenen Code. Sie werden mit HTTP 400 zurückgegeben, sofern nicht anders angegeben. Das Fehlerformat ist unter [Fehler](/api/errors/) beschrieben, die Codes der Zugriffsverwaltung unter [Fehlerbehebung — Zugriffsverwaltung](/access/troubleshooting/).

| Code | Dienst | Bedeutung |
| --- | --- | --- |
| `10003` | Alle | Ticket abgelaufen (Ereignisstrom, Instanzkonsole): Fordern Sie ein neues an |
| `10007` | Alle | HTTP 401: Zweiter Faktor erforderlich, melden Sie sich mit Ihrem zweiten Faktor erneut an |
| `60004`, `60010` bis `60012` | Zugriffsverwaltung | Einladung, Domain, SSO-Verbindung oder Role Binding nicht gefunden |
| `60013`, `60015` | Zugriffsverwaltung | Vorübergehender Fehler (DNS, Rang noch nicht bereit): Versuchen Sie es erneut |
| `60110` bis `60120` | Zugriffsverwaltung | Ungültige Domain, ungültiger Aussteller, Claim, Scope, Rang, ungültiges Ziel eines Role Bindings oder ungültige Einladung, Wert außerhalb der Grenzen, SAML nicht unterstützt |
| `60200` bis `60205` | Domains | Domain nicht verifiziert, Eintrag fehlt, von einer anderen Organisation verifiziert, Verifizierung abgelaufen oder Domain von der SSO-Verbindung verwendet |
| `60206` | Zugriffsverwaltung | Rang vom Identitätsanbieter vergeben: Ändern Sie ihn in Ihrem Verzeichnis |
| `60207` bis `60211` | Mitglieder | Letzter Super-Administrator mit Passwort, Rang des Ziels höher als Ihrer, Selbstherabstufung, Rang für dieses Konto abgelehnt |
| `60212`, `60213` | Konten | Konto gehört nicht zur Organisation, Vorgang auf einem SSO-Konto nicht möglich |
| `60214` bis `60217` | Einladungen | Mitgliedergrenze, Grenze ausstehender Einladungen, zu viele Einladungen auf einmal, Adresse bereits verwendet |
| `60218` | SSO-Verbindung | Die Organisation hat bereits eine SSO-Verbindung |
| `60219`, `60220` | Übertragung | Zugriff in einer anderen Organisation oder Adresse außerhalb der verifizierten Domains |
| `60221`, `60222` | Einladungen | Einladung nicht mehr ausstehend oder externe Zusammenarbeit von der Organisation, der das Konto gehört, abgelehnt |
| `60223` | Role Bindings | Wert bereits auf der Verbindung verwendet |
| `210001` bis `210200` | Instanzkonsole | Instanz nicht gefunden oder gestoppt, Konsole nicht verfügbar oder ausgelastet, ungültiger Konsolentyp |

## Geändert

Diese Änderungen betreffen ein bestehendes Verhalten. Prüfen Sie sie, wenn Sie die API aus eigenen Werkzeugen aufrufen.

- **Mitglieder einer Organisation** — Die Routen `/iam/v1alpha1/organizations/{organization_id}/users` ändern ihren Vertrag. Sie gehören nicht zur Oberfläche der API-Schlüssel: Betroffen sind nur Aufrufe mit einer Benutzersitzung.
  - `{name}` ist jetzt die Kennung des Kontos (das von der Liste zurückgegebene Feld `id`) und nicht mehr sein Benutzername;
  - die Antworten geben `groups` nicht mehr zurück. Sie geben `tiers` zurück, die Liste der Ränge des Mitglieds (`projectId` leer für die Organisation, `tier`), sowie `accountType` (`organization`, `sso` oder `personal`), `owned`, `external` und `tiersFromIdentityProvider`;
  - `PATCH .../users/{name}` ändert nur noch `tiers`, das die Ränge des Mitglieds in der Organisation und ihren Projekten ersetzt, und nur dort. Die Felder `enabled`, `email`, `firstname`, `lastname` und `groups` werden nicht mehr akzeptiert. Eine leere Liste entzieht jeden Zugriff auf die Organisation;
  - `DELETE .../users/{name}` entzieht der Person den Zugriff auf die Organisation und behält ihr Konto; bisher löschte es das Konto;
  - die Liste akzeptiert die Filter `tier`, `projectId` und `identitySource` (`local` oder `federated`).

- **Zweiter Faktor** — Eine Sitzung, die ohne zweiten Faktor geöffnet wurde, wird mit dem Code `10007` (HTTP 401) abgelehnt, außer bei einem SSO-Konto.

## Entfernt

- **Direkte Erstellung eines Benutzers** — `POST /iam/v1alpha1/organizations/{organization_id}/users` wird entfernt. Einladungen ersetzen sie.

- **Anmeldung mit Benutzername und Passwort** — Der Anmeldedienst stellt kein Token mehr gegen einen Benutzernamen und ein Passwort aus. Verwenden Sie einen API-Schlüssel.

## Behoben

- **VM-Instanzen** — Eine VM, die normal startet, zeigt keinen Blockierungsgrund mehr an. Der Grund stammt nun nur noch von einer tatsächlichen Fehlerursache, etwa einem unzureichenden Kontingent oder keinem verfügbaren Server.

- **Sicherungen** — Die erste Sicherung einer VM auf ein brandneues Ziel kann nicht mehr scheitern, weil ihr Repository noch nicht bereit ist.

:::warning Migration
- **Mit Benutzername und Passwort authentifizierte Skripte**: Erstellen Sie in den Projekteinstellungen (Karte **API keys**) einen API-Schlüssel und rufen Sie die API dann mit dem Header `X-Hikube-Api-Key` auf. Siehe [Authentifizierung](/api/authentication/) und [Schnellstart](/api/quick-start/). Zugriffsverwaltung und Schlüsselverwaltung lassen sich nicht mit einem API-Schlüssel aufrufen: Führen Sie sie in der Konsole aus.
- **Zweiter Faktor**: Informieren Sie die Personen Ihrer Organisation, die sich mit einem Passwort anmelden; sie registrieren ihren zweiten Faktor bei ihrer nächsten Anmeldung. Siehe [Den zweiten Faktor einrichten](/access/how-to/set-up-second-factor/).
- **Routen der Mitglieder**: Für diese Routen gibt es keine Übergangszeit. Lesen Sie die `id` eines Mitglieds aus der Liste, bevor Sie es ändern oder ihm den Zugriff entziehen, ersetzen Sie `groups` durch `tiers`, und laden Sie Personen über Einladungen ein.
:::
