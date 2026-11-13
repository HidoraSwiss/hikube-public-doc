---
sidebar_position: 6
title: "Come verificare un dominio"
description: "Dimostrare che la sua organizzazione possiede un dominio con un record DNS TXT _hikube-challenge: dichiarazione, verifica, scadenza, nuova verifica, delega tramite CNAME e rimozione."
---

import NavigationFooter from '@site/src/components/NavigationFooter';

# Verificare un dominio

Un'organizzazione dimostra di possedere un dominio, ad esempio `acme.com`, pubblicando un record DNS TXT. Un dominio verificato serve per:

- la [connessione SSO](../quick-start.md): solo gli indirizzi dei domini verificati possono utilizzarla;
- il [trasferimento di un account](./transfer-account.md) all'organizzazione.

Prerequisito: il livello **Admin** o superiore.

## 1. Dichiarare il dominio

1. Apra **Organization members**, scheda **Domains**.
2. Nella scheda **Verified domains**, faccia clic su **Add a domain**.
3. **Domain**: `acme.com`, senza `http://` né `@`.
4. Faccia clic su **Add**.

La console mostra il record da pubblicare:

| Tipo | Nome | Valore |
|---|---|---|
| `TXT` | `_hikube-challenge.acme.com` | `hikube-verify=<token>` |

Ogni campo ha un pulsante di copia. Il token è specifico della sua organizzazione e di questo dominio. Il dominio è **Pending**.

![Scheda Domains: acme.com in attesa, con il record TXT da pubblicare](/img/console/access/domain-pending.en.png)

## 2. Pubblicare il record

Pubblichi il record `TXT` nella zona DNS di `acme.com` **entro 7 giorni**.

Verifichi che sia visibile da un resolver pubblico:

```bash
dig +short TXT _hikube-challenge.acme.com @9.9.9.9
```

Risultato atteso:

```text
"hikube-verify=<token>"
```

Dopo una risposta «assente», un resolver conserva questa risposta per il TTL negativo della zona (il minimo del suo record SOA): spesso qualche minuto, a volte fino a un'ora. Pubblichi il record prima di avviare la verifica.

## 3. Verificare

Faccia clic su **Verify**. La console mostra **acme.com is verified.** e lo stato passa a **Verified**.

## Stati

| Stato | Significato | Cosa fare |
|---|---|---|
| **Pending** | Record da pubblicare prima della data mostrata | Lo pubblichi, quindi **Verify** |
| **Expired** | Non verificato entro 7 giorni | **Restart the verification**: nuovo token, nuovo termine di 7 giorni |
| **Verified** | L'organizzazione possiede il dominio | Lasci il record al suo posto |

Il menu **Actions** di un dominio in attesa propone anche **Issue a new record**. Il record precedente non vale più: pubblichi quello nuovo prima di verificare.

## Regole

- **Un sottodominio è un dominio a sé.** Verificare `acme.com` non verifica `eu.acme.com`. Ogni sottodominio ha il proprio record. Un indirizzo `bob@eu.acme.com` non appartiene al dominio `acme.com`.
- **Domini rifiutati.** I servizi di posta pubblici (`gmail.com`, `outlook.com`…) e i suffissi pubblici (`co.uk`, `github.io`…). Un sottodominio di un suffisso pubblico, come `acme.github.io`, è accettato.
- **Lunghezza.** Al massimo 235 caratteri. Un dominio con caratteri accentati viene convertito nella sua forma ASCII: `bücher.ch` diventa `xn--bcher-kva.ch`.
- **Al massimo 20 domini** per organizzazione, qualunque sia il loro stato.
- **Un dominio, un'organizzazione.** Se un'altra organizzazione ha già verificato il dominio, la verifica viene rifiutata.

## Lasciare il record al suo posto

:::warning Non elimini il record
Il record deve restare pubblicato finché l'organizzazione mantiene il dominio. Hikube lo controlla di nuovo prima di ogni operazione che conferisce un nuovo effetto al dominio.
:::

Operazioni che controllano di nuovo il record:

- l'attivazione della connessione SSO, per ogni dominio che serve;
- l'aggiunta di un dominio agli **Allowed domains** della connessione SSO;
- il trasferimento di un account all'organizzazione.

L'invio di un invito non lo controlla. Un controllo riuscito vale un'ora per il dominio.

La console mostra l'ultimo controllo sotto il dominio: **record found**, **record missing** o **the DNS did not answer**.

### Se il record è scomparso

L'operazione viene rifiutata. Nient'altro cambia:

- il dominio resta **Verified**;
- gli account, i loro accessi e i loro login continuano a funzionare.

Pubblichi di nuovo il record con lo stesso token, mostrato con il dominio, quindi ripeta l'operazione. Se il DNS non ha risposto, riprovi un po' più tardi.

## Delegare il record tramite un CNAME

Un `CNAME` su `_hikube-challenge.acme.com` viene seguito: può pubblicare il `TXT` in un'altra zona. Il valore deve corrispondere esattamente.

:::warning CNAME generico
Un `CNAME` generico, ad esempio `*.acme.com CNAME saas.exemple.net`, copre anche `_hikube-challenge.acme.com`. Chi controlla i record `TXT` di `saas.exemple.net` può allora rispondere alla verifica di `acme.com`. Con un `CNAME` generico, pubblichi il `TXT` esplicitamente su `_hikube-challenge.acme.com`: un nome esplicito prevale sul generico.
:::

## Un dominio verificato da un'altra organizzazione

Un dominio cambia organizzazione solo tramite il **supporto Hidora**, ad esempio dopo un'acquisizione o la vendita del dominio. Il supporto lo rimuove dall'organizzazione che lo detiene, con il consenso del suo super amministratore o su prova di possesso. La sua organizzazione lo verifica poi normalmente. Gli account che la vecchia organizzazione gestisce già restano suoi.

## Rimuovere un dominio

1. Nel menu **Actions** del dominio, faccia clic su **Remove**.
2. Confermi **Remove**.

Il dominio torna libero per un'altra organizzazione. Gli account di questo dominio che appartengono all'organizzazione le restano.

Un dominio indicato negli **Allowed domains** della connessione SSO non può essere rimosso: lo rimuova prima dalla connessione. Una connessione che non serve più alcun dominio viene disattivata.

<NavigationFooter
  nextSteps={[
    {label: "Creare la connessione SSO", href: "../configure-sso-connection"},
  ]}
  seeAlso={[
    {label: "Avvio rapido", href: "../../quick-start"},
    {label: "Risoluzione dei problemi", href: "../../troubleshooting"},
  ]}
/>
