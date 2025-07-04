/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Rect } from '../utils/rect.js';
/**
 * Button displayed on a comment's top bar.
 */
export class CommentBarButton {
    /**
     * Creates a new CommentBarButton instance.
     *
     * @param id The ID of this button's parent comment.
     * @param workspace The workspace this button's parent comment is on.
     * @param container An SVG group that this button should be a child of.
     */
    constructor(id, workspace, container) {
        this.id = id;
        this.workspace = workspace;
        this.container = container;
    }
    /**
     * Returns whether or not this button is currently visible.
     */
    isVisible() {
        return this.icon.checkVisibility();
    }
    /**
     * Returns the parent comment of this comment bar button.
     */
    getParentComment() {
        const comment = this.workspace.getCommentById(this.id);
        if (!comment) {
            throw new Error(`Comment bar button ${this.id} has no corresponding comment`);
        }
        return comment;
    }
    /**
     * Returns the dimensions of this button in workspace coordinates.
     *
     * @param includeMargin True to include the margin when calculating the size.
     * @returns The size of this button.
     */
    getSize(includeMargin = false) {
        const bounds = this.icon.getBBox();
        const rect = Rect.from(bounds);
        if (includeMargin) {
            const margin = this.getMargin();
            rect.left -= margin;
            rect.top -= margin;
            rect.bottom += margin;
            rect.right += margin;
        }
        return rect;
    }
    /** Returns the margin in workspace coordinates surrounding this button. */
    getMargin() {
        return (this.container.getBBox().height - this.icon.getBBox().height) / 2;
    }
    /** Returns a DOM element representing this button that can receive focus. */
    getFocusableElement() {
        return this.icon;
    }
    /** Returns the workspace this button is a child of. */
    getFocusableTree() {
        return this.workspace;
    }
    /** Called when this button's focusable DOM element gains focus. */
    onNodeFocus() { }
    /** Called when this button's focusable DOM element loses focus. */
    onNodeBlur() { }
    /** Returns whether this button can be focused. True if it is visible. */
    canBeFocused() {
        return this.isVisible();
    }
}
//# sourceMappingURL=comment_bar_button.js.map