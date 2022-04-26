/**
 * NGLContext can be used to render registered components acoording to previously defined view.
 * Views can be either initialized at instantiation of the NGLContext or built dynamically.
 *
 * Example of a JSON view definition:
 * {
 *      "ligandView": {
 *          // list of components to set to visible
 *          "visible": ['ligand'],
 *          // List of components to try and focus. Only the first tha can be focused will be focused
 *          "focus": ['ligand']
 *      },
 *      "proteinView": {
 *          "visible": ['protein'],
 *          "focus": ['protein']
 *      },
 *      "complexView": {
 *          "visible": [
 *              // otherProtein is a fallback if protein can't be rendered
 *              ["protein", "otherProtein"],
 *              "ligand"
 *          ],
 *          "focus": ['ligand']
 *      }
 *  }
 *
 */
export class NGLContext {
  /**
   * @param {object} stage NGL stage to use the context with
   * @param {object} viewDefinition definition of the views to render
   */
  constructor (stage, viewDefinition = undefined) {
    this.stage = stage
    this.views = new Map()
    this.currentView = undefined
    this.components = new Map()
    this.componentSet = new Set()
    this.debug = false
    this.viewListeners = new Map()
    this.stage.signals.clicked.add((pickingProxy) => {
      if (!this.viewListeners.has(this.currentView)) {
        return
      }
      this.viewListeners.get(this.currentView).forEach((listener) => listener(pickingProxy))
    })
    if (viewDefinition) {
      this.parseViewDefinition(viewDefinition)
    }
  }

  /**
   * Parse a view definition into the NGLContext.
   * @param {object} viewDefinition view definition to parse
   */
  parseViewDefinition (viewDefinition) {
    for (const view in viewDefinition) {
      // a view must be an object
      if (!viewDefinition[view] || !(viewDefinition[view] instanceof Object)) {
        throw new Error(`Invalid view definition: ${view}`)
      }
      // visible components must exist and be an array or a set
      if (!viewDefinition[view].visible ||
        (!(viewDefinition[view].visible instanceof Array) &&
          !(viewDefinition[view].visible instanceof Set))) {
        throw new TypeError(`Missing or invalid view components for: ${view}`)
      }
      // focus components must exist and be an array
      if (!viewDefinition[view].focus ||
        !(viewDefinition[view].focus instanceof Array)) {
        throw new TypeError(`Invalid focus components for: ${view}`)
      }
      this.addView(view, viewDefinition[view])
    }
  }

  /**
   * Add a view to the NGLContext.
   * @param {string} view name of the view
   * @param {object} definition definition of the view
   * @returns {NGLContext}
   */
  addView (view, definition = undefined) {
    const copiedDefinition = {
      visible: new Set(),
      focus: []
    }
    if (definition) {
      // visible components converted to set for easier handling
      copiedDefinition.visible = new Set(definition.visible)
      copiedDefinition.focus = new Array(...definition.focus)
    }
    this.views.set(view, copiedDefinition)
    return this
  }

  /**
   * Remove a view from the NGLContext.
   * @param {string} view name of the view
   * @returns {NGLContext}
   */
  removeView (view) {
    this.views.delete(view)
    return this
  }

  /**
   * Add a component to a view.
   * @param {string} view name of the view
   * @param {string | Array<string>} componentName name or names of the registered component
   * @returns {NGLContext}
   */
  addViewComponent (view, componentName) {
    this.views.get(view).visible.add(componentName)
    return this
  }

  /**
   * Remove a component from a view
   * @param {string} view name of the view
   * @param {string | Array<string>} componentName name or names of the registered component
   * @returns {NGLContext}
   */
  removeViewComponent (view, componentName) {
    this.views.get(view).visible.delete(componentName)
    return this
  }

  /**
   * Get the focus components of a view
   * @param {string} view name of the view
   * @returns {Array<string>}
   */
  getFocusComponents (view) {
    return this.views.get(view).focus
  }

  /**
   * Set the focus components of a view
   * @param {string} view name of the view
   * @param {Array<string>} focusComponents
   * @returns {NGLContext}
   */
  setFocusComponents (view, focusComponents) {
    this.views.get(view).focus = focusComponents
    return this
  }

  /**
   * Get a JSON serializable view definition for the current state of the NGLContext.
   * @returns {object}
   */
  getViewDefinition () {
    const viewDefinition = {}
    this.views.forEach((definition, view) => {
      viewDefinition[view] = {
        // turning view components back into an array for JSON serialization
        visible: new Array(...definition.visible),
        focus: new Array(...definition.focus)
      }
    })
    return viewDefinition
  }

  __validateComponent (component) {
    if (!component) {
      throw new Error('Tried to register undefined component')
    }
    if (!component.setVisibility) {
      throw new TypeError('Tried to register invalid component')
    }
    /*
     Structures will usually get multiple representations. If a structure and its representation
     are both registered as components, rendering the representation will lead to the structure
     being set invisible and the representation therefore also being invisible
     */
    if (component.structure) {
      throw new Error('Tried to add structure component instead of representation')
    }
    /*
     If a component has a parent, rendering it will set its parent to invisible and therefore
     itself. This is the same problem as above but from the representation side.
     */
    if (component.parent && this.componentSet.has(component.parent)) {
      throw new Error('Tried to add child component of already added component')
    }
    // custom components may have multiple parents
    if (component.parents &&
      component.parents.some((parent) => this.componentSet.has(parent))) {
      throw new Error('Tried to add child component of already added component')
    }
    return true
  }

  /**
   * Register a component.
   * @param {string} name name to register component under
   * @param {object} component NGL or custom component
   */
  registerComponent (name, component) {
    this.__validateComponent(component)
    // components can only be registered once under one name
    if (this.components.has(name)) {
      throw new Error('Tried to re-register an already registered component')
    }
    if (this.componentSet.has(component)) {
      throw new Error('Tried to re-register an already registered component')
    }
    this.components.set(name, component)
    this.componentSet.add(component)
  }

  /**
   * Replace a registered component.
   * @param {string} name name to register component under
   * @param {object} component new component to replace the old one
   * @return {object} replaced component
   */
  replaceComponent (name, component) {
    this.__validateComponent(component)
    if (this.componentSet.has(component)) {
      throw new Error('Tried to re-register an already registered component')
    }
    if (!this.components.has(name)) {
      throw new Error('Tried to replace non-existent component')
    }
    const formerComponent = this.components.get(name)
    formerComponent.setVisibility(false)
    this.componentSet.delete(formerComponent)
    this.components.set(name, component)
    this.componentSet.add(component)
    return formerComponent
  }

  /**
   * Replace or register a component.
   * Use if you don't care whether the component existed before.
   * @param {string} name name to register component under
   * @param {object} component new component to register or to replace the old one
   * @return {object|undefined} replaced component or undefined
   */
  registerReplaceComponent (name, component) {
    this.__validateComponent(component)
    let formerComponent
    if (this.components.has(name)) {
      formerComponent = this.components.get(name)
      formerComponent.setVisibility(false)
      this.componentSet.delete(formerComponent)
    }
    this.components.set(name, component)
    this.componentSet.add(component)
    return formerComponent
  }

  /**
   * De-register a component.
   * @param {string} name name of the registered component
   * @return {object} removed component
   */
  deregisterComponent (name) {
    const formerComponent = this.components.get(name)
    if (formerComponent) {
      formerComponent.setVisibility(false)
      this.componentSet.delete(formerComponent)
    }
    this.components.delete(name)
    return formerComponent
  }

  /**
   * Switch context to a view.
   * @param {string} view name of the view to switch to
   */
  switchView (view) {
    if (!this.views.has(view)) {
      // switching to non-existent views is not an error
      return
    }
    this.currentView = view
    this.render()
  }

  /**
   * Render a view.
   * @param {string} view name of the view to render
   */
  render (view = this.currentView) {
    if (!view) {
      // no view defined, nothing to do
      return
    }
    const definition = this.views.get(view)
    if (!definition) {
      // no view definition for current view
      return
    }
    if (this.debug) {
      console.log(`Rendering ${view} view`)
    }
    this.components.forEach((component, key) => {
      if (component.visible) {
        if (this.debug) {
          console.log(`Setting ${key} to invisible`)
        }
        component.setVisibility(false)
      }
    })
    definition.visible.forEach((componentDefinition) => {
      // component definitions can be names as well as arrays of fallback componentNames
      if (componentDefinition instanceof Array) {
        componentDefinition.some((componentName) => {
          return this.__setComponentVisible(componentName)
        })
      } else {
        this.__setComponentVisible(componentDefinition)
      }
    })
    // only the first focus component that can be focused will be focused
    definition.focus.some((componentDefinition) => {
      // component definitions can be names as well as arrays of fallback componentNames
      if (componentDefinition instanceof Array) {
        return componentDefinition.some((componentName) => {
          return this.__focusComponent(componentName)
        })
      } else {
        return this.__focusComponent(componentDefinition)
      }
    })
  }

  __setComponentVisible (componentName) {
    const component = this.components.get(componentName)
    if (component) {
      if (this.debug && !component.visible) {
        console.log(`Setting ${componentName} to visible`)
      }
      component.setVisibility(true)
      return true
    }
    return false
  }

  __focusComponent (componentName) {
    const component = this.components.get(componentName)
    if (!component) {
      return false
    }
    if (component.parent && component.parent.autoView) {
      component.parent.autoView()
      if (this.debug) {
        console.log(`Focusing parent of ${componentName}`)
      }
      return true
    }
    if (component.autoView) {
      component.autoView()
      if (this.debug) {
        console.log(`Focusing ${componentName}`)
      }
      return true
    }
    return false
  }

  /**
   * Clear all registered components
   */
  clearComponents () {
    this.components = new Map()
    this.componentSet = new Set()
  }

  /**
   * Register a view listener
   * @param {string} view name of the view
   * @param {function} listener listener function to register
   */
  registerViewListener (view, listener) {
    if (!this.viewListeners.has(view)) {
      this.viewListeners.set(view, new Set())
    }
    this.viewListeners.get(view).add(listener)
  }

  /**
   * Deregister a view listener
   * @param {string} view name of the view
   * @param {function} listener listener function to remove
   */
  deregisterViewListener (view, listener) {
    if (!this.viewListeners.has(view)) {
      return
    }
    this.viewListeners.get(view).delete(listener)
  }
}

/**
 * Abstract custom component for use with an NGLContext.
 */
export class CustomComponent {
  constructor () {
    if (this.constructor === CustomComponent) {
      throw new Error('Abstract class CustomComponent cannot be instantiated')
    }
  }

  /**
   * Corresponds to the NGL Component.visible property.
   */
  get visible () {
    throw new Error('Property visible must be implemented')
  }

  /**
   * Parents property. Custom components can have multiple parent components.
   */
  get parents () {
    throw new Error('Property parent must be implemented')
  }

  /**
   * Corresponds to the NGL Component.setVisibility() function.
   * @param {boolean} _value Set the visibility of the component
   */
  setVisibility (_value) {
    throw new Error('Method setVisibility() must be implemented')
  }

  /**
   * Corresponds to the NGL Component.autoView() function.
   * @param {number} _duration duration of the animation, defaults to 0
   */
  autoView (_duration) {
    throw new Error('Method autoView() must be implemented')
  }
}
