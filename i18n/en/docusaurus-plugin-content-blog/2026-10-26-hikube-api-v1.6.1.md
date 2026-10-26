---
title: Hikube API v1.6.1
authors: [hikube]
tags: [release]
---

The API now applies rate limits per API key and per IP address. All its errors, authentication refusals included, follow the same format with `requestId` and `code`, and every response carries a request identifier. This version also fixes a security issue that requires no action on your part.

<!-- truncate -->

## Added

- **Rate limits** — Requests are limited per API key (currently a burst of 120 requests, then 300 per minute) and per IP address (a burst of 300, then 600 per minute). These values may change. Beyond them, the API answers `429` with code `10008`, and a `Retry-After` header gives, in seconds, how long to wait before retrying. Every response also carries `X-RateLimit-Limit` and `X-RateLimit-Remaining`, which describe the caller's most restrictive limit. See [Rate limits](/api/errors/#limites-de-debit).

- **Request identifier** — Every response, successful ones included, carries an `x-request-id` header. The body of an error also carries a `requestId`. Give either one to support for any investigation, and both if you have them. See [Request identifier](/api/errors/#identifiant-de-requete).

## Changed

- **Error format** — Authentication and rate-limit refusals now follow the format of the API's other errors: a JSON body with `requestId`, `code`, `message` and `details`. A request without an API key receives `403` with code `10002`, like an invalid key. Code `401` (`10001`) only concerns invalid or expired session tokens, not API keys. See [Errors](/api/errors/).

- **OpenAPI specification** — The `429` response is listed on every operation, and the description of the `401` response is corrected. The [API reference](/api/reference/hikube-api) is up to date.

## Security

- **Event stream** — A temporary token used to open the event stream could be kept in the platform's internal logs. It no longer is. No action is required on your part.
