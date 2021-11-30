import { StructureUtils } from '@/internal/StructureUtils'
import { EnsembleComponent } from '@/internal/EnsembleComponent'

/**
 * Loader for an ensemble
 */
export class EnsembleLoader {
  constructor (ensemble, componentMap, nglContext) {
    this.ensemble = ensemble
    this.componentMap = componentMap
    this.nglContext = nglContext
  }

  /**
   * Run function of the loader
   */
  async run () {
    const proteinPromise = this.loadProteins()
    const ligandPromise = this.loadLigands()
    return Promise.all([proteinPromise, ligandPromise])
  }

  /**
   * Load proteins of the ensemble. Initializes the "protein" and "ensemble" component and registers
   * the "ensemble" component as "protein" in the NGL context.
   */
  async loadProteins () {
    const structurePromises = []
    const representations = []
    this.ensemble.complexes.forEach((complex) => {
      const structurePromise = StructureUtils.addStructure(this.nglContext.stage, complex)
        .then((component) => {
          representations.push(component.addRepresentation('cartoon', { visible: false }))
        })
      structurePromises.push(structurePromise)
    })
    await Promise.all(structurePromises)
    this.componentMap.set('protein', representations[0])
    const ensembleComponent = new EnsembleComponent(representations)
    this.componentMap.set('ensemble', ensembleComponent)
    this.nglContext.registerComponent('protein', ensembleComponent)
  }

  /**
   * Load the ligands of an ensemble. Initializes the "ligands" component and registers it as
   * "ligands" in the NGL context.
   */
  async loadLigands () {
    const structurePromises = []
    const representations = []
    this.ensemble.ligands.forEach((ligand) => {
      const structurePromise = StructureUtils.addStructure(this.nglContext.stage, ligand)
        .then((component) => {
          representations.push(component.addRepresentation('licorice', { visible: false }))
        })
      structurePromises.push(structurePromise)
    })
    await Promise.all(structurePromises)
    const ligandEnsembleComponent = new EnsembleComponent(representations)
    this.componentMap.set('ligands', ligandEnsembleComponent)
    this.nglContext.registerComponent('ligands', ligandEnsembleComponent)
  }
}
