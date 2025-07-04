/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Measurable } from './base.js';
import { Types } from './types.js';
/**
 * An object containing information about the space a square corner takes up
 * during rendering.
 */
export class SquareCorner extends Measurable {
    /**
     * @param constants The rendering constants provider.
     * @param opt_position The position of this corner.
     */
    constructor(constants, opt_position) {
        super(constants);
        this.type =
            (!opt_position || opt_position === 'left'
                ? Types.LEFT_SQUARE_CORNER
                : Types.RIGHT_SQUARE_CORNER) | Types.CORNER;
        this.height = this.constants_.NO_PADDING;
        this.width = this.constants_.NO_PADDING;
    }
}
//# sourceMappingURL=square_corner.js.map