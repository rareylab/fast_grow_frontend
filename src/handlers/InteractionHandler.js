import { GeometryUtils } from '@/utils/GeometryUtils'
import { GeometryCollectionComponent } from '@/nglComponents/GeometryCollectionComponent'

export class InteractionHandler {
  constructor (nglContext, data, componentCache) {
    this.nglContext = nglContext
    this.data = data
    this.componentCache = componentCache
  }

  load (interaction, searchPointData) {
    const ligandInteractionsComponent = InteractionHandler.loadLigandInteractions(
      searchPointData.data.ligandSearchPoints, this.nglContext.stage)
    this.nglContext.registerComponent('ligandInteractions', ligandInteractionsComponent)
    this.data.interaction = interaction
    this.data.ligandInteractions = Array.from(ligandInteractionsComponent.geometryMap.values())
  }

  static loadLigandInteractions (ligandSearchPoints, stage) {
    InteractionHandler.loadSearchPoints(ligandSearchPoints, stage)
    return new GeometryCollectionComponent(ligandSearchPoints)
  }

  static loadSearchPoints (searchPoints, stage) {
    searchPoints.forEach((searchPoint, index) => {
      if (searchPoint.ligandInteraction.type === 'ACCEPTOR' ||
        searchPoint.ligandInteraction.type === 'DONOR') {
        searchPoint.component = GeometryUtils.makeHBondInteraction(stage, searchPoint)
      } else {
        searchPoint.component = GeometryUtils.makeHydrophobicPoint(stage, searchPoint.ligandInteraction)
      }
      searchPoint.id = index
    })
  }
}
