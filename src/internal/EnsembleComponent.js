import { CustomComponent } from '@/internal/NGLContext'

/**
 * Wrapper around an ensemble as a component
 */
export class EnsembleComponent extends CustomComponent {
  constructor (structureModels, representations) {
    super()
    this.structureModels = structureModels
    this.structureModels.forEach((structureModel) => {
      if (structureModel.component === undefined) {
        throw new TypeError('Structure model does not have a component')
      }
    })
    this.parentList = []
    this.representations = representations
    this.representations.forEach((representation, index) => {
      if (this.structureModels[index].component !== representation.parent) {
        throw new TypeError('Representation is not of the structure model')
      }
      this.parentList.push(representation.parent)
    })
  }

  /**
   * Is the ensemble visible. If any part of the ensemble is visible this returns true.
   * @returns {boolean}
   */
  get visible () {
    return this.representations.some((representation) => { return representation.visible })
  }

  /**
   * List of parent components of the ensemble members
   * @returns {Array}
   */
  get parents () {
    return this.parentList
  }

  /**
   * Set visibility of the ensemble
   * @param value
   */
  setVisibility (value) {
    this.representations.forEach((representation) => representation.setVisibility(value))
  }

  /**
   * Auto view an ensemble. Will auto view the first component of the ensemble.
   * @param duration
   */
  autoView (duration) {
    const component = this.parents[0]
    component.autoView()
  }
}
