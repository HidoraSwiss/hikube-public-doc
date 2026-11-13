---
sidebar_position: 1
title: "Personen einladen"
description: "Personen in eine Hikube-Organisation oder ein Projekt einladen, eine Einladung erneut senden oder stornieren, eine erhaltene Einladung annehmen oder ablehnen, externe Mitglieder."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Personen einladen

Eine Einladung ist der einzige Weg, eine Person zu einer Organisation hinzuzufügen. Die Person erhält die eingeladenen Ränge, wenn sie **annimmt**, nicht vorher.

## Einladen

Voraussetzung: der Rang **Admin** oder höher auf der Organisation.

1. Öffnen Sie **Organization members**, Registerkarte **Members**.
2. Klicken Sie in der Karte **Pending invitations** auf **Invite people**.
3. **E-mail addresses**: zum Beispiel `ana@acme.com, bruno@acme.com`. Trennen Sie die Adressen durch Kommas oder Zeilenumbrüche, höchstens 50.
4. Wählen Sie die Ränge, **On the organization** und/oder **On a project**. Mindestens ein Rang ist erforderlich, nie über Ihrem eigenen.
5. Klicken Sie auf **Invite … people**.

Die Einladung ist **7 Tage** gültig.

- **Die Person hat bereits ein Hikube-Konto**: Sie erhält keine E-Mail. Sie findet die Einladung bei ihrer nächsten Anmeldung an der Konsole.
- **Die Person hat kein Konto**: Sie erhält eine E-Mail, um ihr Konto zu erstellen. Dort verifiziert sie ihre Adresse, wählt ein Passwort und registriert einen [zweiten Faktor](./set-up-second-factor.md).

Eine erneute Einladung an eine Adresse, die bereits eine ausstehende Einladung hat, ersetzt die alte.

Um nur für ein einzelnes Projekt einzuladen, verwenden Sie **Invite** in der Karte **Project members** der Projekteinstellungen (siehe [Mitglieder eines Projekts](./manage-members.md#mitglieder-eines-projekts)).

![Dialog Invite people: zwei Adressen, Rang Use auf der Organisation](/img/console/access/invite.en.png)

## Verfolgen, erneut senden oder stornieren

Die Karte **Pending invitations** listet die **E-mail**, die **Invited tiers** und das Datum **Expires on** auf. Eine abgelaufene Einladung trägt das Badge **Expired**.

- **Resend**: Sendet die Einladung erneut und verlängert sie um 7 Tage.
- Stornieren: Klicken Sie auf das Stornierungssymbol und dann auf **Cancel the invitation**. Sie kann nicht mehr angenommen werden. Sie können diese Adresse erneut einladen.

Bei der Annahme wird jeder eingeladene Rang auf den Rang begrenzt, den die einladende Person zu diesem Zeitpunkt hält. Hat die einladende Person ihren Rang inzwischen verloren, wird dieser Rang nicht vergeben.

### Grenzen

Eine Organisation hat eine maximale Anzahl an Mitgliedern, an ausstehenden Einladungen und an pro Stunde gesendeten Einladungen (ein erneutes Senden zählt mit). Darüber hinaus zeigt die Konsole eine Meldung an: Entfernen Sie ein Mitglied, stornieren Sie Einladungen oder versuchen Sie es später erneut. Um eine Grenze anzuheben, wenden Sie sich an den Support.

## Auf eine Einladung antworten

1. Melden Sie sich an der Konsole an.
2. Im Profilmenü erscheint ein Badge auf **Invitations**. Klicken Sie darauf.
3. Jede Einladung zeigt die **Organization**, ihren Absender (**Sent by …**), die **Invited tiers** und ihr Ablaufdatum an.
4. Klicken Sie auf **Accept**, oder auf **Decline** und dann **Decline the invitation**.

Nach **Accept** erscheinen Ihre Zugriffe innerhalb weniger Minuten; aktualisieren Sie dann die Seite. Eine abgelehnte Einladung kann nicht mehr angenommen werden: Sie benötigen dann eine neue.

Die Einladung ist an Ihre **verifizierte** E-Mail-Adresse gebunden. Melden Sie sich mit dem Konto der eingeladenen Adresse an.

:::note Einladung mit Super admin
Eine Einladung, die **Super admin** vergibt, kann nur mit einem Konto angenommen werden, das ein Passwort und einen zweiten Faktor hat, ohne Verknüpfung mit einem Identitätsanbieter. Registrieren Sie zuerst Ihren zweiten Faktor. Bis dahin bleibt die Einladung ausstehend.
:::

## Externe Mitglieder

Sie können eine Person einladen, die bereits ein Konto hat, auch ein Konto, das einer anderen Organisation gehört. Sie wird **externes Mitglied**: Sie behält ihr Konto, ihre Zugangsdaten und ihre Zugriffe anderswo. Sie können ihr in Ihrer Organisation nur Zugriffe vergeben und entziehen.

:::info Externe Zusammenarbeit standardmäßig abgelehnt
Ein Konto, das einer Organisation gehört (Organisationskonto oder SSO-Konto), kann standardmäßig keiner anderen Organisation beitreten. Nimmt es Ihre Einladung an, antwortet Hikube, dass seine Organisation dies nicht erlaubt. Auf Ihrer Seite bleibt die Einladung bis zu ihrem Ablauf ausstehend.

Die besitzende Organisation kann die externe Zusammenarbeit erlauben. Diese Einstellung ist noch nicht in der Konsole verfügbar: Ihr Super-Administrator wendet sich an den Support. Persönliche Konten sind nie eingeschränkt.
:::

## Einladung und SSO-Verbindung

Hat Ihre SSO-Verbindung die Option **Invitation required**, erstellt die Einladung einer Adresse einer zulässigen Domain sofort ihr SSO-Konto, ohne E-Mail. Siehe [Die SSO-Verbindung verwalten](./manage-sso-connection.md#einladung-erforderlich).

<NavigationFooter
  nextSteps={[
    {label: "Mitglieder verwalten", href: "../manage-members"},
  ]}
  seeAlso={[
    {label: "Ein Konto an die Organisation übertragen", href: "../transfer-account"},
    {label: "Zweiter Faktor", href: "../set-up-second-factor"},
  ]}
/>
