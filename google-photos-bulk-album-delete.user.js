// ==UserScript==
// @name         Google Photos Bulk Album Delete
// @namespace    https://github.com/shawnhank/google-photos-bulk-album-delete
// @version      1.0.0
// @description  Adds bulk album deletion controls to Google Photos. Deletes albums you own without deleting photos from your library.
// @author       Shawn Hank
// @license      MIT
// @match        https://photos.google.com/*
// @homepageURL  https://github.com/shawnhank/google-photos-bulk-album-delete
// @supportURL   https://github.com/shawnhank/google-photos-bulk-album-delete/issues
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    const CARD_SELECTOR =
        'a[data-item-type="LI2qEb"][data-media-key]';

    const STATE_KEY =
        '__gphotos_bulk_album_delete_v1';

    const DELAYS = {
        afterMenuOpen: 300,
        afterConfirmation: 500,
        afterDelete: 650,
        betweenAlbums: 250,
        afterScroll: 600
    };

    const DEFAULT_STATE = {
        running: false,
        mode: null,
        attempted: 0,
        removed: 0,
        skipped: 0,
        processedIds: [],
        status: 'Ready',
        current: ''
    };

    const sleep = ms =>
        new Promise(resolve => setTimeout(resolve, ms));

    // ============================================================
    // STATE
    // ============================================================

    function loadState() {
        try {
            return {
                ...DEFAULT_STATE,
                ...JSON.parse(
                    localStorage.getItem(STATE_KEY) || '{}'
                )
            };
        } catch {
            return { ...DEFAULT_STATE };
        }
    }

    function saveState(state) {
        localStorage.setItem(
            STATE_KEY,
            JSON.stringify(state)
        );

        updatePanel(state);
    }

    function resetState(overrides = {}) {
        const state = {
            ...DEFAULT_STATE,
            ...overrides
        };

        saveState(state);

        return state;
    }

    function onAlbumsPage() {
        return (
            location.pathname === '/albums' ||
            location.pathname.startsWith('/albums/')
        );
    }

    // ============================================================
    // DOM HELPERS
    // ============================================================

    function normalize(value) {
        return String(value || '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function visible(el) {
        if (!el) return false;

        const rect = el.getBoundingClientRect();
        const style = getComputedStyle(el);

        return (
            rect.width > 0 &&
            rect.height > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0'
        );
    }

    function textOf(el) {
        return normalize(
            el?.getAttribute?.('aria-label') ||
            el?.getAttribute?.('title') ||
            el?.innerText ||
            el?.textContent
        );
    }

    function clickables(root = document) {
        return [
            ...root.querySelectorAll(
                'button, [role="button"], [role="menuitem"], [role="option"]'
            )
        ].filter(visible);
    }

    function findExact(root, labels) {
        const wanted =
            labels.map(value => value.toLowerCase());

        return (
            clickables(root).find(el =>
                wanted.includes(
                    textOf(el).toLowerCase()
                )
            ) || null
        );
    }

    async function waitFor(
        fn,
        timeout = 4000,
        interval = 100
    ) {
        const start = Date.now();

        while (Date.now() - start < timeout) {
            const result = fn();

            if (result) {
                return result;
            }

            await sleep(interval);
        }

        return null;
    }

    // ============================================================
    // ALBUM HELPERS
    // ============================================================

    function albumId(card) {
        return (
            card.getAttribute('data-media-key') ||
            ''
        );
    }

    function albumTitle(card) {
        return normalize(
            card.querySelector('.ptmR6b')?.textContent ||
            card.querySelector('[dir="auto"]')?.textContent ||
            albumId(card)
        );
    }

    function visibleCards() {
        return [
            ...document.querySelectorAll(
                CARD_SELECTOR
            )
        ].filter(visible);
    }

    function nextCard(processed) {
        return (
            visibleCards().find(card => {
                const id = albumId(card);

                return (
                    id &&
                    !processed.has(id)
                );
            }) || null
        );
    }

    // ============================================================
    // SCROLL CONTAINER
    // ============================================================

    function getScroller(element) {
        let node =
            element?.parentElement;

        while (
            node &&
            node !== document.body
        ) {
            const style =
                getComputedStyle(node);

            if (
                (
                    style.overflowY === 'auto' ||
                    style.overflowY === 'scroll'
                ) &&
                node.scrollHeight >
                    node.clientHeight + 20
            ) {
                return node;
            }

            node =
                node.parentElement;
        }

        return (
            document.scrollingElement ||
            document.documentElement
        );
    }

    // ============================================================
    // OPTIONAL CONFIRMATION HANDLING
    // ============================================================

    async function handlePossibleConfirmation() {
        /*
         * Google Photos may delete immediately or may show a
         * confirmation dialog. If a confirmation appears, click
         * its exact Delete/Delete album button automatically.
         */

        const confirmation =
            await waitFor(
                () => {
                    const dialogs = [
                        ...document.querySelectorAll(
                            '[role="dialog"], [role="alertdialog"], dialog'
                        )
                    ].filter(visible);

                    for (const dialog of dialogs) {
                        const button =
                            findExact(
                                dialog,
                                [
                                    'Delete',
                                    'Delete album'
                                ]
                            );

                        if (button) {
                            return button;
                        }
                    }

                    return null;
                },
                800,
                80
            );

        if (confirmation) {
            confirmation.click();

            await sleep(
                DELAYS.afterConfirmation
            );
        }
    }

    // ============================================================
    // PROCESS ONE ALBUM
    // ============================================================

    async function processAlbum(card) {
        let state =
            loadState();

        if (!state.running) {
            return 'stopped';
        }

        const id =
            albumId(card);

        const title =
            albumTitle(card);

        /*
         * Mark before clicking so a slow Google Photos UI cannot
         * trap the loop on the same album card.
         */

        if (
            !state.processedIds.includes(id)
        ) {
            state.processedIds.push(id);
        }

        state.current =
            title;

        state.status =
            `Opening: ${title}`;

        saveState(state);

        const more =
            card.querySelector(
                'button[aria-label="More options"]'
            );

        if (!more) {
            state =
                loadState();

            state.skipped += 1;
            state.current = '';
            state.status =
                `Skipped: no More options menu for ${title}`;

            saveState(state);

            return 'skipped';
        }

        more.click();

        await sleep(
            DELAYS.afterMenuOpen
        );

        const menu =
            await waitFor(
                () => {
                    const menus = [
                        ...document.querySelectorAll(
                            '[role="menu"]'
                        )
                    ].filter(visible);

                    return (
                        menus.at(-1) ||
                        null
                    );
                },
                2500
            );

        if (!menu) {
            state =
                loadState();

            state.skipped += 1;
            state.current = '';
            state.status =
                `Skipped: menu did not open for ${title}`;

            saveState(state);

            return 'skipped';
        }

        const deleteItem =
            findExact(
                menu,
                ['Delete album']
            );

        if (!deleteItem) {
            /*
             * Do not click "Leave album". Albums the current user
             * does not own are skipped instead.
             */

            document.dispatchEvent(
                new KeyboardEvent(
                    'keydown',
                    {
                        key: 'Escape',
                        bubbles: true
                    }
                )
            );

            state =
                loadState();

            state.skipped += 1;
            state.current = '';
            state.status =
                `Skipped: no Delete album action for ${title}`;

            saveState(state);

            return 'skipped';
        }

        state =
            loadState();

        state.status =
            `Deleting: ${title}`;

        saveState(state);

        deleteItem.click();

        await handlePossibleConfirmation();

        await sleep(
            DELAYS.afterDelete
        );

        const stillExists =
            document.querySelector(
                `${CARD_SELECTOR}[data-media-key="${CSS.escape(id)}"]`
            );

        state =
            loadState();

        state.attempted += 1;

        if (!stillExists) {
            state.removed += 1;
        }

        state.current = '';
        state.status =
            `Delete actions sent: ${state.attempted}`;

        saveState(state);

        await sleep(
            DELAYS.betweenAlbums
        );

        return 'attempted';
    }

    // ============================================================
    // MAIN LOOP
    // ============================================================

    async function run(targetAttempts = Infinity) {
        if (!onAlbumsPage()) {
            const state =
                loadState();

            state.running = false;
            state.status =
                'Open Google Photos → Albums before running this script.';

            saveState(state);

            return;
        }

        const startAttempted =
            loadState().attempted;

        let bottomCount = 0;

        while (
            loadState().running
        ) {
            let state =
                loadState();

            if (
                state.attempted -
                startAttempted >=
                targetAttempts
            ) {
                state.running = false;
                state.mode = null;
                state.current = '';
                state.status =
                    targetAttempts === 1
                        ? 'Test complete. One Delete album action was sent.'
                        : `Finished. Delete actions sent: ${state.attempted}. Skipped: ${state.skipped}.`;

                saveState(state);

                return;
            }

            const processed =
                new Set(
                    state.processedIds
                );

            const card =
                nextCard(processed);

            if (card) {
                bottomCount = 0;

                const result =
                    await processAlbum(card);

                if (result === 'stopped') {
                    return;
                }

                continue;
            }

            const cards =
                visibleCards();

            const reference =
                cards[0] ||
                document.querySelector(
                    CARD_SELECTOR
                );

            if (!reference) {
                state =
                    loadState();

                state.running = false;
                state.mode = null;
                state.current = '';
                state.status =
                    `Finished. Delete actions sent: ${state.attempted}. Skipped: ${state.skipped}.`;

                saveState(state);

                return;
            }

            const scroller =
                getScroller(reference);

            const before =
                scroller.scrollTop;

            const max =
                Math.max(
                    0,
                    scroller.scrollHeight -
                    scroller.clientHeight
                );

            scroller.scrollTop =
                Math.min(
                    max,
                    before +
                    Math.max(
                        scroller.clientHeight * 0.8,
                        600
                    )
                );

            await sleep(
                DELAYS.afterScroll
            );

            const after =
                scroller.scrollTop;

            if (
                Math.abs(after - before) < 2 ||
                after >= max - 2
            ) {
                bottomCount += 1;
            } else {
                bottomCount = 0;
            }

            if (bottomCount >= 3) {
                state =
                    loadState();

                state.running = false;
                state.mode = null;
                state.current = '';
                state.status =
                    `Finished. Delete actions sent: ${state.attempted}. Skipped: ${state.skipped}.`;

                saveState(state);

                return;
            }
        }
    }

    // ============================================================
    // CONTROL PANEL
    // ============================================================

    function createButton(text, id) {
        const button =
            document.createElement('button');

        button.id = id;
        button.textContent = text;

        return button;
    }

    function createPanel() {
        if (
            document.getElementById(
                '__gphotos_bulk_album_delete'
            )
        ) {
            return;
        }

        const panel =
            document.createElement('div');

        panel.id =
            '__gphotos_bulk_album_delete';

        const title =
            document.createElement('div');

        title.className =
            'gpbad-title';

        title.textContent =
            'Google Photos Bulk Album Delete';

        const warning =
            document.createElement('div');

        warning.className =
            'gpbad-warning';

        warning.textContent =
            'Deletes albums you own. It does not delete photos from your Google Photos library.';

        const counters =
            document.createElement('div');

        counters.className =
            'gpbad-counters';

        const attempted =
            document.createElement('span');

        attempted.id =
            'gpbad-attempted';

        const removed =
            document.createElement('span');

        removed.id =
            'gpbad-removed';

        const skipped =
            document.createElement('span');

        skipped.id =
            'gpbad-skipped';

        counters.append(
            attempted,
            document.createTextNode(' | '),
            removed,
            document.createTextNode(' | '),
            skipped
        );

        const current =
            document.createElement('div');

        current.id =
            'gpbad-current';

        current.className =
            'gpbad-current';

        const status =
            document.createElement('div');

        status.id =
            'gpbad-status';

        status.className =
            'gpbad-status';

        const buttons =
            document.createElement('div');

        buttons.className =
            'gpbad-buttons';

        const testOne =
            createButton(
                'TEST ONE',
                'gpbad-test'
            );

        const deleteAll =
            createButton(
                'DELETE ALL',
                'gpbad-delete'
            );

        const stop =
            createButton(
                'STOP',
                'gpbad-stop'
            );

        buttons.append(
            testOne,
            deleteAll,
            stop
        );

        panel.append(
            title,
            warning,
            counters,
            current,
            status,
            buttons
        );

        const style =
            document.createElement('style');

        style.textContent = `
            #__gphotos_bulk_album_delete {
                position: fixed;
                right: 18px;
                bottom: 18px;
                z-index: 2147483647;
                width: 390px;
                padding: 14px;
                box-sizing: border-box;
                background: #202124;
                color: #fff;
                border: 1px solid #5f6368;
                border-radius: 10px;
                box-shadow: 0 6px 24px rgba(0,0,0,.35);
                font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            }

            #__gphotos_bulk_album_delete .gpbad-title {
                font-size: 15px;
                font-weight: 700;
                margin-bottom: 7px;
            }

            #__gphotos_bulk_album_delete .gpbad-warning {
                margin-bottom: 9px;
                color: #fdd663;
            }

            #__gphotos_bulk_album_delete .gpbad-counters {
                margin-bottom: 7px;
            }

            #__gphotos_bulk_album_delete .gpbad-current {
                min-height: 18px;
                color: #bdc1c6;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            #__gphotos_bulk_album_delete .gpbad-status {
                min-height: 38px;
                margin-top: 6px;
                margin-bottom: 10px;
                padding: 8px;
                background: #303134;
                border-radius: 6px;
            }

            #__gphotos_bulk_album_delete .gpbad-buttons {
                display: flex;
                gap: 8px;
            }

            #__gphotos_bulk_album_delete button {
                border: 0;
                border-radius: 6px;
                padding: 9px 12px;
                font-weight: 700;
                cursor: pointer;
            }

            #gpbad-test {
                background: #8ab4f8;
                color: #202124;
            }

            #gpbad-delete {
                flex: 1;
                background: #f28b82;
                color: #202124;
            }

            #gpbad-stop {
                background: #e8eaed;
                color: #202124;
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(panel);

        testOne.addEventListener(
            'click',
            () => {
                resetState({
                    running: true,
                    mode: 'test',
                    status:
                        'Test mode: sending one Delete album action.'
                });

                run(1).catch(handleFatalError);
            }
        );

        deleteAll.addEventListener(
            'click',
            () => {
                const answer =
                    prompt(
                        'This will delete every Google Photos album this account owns.\n\n' +
                        'Photos in your Google Photos library are not deleted.\n' +
                        'Albums you do not own are skipped.\n\n' +
                        'Type DELETE ALL ALBUMS to continue:'
                    );

                if (
                    answer !==
                    'DELETE ALL ALBUMS'
                ) {
                    const state =
                        loadState();

                    state.status =
                        'Cancelled.';

                    saveState(state);

                    return;
                }

                resetState({
                    running: true,
                    mode: 'all',
                    status:
                        'Starting bulk album deletion…'
                });

                run().catch(handleFatalError);
            }
        );

        stop.addEventListener(
            'click',
            () => {
                const state =
                    loadState();

                state.running = false;
                state.mode = null;
                state.current = '';
                state.status =
                    'Stopped by user.';

                saveState(state);
            }
        );

        updatePanel(
            loadState()
        );
    }

    function handleFatalError(error) {
        const state =
            loadState();

        state.running = false;
        state.mode = null;
        state.current = '';
        state.status =
            `Stopped: ${error.message || error}`;

        saveState(state);

        console.error(
            '[Google Photos Bulk Album Delete]',
            error
        );
    }

    function updatePanel(state) {
        const attempted =
            document.getElementById(
                'gpbad-attempted'
            );

        const removed =
            document.getElementById(
                'gpbad-removed'
            );

        const skipped =
            document.getElementById(
                'gpbad-skipped'
            );

        const current =
            document.getElementById(
                'gpbad-current'
            );

        const status =
            document.getElementById(
                'gpbad-status'
            );

        if (attempted) {
            attempted.textContent =
                `Sent: ${state.attempted}`;
        }

        if (removed) {
            removed.textContent =
                `Gone: ${state.removed}`;
        }

        if (skipped) {
            skipped.textContent =
                `Skipped: ${state.skipped}`;
        }

        if (current) {
            current.textContent =
                state.current
                    ? `Current: ${state.current}`
                    : '';
        }

        if (status) {
            status.textContent =
                state.status;
        }
    }

    // ============================================================
    // INITIALIZATION
    // ============================================================

    if (onAlbumsPage()) {
        resetState();
        createPanel();
    }
})();