/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Events fired as a result of trashcan flyout open and close.
 *
 * @class
 */
// Former goog.module ID: Blockly.Events.TrashcanOpen
import * as registry from '../registry.js';
import { UiBase } from './events_ui_base.js';
import { EventType } from './type.js';
/**
 * Notifies listeners when the trashcan is opening or closing.
 */
export class TrashcanOpen extends UiBase {
    /**
     * @param opt_isOpen Whether the trashcan flyout is opening (false if
     *     opening). Undefined for a blank event.
     * @param opt_workspaceId The workspace identifier for this event.
     *    Undefined for a blank event.
     */
    constructor(opt_isOpen, opt_workspaceId) {
        super(opt_workspaceId);
        this.type = EventType.TRASHCAN_OPEN;
        this.isOpen = opt_isOpen;
    }
    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    toJson() {
        const json = super.toJson();
        if (this.isOpen === undefined) {
            throw new Error('Whether this is already open or not is undefined. Either pass ' +
                'a value to the constructor, or call fromJson');
        }
        json['isOpen'] = this.isOpen;
        return json;
    }
    /**
     * Deserializes the JSON event.
     *
     * @param event The event to append new properties to. Should be a subclass
     *     of TrashcanOpen, but we can't specify that due to the fact that
     *     parameters to static methods in subclasses must be supertypes of
     *     parameters to static methods in superclasses.
     * @internal
     */
    static fromJson(json, workspace, event) {
        const newEvent = super.fromJson(json, workspace, event ?? new TrashcanOpen());
        newEvent.isOpen = json['isOpen'];
        return newEvent;
    }
}
registry.register(registry.Type.EVENT, EventType.TRASHCAN_OPEN, TrashcanOpen);
//# sourceMappingURL=events_trashcan_open.js.map