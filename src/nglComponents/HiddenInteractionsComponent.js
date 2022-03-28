import { CustomComponent } from '@/NGLContext'

/**
 * Wrapper around hidden interactions as a single component
 */
export class HiddenInteractionsComponent extends CustomComponent {
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
    this.showAllShadows = false
    this.currentShadows = new Set()
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
   * Set the visibility of the hidden interactions
   * @param {boolean} value
   */
  setVisibility (value) {
    for (const geometry of this.geometryMap.values()) {
      const representation = geometry.component.reprList[0]
      if (representation.getParameters().opacity === this.SHADOW) {
        if (value && (this.showAllShadows || this.currentShadows.has(geometry.id))) {
          geometry.component.setVisibility(true)
        } else {
          geometry.component.setVisibility(false)
        }
      } else if (representation.getParameters().opacity === this.HIGHLIGHT) {
        geometry.component.setVisibility(value)
      }
    }
  }

  /**
   * There is really no way to center the view on hidden interactions
   */
  autoView (_duration) {
    throw new Error('Not implemented')
  }

  /**
   * Disable shadow for on interaction
   * @param {integer} geometryID ID of the interaction geometry
   * @returns {object | undefined} interaction the shadow was disabled for or undefined
   */
  disableShadow (geometryID) {
    if (this.showAllShadows) {
      return
    }
    const geometry = this.geometryMap.get(geometryID)
    if (!geometry) {
      return
    }
    const representation = geometry.component.reprList[0]
    if (representation.getParameters().opacity === this.HIGHLIGHT) {
      return
    }
    geometry.component.setVisibility(false)
    this.currentShadows.delete(geometryID)
    return geometry
  }

  /**
   * Enable shadow for on interaction
   * @param {integer} geometryID ID of the interaction geometry
   * @returns {object | undefined} interaction the shadow was enabled for or undefined
   */
  enableShadow (geometryID) {
    const geometry = this.geometryMap.get(geometryID)
    if (!geometry) {
      return
    }
    geometry.component.setVisibility(true)
    this.currentShadows.add(geometryID)
    return geometry
  }

  /**
   * Toggle all interaction shadows
   */
  toggleAllShadows () {
    this.showAllShadows = !this.showAllShadows
  }

  /**
   * Toggle highlight for an interaction geometry
   * @param {integer} geometryID ID of the interaction geometry
   * @returns {[{boolean}, {object}]} tuple of whether the interaction geometry was highlighted and the geometry itself
   */
  toggleHighlight (geometryID) {
    const geometry = this.geometryMap.get(geometryID)
    if (!geometry) {
      return
    }
    let toggledOn = true
    const representation = geometry.component.reprList[0]
    if (representation.getParameters().opacity === this.SHADOW) {
      representation.setParameters({ opacity: this.HIGHLIGHT })
    } else if (representation.getParameters().opacity === this.HIGHLIGHT) {
      // show shadows if they are currently in focus or all shadows are being shown
      if (this.showAllShadows || this.currentShadows.has(geometryID)) {
        representation.setParameters({ opacity: this.SHADOW })
      } else {
        geometry.component.setVisibility(false)
      }
      toggledOn = false
    }
    return [toggledOn, geometry]
  }
}
