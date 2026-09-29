# Google Photos Bulk Album Delete

A Tampermonkey/Greasemonkey userscript that adds bulk album deletion controls to the Google Photos **Albums** page.

## What it does

Google Photos does not provide a practical way to delete hundreds of albums at once. This script automates the existing Google Photos UI:

1. Opens each album card's **More options** menu.
2. Clicks **Delete album** when that action is available.
3. Automatically confirms deletion if Google shows a confirmation dialog.
4. Skips albums the current account does not own instead of clicking **Leave album**.
5. Continues through the album list until there are no more album cards to process.

The script does **not** call an undocumented Google Photos API.

## Important behavior

Deleting an album in Google Photos does **not** delete the photos from your Google Photos library. It removes the album container and its organization.

This script is destructive to albums. Review the code before using it and test with the **TEST ONE** button first.

## Tested

This script was tested against the Google Photos web UI on September 29, 2026.

A real-world cleanup completed successfully with **275 album delete actions sent and 0 skipped**, leaving the Albums page empty.

Google can change the Photos web interface at any time, so future UI changes may require an update.

## Requirements

- A desktop browser supported by your userscript manager
- Tampermonkey, Violentmonkey, or Greasemonkey
- Google Photos web
- Albums visible at `https://photos.google.com/albums`

## Installation

### From GitHub

1. Install a userscript manager such as Tampermonkey.
2. Open the raw script file:
   `google-photos-bulk-album-delete.user.js`
3. Your userscript manager should offer to install it.
4. Open Google Photos and go to **Albums**.

### Manual install

1. Create a new userscript in Tampermonkey.
2. Replace the template with the contents of:
   `google-photos-bulk-album-delete.user.js`
3. Save.
4. Open `https://photos.google.com/albums`.

## Usage

The script adds a small control panel in the lower-right corner of the Albums page.

### TEST ONE

Use this first.

It sends exactly one **Delete album** action, then stops.

### DELETE ALL

Deletes every album the current account owns.

Before starting, the script requires you to type:

`DELETE ALL ALBUMS`

### STOP

Stops the loop after the current operation finishes.

## Counters

- **Sent** — number of `Delete album` actions successfully triggered
- **Gone** — albums confirmed absent when the script checked immediately afterward
- **Skipped** — albums where no usable `Delete album` action was available

The **Gone** count may be lower than **Sent** because Google Photos can remove cards asynchronously. The Albums page itself is the final source of truth.

## Safety behavior

The script intentionally:

- only runs on `photos.google.com`
- only acts from the Albums page
- looks for the exact **Delete album** action
- never clicks **Leave album**
- provides a **TEST ONE** mode
- provides a **STOP** button
- requires typed confirmation before bulk deletion
- uses no analytics
- loads no external JavaScript
- sends no data to third parties

## Known limitations

Google Photos is a single-page application with internal DOM structures that Google may change without notice.

The current script relies on album-card attributes observed in the live Google Photos interface:

- `data-item-type="LI2qEb"`
- `data-media-key`
- `button[aria-label="More options"]`
- exact menu text `Delete album`

If Google changes these structures or labels, the script may stop working until updated.

## Privacy

This script runs locally in your browser. It does not transmit album names, account information, photo metadata, or other data anywhere.

## Contributing

Bug reports and pull requests are welcome.

When reporting a breakage, include:

- browser and version
- userscript manager and version
- what the control panel reported
- relevant Google Photos HTML snippets if selectors appear to have changed

Do not include private album links or personal photo data unless necessary.

## License

MIT License. See [LICENSE](LICENSE).

## Disclaimer

This project is not affiliated with, endorsed by, or supported by Google.

Use it at your own risk. Test before running bulk deletion.
