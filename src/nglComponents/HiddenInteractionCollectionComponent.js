import { CustomComponent } from '@/NGLContext'

export class HiddenInteractionCollectionComponent extends CustomComponent {
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

  get visible () {
    for (const value of this.geometryMap.values()) {
      if (value.component.visible) {
        return true
      }
    }
    return false
  }

  get parents () {
    // geometries have no parents
    return undefined
  }

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

  autoView (_duration) {
    // TODO care?
    throw new Error('Not implemented')
  }

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

  enableShadow (geometryID) {
    const geometry = this.geometryMap.get(geometryID)
    if (!geometry) {
      return
    }
    geometry.component.setVisibility(true)
    this.currentShadows.add(geometryID)
    return geometry
  }

  toggleAllShadows () {
    this.showAllShadows = !this.showAllShadows
  }

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
