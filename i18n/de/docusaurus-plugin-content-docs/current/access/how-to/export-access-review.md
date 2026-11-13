---
sidebar_position: 5
title: "Die Zugriffsüberprüfung exportieren"
description: "Die Zugriffsüberprüfung einer Hikube-Organisation exportieren: wer welchen Rang hält, seit wann, vergeben von wem, letzte Anmeldung, Inaktivität und externe Mitglieder."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Zugriffsüberprüfung

Die Zugriffsüberprüfung ist ein CSV-Export aller Ränge aller Mitglieder der Organisation. Sie dient regelmäßigen Überprüfungen und Audits.

## Die Überprüfung exportieren

Voraussetzung: der Rang **Admin** oder höher.

1. Öffnen Sie **Organization members**, Registerkarte **Members**.
2. Klicken Sie auf **Export the access review**.

Die Konsole lädt `access-review-acme-2026-11-12.csv` herunter. Eine Zeile pro Rang und Geltungsbereich, sortiert nach E-Mail-Adresse und dann nach Projekt.

## Spalten

| Spalte | Inhalt |
|---|---|
| **E-mail**, **First name**, **Last name** | Die Person |
| **Scope**, **Project id**, **Tier** | Der Rang, auf der Organisation oder auf einem Projekt |
| **Granted on (UTC)**, **Granted by** | Wann und von wem der Rang vergeben wurde. Leer bei einem Rang, der vergeben wurde, bevor Hikube diese Informationen erfasste |
| **Source** | **Console**, **Invitation** oder **Identity provider** |
| **Account type** | **Organization account**, **SSO account** oder **Personal account** |
| **External member** | **yes** für ein Konto, das nicht der Organisation gehört |
| **Address outside verified domains** | **yes** für ein Organisationskonto, dessen Adresse auf keiner ihrer verifizierten Domains liegt |
| **Account enabled** | **no** für ein gesperrtes Konto |
| **Last sign-in (UTC)** | Leer, wenn keine Anmeldung erfasst wurde |
| **Inactive** | **yes** ohne Anmeldung seit dem Inaktivitätsschwellenwert |
| **SSO connection**, **Role bindings** | Für einen vom Identitätsanbieter vergebenen Rang: die Verbindung und die Role Bindings, die ihn vergeben |
| **Other organization** | Für die Konten Ihrer Organisation: die Zugriffe, die sie in einer anderen Organisation halten, in eigenen Zeilen |

## Letzte Anmeldung und Inaktivität

Hikube erfasst die erste Anfrage jeder Anmeldung an der Konsole. Ein Mitglied ist **inaktiv**, wenn es sich seit **90 Tagen** nicht angemeldet hat. Bei einem Konto ohne erfasste Anmeldung wird ab seiner Erstellung gezählt.

Eine Organisation kann ihre eigenen inaktiven Konten auch automatisch sperren:

- Nur die Organisationskonten werden gesperrt. Externe Mitglieder werden nur gekennzeichnet, und ein Super-Administrator wird nie auf diese Weise gesperrt;
- die Sperrung erfolgt beim nächsten Aufruf der Mitgliederliste oder der Zugriffsüberprüfung;
- die Tage zählen frühestens ab der Aktivierung der Einstellung: Ihre Aktivierung sperrt niemanden sofort;
- ein Administrator entsperrt das Konto.

:::info Verfügbarkeit
Der Inaktivitätsschwellenwert (1 bis 3650 Tage) und die Sperrung inaktiver Konten lassen sich noch nicht in der Konsole einstellen. Um sie zu ändern, wenden Sie sich an den Support. Die Spalte **Inactive** verwendet den Standardschwellenwert von 90 Tagen.
:::

## Was zu prüfen ist

- die externen Mitglieder (**External member**): Sind ihre Zugriffe noch gerechtfertigt?
- die inaktiven Konten (**Inactive**): Entziehen Sie Zugriffe, die nicht mehr genutzt werden;
- die Ränge **Admin** und **Super admin**: Halten Sie ihre Anzahl so gering wie möglich, aber behalten Sie mindestens einen Super-Administrator mit Passwort;
- die Adressen außerhalb der verifizierten Domains (**Address outside verified domains**);
- bei SSO-Konten die Role Bindings, die jeden Rang vergeben (**Role bindings**).

<NavigationFooter
  seeAlso={[
    {label: "Mitglieder verwalten", href: "../manage-members"},
    {label: "FAQ", href: "../../faq"},
  ]}
/>
