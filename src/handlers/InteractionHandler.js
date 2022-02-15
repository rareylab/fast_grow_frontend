import { GeometryUtils } from '@/utils/GeometryUtils'
import { GeometryCollectionComponent } from '@/nglComponents/GeometryCollectionComponent'

export class InteractionHandler {
  constructor (nglContext, data, componentCache) {
    this.nglContext = nglContext
    this.data = data
    this.componentCache = componentCache
  }

  load (interaction, searchPointData) {
    const ligandInteractionsComponent = InteractionHandler.loadInteractions(
      searchPointData.data.ligandSearchPoints,
      this.nglContext.stage)
    this.nglContext.registerComponent('ligandInteractions', ligandInteractionsComponent)
    this.data.ligandInteractions = Array.from(ligandInteractionsComponent.geometryMap.values())
    const waterInteractionsComponent = InteractionHandler.loadInteractions(
      searchPointData.data.waterSearchPoints,
      this.nglContext.stage,
      searchPointData.data.ligandSearchPoints.length
    )
    this.nglContext.registerComponent('waterInteractions', waterInteractionsComponent)
    this.data.waterInteractions = Array.from(waterInteractionsComponent.geometryMap.values())
    this.data.interaction = interaction
  }

  static loadInteractions (ligandSearchPoints, stage, startIndex = 0) {
    InteractionHandler.loadSearchPoints(ligandSearchPoints, stage, startIndex)
    return new GeometryCollectionComponent(ligandSearchPoints)
  }

  static loadSearchPoints (searchPoints, stage, startIndex = 0) {
    searchPoints.forEach((searchPoint, index) => {
      if (searchPoint.ligandInteraction.type === 'ACCEPTOR' ||
        searchPoint.ligandInteraction.type === 'DONOR') {
        searchPoint.component = GeometryUtils.makeHBondInteraction(stage, searchPoint)
      } else {
        searchPoint.component = GeometryUtils.makeHydrophobicPoint(stage, searchPoint.ligandInteraction)
      }
      searchPoint.id = startIndex + index
    })
  }
}
