import * as NGL from 'ngl'

export class GeometryUtils {
  /**
   * Creates an arrow geometry object pointing at the linkerPosition from the
   * anchorPosition. Its parameters are defined in the constructor
   *
   * @param {object} stage
   * @param {number[]} anchorPosition
   * @param {number[]} linkerPosition
   */
  static makeExitBondMarker (stage, anchorPosition, linkerPosition) {
    const shape = new NGL.Shape('exitBondMarker')
    const radius = 0.4
    const color = new NGL.Color(0.5, 0.5, 1)
    const opacity = 0.8
    shape.addArrow(
      anchorPosition,
      linkerPosition,
      color,
      radius
    )
    const component = stage.addComponentFromObject(shape)
    component.addRepresentation('buffer', {
      name: 'exitBondMarker',
      opacity: opacity
    })
    component.setVisibility(false)
    return component
  }

  static makeHBondInteraction (stage, interaction, options = {}) {
    const color = new NGL.Color(1 - interaction.score, interaction.score, 0)
    options.name = options.name || 'interactionGeometry'
    options.opacity = options.opacity || 0.5
    const interactionGeometry = new NGL.Shape(options.name)
    interactionGeometry.addCylinder(
      interaction.ligandInteraction.position,
      interaction.siteInteraction.position,
      color,
      0.1,
      options.name)
    const interactionComponent = stage.addComponentFromObject(interactionGeometry)
    interactionComponent.addRepresentation('buffer', options)
    interactionComponent.setVisibility(false)
    return interactionComponent
  }

  static makeHydrophobicPoint (stage, interactionPoint, options = {}) {
    const color = new NGL.Color(0.8, 0.8, 0)
    options.name = options.name || 'interactionsGeometry'
    options.opacity = options.opacity || 0.5
    const interactionGeometry = new NGL.Shape(options.name)
    interactionGeometry.addSphere(interactionPoint.position, color, 1, options.name)
    const interactionComponent = stage.addComponentFromObject(interactionGeometry)
    interactionComponent.addRepresentation('buffer', options)
    interactionComponent.setVisibility(false)
    return interactionComponent
  }
}
