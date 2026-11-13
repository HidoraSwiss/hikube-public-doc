---
sidebar_position: 2
title: "Mitglieder verwalten"
description: "Die Ränge eines Mitglieds ändern, einen Zugriff entziehen, eine Organisation oder ein Projekt verlassen und den Zugriff auf ein Projekt an dessen Administratoren delegieren, in der Hikube-Konsole."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Mitglieder verwalten

## Die Liste der Mitglieder öffnen

1. Klicken Sie im Profilmenü (oben rechts) auf **Organization members**.
2. Die Registerkarte **Members** listet jede Person mit ihrem **Organization tier** und ihren **Project tiers** auf.

Mögliche Badges: **You**, **Account disabled**, **Projects only** (kein Rang auf der Organisation), **No tier** (ein SSO-Konto, dem kein Role Binding einen Rang vergibt).

![Mitglieder der Organisation und ausstehende Einladungen](/img/console/access/members.en.png)

## Die Ränge eines Mitglieds ändern

Voraussetzung: der Rang **Admin** oder höher.

1. Klicken Sie in der Zeile des Mitglieds auf **Edit**.
2. In **Tiers of …**:
   - **On the organization**: **None**, **Read**, **Use**, **Admin** oder **Super admin**;
   - **On a project**: ein Rang pro Projekt, der zu dem der Organisation hinzukommt.
3. Klicken Sie auf **Save**.

Das Herabsetzen eines Rangs meldet die Person ab. Die Änderung gilt nach höchstens **5 Minuten**.

Sie können Folgendes nicht ändern:

- ein Mitglied mit höherem Rang als Ihrem;
- Ihre eigenen Ränge;
- ein SSO-Konto, dessen Ränge vom Identitätsanbieter stammen (siehe [Role Bindings](./sso-role-bindings.md)).

Nur ein Super-Administrator vergibt **Super admin**, und nur an ein Konto mit Passwort und zweitem Faktor, ohne Verknüpfung mit einem Identitätsanbieter.

## Den Zugriff eines Mitglieds entziehen

1. Klicken Sie in der Zeile des Mitglieds auf das Papierkorbsymbol.
2. Bestätigen Sie mit **Remove access**.

Alle seine Ränge in der Organisation und ihren Projekten werden entzogen, und die Person wird nach höchstens **5 Minuten** abgemeldet. Ihr Konto bleibt erhalten, mit seinen Zugriffen auf andere Organisationen. Um zurückzukehren, benötigt sie eine neue Einladung.

Alle Ränge unter **Edit** zu entziehen (Schaltfläche **Remove access**) hat dieselbe Wirkung.

:::warning API-Schlüssel
Das Entfernen eines Mitglieds widerruft nicht die API-Schlüssel, die es erstellt hat: Ein Schlüssel behält seine Scopes. Widerrufen Sie sie in der Karte **API keys** der Projekteinstellungen (siehe [Authentifizierung der API](../../../api/authentication)).
:::

## Die Organisation oder ein Projekt verlassen

Jedes Mitglied kann von sich aus gehen.

1. Klicken Sie in Ihrer Zeile (Badge **You**) auf **Leave**.
2. Wählen Sie **Leave the organization** oder **Leave the project …** und bestätigen Sie dann.

- **Leave the organization** entzieht alle Ihre Ränge in der Organisation und ihren Projekten und beendet Ihre Sitzung. Ihr Konto bleibt erhalten. Für eine Rückkehr ist eine neue Einladung nötig.
- **Leave the project** entzieht den Rang, den Sie direkt auf diesem Projekt halten. Ein Rang auf der Organisation gilt dort weiterhin. Sie können ein Projekt auch über seine Einstellungen verlassen, **Danger Zone** → **Leave the project**.

In zwei Fällen ist das Verlassen nicht möglich:

- der letzte Super-Administrator, der sich mit einem Passwort anmeldet: Ernennen Sie zuerst einen anderen Super-Administrator;
- ein SSO-Konto, dessen Ränge vom Identitätsanbieter stammen: Seine nächste Anmeldung würde sie ihm zurückgeben. Entfernen Sie es bei Ihrem Anbieter aus seiner Gruppe.

## Mitglieder eines Projekts

Die Einstellungen eines Projekts (Zahnradsymbol neben dem Projekt in der Projektauswahl) haben eine Karte **Project members**. Sie listet die Personen auf, die **direkt** auf diesem Projekt einen Rang halten. Die von der Organisation vergebenen Zugriffe gelten dort ebenfalls, ohne aufgeführt zu sein.

Über diese Karte kann ein Administrator:

- eine Person mit einem **Tier on the project** einladen (**Invite**);
- den Rang eines Mitglieds auf diesem Projekt ändern (**Change tier**);
- den Zugriff eines Mitglieds auf dieses Projekt entziehen (**Remove access**).

Diese Aktionen betreffen nur den direkt auf diesem Projekt gehaltenen Rang. Ein Projekt hat keinen Rang **Super admin**: Wählen Sie **Read**, **Use** oder **Admin**.

### Delegation an die Projektadministratoren

Standardmäßig verwalten nur die Administratoren der Organisation den Zugriff auf die Projekte. Ein Super-Administrator kann dies den Administratoren jedes Projekts übertragen:

1. Öffnen Sie **Organization members**, Registerkarte **Members**.
2. Aktivieren Sie in der Karte **Delegation to project admins** die Option **Let project admins manage access to their project**.

Ein Projektadministrator lädt dann auf sein Projekt ein und ändert dort die Ränge **Read**, **Use** und **Admin**, nie über seinem eigenen. Er kann den letzten direkten Administrator des Projekts weder entfernen noch herabstufen. Die von der Organisation vergebenen Zugriffe bleiben von deren Administratoren verwaltet. Eine während der Delegation gesendete Einladung bleibt nach deren Deaktivierung gültig.

<NavigationFooter
  nextSteps={[
    {label: "Personen einladen", href: "../invite-members"},
  ]}
  seeAlso={[
    {label: "Konzepte", href: "../../concepts"},
    {label: "Zugriffsüberprüfung", href: "../export-access-review"},
  ]}
/>
