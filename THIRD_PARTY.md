# Third-party audit (website)

Audited 30 October 2026 by reading every `<script>`, `<link>`, `<img>`, URL and form in this folder.
`test-site.js` re-checks it (it fails if any outside host, cookie, storage or tracker appears).

| Item | Loaded from | Personal data sent | Decision |
| --- | --- | --- | --- |
| Plus Jakarta Sans font | `fonts/` (self-hosted) | None | Keep (SIL OFL 1.1). Self-hosted so visitors' IP addresses are not sent to Google |
| Logo and icons | `assets/` (self-hosted) | None | Keep |
| Scripts | `script.js` only (first-party) | None | Keep. No libraries, no CDN |
| Analytics, ads, social buttons, chat, maps, embeds, session replay | Not used | None | Do not add without updating the Privacy and Cookie policies and adding a consent banner with equal Accept and Reject |
| Contact form | Opens the visitor's own email app (`mailto:`) | Only what the visitor chooses to send | Keep. The site stores and transmits nothing itself |

Cookies and browser storage: none.
