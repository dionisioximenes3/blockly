/**
 * @license
 * Copyright 2016 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
/**
 * Number input field
 *
 * @class
 */
// Former goog.module ID: Blockly.FieldNumber
import { Field } from './field.js';
import { FieldInput, } from './field_input.js';
import * as fieldRegistry from './field_registry.js';
import * as aria from './utils/aria.js';
import * as dom from './utils/dom.js';
/**
 * Class for an editable number field.
 */
export class FieldNumber extends FieldInput {
    /**
     * @param value The initial value of the field. Should cast to a number.
     *     Defaults to 0. Also accepts Field.SKIP_SETUP if you wish to skip setup
     *     (only used by subclasses that want to handle configuration and setting
     *     the field value after their own constructors have run).
     * @param min Minimum value. Will only be used if config is not
     *     provided.
     * @param max Maximum value. Will only be used if config is not
     *     provided.
     * @param precision Precision for value. Will only be used if config
     *     is not provided.
     * @param validator A function that is called to validate changes to the
     *     field's value. Takes in a number & returns a validated number, or null
     *     to abort the change.
     * @param config A map of options used to configure the field.
     *     See the [field creation documentation]{@link
     * https://developers.google.com/blockly/guides/create-custom-blocks/fields/built-in-fields/number#creation}
     * for a list of properties this parameter supports.
     */
    constructor(value, min, max, precision, validator, config) {
        // Pass SENTINEL so that we can define properties before value validation.
        super(Field.SKIP_SETUP);
        /** The minimum value this number field can contain. */
        this.min_ = -Infinity;
        /** The maximum value this number field can contain. */
        this.max_ = Infinity;
        /** The multiple to which this fields value is rounded. */
        this.precision_ = 0;
        /**
         * The number of decimal places to allow, or null to allow any number of
         * decimal digits.
         */
        this.decimalPlaces = null;
        /** Don't spellcheck numbers.  Our validator does a better job. */
        this.spellcheck_ = false;
        if (value === Field.SKIP_SETUP)
            return;
        if (config) {
            this.configure_(config);
        }
        else {
            this.setConstraints(min, max, precision);
        }
        this.setValue(value);
        if (validator) {
            this.setValidator(validator);
        }
    }
    /**
     * Configure the field based on the given map of options.
     *
     * @param config A map of options to configure the field based on.
     */
    configure_(config) {
        super.configure_(config);
        this.setMinInternal(config.min);
        this.setMaxInternal(config.max);
        this.setPrecisionInternal(config.precision);
    }
    /**
     * Set the maximum, minimum and precision constraints on this field.
     * Any of these properties may be undefined or NaN to be disabled.
     * Setting precision (usually a power of 10) enforces a minimum step between
     * values. That is, the user's value will rounded to the closest multiple of
     * precision. The least significant digit place is inferred from the
     * precision. Integers values can be enforces by choosing an integer
     * precision.
     *
     * @param min Minimum value.
     * @param max Maximum value.
     * @param precision Precision for value.
     */
    setConstraints(min, max, precision) {
        this.setMinInternal(min);
        this.setMaxInternal(max);
        this.setPrecisionInternal(precision);
        this.setValue(this.getValue());
    }
    /**
     * Sets the minimum value this field can contain. Updates the value to
     * reflect.
     *
     * @param min Minimum value.
     */
    setMin(min) {
        this.setMinInternal(min);
        this.setValue(this.getValue());
    }
    /**
     * Sets the minimum value this field can contain. Called internally to avoid
     * value updates.
     *
     * @param min Minimum value.
     */
    setMinInternal(min) {
        if (min == null) {
            this.min_ = -Infinity;
        }
        else {
            min = Number(min);
            if (!isNaN(min)) {
                this.min_ = min;
            }
        }
    }
    /**
     * Returns the current minimum value this field can contain. Default is
     * -Infinity.
     *
     * @returns The current minimum value this field can contain.
     */
    getMin() {
        return this.min_;
    }
    /**
     * Sets the maximum value this field can contain. Updates the value to
     * reflect.
     *
     * @param max Maximum value.
     */
    setMax(max) {
        this.setMaxInternal(max);
        this.setValue(this.getValue());
    }
    /**
     * Sets the maximum value this field can contain. Called internally to avoid
     * value updates.
     *
     * @param max Maximum value.
     */
    setMaxInternal(max) {
        if (max == null) {
            this.max_ = Infinity;
        }
        else {
            max = Number(max);
            if (!isNaN(max)) {
                this.max_ = max;
            }
        }
    }
    /**
     * Returns the current maximum value this field can contain. Default is
     * Infinity.
     *
     * @returns The current maximum value this field can contain.
     */
    getMax() {
        return this.max_;
    }
    /**
     * Sets the precision of this field's value, i.e. the number to which the
     * value is rounded. Updates the field to reflect.
     *
     * @param precision The number to which the field's value is rounded.
     */
    setPrecision(precision) {
        this.setPrecisionInternal(precision);
        this.setValue(this.getValue());
    }
    /**
     * Sets the precision of this field's value. Called internally to avoid
     * value updates.
     *
     * @param precision The number to which the field's value is rounded.
     */
    setPrecisionInternal(precision) {
        this.precision_ = Number(precision) || 0;
        let precisionString = String(this.precision_);
        if (precisionString.includes('e')) {
            // String() is fast.  But it turns .0000001 into '1e-7'.
            // Use the much slower toLocaleString to access all the digits.
            precisionString = this.precision_.toLocaleString('en-US', {
                maximumFractionDigits: 20,
            });
        }
        const decimalIndex = precisionString.indexOf('.');
        if (decimalIndex === -1) {
            // If the precision is 0 (float) allow any number of decimals,
            // otherwise allow none.
            this.decimalPlaces = precision ? 0 : null;
        }
        else {
            this.decimalPlaces = precisionString.length - decimalIndex - 1;
        }
    }
    /**
     * Returns the current precision of this field. The precision being the
     * number to which the field's value is rounded. A precision of 0 means that
     * the value is not rounded.
     *
     * @returns The number to which this field's value is rounded.
     */
    getPrecision() {
        return this.precision_;
    }
    /**
     * Ensure that the input value is a valid number (must fulfill the
     * constraints placed on the field).
     *
     * @param newValue The input value.
     * @returns A valid number, or null if invalid.
     */
    doClassValidation_(newValue) {
        if (newValue === null) {
            return null;
        }
        // Clean up text.
        newValue = `${newValue}`;
        // TODO: Handle cases like 'ten', '1.203,14', etc.
        // 'O' is sometimes mistaken for '0' by inexperienced users.
        newValue = newValue.replace(/O/gi, '0');
        // Strip out thousands separators.
        newValue = newValue.replace(/,/g, '');
        // Ignore case of 'Infinity'.
        newValue = newValue.replace(/infinity/i, 'Infinity');
        // Clean up number.
        let n = Number(newValue || 0);
        if (isNaN(n)) {
            // Invalid number.
            return null;
        }
        // Get the value in range.
        n = Math.min(Math.max(n, this.min_), this.max_);
        // Round to nearest multiple of precision.
        if (this.precision_ && isFinite(n)) {
            n = Math.round(n / this.precision_) * this.precision_;
        }
        // Clean up floating point errors.
        if (this.decimalPlaces !== null) {
            n = Number(n.toFixed(this.decimalPlaces));
        }
        return n;
    }
    /**
     * Create the number input editor widget.
     *
     * @returns The newly created number input editor.
     */
    widgetCreate_() {
        const htmlInput = super.widgetCreate_();
        // Set the accessibility state
        if (this.min_ > -Infinity) {
            htmlInput.min = `${this.min_}`;
            aria.setState(htmlInput, aria.State.VALUEMIN, this.min_);
        }
        if (this.max_ < Infinity) {
            htmlInput.max = `${this.max_}`;
            aria.setState(htmlInput, aria.State.VALUEMAX, this.max_);
        }
        return htmlInput;
    }
    /**
     * Initialize the field's DOM.
     *
     * @override
     */
    initView() {
        super.initView();
        if (this.fieldGroup_) {
            dom.addClass(this.fieldGroup_, 'blocklyNumberField');
        }
    }
    /**
     * Construct a FieldNumber from a JSON arg object.
     *
     * @param options A JSON object with options (value, min, max, and precision).
     * @returns The new field instance.
     * @nocollapse
     * @internal
     */
    static fromJson(options) {
        // `this` might be a subclass of FieldNumber if that class doesn't override
        // the static fromJson method.
        return new this(options.value, undefined, undefined, undefined, undefined, options);
    }
}
fieldRegistry.register('field_number', FieldNumber);
FieldNumber.prototype.DEFAULT_VALUE = 0;
//# sourceMappingURL=field_number.js.map