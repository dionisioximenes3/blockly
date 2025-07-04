/**
 * @license
 * Copyright 2018 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as comments from '../serialization/workspace_comments.js';
import { Abstract as AbstractEvent, } from './events_abstract.js';
import { getGroup, getRecordUndo } from './utils.js';
/**
 * Abstract class for a comment event.
 */
export class CommentBase extends AbstractEvent {
    /**
     * @param opt_comment The comment this event corresponds to.  Undefined for a
     *     blank event.
     */
    constructor(opt_comment) {
        super();
        this.isBlank = true;
        /** Whether or not an event is blank. */
        this.isBlank = !opt_comment;
        if (!opt_comment)
            return;
        this.commentId = opt_comment.id;
        this.workspaceId = opt_comment.workspace.id;
        this.group = getGroup();
        this.recordUndo = getRecordUndo();
    }
    /**
     * Encode the event as JSON.
     *
     * @returns JSON representation.
     */
    toJson() {
        const json = super.toJson();
        if (!this.commentId) {
            throw new Error('The comment ID is undefined. Either pass a comment to ' +
                'the constructor, or call fromJson');
        }
        json['commentId'] = this.commentId;
        return json;
    }
    /**
     * Deserializes the JSON event.
     *
     * @param event The event to append new properties to. Should be a subclass
     *     of CommentBase, but we can't specify that due to the fact that
     *     parameters to static methods in subclasses must be supertypes of
     *     parameters to static methods in superclasses.
     * @internal
     */
    static fromJson(json, workspace, event) {
        const newEvent = super.fromJson(json, workspace, event ?? new CommentBase());
        newEvent.commentId = json['commentId'];
        return newEvent;
    }
    /**
     * Helper function for Comment[Create|Delete]
     *
     * @param event The event to run.
     * @param create if True then Create, if False then Delete
     */
    static CommentCreateDeleteHelper(event, create) {
        const workspace = event.getEventWorkspace_();
        if (create) {
            if (!event.json) {
                throw new Error('Encountered a comment event without proper json');
            }
            comments.append(event.json, workspace);
        }
        else {
            if (!event.commentId) {
                throw new Error('The comment ID is undefined. Either pass a comment to ' +
                    'the constructor, or call fromJson');
            }
            const comment = workspace.getCommentById(event.commentId);
            if (comment) {
                comment.dispose();
            }
            else {
                console.warn("Can't delete non-existent comment: " + event.commentId);
            }
        }
    }
}
//# sourceMappingURL=events_comment_base.js.map