/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { Measurable } from './base.js';
import { Types } from './types.js';
/**
 * The base class to represent a connection and the space that it takes up on
 * the block.
 */
export class Connection extends Measurable {
    /**
     * @param constants The rendering constants provider.
     * @param connectionModel The connection object on the block that this
     *     represents.
     */
    constructor(constants, connectionModel) {
        super(constants);
        this.connectionModel = connectionModel;
        this.type |= Types.CONNECTION;
        this.shape = this.constants_.shapeFor(connectionModel);
        this.isDynamicShape = 'isDynamic' in this.shape && this.shape.isDynamic;
        this.highlighted = connectionModel.isHighlighted();
    }
}
//# sourceMappingURL=connection.js.map