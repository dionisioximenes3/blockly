/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import * as arrayUtils from './utils/array.js';
import * as dom from './utils/dom.js';
/**
 * Class for storing and updating a workspace's theme and UI components.
 */
export class ThemeManager {
    /**
     * @param workspace The main workspace.
     * @param theme The workspace theme.
     * @internal
     */
    constructor(workspace, theme) {
        this.workspace = workspace;
        this.theme = theme;
        /** A list of workspaces that are subscribed to this theme. */
        this.subscribedWorkspaces = [];
        this.componentDB = new Map();
    }
    /**
     * Get the workspace theme.
     *
     * @returns The workspace theme.
     * @internal
     */
    getTheme() {
        return this.theme;
    }
    /**
     * Set the workspace theme, and refresh the workspace and all components.
     *
     * @param theme The workspace theme.
     * @internal
     */
    setTheme(theme) {
        const prevTheme = this.theme;
        this.theme = theme;
        // Set the theme name onto the injection div.
        const injectionDiv = this.workspace.getInjectionDiv();
        if (injectionDiv) {
            if (prevTheme) {
                const oldClassName = prevTheme.getClassName();
                if (oldClassName) {
                    dom.removeClass(injectionDiv, oldClassName);
                }
            }
            const newClassName = this.theme.getClassName();
            if (newClassName) {
                dom.addClass(injectionDiv, newClassName);
            }
        }
        // Refresh all subscribed workspaces.
        for (let i = 0, workspace; (workspace = this.subscribedWorkspaces[i]); i++) {
            workspace.refreshTheme();
        }
        // Refresh all registered Blockly UI components.
        for (const [key, componentList] of this.componentDB) {
            for (const component of componentList) {
                const element = component.element;
                const propertyName = component.propertyName;
                const style = this.theme && this.theme.getComponentStyle(key);
                element.style.setProperty(propertyName, style || '');
            }
        }
        for (const workspace of this.subscribedWorkspaces) {
            workspace.hideChaff();
        }
    }
    /**
     * Subscribe a workspace to changes to the selected theme.  If a new theme is
     * set, the workspace is called to refresh its blocks.
     *
     * @param workspace The workspace to subscribe.
     * @internal
     */
    subscribeWorkspace(workspace) {
        this.subscribedWorkspaces.push(workspace);
    }
    /**
     * Unsubscribe a workspace to changes to the selected theme.
     *
     * @param workspace The workspace to unsubscribe.
     * @internal
     */
    unsubscribeWorkspace(workspace) {
        if (!arrayUtils.removeElem(this.subscribedWorkspaces, workspace)) {
            throw Error("Cannot unsubscribe a workspace that hasn't been subscribed.");
        }
    }
    /**
     * Subscribe an element to changes to the selected theme.  If a new theme is
     * selected, the element's style is refreshed with the new theme's style.
     *
     * @param element The element to subscribe.
     * @param componentName The name used to identify the component. This must be
     *     the same name used to configure the style in the Theme object.
     * @param propertyName The inline style property name to update.
     * @internal
     */
    subscribe(element, componentName, propertyName) {
        if (!this.componentDB.has(componentName)) {
            this.componentDB.set(componentName, []);
        }
        // Add the element to our component map.
        this.componentDB.get(componentName).push({ element, propertyName });
        // Initialize the element with its corresponding theme style.
        const style = this.theme && this.theme.getComponentStyle(componentName);
        element.style.setProperty(propertyName, style || '');
    }
    /**
     * Unsubscribe an element to changes to the selected theme.
     *
     * @param element The element to unsubscribe.
     * @internal
     */
    unsubscribe(element) {
        if (!element) {
            return;
        }
        // Go through all component, and remove any references to this element.
        for (const [componentName, elements] of this.componentDB) {
            for (let i = elements.length - 1; i >= 0; i--) {
                if (elements[i].element === element) {
                    elements.splice(i, 1);
                }
            }
            // Clean up the component map entry if the list is empty.
            if (!elements.length) {
                this.componentDB.delete(componentName);
            }
        }
    }
    /**
     * Dispose of this theme manager.
     *
     * @internal
     */
    dispose() {
        this.subscribedWorkspaces.length = 0;
        this.componentDB.clear();
    }
}
//# sourceMappingURL=theme_manager.js.map