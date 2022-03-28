import { CustomComponent } from '@/NGLContext'

/**
 * Wrapper around interactions as a single component
 */
export class InteractionsComponent extends CustomComponent {
  // opacity values for different states
  SHADOW = 0.5
  HIGHLIGHT = 0.8

  constructor (interactionGeometries) {
    super()
    this.geometryMap = new Map()
    interactionGeometries.forEach((geometry) => {
      if (geometry.id === undefined) {
        throw Error('Invalid geometry does not have an ID')
      }
      this.geometryMap.set(geometry.id, geometry)
    })
  }

  /**
   * Are any interactions visible
   * @returns {boolean}
   */
  get visible () {
    for (const value of this.geometryMap.values()) {
      if (value.component.visible) {
        return true
      }
    }
    return false
  }

  /**
   * Interactions do not have parents
   * @returns {undefined}
   */
  get parents () {
    // geometries have no parents
    return undefined
  }

  /**
   * Set the visibility of the interactions
   * @param {boolean} value
   */
  setVisibility (value) {
    for (const geometry of this.geometryMap.values()) {
      geometry.component.setVisibility(value)
    }
  }

  /**
   * There is really no way to center the view on interactions
   */
  autoView (_duration) {
    throw new Error('Not implemented')
  }

  /**
   * Toggle highlight for an interaction geometry
   * @param {integer} geometryID ID of the interaction geometry
   * @returns {[{boolean}, {object}]} tuple of whether the interaction geometry was highlighted and the geometry itself
   */
  toggleHighlight (geometryID) {
    const geometry = this.geometryMap.get(geometryID)
    let toggledOn = true
    const representation = geometry.component.reprList[0]
    if (representation.getParameters().opacity === this.SHADOW) {
      representation.setParameters({ opacity: this.HIGHLIGHT })
    } else {
      representation.setParameters({ opacity: this.SHADOW })
      toggledOn = false
    }
    return [toggledOn, geometry]
  }
}
