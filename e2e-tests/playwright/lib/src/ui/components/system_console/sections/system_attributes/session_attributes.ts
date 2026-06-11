// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import type {Locator} from '@playwright/test';
import {expect} from '@playwright/test';

const SESSION_ATTRIBUTES_URL = '/admin_console/system_attributes/session_attributes';

// PATCH route the page hits when committing staged edits (one request per changed field).
const PATCH_FIELD_URL_FRAGMENT = '/properties/groups/session_attributes/session/fields/';

/**
 * System Console -> System Attributes -> Session Attributes
 *
 * Page object for the seeded session-attribute listing/tuning UI. Rows are keyed
 * by the server-assigned property field id (resolve it via the property fields
 * API before calling row-scoped accessors).
 */
export default class SessionAttributes {
    readonly container: Locator;
    private readonly page;

    readonly saveButton: Locator;
    readonly cancelButton: Locator;

    constructor(container: Locator) {
        this.container = container.getByTestId('sessionAttributes');
        this.page = container.page();

        this.saveButton = this.page.getByTestId('saveSetting');
        this.cancelButton = this.page.locator('#cancelButtonSettings');
    }

    // ── Visibility ──────────────────────────────────────────────────────

    async goto() {
        await this.page.goto(SESSION_ATTRIBUTES_URL);
        await this.page.waitForLoadState('networkidle');
    }

    async toBeVisible() {
        await expect(this.container).toBeVisible();
    }

    // ── Row accessors (keyed by server field id) ────────────────────────

    row(fieldId: string): Locator {
        return this.container.locator(`#sessionAttributes-row-${fieldId}`);
    }

    displayName(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-display-name');
    }

    serverLabel(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-server-label');
    }

    type(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-type');
    }

    platforms(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-platforms');
    }

    ttl(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-ttl');
    }

    grace(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-grace');
    }

    status(fieldId: string): Locator {
        return this.row(fieldId).getByTestId('session-attribute-status');
    }

    dotMenuButton(fieldId: string): Locator {
        return this.row(fieldId).getByTestId(`session-attribute-dotmenu-${fieldId}`);
    }

    // ── Row actions (stage edits locally; commit via saveAndWaitForSettled) ──

    async openDotMenu(fieldId: string) {
        await this.dotMenuButton(fieldId).click();
    }

    /**
     * Stage a TTL preset (in seconds) for a field via its dot menu. The submenu
     * stays open until a preset is chosen; the option closes the menu on click.
     */
    async setTtlPreset(fieldId: string, seconds: number) {
        await this.openDotMenu(fieldId);
        await this.page.getByRole('menuitem', {name: /Time-to-live/}).hover();
        const option = this.page.getByTestId(`session-attribute-ttl-option-${fieldId}-${seconds}`);
        await expect(option).toBeAttached();
        await option.click({force: true});
    }

    /**
     * Stage a grace-period preset (in seconds) for a field via its dot menu.
     */
    async setGracePreset(fieldId: string, seconds: number) {
        await this.openDotMenu(fieldId);
        await this.page.getByRole('menuitem', {name: /Grace Period/}).hover();
        const option = this.page.getByTestId(`session-attribute-grace-option-${fieldId}-${seconds}`);
        await expect(option).toBeAttached();
        await option.click({force: true});
    }

    /**
     * One-click enable (no confirmation modal) for a currently disabled field.
     */
    async enable(fieldId: string) {
        await this.openDotMenu(fieldId);
        await this.page.getByTestId(`session-attribute-enable-${fieldId}`).click();
    }

    /**
     * Open the disable confirmation modal for a currently enabled field. The
     * stage only happens after confirmDisable().
     */
    async openDisableModal(fieldId: string) {
        await this.openDotMenu(fieldId);
        await this.page.getByTestId(`session-attribute-disable-${fieldId}`).click();
    }

    disableModal(): Locator {
        return this.page.getByRole('dialog').filter({hasText: 'Disable attribute'});
    }

    async confirmDisable() {
        await this.disableModal().getByRole('button', {name: 'Disable', exact: true}).click();
    }

    // ── Save / Cancel ───────────────────────────────────────────────────

    async cancel() {
        await this.cancelButton.click();
    }

    /**
     * Click Save and wait for the property-field PATCH round-trip(s) to complete,
     * then assert the button returns to disabled (no pending changes).
     */
    async saveAndWaitForSettled() {
        await expect(this.saveButton).toBeEnabled();

        const savePatchPromise = this.page.waitForResponse(
            (resp) => resp.url().includes(PATCH_FIELD_URL_FRAGMENT) && resp.request().method() === 'PATCH',
        );

        await this.saveButton.click();
        await savePatchPromise;
        await expect(this.saveButton).toBeDisabled({timeout: 10000});
    }
}
