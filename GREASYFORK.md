# Greasy Fork Publishing Guide

This repository is the canonical source for **Google Photos Bulk Album Delete**.

## Published listing

Greasy Fork:

https://greasyfork.org/en/scripts/597987-google-photos-bulk-album-delete

Status: **Published**

The Greasy Fork listing is the recommended installation page. GitHub remains the canonical development source.


## Listing metadata

**Name**

Google Photos Bulk Album Delete

**Language**

English

**License**

MIT

**Applies to**

Google Photos — `https://photos.google.com/*`

**Short description**

Bulk-delete Google Photos albums you own. Includes test, stop, and safety controls; does not delete photos from your library.

## Full listing description

Google Photos does not provide a practical bulk-delete control for albums.

This userscript adds a small control panel to the Google Photos **Albums** page so you can remove many albums without opening each album menu and choosing **Delete album** manually.

### Why this exists

This script came out of a real Google Photos cleanup.

Bulk photo-deletion tools can clear the photos from the Google Photos library, but the album containers can remain behind. After the photo library was cleared during testing, the Albums page still contained hundreds of empty album placeholders.

Google Photos provides no practical bulk way to delete those albums. The normal interface requires using the menu on each album individually.

This userscript was created to automate that second cleanup step.

In the original test run, the script sent **275 album delete actions**, skipped **0**, and left the Albums page empty.

### Features

- **TEST ONE** mode to verify the script against your current Google Photos UI
- **DELETE ALL** mode for albums the current account owns
- **STOP** button
- typed `DELETE ALL ALBUMS` confirmation before bulk deletion
- automatically handles Google Photos confirmation dialogs when they appear
- skips albums where the account does not have a **Delete album** action
- never automatically clicks **Leave album**
- shows counters for delete actions sent, cards already gone, and skipped albums
- no analytics
- no tracking
- no external JavaScript
- no data transmission

### Important behavior

Deleting a Google Photos album removes the album container and its organization. It does **not** delete the photos from your Google Photos library.

This script is for **album cleanup**, not bulk photo deletion.

If your goal is to completely clear a Google Photos account, remove the photos from the photo library first, then use this script to clean up the remaining albums.

### Safety recommendation

Use **TEST ONE** before **DELETE ALL**.

Google can change the Photos web interface at any time. If Google changes its album-card structure or menu labels, the script may need an update.

### Privacy

The script runs locally in your browser. It does not transmit album names, account data, photo metadata, or usage information anywhere.

### Source and support

Source:
https://github.com/shawnhank/google-photos-bulk-album-delete

Issues:
https://github.com/shawnhank/google-photos-bulk-album-delete/issues

## Userscript metadata block

The publishable script currently includes:

- `@name`
- `@namespace`
- `@version`
- `@description`
- `@author`
- `@license MIT`
- `@match https://photos.google.com/*`
- `@homepageURL`
- `@supportURL`
- `@compatible chrome Tested with Tampermonkey`
- `@grant none`
- `@run-at document-idle`

Greasy Fork requires the script name, description, namespace, version, and at least one match/include. The current script satisfies those requirements.

## Greasy Fork compliance notes

The script is intentionally structured to fit Greasy Fork's current code rules:

- source is readable and not minified or obfuscated
- primary functionality is contained directly in the userscript
- no external executable code is loaded
- no `@require` dependencies
- no advertising
- no tracking or analytics
- no author-benefiting antifeatures
- the `@match` scope is limited to Google Photos
- the script clearly describes its destructive album-deletion behavior before installation

No `@antifeature` declaration is needed because the script contains no ads, tracking, referral links, or similar author-benefiting functionality.

## Canonical source

Repository:

https://github.com/shawnhank/google-photos-bulk-album-delete

Raw userscript:

https://raw.githubusercontent.com/shawnhank/google-photos-bulk-album-delete/main/google-photos-bulk-album-delete.user.js

Support:

https://github.com/shawnhank/google-photos-bulk-album-delete/issues

## Initial publication workflow

1. Sign in to Greasy Fork.
2. Open **Post a new script**.
3. Paste the complete contents of `google-photos-bulk-album-delete.user.js`.
4. Confirm the detected name, description, version, license, and Google Photos match scope.
5. Paste the **Full listing description** above into the script description.
6. Publish.
7. After publication, add the Greasy Fork URL back to this repository's README.

Greasy Fork keeps the complete script source on its own service. The GitHub repository remains the canonical development source.

## Updating after publication

For every code change:

1. increment `@version`
2. test **TEST ONE** against the current Google Photos UI
3. verify the exact **Delete album** action still works
4. verify **Leave album** is never clicked automatically
5. update `CHANGELOG.md`
6. update the code on Greasy Fork

## Versioning

Recommended semantic versioning:

- **Patch** — selector, timing, wording, or compatibility fixes
- **Minor** — new features or controls
- **Major** — material behavior changes to deletion logic
