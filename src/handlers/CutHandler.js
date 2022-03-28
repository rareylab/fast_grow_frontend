import { StructureUtils } from '@/utils/StructureUtils'
import { StructureModelComponent } from '@/nglComponents/StructureModelComponent'
import { GeometryUtils } from '@/utils/GeometryUtils'
import { Utils } from '@/utils/Utils'

export class CutHandler {
  constructor (nglContext, model, componentCache) {
    this.nglContext = nglContext
    this.model = model
    this.componentCache = componentCache
  }

  /**
   * Remove the chose bond and its bond marker
   */
  removeChosenBond () {
    if (this.model.bondMarker) {
      this.nglContext.deregisterComponent('bondMarker')
      this.nglContext.stage.removeComponent(this.model.bondMarker)
    }
    this.model.anchor = undefined
    this.model.linker = undefined
  }

  /**
   * Choose a bond to cut by its two atoms
   * @param {object} anchor last atom before the cut
   * @param {object} linker first atom after the cut
   */
  bondChosen (anchor, linker) {
    this.removeChosenBond()
    this.model.anchor = anchor
    this.model.linker = linker
    const bondMarker = GeometryUtils.makeExitBondMarker(
      this.nglContext.stage,
      this.model.anchor.positionToArray(),
      this.model.linker.positionToArray()
    )
    this.nglContext.registerReplaceComponent('bondMarker', bondMarker)
    this.model.bondMarker = bondMarker
    this.nglContext.render()
  }

  /**
   * Validate whether all cutting information has been set
   *
   * We need a ligand, an anchor, and linker to cut.
   * @returns {boolean} is valid
   */
  validate (ligand) {
    if (ligand === undefined || ligand.id === undefined) {
      return false
    }
    if (this.model.anchor === undefined || this.model.anchor.index === undefined) {
      return false
    }
    if (this.model.linker === undefined || this.model.linker.index === undefined) {
      return false
    }
    return true
  }

  /**
   * Build request data for a cut
   * @returns {{linker: *, ligand_id, anchor: *}}
   */
  makeData (ligand) {
    return {
      ligand_id: ligand.id,
      anchor: this.model.anchor.index + 1,
      linker: this.model.linker.index + 1
    }
  }

  /**
   * Cut a chosen bond
   * @param {object} ligand ligand to cut
   * @param {string} baseUrl base url of the backend server
   */
  async bondCut (ligand, baseUrl = '') {
    if (!this.validate(ligand)) {
      this.model.cutSubmitError = 'Invalid anchor or linker'
      return
    }
    try {
      window.dispatchEvent(new CustomEvent('pollingOn', { bubbles: true }))
      const response = await fetch(baseUrl + '/core', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.makeData(ligand))
      })
      let core = await response.json()
      core = await Utils.pollModel(core, baseUrl + '/core/')
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
      await this.load(core)
      this.nglContext.render()
    } catch (error) {
      console.error(error)
      this.model.cutSubmitError = 'An error occurred while cutting the structure'
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
    }
  }

  /**
   * Load a cut core
   * @param {object} coreModel core model to load
   */
  async load (coreModel) {
    const coreComponent = await StructureUtils.addStructure(this.nglContext.stage, coreModel)
    coreModel.component = coreComponent
    const coreRepresentation = coreComponent.addRepresentation('licorice', {
      visible: false,
      multipleBond: true
    })
    const core = new StructureModelComponent(coreModel, coreRepresentation)
    this.model.core = coreModel
    this.nglContext.registerReplaceComponent('core', core)
  }

  /**
   * Remove the core and the chosen bond, reseting everything to the ligand
   */
  coreReset () {
    this.removeChosenBond()
    if (this.model.core) {
      this.model.core = undefined
      this.nglContext.deregisterComponent('core')
      this.nglContext.stage.removeComponent(this.model.core)
      this.nglContext.render()
    }
  }
}
