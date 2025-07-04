/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import { getFocusManager } from './focus_manager.js';
import * as object from './utils/object.js';
/**
 * Class for the registry of keyboard shortcuts. This is intended to be a
 * singleton. You should not create a new instance, and only access this class
 * from ShortcutRegistry.registry.
 */
export class ShortcutRegistry {
    /** Resets the existing ShortcutRegistry singleton. */
    constructor() {
        /** Registry of all keyboard shortcuts, keyed by name of shortcut. */
        this.shortcuts = new Map();
        /** Map of key codes to an array of shortcut names. */
        this.keyMap = new Map();
        this.reset();
    }
    /** Clear and recreate the registry and keyMap. */
    reset() {
        this.shortcuts.clear();
        this.keyMap.clear();
    }
    /**
     * Registers a keyboard shortcut.
     *
     * @param shortcut The shortcut for this key code.
     * @param allowOverrides True to prevent a warning when overriding an
     *     already registered item.
     * @throws {Error} if a shortcut with the same name already exists.
     */
    register(shortcut, allowOverrides) {
        const registeredShortcut = this.shortcuts.get(shortcut.name);
        if (registeredShortcut && !allowOverrides) {
            throw new Error(`Shortcut named "${shortcut.name}" already exists.`);
        }
        this.shortcuts.set(shortcut.name, shortcut);
        const keyCodes = shortcut.keyCodes;
        if (keyCodes?.length) {
            for (const keyCode of keyCodes) {
                this.addKeyMapping(keyCode, shortcut.name, !!shortcut.allowCollision);
            }
        }
    }
    /**
     * Unregisters a keyboard shortcut registered with the given name. This
     * will also remove any key mappings that reference this shortcut.
     *
     * @param shortcutName The name of the shortcut to unregister.
     * @returns True if an item was unregistered, false otherwise.
     */
    unregister(shortcutName) {
        const shortcut = this.shortcuts.get(shortcutName);
        if (!shortcut) {
            console.warn(`Keyboard shortcut named "${shortcutName}" not found.`);
            return false;
        }
        this.removeAllKeyMappings(shortcutName);
        this.shortcuts.delete(shortcutName);
        return true;
    }
    /**
     * Adds a mapping between a keycode and a keyboard shortcut.
     *
     * Normally only one shortcut can be mapped to any given keycode,
     * but setting allowCollisions to true allows a keyboard to be
     * mapped to multiple shortcuts.  In that case, when onKeyDown is
     * called with the given keystroke, it will process the mapped
     * shortcuts in reverse order, from the most- to least-recently
     * mapped).
     *
     * @param keyCode The key code for the keyboard shortcut. If registering a key
     *     code with a modifier (ex: ctrl+c) use
     *     ShortcutRegistry.registry.createSerializedKey;
     * @param shortcutName The name of the shortcut to execute when the given
     *     keycode is pressed.
     * @param allowCollision True to prevent an error when adding a shortcut
     *     to a key that is already mapped to a shortcut.
     * @throws {Error} if the given key code is already mapped to a shortcut.
     */
    addKeyMapping(keyCode, shortcutName, allowCollision) {
        keyCode = `${keyCode}`;
        const shortcutNames = this.keyMap.get(keyCode);
        if (shortcutNames && !allowCollision) {
            throw new Error(`Shortcut named "${shortcutName}" collides with shortcuts "${shortcutNames}"`);
        }
        else if (shortcutNames && allowCollision) {
            shortcutNames.unshift(shortcutName);
        }
        else {
            this.keyMap.set(keyCode, [shortcutName]);
        }
    }
    /**
     * Removes a mapping between a keycode and a keyboard shortcut.
     *
     * @param keyCode The key code for the keyboard shortcut. If registering a key
     *     code with a modifier (ex: ctrl+c) use
     *     ShortcutRegistry.registry.createSerializedKey;
     * @param shortcutName The name of the shortcut to execute when the given
     *     keycode is pressed.
     * @param quiet True to not console warn when there is no shortcut to
     *     remove.
     * @returns True if a key mapping was removed, false otherwise.
     */
    removeKeyMapping(keyCode, shortcutName, quiet) {
        const shortcutNames = this.keyMap.get(keyCode);
        if (!shortcutNames) {
            if (!quiet) {
                console.warn(`No keyboard shortcut named "${shortcutName}" registered with key code "${keyCode}"`);
            }
            return false;
        }
        const shortcutIdx = shortcutNames.indexOf(shortcutName);
        if (shortcutIdx > -1) {
            shortcutNames.splice(shortcutIdx, 1);
            if (shortcutNames.length === 0) {
                this.keyMap.delete(keyCode);
            }
            return true;
        }
        if (!quiet) {
            console.warn(`No keyboard shortcut named "${shortcutName}" registered with key code "${keyCode}"`);
        }
        return false;
    }
    /**
     * Removes all the key mappings for a shortcut with the given name.
     * Useful when changing the default key mappings and the key codes registered
     * to the shortcut are unknown.
     *
     * @param shortcutName The name of the shortcut to remove from the key map.
     */
    removeAllKeyMappings(shortcutName) {
        for (const keyCode of this.keyMap.keys()) {
            this.removeKeyMapping(keyCode, shortcutName, /* quiet= */ true);
        }
    }
    /**
     * Sets the key map. Setting the key map will override any default key
     * mappings.
     *
     * @param newKeyMap The object with key code to shortcut names.
     */
    setKeyMap(newKeyMap) {
        this.keyMap.clear();
        for (const key in newKeyMap) {
            this.keyMap.set(key, newKeyMap[key]);
        }
    }
    /**
     * Gets the current key map.
     *
     * @returns The object holding key codes to ShortcutRegistry.KeyboardShortcut.
     */
    getKeyMap() {
        const legacyKeyMap = Object.create(null);
        for (const [key, value] of this.keyMap) {
            legacyKeyMap[key] = value;
        }
        return legacyKeyMap;
    }
    /**
     * Gets the registry of keyboard shortcuts.
     *
     * @returns The registry of keyboard shortcuts.
     */
    getRegistry() {
        const legacyRegistry = Object.create(null);
        for (const [key, value] of this.shortcuts) {
            legacyRegistry[key] = value;
        }
        return object.deepMerge(Object.create(null), legacyRegistry);
    }
    /**
     * Handles key down events.
     *
     * - Any `KeyboardShortcut`(s) mapped to the keycodes that cause
     *   event `e` to be fired will be processed, in order from least-
     *   to most-recently registered.
     * - If the shortcut's `preconditionFn` exists it will be called.
     *   If `preconditionFn` returns false the shortcut's `callback`
     *   function will be skipped.  Processing will continue with the
     *   next shortcut, if any.
     * - The shortcut's `callback` function will then be called.  If it
     *   returns true, processing will terminate and `onKeyDown` will
     *   return true.  If it returns false, processing will continue
     *   with with the next shortcut, if any.
     * - If all registered shortcuts for the given keycode have been
     *   processed without any having returned true, `onKeyDown` will
     *   return false.
     *
     * @param workspace The main workspace where the event was captured.
     * @param e The key down event.
     * @returns True if the event was handled, false otherwise.
     */
    onKeyDown(workspace, e) {
        const key = this.serializeKeyEvent(e);
        const shortcutNames = this.getShortcutNamesByKeyCode(key);
        if (!shortcutNames)
            return false;
        for (const shortcutName of shortcutNames) {
            const shortcut = this.shortcuts.get(shortcutName);
            if (!shortcut ||
                (shortcut.preconditionFn &&
                    !shortcut.preconditionFn(workspace, {
                        focusedNode: getFocusManager().getFocusedNode() ?? undefined,
                    }))) {
                continue;
            }
            // If the key has been handled, stop processing shortcuts.
            if (shortcut.callback?.(workspace, e, shortcut, {
                focusedNode: getFocusManager().getFocusedNode() ?? undefined,
            })) {
                return true;
            }
        }
        return false;
    }
    /**
     * Gets the shortcuts registered to the given key code.
     *
     * @param keyCode The serialized key code.
     * @returns The list of shortcuts to call when the given keyCode is used.
     *     Undefined if no shortcuts exist.
     */
    getShortcutNamesByKeyCode(keyCode) {
        // Copy the list of shortcuts in case one of them unregisters itself
        // in its callback.
        return this.keyMap.get(keyCode)?.slice() || [];
    }
    /**
     * Gets the serialized key codes that the shortcut with the given name is
     * registered under.
     *
     * @param shortcutName The name of the shortcut.
     * @returns An array with all the key codes the shortcut is registered under.
     */
    getKeyCodesByShortcutName(shortcutName) {
        const keys = [];
        for (const [keyCode, shortcuts] of this.keyMap) {
            const shortcutIdx = shortcuts.indexOf(shortcutName);
            if (shortcutIdx > -1) {
                keys.push(keyCode);
            }
        }
        return keys;
    }
    /**
     * Serializes a key event.
     *
     * @param e A key down event.
     * @returns The serialized key code for the given event.
     */
    serializeKeyEvent(e) {
        let serializedKey = '';
        for (const modifier in ShortcutRegistry.modifierKeys) {
            if (e.getModifierState(modifier)) {
                if (serializedKey !== '') {
                    serializedKey += '+';
                }
                serializedKey += modifier;
            }
        }
        if (serializedKey !== '' && e.keyCode) {
            serializedKey += '+' + e.keyCode;
        }
        else if (e.keyCode) {
            serializedKey = String(e.keyCode);
        }
        return serializedKey;
    }
    /**
     * Checks whether any of the given modifiers are not valid.
     *
     * @param modifiers List of modifiers to be used with the key.
     * @throws {Error} if the modifier is not in the valid modifiers list.
     */
    checkModifiers(modifiers) {
        for (const modifier of modifiers) {
            if (!(modifier in ShortcutRegistry.modifierKeys)) {
                throw new Error(modifier + ' is not a valid modifier key.');
            }
        }
    }
    /**
     * Creates the serialized key code that will be used in the key map.
     *
     * @param keyCode Number code representing the key.
     * @param modifiers List of modifier key codes to be used with the key. All
     *     valid modifiers can be found in the `ShortcutRegistry.modifierKeys`.
     * @returns The serialized key code for the given modifiers and key.
     */
    createSerializedKey(keyCode, modifiers) {
        let serializedKey = '';
        if (modifiers) {
            this.checkModifiers(modifiers);
            for (const modifier in ShortcutRegistry.modifierKeys) {
                const modifierKeyCode = ShortcutRegistry.modifierKeys[modifier];
                if (modifiers.includes(modifierKeyCode)) {
                    if (serializedKey !== '') {
                        serializedKey += '+';
                    }
                    serializedKey += modifier;
                }
            }
        }
        if (serializedKey !== '' && keyCode) {
            serializedKey += '+' + keyCode;
        }
        else if (keyCode) {
            serializedKey = `${keyCode}`;
        }
        return serializedKey;
    }
}
ShortcutRegistry.registry = new ShortcutRegistry();
(function (ShortcutRegistry) {
    /** Supported modifiers. */
    let modifierKeys;
    (function (modifierKeys) {
        modifierKeys[modifierKeys["Shift"] = 16] = "Shift";
        modifierKeys[modifierKeys["Control"] = 17] = "Control";
        modifierKeys[modifierKeys["Alt"] = 18] = "Alt";
        modifierKeys[modifierKeys["Meta"] = 91] = "Meta";
    })(modifierKeys = ShortcutRegistry.modifierKeys || (ShortcutRegistry.modifierKeys = {}));
})(ShortcutRegistry || (ShortcutRegistry = {}));
// No need to export ShorcutRegistry.modifierKeys from the module at this time
// because (1) it wasn't automatically converted by the automatic migration
// script, (2) the name doesn't follow the styleguide.
//# sourceMappingURL=shortcut_registry.js.map