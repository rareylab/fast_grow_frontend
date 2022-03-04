import { GeometryUtils } from '@/utils/GeometryUtils'
import { InteractionCollectionComponent } from '@/nglComponents/InteractionCollectionComponent'
import { HiddenInteractionCollectionComponent } from '@/nglComponents/HiddenInteractionCollectionComponent'

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
    searchPointData.data.ligandSearchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Ligand'
    })
    this.nglContext.registerComponent('ligandInteractions', ligandInteractionsComponent)
    this.data.ligandInteractions = Array.from(ligandInteractionsComponent.geometryMap.values())
    const waterInteractionsComponent = InteractionHandler.loadInteractions(
      searchPointData.data.waterSearchPoints,
      this.nglContext.stage,
      searchPointData.data.ligandSearchPoints.length
    )
    searchPointData.data.waterSearchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Water'
    })
    this.nglContext.registerComponent('waterInteractions', waterInteractionsComponent)
    this.data.waterInteractions = Array.from(waterInteractionsComponent.geometryMap.values())
    this.data.interaction = interaction

    searchPointData.data.activeSiteSearchPoints.searchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Active Site'
    })
    const [residueToInteractions, pocketInteractionsComponent] =
      InteractionHandler.loadResidueInteractions(
        searchPointData.data.activeSiteSearchPoints,
        this.nglContext.stage
      )
    this.nglContext.registerComponent('pocketInteractions', pocketInteractionsComponent)
    this.data.residueToInteractions = residueToInteractions
    this.data.pocketInteractions = Array.from(pocketInteractionsComponent.geometryMap.values())
  }

  static loadInteractions (ligandSearchPoints, stage, startIndex = 0) {
    InteractionHandler.loadSearchPoints(ligandSearchPoints, stage, startIndex)
    return new InteractionCollectionComponent(ligandSearchPoints)
  }

  static loadSearchPoints (searchPoints, stage, startIndex = 0) {
    searchPoints.forEach((searchPoint, index) => {
      this.loadSearchPoint(searchPoint, stage)
      searchPoint.id = startIndex + index
    })
  }

  static loadSearchPoint (searchPoint, stage, options = {}) {
    if (searchPoint.ligandInteraction) {
      if (searchPoint.ligandInteraction.type === 'ACCEPTOR' ||
        searchPoint.ligandInteraction.type === 'DONOR') {
        searchPoint.component = GeometryUtils.makeHBondInteraction(stage, searchPoint, options)
      } else {
        searchPoint.component = GeometryUtils.makeHydrophobicPoint(stage, searchPoint.ligandInteraction, options)
      }
    } else {
      if (searchPoint.type === 'ACCEPTOR' ||
        searchPoint.type === 'DONOR') {
        searchPoint.component = GeometryUtils.makeHBondPoint(stage, searchPoint, options)
      } else {
        searchPoint.component = GeometryUtils.makeHydrophobicPoint(stage, searchPoint, options)
      }
    }
  }

  static loadResidueInteractions (residueSearchPoints, stage, startIndex = 0) {
    InteractionHandler.loadSearchPoints(residueSearchPoints.searchPoints, stage, startIndex)
    const residueToInteractions = new Map()
    residueSearchPoints.mapping.forEach((mapping) => {
      if (!residueToInteractions.has(mapping[1])) {
        residueToInteractions.set(mapping[1], [])
      }
      const index = mapping[0] + startIndex
      const searchPoint = residueSearchPoints.searchPoints[index]
      if (!searchPoint.residue) {
        searchPoint.residue = mapping[1]
      } else {
        searchPoint.residue += ', ' + mapping[1]
      }
      residueToInteractions.get(mapping[1]).push(index)
    })
    return [residueToInteractions, new HiddenInteractionCollectionComponent(residueSearchPoints.searchPoints)]
  }
}
