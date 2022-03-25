import { GeometryUtils } from '@/utils/GeometryUtils'
import { InteractionCollectionComponent } from '@/nglComponents/InteractionCollectionComponent'
import { HiddenInteractionCollectionComponent } from '@/nglComponents/HiddenInteractionCollectionComponent'
import { StructureUtils } from '@/utils/StructureUtils'
import { Utils } from '@/utils/Utils'

export class InteractionHandler {
  constructor (nglContext, model, componentCache) {
    this.nglContext = nglContext
    this.model = model
    this.componentCache = componentCache
  }

  async updateInteractions (interactions, baseUrl) {
    try {
      this.model.loadingInteractions = true
      const response = await fetch(baseUrl + '/interactions', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactions)
      })
      let searchPointData = await response.json()
      searchPointData = await Utils.pollUpload(searchPointData, baseUrl + '/interactions/')
      this.load(interactions, searchPointData)
      this.model.loadingInteractions = false
      this.nglContext.render()
    } catch (error) {
      console.error(error)
      this.model.interactionError = 'An error occurred while generating interactions'
      this.model.loadingInteractions = false
    }
  }

  load (interaction, searchPointData) {
    const ligandInteractionsComponent = InteractionHandler.loadInteractions(
      searchPointData.data.ligandSearchPoints,
      this.nglContext.stage)
    searchPointData.data.ligandSearchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Ligand'
    })
    this.nglContext.registerComponent('ligandInteractions', ligandInteractionsComponent)
    this.model.ligandInteractions = Array.from(ligandInteractionsComponent.geometryMap.values())
    const waterInteractionsComponent = InteractionHandler.loadInteractions(
      searchPointData.data.waterSearchPoints,
      this.nglContext.stage,
      searchPointData.data.ligandSearchPoints.length
    )
    searchPointData.data.waterSearchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Water'
    })
    this.nglContext.registerComponent('waterInteractions', waterInteractionsComponent)
    this.model.waterInteractions = Array.from(waterInteractionsComponent.geometryMap.values())
    this.model.currentInteractions = interaction

    searchPointData.data.activeSiteSearchPoints.searchPoints.forEach((searchPoint) => {
      searchPoint.source = 'Active Site'
    })
    const [residueToInteractions, pocketInteractionsComponent] =
      InteractionHandler.loadResidueInteractions(
        searchPointData.data.activeSiteSearchPoints,
        this.nglContext.stage
      )
    this.nglContext.registerComponent('pocketInteractions', pocketInteractionsComponent)
    this.model.residueToInteractions = residueToInteractions
    this.model.pocketInteractions = Array.from(pocketInteractionsComponent.geometryMap.values())
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

  toggleInteractionShadows () {
    const pocketInteractionComponent = this.nglContext.components.get('pocketInteractions')
    if (!pocketInteractionComponent) {
      return
    }
    pocketInteractionComponent.toggleAllShadows()
    this.nglContext.render()
  }

  toggleResidueShadows (residueName) {
    const [residueType, chainName, residueNumber] = residueName.split('_')
    if (residueType === 'HET' || !chainName || !residueNumber) {
      return
    }
    const selection = ':' + chainName + ' and ' + residueNumber
    const proteinComponent = this.nglContext.components.get('pocket').parent
    const highlightRepresentation = StructureUtils.addPocketHighlight(proteinComponent, selection)
    const replacedHighlight =
      this.nglContext.registerReplaceComponent('pocketHighlight', highlightRepresentation)
    proteinComponent.removeRepresentation(replacedHighlight)

    // switch off former shadows
    const interactionComponent = this.nglContext.components.get('pocketInteractions')
    if (this.model.highlightedResidue) {
      const formerInteractionIDs = this.model.residueToInteractions.get(this.model.highlightedResidue)
      if (formerInteractionIDs) {
        formerInteractionIDs.forEach((interactionID) => {
          interactionComponent.disableShadow(interactionID)
        })
      }
    }

    // switch on current shadows
    this.model.highlightedResidue = residueName
    const interactionIDs = this.model.residueToInteractions.get(this.model.highlightedResidue)
    if (interactionIDs) {
      interactionIDs.forEach((interactionID) => {
        interactionComponent.enableShadow(interactionID)
      })
    }
  }
}
