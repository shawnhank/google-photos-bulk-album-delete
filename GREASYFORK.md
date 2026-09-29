# Greasy Fork Publishing Guide

This repository is the canonical source for **Google Photos Bulk Album Delete**.

## Script title

Google Photos Bulk Album Delete

## Short description

Adds safe bulk album deletion controls to Google Photos. Deletes albums you own, skips albums you do not own, and does not delete photos from your Google Photos library.

## Suggested full description

Google Photos does not provide a practical bulk-delete control for albums. This userscript adds a small control panel to the Google Photos Albums page so you can remove many albums without opening and deleting each one manually.

### Features

- **TEST ONE** mode to verify the script against your current Google Photos UI
- **DELETE ALL** mode for albums the current account owns
- **STOP** button
- Automatically handles Google Photos confirmation dialogs when they appear
- Skips albums where the current account does not have a **Delete album** action
- Never automatically clicks **Leave album**
- Shows running counters for delete actions sent, cards already gone, and skipped albums
- No analytics, tracking, external JavaScript, or data transmission

### Important

Deleting a Google Photos album removes the album container and its organization. It does **not** delete the photos from your Google Photos library.

This is a destructive tool for album organization. Use **TEST ONE** first before running **DELETE ALL**.

Google can change the Photos web interface at any time. If the Google Photos DOM or menu labels change, the script may need an update.

## Language

English

## License

MIT

## Category / site

Google Photos

## Canonical repository

https://github.com/shawnhank/google-photos-bulk-album-delete

## Canonical userscript source

https://raw.githubusercontent.com/shawnhank/google-photos-bulk-album-delete/main/google-photos-bulk-album-delete.user.js

## Support URL

https://github.com/shawnhank/google-photos-bulk-album-delete/issues

## Initial publish workflow

1. Sign in to Greasy Fork.
2. Choose **Post a new script**.
3. Paste the contents of:
   `google-photos-bulk-album-delete.user.js`
4. Use the suggested description above.
5. Publish.
6. In the script's administration settings, configure source syncing from the canonical raw GitHub URL if desired.

## Versioning

Increment the userscript `@version` whenever the userscript code changes.

Recommended scheme:

- Patch: selector fixes, UI fixes, compatibility fixes
- Minor: new features or controls
- Major: behavior changes that materially change how deletion works

## Release checklist

Before publishing an update:

- Confirm `@version` was incremented.
- Confirm the script still runs only on Google Photos.
- Run **TEST ONE** against the current Google Photos Albums UI.
- Verify the exact **Delete album** action is still detected.
- Verify albums without that action are skipped.
- Verify **Leave album** is not clicked automatically.
- Run a small multi-album test before a large cleanup.
- Update CHANGELOG.md.
