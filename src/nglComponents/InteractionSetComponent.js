import { CustomComponent } from '@/NGLContext'

export class InteractionSetComponent extends CustomComponent {
  constructor () {
    super()
    this.interactions = new Map()
  }

  get visible () {
    for (const interaction of this.interactions.values()) {
      if (interaction.component.visible) {
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
    this.interactions.forEach((interaction) => {
      interaction.component.setVisibility(value)
    })
  }

  autoView (_duration) {
    // TODO care?
    throw new Error('Not implemented')
  }
}
