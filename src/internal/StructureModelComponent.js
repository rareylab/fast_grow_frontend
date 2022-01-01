import { CustomComponent } from '@/internal/NGLContext'

/**
 * Wrapper around a structure as a component. A convenience object that associates the structure
 * Model with the rendered representation.
 */
export class StructureModelComponent extends CustomComponent {
  constructor (structureModel, representation) {
    super()
    this.structureModel = structureModel
    if (structureModel.component === undefined) {
      throw new TypeError('Structure model does not have a component')
    }
    if (this.structureModel.component !== representation.parent) {
      throw new TypeError('Representation is not of the structure model')
    }
    this.representation = representation
  }

  get parents () {
    return [this.representation.parent]
  }

  get visible () {
    return this.representation.visible
  }

  setVisibility (value) {
    this.representation.setVisibility(value)
  }

  autoView (duration) {
    this.representation.parent.autoView(duration)
  }
}
