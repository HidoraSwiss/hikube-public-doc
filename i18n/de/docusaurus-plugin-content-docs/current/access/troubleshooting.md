---
sidebar_position: 7
title: "Fehlerbehebung — Zugriffsverwaltung"
sidebar_label: Fehlerbehebung
description: "Fehlercodes 60xxx der Hikube-Zugriffsverwaltung (Mitglieder, Einladungen, Domains, SSO-Verbindung, Role Bindings): Bedeutung und Maßnahme."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Fehlerbehebung — Zugriffsverwaltung

Die Konsole zeigt für jede Ablehnung eine Meldung an. Die folgenden Tabellen geben den Fehlercode (`60xxx`), seine Bedeutung und die zu ergreifende Maßnahme an. Wenn Sie sich an den Support wenden, geben Sie die angezeigte Meldung und die Uhrzeit des Vorgangs an.

## Mitglieder und Ränge

| Code | Meldung | Was zu tun ist |
|---|---|---|
| `60003` | Sie können keinen höheren Rang als Ihren eigenen vergeben | Bitten Sie ein Mitglied mit ausreichendem Rang |
| `60206` | Die Ränge dieses Kontos stammen vom Identitätsanbieter | Ändern Sie sie in Ihrem Verzeichnis (siehe [Role Bindings](./how-to/sso-role-bindings.md)) |
| `60207` | Die Organisation muss mindestens einen Super-Administrator behalten, der sich mit einem Passwort anmelden kann | Ernennen Sie zuerst einen anderen Super-Administrator |
| `60208` | Dieses Mitglied hat einen höheren Rang als Sie | Bitten Sie einen Super-Administrator |
| `60209` | Sie können Ihre eigenen Ränge weder herabsetzen noch entziehen | Bitten Sie einen anderen Administrator, oder [verlassen Sie die Organisation](./how-to/manage-members.md#die-organisation-oder-ein-projekt-verlassen) |
| `60210` | Das Projekt muss mindestens einen direkten Administrator behalten | Ernennen Sie zuerst einen anderen Administrator des Projekts |
| `60211` | Ein Super-Administrator muss ein Passwort und einen zweiten Faktor haben, ohne Verknüpfung mit einem Identitätsanbieter | Registrieren Sie einen [zweiten Faktor](./how-to/set-up-second-factor.md), oder wählen Sie ein Konto mit Passwort |
| `60115` | Unbekannter Rang, oder **Super admin** auf einem Projekt angefordert | Wählen Sie auf einem Projekt **Read**, **Use** oder **Admin** |
| `60015` | Der Rang ist auf einem gerade erstellten Projekt noch nicht bereit | Versuchen Sie es in einigen Sekunden erneut |
| `60005` | Dienst vorübergehend nicht verfügbar | Versuchen Sie es erneut |

## Einladungen

| Code | Meldung | Was zu tun ist |
|---|---|---|
| `60004` | Einladung nicht gefunden | Melden Sie sich mit dem Konto der eingeladenen Adresse an, deren Adresse verifiziert ist |
| `60221` | Die Einladung ist nicht mehr ausstehend | Sie ist abgelaufen, wurde storniert oder bereits angenommen: Fordern Sie eine neue an |
| `60214` | Die Organisation hat ihre maximale Anzahl an Mitgliedern erreicht | Entfernen Sie ein Mitglied, oder wenden Sie sich an den Support |
| `60215` | Maximale Anzahl ausstehender Einladungen erreicht | Stornieren Sie Einladungen, oder warten Sie, bis sie angenommen werden |
| `60216` | Zu viele Einladungen innerhalb einer Stunde gesendet | Versuchen Sie es später erneut |
| `60222` | Die Organisation, der Ihr Konto gehört, erlaubt ihm nicht, anderen Organisationen beizutreten | Fragen Sie deren Administratoren (siehe [Externe Mitglieder](./how-to/invite-members.md#externe-mitglieder)) |
| `60120` | Ungültige Einladung: Adresse, Duplikat, kein Rang oder Projekt | Korrigieren Sie die Eingabe |

## Kontoübertragung

| Code | Meldung | Was zu tun ist |
|---|---|---|
| `60220` | Die Adresse liegt auf keiner verifizierten Domain der Organisation | Verifizieren Sie die Domain, oder nehmen Sie an, ohne das Konto zu übertragen |
| `60219` | Das Konto hat Zugriffe in einer anderen Organisation | Nehmen Sie an, ohne das Konto zu übertragen |
| `60212` | Das Konto gehört nicht der Organisation | Sie können nur seine Zugriffe entziehen |
| `60213` | Aktion auf einem SSO-Konto nicht möglich: Seine Zugangsdaten liegen bei Ihrem Anbieter | Handeln Sie bei Ihrem Identitätsanbieter |

## Domains

| Code | Meldung | Was zu tun ist |
|---|---|---|
| `60110` | Ungültige Domain | Geben Sie einen Hostnamen mit mindestens zwei Labels und höchstens 235 Zeichen ein |
| `60111` | Öffentlicher E-Mail-Dienst oder öffentliches Suffix | Geben Sie die Domain Ihres Unternehmens an |
| `60118` | Limit überschritten, zum Beispiel eine 21. Domain | Entfernen Sie eine Domain, die nicht mehr verwendet wird |
| `60201` | Der TXT-Eintrag fehlt oder enthält das Token nicht | Veröffentlichen Sie ihn erneut; ein gerade veröffentlichter Eintrag kann bis zum Ablauf der negativen TTL der Zone brauchen, um sichtbar zu werden |
| `60013` | Die DNS-Abfrage ist fehlgeschlagen | Versuchen Sie es erneut |
| `60202` | Die Domain ist von einer anderen Organisation verifiziert | Wenden Sie sich an den Support, um sie zu übertragen |
| `60203` | Die Verifizierung ist abgelaufen | **Restart the verification** |
| `60204` | Die Domain ist bereits verifiziert | Veröffentlichen Sie ihren Eintrag erneut, statt die Verifizierung neu zu starten |
| `60205` | Die SSO-Verbindung lässt diese Domain zu | Entfernen Sie sie zuerst aus ihren **Allowed domains** |
| `60010` | Domain in der Organisation nicht gefunden | Aktualisieren Sie die Seite |

## SSO-Verbindung und Role Bindings

| Code | Meldung | Was zu tun ist |
|---|---|---|
| `60112` | Discovery-Dokument abgelehnt: nicht erreichbar, abweichender Aussteller, fehlender Endpunkt oder fehlende Signatur; oder Wechsel von Google zu einem anderen Anbieter | Kopieren Sie die Discovery-URL so, wie Ihr Anbieter sie anzeigt (siehe [Technische Anforderungen](./concepts.md#technische-anforderungen)) |
| `60119` | SAML wird nicht unterstützt | Verwenden Sie OpenID Connect |
| `60113` | Ungültiger Claim-Name | Ein Name oder ein Pfad mit Punkten; ein Punkt innerhalb eines Namens wird als `\.` geschrieben |
| `60114` | Ungültiger Scope, oder Projekt des Role Bindings nicht gefunden | Entfernen Sie `offline_access`; wählen Sie ein Projekt der Organisation |
| `60118` | Feld außerhalb der Grenzen: Google-Verbindung ohne genau eine Domain, Wert mit mehr als 255 Zeichen, 257. Role Binding … | Korrigieren Sie das in der Meldung genannte Feld |
| `60200` | Eine zulässige Domain, oder die zum Aktivieren erforderliche, ist nicht verifiziert | [Verifizieren Sie die Domain](./how-to/verify-domain.md) |
| `60201` | Der TXT-Eintrag einer Domain ist verschwunden | Veröffentlichen Sie ihn erneut und versuchen Sie es dann noch einmal |
| `60218` | Die Organisation hat bereits eine SSO-Verbindung | Ändern oder ersetzen Sie die bestehende Verbindung |
| `60117` | Role Binding auf einer Verbindung ohne Rollen-Claim | Setzen Sie zuerst den **Roles claim** |
| `60116` | Dieses Projekt kann keinen eigenen Rang erhalten | Vergeben Sie den Rang auf der Organisation, oder wenden Sie sich an den Support |
| `60223` | Der Wert ist auf der Verbindung bereits gebunden | Ändern Sie das bestehende Role Binding |
| `60011` / `60012` | Verbindung oder Role Binding nicht gefunden | Aktualisieren Sie die Seite |

## Probleme mit der SSO-Anmeldung

### Eine Person wird bei der Anmeldung abgelehnt

- Ihre Adresse liegt auf keiner der **Allowed domains**: `bob@eu.acme.com` ist nicht `acme.com`.
- Ihre Adresse steht nicht im ID-Token (Entra ID: leeres E-Mail-Attribut).
- Sie ist der Anwendung bei Ihrem Anbieter nicht zugewiesen.
- **Invitation required** ist aktiviert, und sie wurde nicht eingeladen.

### Eine Person meldet sich an, hat aber keinen Zugriff

- Ohne Rollen-Claim: Ein Administrator muss ihr einen Rang vergeben.
- Mit einem Rollen-Claim: Kein Role Binding passt zu einem Wert ihres Tokens. Prüfen Sie den genauen Wert, einschließlich Groß- und Kleinschreibung. Mit Entra ID und dem Claim `groups` fehlt der Claim ab mehr als 200 Gruppen.
- Mit **Confirm the address by a link**: Sie hat den Link noch nicht geöffnet.
- Die Mitgliedergrenze ist erreicht.

### Niemand kann sich mehr per SSO anmelden

- Das Client-Secret ist bei Ihrem Anbieter abgelaufen: Geben Sie das neue unter **Edit settings** ein.
- Die Verbindung ist **Disabled**: Möglicherweise wurde eine zulässige Domain entfernt.
- Melden Sie sich mit einem Super-Administrator an, der ein Passwort hat.

<NavigationFooter
  seeAlso={[
    {label: "Fehler der API", href: "../../api/errors"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
