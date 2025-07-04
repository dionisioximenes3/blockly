/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
// Former goog.module ID: Blockly.serialization.workspaces
import { EventType } from '../events/type.js';
import * as eventUtils from '../events/utils.js';
import * as registry from '../registry.js';
import * as dom from '../utils/dom.js';
import { WorkspaceSvg } from '../workspace_svg.js';
/**
 * Returns the state of the workspace as a plain JavaScript object.
 *
 * @param workspace The workspace to serialize.
 * @returns The serialized state of the workspace.
 */
export function save(workspace) {
    const state = Object.create(null);
    const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
    for (const key in serializerMap) {
        const save = serializerMap[key]?.save(workspace);
        if (save) {
            state[key] = save;
        }
    }
    return state;
}
/**
 * Loads the variable represented by the given state into the given workspace.
 *
 * @param state The state of the workspace to deserialize into the workspace.
 * @param workspace The workspace to add the new state to.
 * @param param1 recordUndo: If true, events triggered by this function will be
 *     undo-able by the user. False by default.
 */
export function load(state, workspace, { recordUndo = false } = {}) {
    const serializerMap = registry.getAllItems(registry.Type.SERIALIZER, true);
    if (!serializerMap) {
        return;
    }
    const deserializers = Object.entries(serializerMap).sort((a, b) => b[1].priority - a[1].priority);
    const prevRecordUndo = eventUtils.getRecordUndo();
    eventUtils.setRecordUndo(recordUndo);
    const existingGroup = eventUtils.getGroup();
    if (!existingGroup) {
        eventUtils.setGroup(true);
    }
    dom.startTextWidthCache();
    if (workspace instanceof WorkspaceSvg) {
        workspace.setResizesEnabled(false);
    }
    // We want to trigger clearing in reverse priority order so plugins don't end
    // up missing dependencies.
    for (const [, deserializer] of deserializers.reverse()) {
        deserializer?.clear(workspace);
    }
    // reverse() is destructive, so we have to re-reverse to correct the order.
    for (const [name, deserializer] of deserializers.reverse()) {
        const pluginState = state[name];
        if (pluginState) {
            deserializer?.load(state[name], workspace);
        }
    }
    if (workspace instanceof WorkspaceSvg) {
        workspace.setResizesEnabled(true);
    }
    dom.stopTextWidthCache();
    eventUtils.fire(new (eventUtils.get(EventType.FINISHED_LOADING))(workspace));
    eventUtils.setGroup(existingGroup);
    eventUtils.setRecordUndo(prevRecordUndo);
}
//# sourceMappingURL=workspaces.js.map