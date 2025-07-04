/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as idGenerator from '../utils/idgenerator.js';
/**
 * Class for an item in the toolbox.
 */
export class ToolboxItem {
    /**
     * @param toolboxItemDef The JSON defining the toolbox item.
     * @param parentToolbox The toolbox that holds the toolbox item.
     * @param opt_parent The parent toolbox item or null if the category does not
     *     have a parent.
     */
    constructor(toolboxItemDef, parentToolbox, opt_parent) {
        /** The ID for the category. */
        this.id_ =
            toolboxItemDef['toolboxitemid'] ||
                idGenerator.getNextUniqueId();
        /** The parent of the category. */
        this.parent_ = opt_parent || null;
        /** The level that the category is nested at. */
        this.level_ = this.parent_ ? this.parent_.getLevel() + 1 : 0;
        /** The JSON definition of the toolbox item. */
        this.toolboxItemDef_ = toolboxItemDef;
        this.parentToolbox_ = parentToolbox;
        /** The workspace of the parent toolbox. */
        this.workspace_ = this.parentToolbox_.getWorkspace();
    }
    /**
     * Initializes the toolbox item.
     * This includes creating the DOM and updating the state of any items based
     * on the info object.
     */
    init() { }
    // No-op by default.
    /**
     * Gets the div for the toolbox item.
     *
     * @returns The div for the toolbox item.
     */
    getDiv() {
        return null;
    }
    /**
     * Gets the HTML element that is clickable.
     * The parent toolbox element receives clicks. The parent toolbox will add an
     * ID to this element so it can pass the onClick event to the correct
     * toolboxItem.
     *
     * @returns The HTML element that receives clicks, or null if this item should
     *     not receive clicks.
     */
    getClickTarget() {
        return null;
    }
    /**
     * Gets a unique identifier for this toolbox item.
     *
     * @returns The ID for the toolbox item.
     */
    getId() {
        return this.id_;
    }
    /**
     * Gets the parent if the toolbox item is nested.
     *
     * @returns The parent toolbox item, or null if this toolbox item is not
     *     nested.
     */
    getParent() {
        return null;
    }
    /**
     * Gets the nested level of the category.
     *
     * @returns The nested level of the category.
     * @internal
     */
    getLevel() {
        return this.level_;
    }
    /**
     * Whether the toolbox item is selectable.
     *
     * @returns True if the toolbox item can be selected.
     */
    isSelectable() {
        return false;
    }
    /**
     * Whether the toolbox item is collapsible.
     *
     * @returns True if the toolbox item is collapsible.
     */
    isCollapsible() {
        return false;
    }
    /** Dispose of this toolbox item. No-op by default. */
    dispose() { }
    /**
     * Sets whether the category is visible or not.
     * For a category to be visible its parent category must also be expanded.
     *
     * @param _isVisible True if category should be visible.
     */
    setVisible_(_isVisible) { }
    /** See IFocusableNode.getFocusableElement. */
    getFocusableElement() {
        const div = this.getDiv();
        if (!div) {
            throw Error('Trying to access toolbox item before DOM is initialized.');
        }
        if (!(div instanceof HTMLElement)) {
            throw Error('Toolbox item div is unexpectedly not an HTML element.');
        }
        return div;
    }
    /** See IFocusableNode.getFocusableTree. */
    getFocusableTree() {
        return this.parentToolbox_;
    }
    /** See IFocusableNode.onNodeFocus. */
    onNodeFocus() { }
    /** See IFocusableNode.onNodeBlur. */
    onNodeBlur() { }
    /** See IFocusableNode.canBeFocused. */
    canBeFocused() {
        return true;
    }
}
// nop by default
//# sourceMappingURL=toolbox_item.js.map