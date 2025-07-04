/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Measurable } from './base.js';
import { Types } from './types.js';
/**
 * An object containing information about a spacer between two elements on a
 * row.
 */
export class InRowSpacer extends Measurable {
    /**
     * @param constants The rendering constants provider.
     * @param width The width of the spacer.
     */
    constructor(constants, width) {
        super(constants);
        this.type |= Types.SPACER | Types.IN_ROW_SPACER;
        this.width = width;
        this.height = this.constants_.SPACER_DEFAULT_HEIGHT;
    }
}
//# sourceMappingURL=in_row_spacer.js.map