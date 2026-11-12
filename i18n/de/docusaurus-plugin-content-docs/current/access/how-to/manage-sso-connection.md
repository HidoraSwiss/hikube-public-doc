---
sidebar_position: 9
title: "Die SSO-Verbindung verwalten"
description: "Die SSO-Verbindung Ihrer Hikube-Organisation ändern, deaktivieren, den Anbieter ersetzen oder sie löschen, und nur eingeladene Personen zulassen."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Die SSO-Verbindung verwalten

Alle diese Aktionen erfolgen unter **Organization members**, Registerkarte **SSO connection**, mit dem Rang **Super admin**.

## Die Einstellungen ändern

1. Klicken Sie auf **Edit settings**.
2. Ändern Sie die gewünschten Felder und klicken Sie dann auf **Save**.

Um nur das Secret zu ändern, geben Sie das neue unter **Client secret** ein. Bleibt das Feld leer, wird das aktuelle Secret beibehalten. Ersetzen Sie das Secret vor seinem Ablauf bei Ihrem Anbieter: Ein abgelaufenes Secret blockiert alle SSO-Anmeldungen.

Das Hinzufügen einer Domain zu den **Allowed domains** prüft ihren DNS-Eintrag erneut.

## Einladung erforderlich

Mit **Invitation required** erstellt eine erste Anmeldung kein Konto. Nur die Personen, die Sie einladen, melden sich an.

Um jemanden zuzulassen, [laden Sie die Person](./invite-members.md) wie gewohnt ein:

- Für eine Adresse einer zulässigen Domain erstellt Hikube sofort ihr SSO-Konto, mit den eingeladenen Rängen, **ohne eine E-Mail zu senden**. Sagen Sie der Person, dass sie sich über Ihren Anbieter anmelden soll;
- bei ihrer ersten Anmeldung erhält die Person einen Link an ihre Adresse. Sobald der Link geöffnet ist, gehört das Konto ihr, und die Einladung erscheint als angenommen;
- das Konto zählt ab der Einladung zu Ihrer Mitgliedergrenze;
- eine Einladung, die abläuft oder die Sie vor der ersten Anmeldung stornieren, löscht das erstellte Konto. Ein erneutes Senden behält das Konto bei;
- eine nicht eingeladene Person sieht, dass für ihre Adresse kein Konto existiert;
- eine Adresse, die bereits ein Konto hat, wird wie gewohnt eingeladen.

Mit einem Rollen-Claim stammen die Ränge bei der Anmeldung vom Anbieter, nicht aus der Einladung. Das Aktivieren oder Deaktivieren der Option ändert kein Konto.

## Deaktivieren und wieder aktivieren

1. Klicken Sie auf **Disable** und bestätigen Sie dann mit **Disable**.

Niemand meldet sich mehr über Ihren Anbieter an. Die SSO-Konten und ihre Zugriffe bleiben erhalten. Sie können sich wieder anmelden, sobald Sie auf **Enable** klicken.

:::note Entfernte Domain
Eine in den **Allowed domains** genannte Domain kann nicht entfernt werden: Entfernen Sie sie zuerst aus der Verbindung. Bedient die Verbindung keine Domain mehr, wird sie deaktiviert. Um sie wieder zu aktivieren, wählen Sie ihre zulässigen Domains erneut aus.
:::

## Den Anbieter ersetzen

Wechseln Sie die Anwendung oder den Anbieter, ohne die Konten zu verlieren.

1. Konfigurieren Sie beim neuen Anbieter die Anwendung wie die erste: dieselbe Redirect-URI, dieselben Zuweisungen, derselbe Rollen-Claim.
2. Klicken Sie in Hikube auf **Replace the provider**.
3. Geben Sie die neue **Discovery URL**, die **Client id** und das **Client secret** ein und klicken Sie dann auf **Replace**.

Erhalten bleiben: die Kennung der Verbindung, ihre Redirect-URI, ihre Einstellungen, die SSO-Konten und ihre Zugriffe.

Bei ihrer nächsten Anmeldung verknüpfen sich die SSO-Konten mit dem neuen Anbieter, nachdem sie den an ihre Adresse gesendeten Link geöffnet haben. Ein Konto, das ein Passwort behalten hat, verknüpft sich durch Eingabe dieses Passworts. SSO-Konten, deren Adresse noch nicht bestätigt war, werden gelöscht.

:::warning Google Workspace
Eine Google-Verbindung kann nicht zu einem anderen Anbieter wechseln, und umgekehrt. Löschen Sie die Verbindung und erstellen Sie eine neue.
:::

## Die Verbindung löschen

:::danger Gelöschte Konten
Das Löschen der Verbindung löscht die SSO-Konten, die sie erstellt hat, sowie die an die Organisation übertragenen Konten, die sich über sie anmeldeten. Ihr Zugriff endet überall nach höchstens 5 Minuten. Um den Anbieter zu wechseln, ohne die Konten zu verlieren, ersetzen Sie den Anbieter.
:::

1. Klicken Sie auf **Delete**.
2. Der Dialog **Delete the SSO connection?** nennt die Anzahl der gelöschten SSO-Konten.
3. Wählen Sie **I understand that … account(s) will be deleted.** aus.
4. Klicken Sie auf **Delete**.

Ein Konto, das ein Passwort behalten hat, wird lediglich von der Verbindung getrennt. Es meldet sich weiterhin mit seinem Passwort und seinem zweiten Faktor an.

<NavigationFooter
  seeAlso={[
    {label: "FAQ", href: "../../faq"},
    {label: "Personen einladen", href: "../invite-members"},
    {label: "Eine Domain verifizieren", href: "../verify-domain"},
  ]}
/>
