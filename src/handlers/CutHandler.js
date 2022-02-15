import { StructureUtils } from '@/utils/StructureUtils'
import { StructureModelComponent } from '@/nglComponents/StructureModelComponent'

export class CutHandler {
  constructor (nglContext, data, componentCache) {
    this.nglContext = nglContext
    this.data = data
    this.componentCache = componentCache
  }

  /**
   * Validate whether all cutting information has been set
   *
   * We nee a ligand, an anchor, and linker to cut.
   * @returns {boolean} is valid
   */
  validate () {
    if (this.data.ligand === undefined || this.data.ligand.id === undefined) {
      return false
    }
    if (this.data.anchor === undefined || this.data.anchor.index === undefined) {
      return false
    }
    if (this.data.linker === undefined || this.data.linker.index === undefined) {
      return false
    }
    return true
  }

  /**
   * Build request data for a cut
   * @returns {{linker: *, ligand_id, anchor: *}}
   */
  makeData () {
    return {
      ligand_id: this.data.ligand.id,
      anchor: this.data.anchor.index + 1,
      linker: this.data.linker.index + 1
    }
  }

  /**
   * Load a cut core
   * @param {object} coreModel core model to load
   */
  async load (coreModel) {
    // const catFound = new CustomEvent('remove', { derivedFrom: 'core' })
    // window.dispatchEvent(catFound)

    const coreComponent = await StructureUtils.addStructure(this.nglContext.stage, coreModel)
    coreModel.component = coreComponent
    const coreRepresentation = coreComponent.addRepresentation('licorice', {
      visible: false,
      multipleBond: true
    })
    const core = new StructureModelComponent(coreModel, coreRepresentation)
    this.nglContext.registerReplaceComponent('core', core)
    this.data.core = core
  }
}
