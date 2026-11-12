---
sidebar_position: 3
title: "Ein Konto an die Organisation übertragen"
description: "Ein persönliches Hikube-Konto an die Organisation übertragen: Bedingungen, Auswirkungen, was die Administratoren danach tun können, und Zusammenhang mit der SSO-Verbindung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ein Konto an die Organisation übertragen

Die meisten Personen melden sich mit einem **persönlichen Konto** an: Es gehört ihnen, und die Organisation vergibt ihm lediglich Zugriffe. Eine Person kann ihr Konto auch an die Organisation **übertragen**. Das Konto wird dann zu einem **Organisationskonto**, das deren Administratoren verwalten.

:::info Verfügbarkeit
Die Übertragung eines Kontos wird in der Konsole noch nicht angeboten. Um ein Konto an Ihre Organisation zu übertragen, wenden Sie sich an den Support.
:::

## Bedingungen

Ohne Zustimmung der Person wird nichts übertragen. Die Übertragung erfordert:

- eine **verifizierte** E-Mail-Adresse auf einer [verifizierten Domain](./verify-domain.md) der Organisation, deren DNS-Eintrag noch vorhanden ist;
- Mitglied der Organisation zu sein oder gleichzeitig ihre Einladung anzunehmen;
- **keinen Zugriff in einer anderen Organisation**, weder auf dieser selbst noch auf einem ihrer Projekte. Ausstehende Einladungen zählen nicht.

Eine Person, deren Übertragung abgelehnt wird, behält ihr persönliches Konto und die ihr vergebenen Zugriffe. Sie kann die Einladung annehmen, ohne ihr Konto zu übertragen: Sie wird externes Mitglied.

## Auswirkungen

- Das Konto behält sein Passwort und seinen zweiten Faktor.
- Die Super-Administratoren der Organisation sehen die Übertragung.
- Standardmäßig kann das Konto keiner anderen Organisation mehr beitreten (siehe [Externe Mitglieder](./invite-members.md#externe-mitglieder)).

### Mit einer aktiven SSO-Verbindung

Ist die SSO-Verbindung der Organisation aktiv und bedient sie die Domain der Adresse, wird die Übertragung bei der nächsten Anmeldung der Person über Ihren Anbieter abgeschlossen, nach ihrem Passwort und ihrem zweiten Faktor. Das Konto wird dann zu einem SSO-Konto: Sein Hikube-Passwort und sein zweiter Faktor werden entfernt. Mit einem Rollen-Claim werden seine in Hikube vergebenen Ränge durch die der [Role Bindings](./sso-role-bindings.md) ersetzt.

Ein Super-Administrator wird nie umgewandelt: Er behält sein Passwort.

## Was Ihre Administratoren tun können

Bei einem Organisationskonto kann ein Administrator zusätzlich zur Verwaltung seiner Zugriffe:

- **es sperren**: Die Person wird abgemeldet und kann sich nicht mehr anmelden; ihre Zugriffe bleiben für die Entsperrung erhalten;
- **es entsperren**;
- **seine Zugangsdaten zurücksetzen**: Sein Passwort und alle seine zweiten Faktoren werden entfernt, die Person wird abgemeldet und erhält einen 24 Stunden gültigen Link, um neue zu wählen. Ein SSO-Konto hat in Hikube keine Zugangsdaten: Setzen Sie sie bei Ihrem Anbieter zurück;
- **es löschen**, mit allen seinen Zugriffen.

:::info Verfügbarkeit
Diese Aktionen sind noch nicht in der Konsole verfügbar. Wenden Sie sich an den Support.
:::

Niemand wirkt auf ein Mitglied mit höherem Rang als dem eigenen ein, und niemand sperrt oder löscht sein eigenes Konto. Die Organisation behält immer einen aktiven Super-Administrator mit Passwort. Das Profil (Name, E-Mail-Adresse) gehört der Person: Ihre Administratoren ändern es nicht.

<NavigationFooter
  seeAlso={[
    {label: "Konzepte", href: "../../concepts"},
    {label: "Eine Domain verifizieren", href: "../verify-domain"},
  ]}
/>
