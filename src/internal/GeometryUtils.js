import * as NGL from 'ngl'

export class GeometryUtils {
  /**
   * Creates an arrow geometry object pointing at the linkerPosition from the
   * anchorPosition. Its parameters are defined in the constructor
   *
   * @param {number[]} anchorPosition
   * @param {number[]} linkerPosition
   * @param {object} stage
   */
  static makeExitBondMarker (anchorPosition, linkerPosition, stage) {
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
      opacity: opacity,
      visibility: false
    })
    return component
  }
}
