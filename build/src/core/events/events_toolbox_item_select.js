/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Events fired as a result of selecting an item on the toolbox.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.ToolboxItemSelect
import * as registry from '../registry.js';
import { UiBase } from './events_ui_base.js';
import { EventType } from './type.js';
/**
 * Notifies listeners that a toolbox item has been selected.
 */
export class ToolboxItemSelect extends UiBase {
    /**
     * @param opt_oldItem The previously selected toolbox item.
     *     Undefined for a blank event.
     * @param opt_newItem The newly selected toolbox item. Undefined for a blank
     *     event.
     * @param opt_workspaceId The workspace identifier for this event.
     *    Undefined for a blank event.
     */
    constructor(opt_oldItem, opt_newItem, opt_workspaceId) {
        super(opt_workspaceId);
        this.type = EventType.TOOLBOX_ITEM_SELECT;
        this.oldItem = opt_oldItem ?? undefined;
        this.newItem = opt_newItem ?? undefined;
    }
    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    toJson() {
        const json = super.toJson();
        json['oldItem'] = this.oldItem;
        json['newItem'] = this.newItem;
        return json;
    }
    /**
     * Deserializes the JSON event.
     *
     * @param event The event to append new properties to. Should be a subclass
     *     of ToolboxItemSelect, but we can't specify that due to the fact that
     *     parameters to static methods in subclasses must be supertypes of
     *     parameters to static methods in superclasses.
     * @internal
     */
    static fromJson(json, workspace, event) {
        const newEvent = super.fromJson(json, workspace, event ?? new ToolboxItemSelect());
        newEvent.oldItem = json['oldItem'];
        newEvent.newItem = json['newItem'];
        return newEvent;
    }
}
registry.register(registry.Type.EVENT, EventType.TOOLBOX_ITEM_SELECT, ToolboxItemSelect);
//# sourceMappingURL=events_toolbox_item_select.js.map