import { EnsembleComponent } from '@/nglComponents/EnsembleComponent'
import { StructureUtils } from '@/utils/StructureUtils'
import { StructureModelComponent } from '@/nglComponents/StructureModelComponent'
import { Utils } from '@/utils/Utils'

export class StructureUploadHandler {
  constructor (nglContext, model, componentCache) {
    this.nglContext = nglContext
    this.model = model
    this.componentCache = componentCache
  }

  /**
   * Upload structures to the backend server and FastGrow itself
   * @param {Event} formSubmitEvent submit event for structure upload
   * @param {string} baseUrl base URL of the backend server
   */
  async structureUpload (formSubmitEvent, baseUrl = '') {
    formSubmitEvent.preventDefault()
    if (!this.validate(formSubmitEvent)) {
      return
    }
    const formData = this.makeFormData(formSubmitEvent)
    try {
      window.dispatchEvent(new CustomEvent('pollingOn', { bubbles: true }))
      const response = await fetch(baseUrl + '/complex', {
        method: 'post',
        body: formData
      })
      let ensemble = await response.json()
      ensemble = await Utils.pollModel(ensemble, baseUrl + '/complex/')
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
      await this.load(ensemble)
      if (this.model.ligand && this.model.pocket) {
        window.dispatchEvent(new CustomEvent('changeTab', {
          bubbles: true,
          detail: { tabTrigger: 'cut-tab-trigger' }
        }))
      } else if (this.model.ligand) {
        window.dispatchEvent(new CustomEvent('changeTab', {
          bubbles: true,
          detail: { tabTrigger: 'pockets-tab-trigger' }
        }))
      } else {
        window.dispatchEvent(new CustomEvent('changeTab', {
          bubbles: true,
          detail: { tabTrigger: 'ligands-tab-trigger' }
        }))
      }
    } catch (error) {
      console.error(error)
      this.model.structureSubmitError = 'An error occurred while uploading the structure'
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
    }
  }

  /**
   * Validate an upload event
   * @param {Event} event upload event
   * @returns {boolean} is valid
   */
  validate (event) {
    const ensembleField = event.target.ensemble
    if (ensembleField.files.length < 1) {
      this.model.structureSubmitError = 'At least 1 protein is required'
      return false
    }
    return true
  }

  /**
   * Build form data for an upload event
   * @param {Event} event upload event
   */
  makeFormData (event) {
    const formData = new FormData()
    const ensembleField = event.target.ensemble
    for (const protein of ensembleField.files) {
      formData.append('ensemble[]', protein)
    }
    formData.append('ligand', event.target.ligand.files[0])
    return formData
  }

  /**
   * Load the components of an ensemble
   * @param {object} ensemble
   */
  async load (ensemble) {
    // const catFound = new CustomEvent('remove', { derivedFrom: 'ligands' })
    // window.dispatchEvent(catFound)
    this.model.ensemble = ensemble

    const [complexRepresentations, ligandChoiceRepresentations, ligandComponents] = await StructureUploadHandler.loadEnsemble(ensemble, this.nglContext.stage)

    const ensembleComponent = new EnsembleComponent(ensemble.complexes, complexRepresentations)
    this.nglContext.registerReplaceComponent('ensemble', ensembleComponent)
    this.model.complexes = ensembleComponent.structureModels

    const ligandsComponent = new EnsembleComponent(ensemble.ligands, ligandChoiceRepresentations)
    this.nglContext.registerReplaceComponent('ligands', ligandsComponent)
    this.model.ligands = ligandsComponent.structureModels

    if (ensemble.ligands.length === 1) {
      // TODO set ligand with linker to ligand
      this.nglContext.registerReplaceComponent('ligand', ligandComponents[0])
      this.model.ligand = ligandComponents[0].structureModel
      if (ensemble.complexes.length === 1) {
        const pocketRepresentation = StructureUtils.addPocket(ligandComponents[0].structureModel.component, ensemble.complexes[0].component)
        this.nglContext.registerReplaceComponent('pocket', pocketRepresentation)
        this.model.pocket = ensemble.complexes[0]
      }
    }

    if (!this.model.ligand || !this.model.pocket) {
      this.cacheChoiceComponents(ensemble, complexRepresentations, ligandComponents)
    }
  }

  /**
   * Cache components for ligand and pocket choosing
   * @param {object} ensemble
   * @param {Array<object>} complexRepresentations
   * @param {Array<object>} ligandComponents
   */
  cacheChoiceComponents (ensemble, complexRepresentations, ligandComponents) {
    ligandComponents.forEach((ligandComponent) => {
      // different components with overlapping IDs can be cached
      this.componentCache.set('ligand_' + ligandComponent.structureModel.id, ligandComponent)
    })
    complexRepresentations.forEach((complexRepresentation, index) => {
      const complex = ensemble.complexes[index]
      this.componentCache.set('complex_' + complex.id, new StructureModelComponent(complex, complexRepresentation))
    })
  }

  /**
   * Load the contents of an ensemble
   * @param {object} ensemble
   * @param {object} stage
   * @returns {Promise} loading promise
   */
  static async loadEnsemble (ensemble, stage) {
    const structurePromises = []
    const complexRepresentations = StructureUploadHandler.loadComplexes(ensemble, stage, structurePromises)
    const [ligandChoiceRepresentations, ligandComponents] = StructureUploadHandler.loadLigands(ensemble, stage, structurePromises)
    await Promise.all(structurePromises)
    return [complexRepresentations, ligandChoiceRepresentations, ligandComponents]
  }

  /**
   * Load the complexes of an ensemble
   * @param {object} ensemble
   * @param {object} stage
   * @param {Array<Promise>} structurePromises
   * @returns {Array} complex representations
   */
  static loadComplexes (ensemble, stage, structurePromises) {
    const complexRepresentations = []
    for (let i = 0; i < ensemble.complexes.length; i++) {
      const structurePromise = StructureUtils.addStructure(stage, ensemble.complexes[i])
        .then((component) => {
          ensemble.complexes[i].component = component
          complexRepresentations.push(component.addRepresentation('cartoon', { visible: false }))
        })
      structurePromises.push(structurePromise)
    }
    return complexRepresentations
  }

  /**
   * Load the ligands of an ensemble
   * @param {object} ensemble
   * @param {object} stage
   * @param {Array<Promise>} structurePromises
   * @returns {Array, Array} ligand choice representations and ligand components
   */
  static loadLigands (ensemble, stage, structurePromises) {
    const ligandChoiceRepresentations = []
    const ligandComponents = []
    ensemble.ligands.sort(StructureUploadHandler.compareLigands)
    for (let i = 0; i < ensemble.ligands.length; i++) {
      const structurePromise = StructureUtils.addStructure(stage, ensemble.ligands[i])
        .then((component) => {
          ensemble.ligands[i].component = component
          const ligandRepr = component.addRepresentation('licorice', {
            visible: false,
            multipleBond: true
          })
          // when choosing ligands the choices should by translucent
          // to differentiate them from chosen ligands
          const choiceRepr = component.addRepresentation('licorice', {
            visible: false,
            multipleBond: true,
            opacity: 0.5
          })
          ligandChoiceRepresentations.push(choiceRepr)
          ligandComponents.push(new StructureModelComponent(ensemble.ligands[i], ligandRepr))
        })
      structurePromises.push(structurePromise)
    }
    return [ligandChoiceRepresentations, ligandComponents]
  }

  /**
   * Sort ligands by file_string length and then name. file_string length is a surrogate for atom
   * molecule size.
   */
  static compareLigands (first, second) {
    if (first.file_string.length !== second.file_string.length) {
      return first.file_string.length > second.file_string.length ? -1 : 1
    }
    return first.name < second.name ? -1 : 1
  }

  /**
   * Pick a ligand
   * @param {integer} ligandId ID of the ligand to pick
   */
  ligandChosen (ligandId) {
    const ligandComponent = this.componentCache.get('ligand_' + ligandId)
    if (!ligandComponent) {
      return
    }
    this.model.ligand = ligandComponent.structureModel
    this.nglContext.registerReplaceComponent('ligand', ligandComponent)
    this.nglContext.render()
  }

  /**
   * Pick a pocket
   * @param {integer} complexId ID of the complex to pick as a pocket
   */
  pocketChosen (complexId) {
    const complexComponent = this.componentCache.get('complex_' + complexId)
    if (!complexComponent) {
      return
    }
    const complexRepresentations = complexComponent.structureModel.component.reprList
    complexRepresentations.forEach((representation) => {
      if (representation.name === 'pocketLicorice') {
        complexComponent.structureModel.component.removeRepresentation(representation)
      }
    })
    const pocketRepresentation = StructureUtils.addPocket(this.model.ligand.component, complexComponent.structureModel.component)
    this.model.pocket = complexComponent.structureModel
    this.nglContext.registerReplaceComponent('pocket', pocketRepresentation)
    this.nglContext.render()
  }
}
