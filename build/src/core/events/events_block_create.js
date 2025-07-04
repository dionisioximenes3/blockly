/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as registry from '../registry.js';
import * as blocks from '../serialization/blocks.js';
import * as utilsXml from '../utils/xml.js';
import * as Xml from '../xml.js';
import { BlockBase } from './events_block_base.js';
import { EventType } from './type.js';
import * as eventUtils from './utils.js';
/**
 * Notifies listeners when a block (or connected stack of blocks) is
 * created.
 */
export class BlockCreate extends BlockBase {
    /** @param opt_block The created block.  Undefined for a blank event. */
    constructor(opt_block) {
        super(opt_block);
        this.type = EventType.BLOCK_CREATE;
        if (!opt_block) {
            return; // Blank event to be populated by fromJson.
        }
        if (opt_block.isShadow()) {
            // Moving shadow blocks is handled via disconnection.
            this.recordUndo = false;
        }
        this.xml = Xml.blockToDomWithXY(opt_block);
        this.ids = eventUtils.getDescendantIds(opt_block);
        this.json = blocks.save(opt_block, { addCoordinates: true });
    }
    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    toJson() {
        const json = super.toJson();
        if (!this.xml) {
            throw new Error('The block XML is undefined. Either pass a block to ' +
                'the constructor, or call fromJson');
        }
        if (!this.ids) {
            throw new Error('The block IDs are undefined. Either pass a block to ' +
                'the constructor, or call fromJson');
        }
        if (!this.json) {
            throw new Error('The block JSON is undefined. Either pass a block to ' +
                'the constructor, or call fromJson');
        }
        json['xml'] = Xml.domToText(this.xml);
        json['ids'] = this.ids;
        json['json'] = this.json;
        if (!this.recordUndo) {
            json['recordUndo'] = this.recordUndo;
        }
        return json;
    }
    /**
     * Deserializes the JSON event.
     *
     * @param event The event to append new properties to. Should be a subclass
     *     of BlockCreate, but we can't specify that due to the fact that
     *     parameters to static methods in subclasses must be supertypes of
     *     parameters to static methods in superclasses.
     * @internal
     */
    static fromJson(json, workspace, event) {
        const newEvent = super.fromJson(json, workspace, event ?? new BlockCreate());
        newEvent.xml = utilsXml.textToDom(json['xml']);
        newEvent.ids = json['ids'];
        newEvent.json = json['json'];
        if (json['recordUndo'] !== undefined) {
            newEvent.recordUndo = json['recordUndo'];
        }
        return newEvent;
    }
    /**
     * Run a creation event.
     *
     * @param forward True if run forward, false if run backward (undo).
     */
    run(forward) {
        const workspace = this.getEventWorkspace_();
        if (!this.json) {
            throw new Error('The block JSON is undefined. Either pass a block to ' +
                'the constructor, or call fromJson');
        }
        if (!this.ids) {
            throw new Error('The block IDs are undefined. Either pass a block to ' +
                'the constructor, or call fromJson');
        }
        if (allShadowBlocks(workspace, this.ids))
            return;
        if (forward) {
            blocks.append(this.json, workspace);
        }
        else {
            for (let i = 0; i < this.ids.length; i++) {
                const id = this.ids[i];
                const block = workspace.getBlockById(id);
                if (block) {
                    block.dispose(false);
                }
                else if (id === this.blockId) {
                    // Only complain about root-level block.
                    console.warn("Can't uncreate non-existent block: " + id);
                }
            }
        }
    }
}
/**
 * Returns true if all blocks in the list are shadow blocks. If so, that means
 * the top-level block being created is a shadow block. This only happens when a
 * block that was covering up a shadow block is removed. We don't need to create
 * an additional block in that case because the original block still has its
 * shadow block.
 *
 * @param workspace Workspace to check for blocks
 * @param ids A list of block ids that were created in this event
 * @returns True if all block ids in the list are shadow blocks
 */
const allShadowBlocks = function (workspace, ids) {
    const shadows = ids
        .map((id) => workspace.getBlockById(id))
        .filter((block) => block && block.isShadow());
    return shadows.length === ids.length;
};
registry.register(registry.Type.EVENT, EventType.BLOCK_CREATE, BlockCreate);
//# sourceMappingURL=events_block_create.js.map