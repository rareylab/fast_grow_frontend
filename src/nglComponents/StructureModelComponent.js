import { CustomComponent } from '@/NGLContext'

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

  /**
   * Parent component of a structure representation
   * @returns {[{object}]}
   */
  get parents () {
    return [this.representation.parent]
  }

  /**
   * Is the representation visible
   * @returns {boolean} is visible
   */
  get visible () {
    return this.representation.visible
  }

  /**
   * Set the visibility of the representation
   * @param {boolean} value visibility of the representation
   */
  setVisibility (value) {
    this.representation.setVisibility(value)
  }

  /**
   * Center the view on the structure representation
   * @param duration
   */
  autoView (duration) {
    this.representation.parent.autoView(duration)
  }
}
