import { StructureUtils } from '@/internal/StructureUtils'
import { StructureModelComponent } from '@/internal/StructureModelComponent'
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
          complex.component = component
          representations.push(component.addRepresentation('cartoon', { visible: false }))
        })
      structurePromises.push(structurePromise)
    })
    await Promise.all(structurePromises)
    // const proteinComponent = new StructureModelComponent(this.ensemble.complexes[0], representations[0])
    // this.componentMap.set('protein', proteinComponent)
    const ensembleComponent = new EnsembleComponent(this.ensemble.complexes, representations)
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
    this.ensemble.ligands.sort(this.compareLigands)
    this.ensemble.ligands.forEach((ligand) => {
      const structurePromise = StructureUtils.addStructure(this.nglContext.stage, ligand)
        .then((component) => {
          ligand.component = component
          const ligandRepr = component.addRepresentation('licorice', { visible: false })
          // when choosing ligands the choices should by translucent
          // to differentiate them from chosen ligands
          const choiceRepr = component.addRepresentation('licorice', {
            visible: false,
            opacity: 0.5
          })
          representations.push(choiceRepr)
          this.componentMap.set(ligand.name, new StructureModelComponent(ligand, ligandRepr))
        })
      structurePromises.push(structurePromise)
    })
    await Promise.all(structurePromises)
    const ligandEnsembleComponent = new EnsembleComponent(this.ensemble.ligands, representations)
    this.componentMap.set('ligands', ligandEnsembleComponent)
    this.nglContext.registerComponent('ligands', ligandEnsembleComponent)
  }

  /**
   * Sort ligands by file_string length and then name. file_string length is a surrogate for atom
   * molecule size.
   */
  compareLigands (first, second) {
    if (first.file_string.length !== second.file_string.length) {
      return first.file_string.length > second.file_string.length ? -1 : 1
    }
    return first.name < second.name ? -1 : 1
  }
}
