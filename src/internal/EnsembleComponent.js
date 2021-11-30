import { CustomComponent } from '@/internal/NGLContext'

/**
 * Wrapper around an ensemble as a component
 */
export class EnsembleComponent extends CustomComponent {
  constructor (complexRepresentations) {
    super()
    this.representations = complexRepresentations
    this.parents = []
    this.representations.forEach((representation) => {
      this.parents.push(representation.parent)
    })
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
