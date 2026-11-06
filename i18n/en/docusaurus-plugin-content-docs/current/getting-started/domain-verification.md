---
sidebar_position: 4
title: Verify a domain
description: "Prove that your organization owns a domain with a DNS TXT record: publishing it, the operations that check it again, propagation delays and moving a domain."
---

# Verify a domain of your organization

An organization proves that it owns a domain (for example `acme.com`) by
publishing a DNS TXT record. A verified domain lets the organization manage the
accounts of its addresses: a member whose address is on that domain can hand its
account over to the organization.

:::info Availability
Domain verification comes with the management of the organization's members. It
is not offered in the console yet: contact Hidora's support if you need it.
:::

---

## Publish the record

An administrator of the organization declares the domain. Hikube gives them a
record to publish in the domain's DNS zone:

| Name | Type | Value |
|------|------|-------|
| `_hikube-challenge.acme.com` | `TXT` | `hikube-verify=<token>` |

The token belongs to your organization and to that domain. Once the record is
published, the administrator asks for the verification. The domain then goes from
**pending** to **verified**.

- **7-day window.** A domain not verified within 7 days **expires**. Restart its
  verification: Hikube gives a new token, and the old record no longer verifies
  anything.
- **A subdomain is a domain of its own.** Verifying `acme.com` does not verify
  `eu.acme.com`. Each subdomain has its own record. An address `bob@eu.acme.com`
  does not belong to the domain `acme.com`.
- **Refused domains.** Public e-mail domains (`gmail.com`, `outlook.com`…) and
  public suffixes (`co.uk`, `github.io`…) cannot be declared. A subdomain of a
  public suffix (`acme.github.io`) can.
- **20 domains at most** per organization, whatever their state.

## Keep the record in place

:::warning Do not delete the record
The record must stay published as long as the organization keeps the domain.
Hikube checks it again before every operation that gives the domain a new effect.
:::

The operations that check the record again:

- accepting an invitation while handing one's account over to the organization;
- transferring an existing account to the organization, asked by the person;
- coming with the company sign-in (SSO): enabling it and changing the domains it
  serves.

Sending an invitation does not check the record. A successful check holds for one
hour for the domain: a batch of acceptances queries the DNS once.

### If the record is gone

The operation is refused with a message asking to publish the record again.
Nothing else changes:

- the domain stays **verified**;
- existing accounts, their access and their sign-ins keep working;
- the result of the last check is shown to the organization's administrators.

Publish the record again with the same token (it is shown with the domain), then
retry the operation. A person who does not want to wait can accept the invitation
without handing over the account: they become an external member with their
personal account.

If the DNS could not be queried (timeout, server error), the operation is refused
without counting as a missing record: retry a little later.

### A record just published

Hikube queries public DNS resolvers. After a "missing" answer, a resolver keeps
that answer for the zone's negative TTL (the minimum of its SOA record), often a
few minutes, sometimes up to an hour. Hikube itself keeps no "missing" result: as
soon as the resolvers see the record, the next operation goes through.

:::tip
Publish the record before asking for the verification, and wait until it is
visible from a public resolver, for example with
`dig TXT _hikube-challenge.acme.com @9.9.9.9`.
:::

## Delegate the record through a CNAME

A `CNAME` at `_hikube-challenge.<domain>` is followed: you may publish the `TXT`
in another zone. The value must match exactly: a wildcard `TXT` never verifies
anything by chance.

:::warning Wildcard CNAME
A wildcard `CNAME`, for example `*.acme.com CNAME saas.example.net`, also covers
`_hikube-challenge.acme.com`. Whoever controls the `TXT` records of
`saas.example.net` can then answer the verification of `acme.com`. With a
wildcard `CNAME`, publish the `TXT` record explicitly at
`_hikube-challenge.acme.com`: an explicit name wins over the wildcard.
:::

## A domain verified by another organization

A domain is verified for one organization only. If another organization holds it
already, the verification is refused, even with your record in place.

A domain moves to another organization only through **Hidora's support**, for
example after an acquisition or the sale of the domain. The support removes it
from the organization holding it, with the agreement of its superadmin or on proof
of ownership. Your organization then verifies it as usual. The accounts the
former organization manages already stay its own.

## Remove a domain

An administrator can remove a domain at any time. The domain is then free for
another organization. The accounts your organization manages on that domain stay
its own.
