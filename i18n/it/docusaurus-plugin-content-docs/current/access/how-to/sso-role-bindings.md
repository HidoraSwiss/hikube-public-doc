---
sidebar_position: 8
title: "Come conferire i livelli dal suo provider"
description: "Role binding: un valore del claim dei ruoli del suo provider di identità conferisce un livello Hikube sull'organizzazione o su un progetto. Una sola fonte di diritti per connessione."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Conferire i livelli dal suo provider (role binding)

Con un claim dei ruoli, la sua directory decide chi detiene quale livello in Hikube. Un **role binding** associa un valore di questo claim (un nome di gruppo o di ruolo della sua directory) a un livello, sull'organizzazione o su uno dei suoi progetti.

Esempio per l'organizzazione `acme`:

| Valore del claim | Ambito | Livello |
|---|---|---|
| `acme-devs` | Organizzazione | **Use** |
| `web-admins` | Progetto `web` | **Admin** |

Una persona del gruppo `acme-devs` riceve **Use** su tutta l'organizzazione al suo accesso. Una persona di `web-admins` riceve **Admin** sul progetto `web`.

## Una sola fonte di diritti per connessione

| Claim dei ruoli | Da dove provengono i livelli degli account SSO |
|---|---|
| **Compilato** (ruoli dell'applicazione Entra ID, gruppi Okta…) | Solo dai role binding. Non si conferiscono, non si modificano e non si rimuovono più in Hikube: li modifichi nella sua directory |
| **Vuoto** (Google Workspace, il cui token non contiene gruppi) | Da Hikube: un amministratore li conferisce dalla pagina dei membri. La connessione non ha role binding |

Quando i livelli provengono dal provider, la pagina dei membri mostra su questi account: **Tiers granted by the identity provider: change them in your directory.** Una persona di questo tipo non può nemmeno lasciare l'organizzazione né accettare un invito che le conferirebbe un livello.

Gli account che accedono con una password Hikube non sono mai interessati: i loro livelli si conferiscono sempre in Hikube.

:::note Mai il livello Super admin
Un role binding conferisce **Read**, **Use** o **Admin**. Mai **Super admin**: questo livello resta agli account che accedono con una password Hikube e un secondo fattore.
:::

## A ogni accesso

Una persona riceve il livello di ogni role binding il cui valore è contenuto nel suo token di identità. Perde il livello di ogni role binding il cui valore è scomparso, a meno che un altro role binding non conferisca lo stesso livello.

- Una persona rimossa da un gruppo presso il suo provider perde il livello al suo **accesso successivo**.
- Un token senza il claim dei ruoli non conferisce alcun livello.
- Il valore viene confrontato così com'è, maiuscole e spazi compresi.

## Configurare i role binding

Prerequisito: il livello **Super admin**, e una connessione SSO creata (vedere [Creare la connessione SSO](./configure-sso-connection.md)).

### 1. Compilare il claim dei ruoli

1. Apra **Organization members**, scheda **SSO connection**.
2. Faccia clic su **Edit settings**.
3. In **Roles claim**, inserisca il nome del claim, ad esempio `groups` (Okta) o `roles` (ruoli dell'applicazione Entra ID).
4. Faccia clic su **Save**.

:::warning Effetto immediato
Compilare il claim dei ruoli rimuove i livelli conferiti in Hikube agli account SSO della connessione. Questi account vengono disconnessi. Da quel momento decidono i role binding. Li crei subito dopo, quindi chieda alle persone di accedere di nuovo.
:::

### 2. Aggiungere un role binding

1. Nella sezione **Role bindings**, faccia clic su **Add a role binding**.
2. **Claim value**: `acme-devs`.
3. **Scope**: **Organization**, oppure un progetto.
4. **Tier given**: **Use**.
5. Faccia clic su **Add**.

La console mostra **Role binding of “acme-devs” added. It applies at the next sign-in.**

Ripeta per ogni gruppo. Una connessione contiene al massimo 256 role binding, e un valore vi compare una sola volta.

![Finestra Add a role binding: acme-devs, Organization, Use](/img/console/access/role-binding-add.en.png)

### 3. Modificare o eliminare un role binding

- **Edit**: modifichi il valore, l'ambito o il livello, quindi **Save**.
- **Delete**: confermi **Delete**.

Gli account SSO che detenevano il vecchio livello lo perdono, a meno che un altro role binding non lo conferisca. Vengono disconnessi: il loro accesso termina entro **5 minuti** al massimo. Il loro accesso successivo conferisce esattamente ciò che concedono i role binding rimanenti.

## Cambiare fonte

- **Svuotare il claim dei ruoli** elimina tutti i role binding e i livelli che conferivano. Gli account interessati vengono disconnessi. I livelli si conferiscono poi in Hikube.
- **Eliminare un progetto** elimina i role binding che lo riguardano, con i livelli che conferivano.
- **Una persona che affida all'organizzazione un account con password** conserva i propri livelli fino al suo primo accesso tramite il provider. In seguito, i suoi livelli conferiti in Hikube vengono rimossi e decidono i role binding.

## Revisione degli accessi

La [revisione degli accessi](./export-access-review.md) indica, per ogni livello di un account SSO, la fonte **Identity provider**, la connessione e i role binding che lo conferiscono.

<NavigationFooter
  nextSteps={[
    {label: "Gestire la connessione SSO", href: "../manage-sso-connection"},
  ]}
  seeAlso={[
    {label: "Okta: claim groups", href: "../sso-okta"},
    {label: "Entra ID: ruoli dell'applicazione", href: "../sso-entra-id"},
    {label: "Concetti", href: "../../concepts"},
  ]}
/>
