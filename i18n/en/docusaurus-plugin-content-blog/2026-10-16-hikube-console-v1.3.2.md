---
title: Hikube Console v1.3.2
authors: [hikube]
tags: [release]
---

This fix makes the console's real-time updates quieter. A session renewal no longer reloads the page in the background, and a tab left idle no longer extends your session.

<!-- truncate -->

## Fixed

- **Real time** — When your session is renewed, the console no longer reloads all the data on the page. Only the data that could not be loaded is requested again. Lists, such as the VM instances list, are no longer re-read or interrupted on each renewal.

## Security

- **Session** — A tab left open without activity no longer extends your session. When your session reaches its expiry, real-time updates pause and the indicator shows **Reconnecting…**. As soon as you come back to the tab, the session is renewed, the data is reloaded and the indicator returns to **Live**. Without activity, the session expires normally, at the time set by the platform.
