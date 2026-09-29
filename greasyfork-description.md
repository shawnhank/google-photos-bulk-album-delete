Google Photos does not provide a practical bulk-delete control for albums.

This userscript adds a small control panel to the Google Photos **Albums** page so you can remove many albums without opening each album menu and choosing **Delete album** manually.

## Why this exists

This script came out of a real Google Photos cleanup.

Bulk photo-deletion tools can clear the photos from the Google Photos library, but the album containers can remain behind. After the photo library was cleared during testing, the Albums page still contained hundreds of empty album placeholders.

Google Photos provides no practical bulk way to delete those albums. The normal interface requires using the menu on each album individually.

This userscript was created to automate that second cleanup step.

In the original test run, the script sent **275 album delete actions**, skipped **0**, and left the Albums page empty.

## Features

- **TEST ONE** mode to verify the script against your current Google Photos UI
- **DELETE ALL** mode for albums the current account owns
- **STOP** button
- Typed `DELETE ALL ALBUMS` confirmation before bulk deletion
- Automatically handles Google Photos confirmation dialogs when they appear
- Skips albums where the account does not have a **Delete album** action
- Never automatically clicks **Leave album**
- Shows counters for delete actions sent, cards already gone, and skipped albums
- No analytics
- No tracking
- No external JavaScript
- No data transmission

## Important behavior

Deleting a Google Photos album removes the album container and its organization. It does **not** delete the photos from your Google Photos library.

This script is for **album cleanup**, not bulk photo deletion.

If your goal is to completely clear a Google Photos account, remove the photos from the photo library first, then use this script to clean up the remaining albums.

## Safety recommendation

Use **TEST ONE** before **DELETE ALL**.

Google can change the Photos web interface at any time. If Google changes its album-card structure or menu labels, the script may need an update.

## Privacy

The script runs locally in your browser. It does not transmit album names, account data, photo metadata, or usage information anywhere.

## Source and support

Source:  
https://github.com/shawnhank/google-photos-bulk-album-delete

Issues:  
https://github.com/shawnhank/google-photos-bulk-album-delete/issues
