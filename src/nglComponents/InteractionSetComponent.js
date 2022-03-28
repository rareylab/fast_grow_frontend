import { CustomComponent } from '@/NGLContext'

/**
 * Wrapper around a set of interactions as a single component
 */
export class InteractionSetComponent extends CustomComponent {
  constructor () {
    super()
    this.interactions = new Map()
  }

  /**
   * Are any interactions visible
   * @returns {boolean}
   */
  get visible () {
    for (const interaction of this.interactions.values()) {
      if (interaction.component.visible) {
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
    this.interactions.forEach((interaction) => {
      interaction.component.setVisibility(value)
    })
  }

  /**
   * There is really no way to center the view on interactions
   */
  autoView (_duration) {
    throw new Error('Not implemented')
  }
}
