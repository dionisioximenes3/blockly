/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Events fired as a result of a theme update.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.ThemeChange
import * as registry from '../registry.js';
import { UiBase } from './events_ui_base.js';
import { EventType } from './type.js';
/**
 * Notifies listeners that the workspace theme has changed.
 */
export class ThemeChange extends UiBase {
    /**
     * @param opt_themeName The theme name. Undefined for a blank event.
     * @param opt_workspaceId The workspace identifier for this event.
     *    event. Undefined for a blank event.
     */
    constructor(opt_themeName, opt_workspaceId) {
        super(opt_workspaceId);
        this.type = EventType.THEME_CHANGE;
        this.themeName = opt_themeName;
    }
    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    toJson() {
        const json = super.toJson();
        if (!this.themeName) {
            throw new Error('The theme name is undefined. Either pass a theme name to ' +
                'the constructor, or call fromJson');
        }
        json['themeName'] = this.themeName;
        return json;
    }
    /**
     * Deserializes the JSON event.
     *
     * @param event The event to append new properties to. Should be a subclass
     *     of ThemeChange, but we can't specify that due to the fact that
     *     parameters to static methods in subclasses must be supertypes of
     *     parameters to static methods in superclasses.
     * @internal
     */
    static fromJson(json, workspace, event) {
        const newEvent = super.fromJson(json, workspace, event ?? new ThemeChange());
        newEvent.themeName = json['themeName'];
        return newEvent;
    }
}
registry.register(registry.Type.EVENT, EventType.THEME_CHANGE, ThemeChange);
//# sourceMappingURL=events_theme_change.js.map