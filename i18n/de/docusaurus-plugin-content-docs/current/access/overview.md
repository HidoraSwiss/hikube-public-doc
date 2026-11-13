---
sidebar_position: 1
title: Zugriffsverwaltung im Überblick
description: "Hikube-Zugriffsverwaltung: wer in Ihrer Organisation worauf zugreift, Einladungen, Ränge, zweiter Faktor, Zugriffsüberprüfung und SSO-Verbindung mit Ihrem Identitätsanbieter."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Zugriffsverwaltung

Die Zugriffsverwaltung legt fest, **wer** in Ihre Hikube-Organisation gelangt und **was jede Person dort tun darf**. Sie wird über die [Konsole](https://console.hikube.cloud) gesteuert, Profilmenü → **Organization members**.

## Was sie abdeckt

| Bedarf | Was Hikube bietet |
|---|---|
| Jemanden aufnehmen | Eine Einladung, für die Organisation oder für ein einzelnes Projekt |
| Über die Rechte entscheiden | Vier Ränge: **Read**, **Use**, **Admin**, **Super admin** |
| Anmeldungen schützen | Ein verpflichtender zweiter Faktor für jedes Konto mit Passwort |
| Zugriffe kontrollieren | Eine exportierbare Zugriffsüberprüfung, mit letzter Anmeldung und Inaktivität |
| Den Besitz einer Domain nachweisen | Per DNS-Eintrag verifizierte Domains |
| Die Konten Ihres Unternehmens verwenden | Eine SSO-Verbindung mit Ihrem Identitätsanbieter (Okta, Microsoft Entra ID …) |
| Ihr Verzeichnis über die Rechte entscheiden lassen | Role Bindings: Eine Gruppe Ihres Verzeichnisses vergibt einen Rang |

## Für wen

- **Mitglieder** sehen die Liste der Mitglieder ein, beantworten ihre Einladungen und können eine Organisation verlassen.
- **Administratoren** laden ein, ändern Ränge, entziehen Zugriffe, verwalten die Domains und exportieren die Zugriffsüberprüfung.
- **Super-Administratoren** vergeben den Rang **Super admin** und verwalten die SSO-Verbindung.

## Entzogene Zugriffe wirken schnell

Ein herabgesetzter Rang, ein entferntes Mitglied, ein gelöschtes Role Binding: Die Person wird abgemeldet, und die Änderung gilt nach höchstens **5 Minuten**.

:::info Konsole und API
Die Zugriffsverwaltung erfolgt in der Konsole. Ein [API-Schlüssel](../../api/authentication) kann sie nicht aufrufen: Ein Schlüssel wirkt auf die Ressourcen eines Projekts, nie auf die Zugriffe.
:::

<NavigationFooter
  nextSteps={[
    {label: "Konzepte", href: "../concepts"},
    {label: "Schnellstart: SSO-Verbindung", href: "../quick-start"},
  ]}
  seeAlso={[
    {label: "Personen einladen", href: "../how-to/invite-members"},
  ]}
/>
