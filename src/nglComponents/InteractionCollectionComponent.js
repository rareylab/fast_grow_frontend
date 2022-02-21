import { CustomComponent } from '@/NGLContext'

export class InteractionCollectionComponent extends CustomComponent {
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
      geometry.component.setVisibility(value)
    }
  }

  autoView (_duration) {
    // TODO care?
    throw new Error('Not implemented')
  }

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
