---
sidebar_position: 2
title: Konzepte
description: "Organisationen, Projekte, Ränge, wer was tun darf, Mitgliedstypen, verifizierte Domains, SSO-Verbindung und Role Bindings: die Begriffe der Hikube-Zugriffsverwaltung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Konzepte der Zugriffsverwaltung

## Organisation und Projekte

- Die **Organisation** steht für Ihr Unternehmen. Sie bündelt Ihre Mitglieder und Ihre Projekte.
- Ein **Projekt** ist ein isolierter Bereich der Organisation: Dort befinden sich Ihre VMs, Cluster und Datenbanken.
- Ein Rang auf der Organisation gilt für alle ihre Projekte. Ein Rang auf einem Projekt kommt dort hinzu.

## Die vier Ränge

| Rang | Wert | Was er erlaubt |
|---|---|---|
| **Read** | `read` | Die Ressourcen einsehen |
| **Use** | `write` | Read, dazu die Nutzung der Ressourcen |
| **Admin** | `admin` | Ressourcen erstellen, ändern und löschen; Mitglieder verwalten |
| **Super admin** | `superadmin` | Alle Rechte, einschließlich der Vergabe dieses Rangs; die SSO-Verbindung verwalten |

Ein Rang schließt die Rechte der niedrigeren Ränge ein. Ein Mitglied, das mehrere Ränge auf demselben Geltungsbereich hält, wird mit dem höchsten angezeigt.

:::note Kein Super admin auf Projektebene
**Super admin** ist ausschließlich ein Rang der Organisation. Auf einem Projekt ist der höchste Rang **Admin**.
:::

## Wer was in der Organisation tun darf

| Aktion | Read | Use | Admin | Super admin |
|---|:-:|:-:|:-:|:-:|
| Die Mitglieder, ihre E-Mail-Adresse und ihren Rang sehen | ja | ja | ja | ja |
| Einladen; Einladungen stornieren und erneut senden | nein | nein | ja | ja |
| **Read**, **Use**, **Admin** vergeben oder entziehen | nein | nein | ja | ja |
| Den Zugriff eines Mitglieds entziehen | nein | nein | ja | ja |
| Die Zugriffsüberprüfung exportieren; die Domains verwalten | nein | nein | ja | ja |
| Auf ein Mitglied mit höherem Rang als dem eigenen einwirken | nein | nein | nein | ja |
| **Super admin** vergeben oder entziehen | nein | nein | nein | ja |
| Die SSO-Verbindung und ihre Role Bindings verwalten | nein | nein | nein | ja |
| Den eigenen Rang herabsetzen | nein | nein | nein | nein |
| Die Organisation verlassen | ja | ja | ja | ja |

Regeln, die die Organisation schützen:

- Niemand vergibt einen höheren Rang als den eigenen;
- niemand setzt den eigenen Rang herab oder entzieht ihn sich: Wer gehen möchte, [verlässt die Organisation](./how-to/manage-members.md#die-organisation-oder-ein-projekt-verlassen);
- die Organisation behält immer mindestens einen Super-Administrator, der sich mit einem Passwort anmeldet;
- **Super admin** geht nur an ein Konto mit Passwort und zweitem Faktor, ohne Verknüpfung mit einem Identitätsanbieter. So behält die Organisation einen Zugang, wenn ihre SSO-Verbindung ausfällt.

## Mitgliedstypen

| Mitglied | Wem das Konto gehört | Was Ihre Administratoren tun können |
|---|---|---|
| **Organisationskonto** | Ihrer Organisation, nach einer [Übertragung](./how-to/transfer-account.md) | Seine Zugriffe vergeben und entziehen; alles Weitere über den Support |
| **SSO-Konto** | Ihrer Organisation, erstellt durch Ihre SSO-Verbindung | Seine Zugriffe vergeben und entziehen (oder Ihre Role Bindings) |
| **Persönliches Konto** (externes Mitglied) | Der Person | Seine Zugriffe in Ihrer Organisation vergeben und entziehen, sonst nichts |
| **Konto einer anderen Organisation** (externes Mitglied) | Der anderen Organisation | Seine Zugriffe in Ihrer Organisation vergeben und entziehen, sonst nichts |

Ein externes Mitglied behält sein Konto, seine Zugangsdaten und seine Zugriffe anderswo. Das Entziehen seines Zugriffs bei Ihnen berührt den Rest nicht.

Ein **Mitglied nur eines Projekts** hält Ränge auf einem oder mehreren Projekten und keinen auf der Organisation. Die Mitgliederseite zeigt es mit dem Badge **Projects only** an. Es sieht den Namen der Organisation und ihre Projekte, sonst nichts. Sein Zugriff endet mit dem Projekt.

Standardmäßig kann ein Konto, das einer Organisation gehört, keiner anderen Organisation beitreten: Die **externe Zusammenarbeit** ist abgelehnt.

## Zweiter Faktor

Jedes Konto, das sich mit einem Hikube-Passwort anmeldet, legt zusätzlich einen zweiten Faktor vor. Ein SSO-Konto hat in Hikube weder Passwort noch zweiten Faktor: Seine MFA ist die Ihres Identitätsanbieters. Siehe [Zweiter Faktor](./how-to/set-up-second-factor.md).

## Verifizierte Domain

Eine verifizierte Domain weist nach, dass die Organisation eine Domain besitzt, zum Beispiel `acme.com`, mithilfe eines DNS-Eintrags vom Typ `TXT` namens `_hikube-challenge.acme.com`. Eine Domain gehört nur einer Organisation. Eine Subdomain ist eine eigene Domain. Der Eintrag muss veröffentlicht bleiben. Siehe [Eine Domain verifizieren](./how-to/verify-domain.md).

## SSO-Verbindung

Mit Single Sign-on (SSO) melden sich die Personen Ihrer Organisation mit dem Konto ihres Unternehmens bei Ihrem **Identitätsanbieter** an, statt mit einem Hikube-Passwort.

- **Eine einzige Verbindung pro Organisation**, über OpenID Connect. SAML wird nicht unterstützt.
- **Nur verifizierte Domains.** Nur die Adressen der zulässigen Domains der Verbindung, die alle verifiziert sind, können sie verwenden.
- **Ein SSO-Konto** wird bei der ersten Anmeldung einer Person erstellt. Es gehört der Organisation.
- **Konten mit Passwort** melden sich weiterhin damit an und werden nie zu Ihrem Anbieter weitergeleitet.

### Technische Anforderungen

| Einstellung bei Ihrem Anbieter | Wert |
|---|---|
| Anwendungstyp | Webanwendung, vertraulich, Authorization-Code-Flow |
| Redirect-URI | Die von der Konsole angezeigte, die auf `/broker/org-<Organisation>/endpoint` endet |
| Client-Authentifizierung | Client-Secret |
| Scopes | `openid`, `email`, `profile` |
| Claims | `email`, Vorname, Nachname und, falls Sie ihn verwenden, der Rollen-Claim, im **ID-Token** (*ID token*) |
| Signatur des ID-Tokens | Asymmetrisch (RS256, ES256 …). HS256 allein wird abgelehnt |
| PKCE | S256, standardmäßig aktiviert |

### Anbieter

| Anbieter | Status |
|---|---|
| [Okta](./how-to/sso-okta.md) | Von Hikube verifiziert |
| [Microsoft Entra ID](./how-to/sso-entra-id.md) | Von Hikube verifiziert |
| [Google Workspace](./how-to/sso-google-workspace.md) | Nicht verifiziert |
| [Auth0](./how-to/sso-auth0.md) | Nicht verifiziert |

Jeder andere OpenID-Connect-Anbieter, der die obigen Anforderungen erfüllt, kann geeignet sein. Er wurde nicht von Hikube verifiziert: Wenden Sie sich an den Support, bevor Sie ihn produktiv einsetzen.

## Role Bindings: eine einzige Quelle für Rechte

Ein **Role Binding** ordnet einen Wert des Rollen-Claims Ihres Anbieters (eine Gruppe oder eine Rolle Ihres Verzeichnisses) einem Hikube-Rang zu, auf der Organisation oder auf einem Projekt. Jede SSO-Verbindung hat eine einzige Quelle für Rechte:

| Rollen-Claim | Woher die Ränge der SSO-Konten stammen |
|---|---|
| **Gesetzt** | Ausschließlich aus den Role Bindings, bei jeder Anmeldung. Sie lassen sich in Hikube nicht mehr ändern |
| **Leer** | Aus Hikube: Ein Administrator vergibt sie auf der Mitgliederseite |

Ein Role Binding vergibt nie **Super admin**. Siehe [Ränge über Ihren Identitätsanbieter vergeben](./how-to/sso-role-bindings.md).

<NavigationFooter
  nextSteps={[
    {label: "Schnellstart: SSO-Verbindung", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Personen einladen", href: "../how-to/invite-members"},
    {label: "FAQ", href: "../faq"},
  ]}
/>
