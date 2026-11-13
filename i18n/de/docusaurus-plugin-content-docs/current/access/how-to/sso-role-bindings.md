---
sidebar_position: 8
title: "Ränge über Ihren Identitätsanbieter vergeben"
description: "Role Bindings: Ein Wert des Rollen-Claims Ihres Identitätsanbieters vergibt einen Hikube-Rang auf der Organisation oder einem Projekt. Eine einzige Quelle für Rechte pro Verbindung."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Ränge über Ihren Identitätsanbieter vergeben (Role Bindings)

Mit einem Rollen-Claim entscheidet Ihr Verzeichnis, wer in Hikube welchen Rang hält. Ein **Role Binding** ordnet einen Wert dieses Claims (einen Gruppen- oder Rollennamen Ihres Verzeichnisses) einem Rang zu, auf der Organisation oder auf einem ihrer Projekte.

Beispiel für die Organisation `acme`:

| Claim-Wert | Geltungsbereich | Rang |
|---|---|---|
| `acme-devs` | Organisation | **Use** |
| `web-admins` | Projekt `web` | **Admin** |

Eine Person der Gruppe `acme-devs` erhält bei ihrer Anmeldung **Use** auf der gesamten Organisation. Eine Person von `web-admins` erhält **Admin** auf dem Projekt `web`.

## Eine einzige Quelle für Rechte pro Verbindung

| Rollen-Claim | Woher die Ränge der SSO-Konten stammen |
|---|---|
| **Gesetzt** (App-Rollen von Entra ID, Okta-Gruppen …) | Ausschließlich aus den Role Bindings. Sie werden in Hikube weder vergeben noch geändert noch entzogen: Ändern Sie sie in Ihrem Verzeichnis |
| **Leer** (Google Workspace, dessen Token keine Gruppen enthält) | Aus Hikube: Ein Administrator vergibt sie auf der Mitgliederseite. Die Verbindung hat kein Role Binding |

Stammen die Ränge vom Anbieter, zeigt die Mitgliederseite bei diesen Konten an: **Tiers granted by the identity provider: change them in your directory.** Eine solche Person kann außerdem weder die Organisation verlassen noch eine Einladung annehmen, die ihr einen Rang vergeben würde.

Konten, die sich mit einem Hikube-Passwort anmelden, sind nie betroffen: Ihre Ränge werden immer in Hikube vergeben.

:::note Nie Super admin
Ein Role Binding vergibt **Read**, **Use** oder **Admin**. Nie **Super admin**: Dieser Rang bleibt Konten vorbehalten, die sich mit einem Hikube-Passwort und einem zweiten Faktor anmelden.
:::

## Bei jeder Anmeldung

Eine Person erhält den Rang jedes Role Bindings, dessen Wert ihr ID-Token enthält. Sie verliert den Rang jedes Role Bindings, dessen Wert verschwunden ist, es sei denn, ein anderes Role Binding vergibt denselben Rang.

- Eine Person, die bei Ihrem Anbieter aus einer Gruppe entfernt wird, verliert den Rang bei ihrer **nächsten Anmeldung**.
- Ein Token ohne Rollen-Claim vergibt keinen Rang.
- Der Wert wird unverändert verglichen, einschließlich Groß- und Kleinschreibung und Leerzeichen.

## Die Role Bindings einrichten

Voraussetzung: der Rang **Super admin** und eine erstellte SSO-Verbindung (siehe [Die SSO-Verbindung erstellen](./configure-sso-connection.md)).

### 1. Den Rollen-Claim setzen

1. Öffnen Sie **Organization members**, Registerkarte **SSO connection**.
2. Klicken Sie auf **Edit settings**.
3. Geben Sie unter **Roles claim** den Namen des Claims ein, zum Beispiel `groups` (Okta) oder `roles` (App-Rollen von Entra ID).
4. Klicken Sie auf **Save**.

:::warning Sofortige Wirkung
Das Setzen des Rollen-Claims entzieht den SSO-Konten der Verbindung die in Hikube vergebenen Ränge. Diese Konten werden abgemeldet. Danach entscheiden die Role Bindings. Erstellen Sie sie direkt im Anschluss und bitten Sie die Personen dann, sich erneut anzumelden.
:::

### 2. Ein Role Binding hinzufügen

1. Klicken Sie im Abschnitt **Role bindings** auf **Add a role binding**.
2. **Claim value**: `acme-devs`.
3. **Scope**: **Organization**, oder ein Projekt.
4. **Tier given**: **Use**.
5. Klicken Sie auf **Add**.

Die Konsole zeigt **Role binding of “acme-devs” added. It applies at the next sign-in.** an.

Wiederholen Sie dies für jede Gruppe. Eine Verbindung trägt höchstens 256 Role Bindings, und ein Wert kommt darin nur einmal vor.

![Dialog Add a role binding: acme-devs, Organization, Use](/img/console/access/role-binding-add.en.png)

### 3. Ein Role Binding ändern oder löschen

- **Edit**: Ändern Sie den Wert, den Geltungsbereich oder den Rang, dann **Save**.
- **Delete**: Bestätigen Sie mit **Delete**.

Die SSO-Konten, die den alten Rang hielten, verlieren ihn, es sei denn, ein anderes Role Binding vergibt ihn. Sie werden abgemeldet: Ihr Zugriff endet nach höchstens **5 Minuten**. Ihre nächste Anmeldung vergibt genau das, was die verbleibenden Role Bindings gewähren.

## Die Quelle wechseln

- **Das Leeren des Rollen-Claims** löscht alle Role Bindings und die Ränge, die sie vergaben. Die betroffenen Konten werden abgemeldet. Die Ränge werden danach in Hikube vergeben.
- **Das Löschen eines Projekts** löscht die Role Bindings, die auf dieses Projekt zielen, mit den Rängen, die sie vergaben.
- **Eine Person, die ein Konto mit Passwort an die Organisation überträgt**, behält ihre Ränge bis zu ihrer ersten Anmeldung über den Anbieter. Danach werden ihre in Hikube vergebenen Ränge entzogen, und die Role Bindings entscheiden.

## Zugriffsüberprüfung

Die [Zugriffsüberprüfung](./export-access-review.md) gibt für jeden Rang eines SSO-Kontos die Quelle **Identity provider**, die Verbindung und die Role Bindings an, die ihn vergeben.

<NavigationFooter
  nextSteps={[
    {label: "Die SSO-Verbindung verwalten", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Okta: Claim groups", href: "../sso-okta"},
    {label: "Entra ID: App-Rollen", href: "../sso-entra-id"},
    {label: "Konzepte", href: "../../concepts"},
  ]}
/>
