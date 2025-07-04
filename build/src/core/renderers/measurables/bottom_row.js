/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Row } from './row.js';
import { Types } from './types.js';
/**
 * An object containing information about what elements are in the bottom row of
 * a block as well as spacing information for the bottom row.
 * Elements in a bottom row can consist of corners, spacers and next
 * connections.
 */
export class BottomRow extends Row {
    /**
     * @param constants The rendering constants provider.
     */
    constructor(constants) {
        super(constants);
        /**
         * Whether this row has a next connection.
         */
        this.hasNextConnection = false;
        /**
         * The next connection on the row, if any.
         */
        this.connection = null;
        /**
         * The amount that the bottom of the block extends below the horizontal
         * edge, e.g. because of a next connection.  Must be non-negative (see
         * #2820).
         */
        this.descenderHeight = 0;
        /**
         * The Y position of the bottom edge of the block, relative to the origin
         * of the block rendering.
         */
        this.baseline = 0;
        this.type |= Types.BOTTOM_ROW;
    }
    /**
     * Returns whether or not the bottom row has a left square corner.
     *
     * @param block The block whose bottom row this represents.
     * @returns Whether or not the bottom row has a left square corner.
     */
    hasLeftSquareCorner(block) {
        return !!block.outputConnection || !!block.getNextBlock();
    }
    /**
     * Returns whether or not the bottom row has a right square corner.
     *
     * @param _block The block whose bottom row this represents.
     * @returns Whether or not the bottom row has a right square corner.
     */
    hasRightSquareCorner(_block) {
        return true;
    }
    measure() {
        let height = 0;
        let width = 0;
        let descenderHeight = 0;
        for (let i = 0; i < this.elements.length; i++) {
            const elem = this.elements[i];
            width += elem.width;
            if (!Types.isSpacer(elem)) {
                // Note: this assumes that next connections have *only* descenderHeight,
                // with no height above the baseline.
                if (Types.isNextConnection(elem)) {
                    descenderHeight = Math.max(descenderHeight, elem.height);
                }
                else {
                    height = Math.max(height, elem.height);
                }
            }
        }
        this.width = Math.max(this.minWidth, width);
        this.height = Math.max(this.minHeight, height) + descenderHeight;
        this.descenderHeight = descenderHeight;
        this.widthWithConnectedBlocks = this.width;
    }
    startsWithElemSpacer() {
        return false;
    }
    endsWithElemSpacer() {
        return false;
    }
}
//# sourceMappingURL=bottom_row.js.map