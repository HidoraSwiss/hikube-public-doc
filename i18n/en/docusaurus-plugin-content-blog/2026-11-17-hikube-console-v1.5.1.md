---
title: Hikube Console v1.5.1
authors: [hikube]
tags: [release]
---

The console accompanies API v1.7.1. It becomes more accessible, with the keyboard as with a screen reader, and displays better on small screens. The theme can follow the system's, and the console keeps less data in the browser.

<!-- truncate -->

## Added

- **Theme** — The theme menu offers **Light**, **Dark** or **System**. In **System** mode, the console follows the computer's theme, including when it changes, and a change made in one tab applies to the other open tabs.

- **GPU** — The NVIDIA L4 GPU can be chosen in the creation wizards of VM instances and Kubernetes clusters.

## Changed

These changes modify an existing behavior of the console.

- **Forms** — An input error appears once the field is left, no longer from the first letter typed. It disappears as soon as it is corrected. Error messages are tied to their field, and required fields are announced by screen readers.

- **Navigation** — Actions that lead to a page, such as **View** and **Edit** in lists, are real links: middle click and **Open in new tab** work.

- **Accessibility** — Each page has its own tab title. Navigation areas, menu states and wizard steps are announced by screen readers, as are actions in progress. Contrast and the focus outline are stronger, tooltips open with the keyboard and on touch, and text follows the font size set in the browser.

- **Small screens** — On a narrow screen, the tables of members, invitations, SSO role bindings and API keys switch to a stacked layout, without horizontal scrolling. Page height takes the mobile browser's bars into account.

- **Dark theme** — Scrollbars, dropdown lists, date pickers and fields autofilled by the browser follow the dark theme.

- **Performance** — Pages load faster, and periodic updates stop while the tab is hidden.

## Fixed

- **Instance console** — In full screen, dialogs, notifications and tooltips show on top of the console.

- **VM instances** — The window that shows the Windows password only once no longer closes with the Escape key.

## Security

- **Console** — Wizard drafts, initialization passwords included, stay in memory and are no longer written to browser storage, except during a language switch. The kubeconfig file is no longer cached. Signing out clears the site's data in the browser.

- **Console** — The content security policy is tighter, and the console is isolated from other sites. Performance measurements no longer send the names of organizations, projects or resources.
