import { GeometryUtils } from '@/utils/GeometryUtils'
import { InteractionsComponent } from '@/nglComponents/InteractionsComponent'
import { InteractionSetComponent } from '@/nglComponents/InteractionSetComponent'
import { HiddenInteractionsComponent } from '@/nglComponents/HiddenInteractionsComponent'
import { StructureUtils } from '@/utils/StructureUtils'
import { Utils } from '@/utils/Utils'

export class InteractionHandler {
  constructor (nglContext, model, componentCache) {
    this.nglContext = nglContext
    this.model = model
    this.componentCache = componentCache
  }

  /**
   * Update interaction information
   * @param {object} interactions the protein-ligand interaction pair
   * @param {string} baseUrl base URL of the backend server
   */
  async updateInteractions (interactions, baseUrl) {
    try {
      this.model.loadingInteractions = true
      const response = await fetch(baseUrl + '/interactions', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactions)
      })
      let searchPointData = await response.json()
      searchPointData = await Utils.pollModel(searchPointData, baseUrl + '/interactions/')
      this.load(interactions, searchPointData)
      this.model.loadingInteractions = false
      this.nglContext.render()
    } catch (error) {
      console.error(error)
      this.model.interactionError = 'An error occurred while generating interactions'
      this.model.loadingInteractions = false
    }
  }

  /**
   * Load search point data for a protein-ligand interaction
   * @param {object} interactions the protein-ligand interaction pair
   * @param {object} searchPointData search point data to load
   */
  load (interactions, searchPointData) {
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
    this.model.currentInteractions = interactions

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

  /**
   * Load two-point interactions
   * @param {Array<object>} searchPoints list of search points
   * @param {object} stage NGL stage
   * @param {integer} startIndex start index for interaction numbering
   */
  static loadInteractions (searchPoints, stage, startIndex = 0) {
    InteractionHandler.loadSearchPoints(searchPoints, stage, startIndex)
    return new InteractionsComponent(searchPoints)
  }

  /**
   * Load search points
   * @param {Array<object>} searchPoints search points to load
   * @param {object} stage NGL stage
   * @param {integer} startIndex start index for interaction numbering
   */
  static loadSearchPoints (searchPoints, stage, startIndex = 0) {
    searchPoints.forEach((searchPoint, index) => {
      this.loadSearchPoint(searchPoint, stage)
      searchPoint.id = startIndex + index
    })
  }

  /**
   * Load a search point
   * @param {object} searchPoint search point to load
   * @param {object} stage NGL Stage
   * @param {object} options options to pass through to NGL
   */
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

  /**
   * Load interactions associated with residues
   * @param {object} residueSearchPoints  residue search point mapping
   * @param {object} stage NGL stage
   * @param {integer} startIndex start index for interaction numbering
   */
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
    return [residueToInteractions, new HiddenInteractionsComponent(residueSearchPoints.searchPoints)]
  }

  /**
   * Toggle all interaction shadows
   */
  toggleInteractionShadows () {
    const pocketInteractionComponent = this.nglContext.components.get('pocketInteractions')
    if (!pocketInteractionComponent) {
      return
    }
    pocketInteractionComponent.toggleAllShadows()
    this.nglContext.render()
  }

  /**
   * Toggle interaction shadows for a residue
   * @param {string} residueName name of the residue to toggle shadows for
   */
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

  /***
   * Pick an interaction
   * @param {Integer} interactionID
   * @param {String} componentName
   */
  interactionPicked (interactionID, componentName) {
    if (!this.nglContext.components.has('pickedInteractions')) {
      this.nglContext.registerComponent('pickedInteractions', new InteractionSetComponent())
    }
    const pickedInteractionsComponent = this.nglContext.components.get('pickedInteractions')
    const interactionComponent = this.nglContext.components.get(componentName)
    if (!interactionComponent) {
      return
    }
    const [toggledOn, geometry] = interactionComponent.toggleHighlight(interactionID)
    if (toggledOn) {
      // copy and remove component because Vue and NGL components hate each other
      const geometryCopy = {}
      if (geometry.ligandInteraction) {
        Object.assign(geometryCopy, geometry.ligandInteraction)
        geometryCopy.source = geometry.source
      } else {
        Object.assign(geometryCopy, geometry)
      }
      geometryCopy.component = {}
      this.model.pickedInteractions.set(geometry.id, geometryCopy)

      // copy interaction again to generate search point (generating search point on geometryCopy can lead to Vue errors)
      const searchPointCopy = {}
      Object.assign(searchPointCopy, geometryCopy)
      InteractionHandler.loadSearchPoint(searchPointCopy, this.nglContext.stage, { opacity: 0.8 })
      pickedInteractionsComponent.interactions.set(geometry.id, searchPointCopy)
    } else {
      this.model.pickedInteractions.delete(geometry.id)
      // remove from picked interactions component
      const searchPoint = pickedInteractionsComponent.interactions.get(geometry.id)
      this.nglContext.stage.removeComponent(searchPoint.component)
      pickedInteractionsComponent.interactions.delete(geometry.id)
    }
    this.model.pickedInteractionsArray = Array.from(this.model.pickedInteractions.values())
  }
}
