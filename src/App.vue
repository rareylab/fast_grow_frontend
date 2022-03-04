<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <div class="col-7 h-100">
        <div id="viewport" class="h-100"></div>
      </div>
      <div class="col-5 h-100 d-flex flex-column">
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-expanded="false"
            >
              Structure
            </a>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="upload-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#upload-tab"
                  aria-controls="upload-tab"
                  aria-selected="true"
                >
                  Upload
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="ligands-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#ligands-tab"
                  aria-controls="ligands-tab"
                >
                  Ligands
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="pockets-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#pockets-tab"
                  aria-controls="pockets-tab"
                >
                  Pockets
                </a>
              </li>
            </ul>
          </li>
          <li class="nav-item" role="presentation">
            <button
              id="cut-tab-trigger"
              class="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#cut-tab"
              type="button"
              role="tab"
              aria-controls="cut-tab"
            >
              Cut
            </button>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-expanded="false"
              id="interactions-dropdown"
            >
              Interactions
            </a>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="ligand-interactions-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#ligand-interactions-tab"
                  aria-controls="ligand-interactions-tab"
                >
                  Ligand
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="water-interactions-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#water-interactions-tab"
                  aria-controls="water-interactions-tab"
                >
                  Water
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="pocket-interactions-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#pocket-interactions-tab"
                  aria-controls="pocket-interactions-tab"
                >
                  Pocket
                </a>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-expanded="false"
              id="growing-dropdown"
            >
              Growing
            </a>
            <ul class="dropdown-menu">
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="query-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#query-tab"
                  aria-controls="query-tab"
                >
                  Query
                </a>
              </li>
              <li>
                <a
                  class="dropdown-item"
                  href="#"
                  id="results-tab-trigger"
                  data-bs-toggle="tab"
                  data-bs-target="#results-tab"
                  aria-controls="results-tab"
                >
                  Results
                </a>
              </li>
            </ul>
          </li>
        </ul>
        <div class="tab-content flex-grow-1" id="tab-content">
          <div
            class="tab-pane fade show active"
            id="upload-tab"
            role="tabpanel"
            aria-labelledby="upload-tab"
          >
            <structure-upload
              @submit="this.structureUpload"
              @change="this.structureSubmitError = undefined"
              :submit-error="this.structureSubmitError"
              :polling-server="this.pollingServer"
            ></structure-upload>
          </div>
          <div
            class="tab-pane fade h-100"
            id="ligands-tab"
            role="tabpanel"
            aria-labelledby="ligands-tab"
          >
            <ligand-choice
              @register="this.registerListener"
              @ligandChosen="this.ligandChosen"
              :ligands="this.ligands"
              :view="'ligands-tab'"
            ></ligand-choice>
          </div>
          <div
            class="tab-pane fade h-100"
            id="pockets-tab"
            role="tabpanel"
            aria-labelledby="pockets-tab"
          >
            <pocket-choice
              @pocketChosen="this.pocketChosen"
              :complexes="this.complexes"
            ></pocket-choice>
          </div>
          <div
            class="tab-pane fade h-100"
            id="cut-tab"
            role="tabpanel"
            aria-labelledby="cut-tab"
          >
            <cut
              @register="this.registerListener"
              @bondChosen="this.bondChosen"
              @cut="this.bondCut"
              @reset="this.coreReset"
              :submit-error="this.cutSubmitError"
              :polling-server="this.pollingServer"
              :view="'cut-tab'"
              :ligand="this.ligand"
              ref="clip"
            ></cut>
          </div>
          <div
            class="tab-pane fade h-100"
            id="ligand-interactions-tab"
            role="tabpanel"
            aria-labelledby="ligand-interactions-tab"
          >
            <interaction-table
              :view="'ligand-interactions-tab'"
              :title="'Ligand'"
              :interactions="this.ligandInteractions"
              :loading="this.loadingInteractions"
              :submit-error="this.interactionError"
              @register="this.registerListener"
              @picked="this.ligandInteractionPicked"
            >
            </interaction-table>
          </div>
          <div
            class="tab-pane fade h-100"
            id="water-interactions-tab"
            role="tabpanel"
            aria-labelledby="water-interactions-tab"
          >
            <interaction-table
              :view="'water-interactions-tab'"
              :title="'Water'"
              :interactions="this.waterInteractions"
              :loading="this.loadingInteractions"
              :submit-error="this.interactionError"
              @register="this.registerListener"
              @picked="this.waterInteractionPicked"
            >
            </interaction-table>
          </div>
          <div
            class="tab-pane fade h-100"
            id="pocket-interactions-tab"
            role="tabpanel"
            aria-labelledby="pocket-interactions-tab"
          >
            <interaction-picker
              :view="'pocket-interactions-tab'"
              :interactions="this.pocketInteractions"
              :loading="this.loadingInteractions"
              :submit-error="this.interactionError"
              @register="this.registerListener"
              @change="this.toggleInteractionShadows"
              @picked="this.pocketInteractionPicked"
              @highlight="this.toggleResidueShadows"
            >
            </interaction-picker>
          </div>
          <div
            class="tab-pane fade h-100"
            id="query-tab"
            role="tabpanel"
            aria-labelledby="query-tab"
          >
            <query
              :submit-error="this.growSubmitError"
              :polling-server="this.pollingServer"
              :fragment-sets="this.fragmentSets"
              :complexes="this.complexes"
              :core="this.core"
              :interactions="this.interactionsArray"
              @grow="this.grow"
            ></query>
          </div>
          <div
            class="tab-pane fade h-100"
            id="results-tab"
            role="tabpanel"
            aria-labelledby="query-tab"
          >
            <results
              :hits="this.hitsArray"
              :loading="this.pollingServer"
              @picked="this.hitChosen"
            ></results>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// external imports
import * as bootstrap from 'bootstrap'
import * as NGL from 'ngl'
import _ from 'lodash'

// internal imports
import { NGLContext } from '@/NGLContext'
import { Utils } from '@/utils/Utils'
import { StructureUtils } from '@/utils/StructureUtils'
import { GeometryUtils } from '@/utils/GeometryUtils'
import { StructureUploadHandler } from '@/handlers/StructureUploadHandler'
import { CutHandler } from '@/handlers/CutHandler'
import { InteractionHandler } from '@/handlers/InteractionHandler'
import { InteractionSetComponent } from '@/nglComponents/InteractionSetComponent'
import { GrowingHandler } from '@/handlers/GrowingHandler'

// components
import StructureUpload from '@/components/StructureUpload'
import LigandChoice from '@/components/LigandChoice'
import PocketChoice from '@/components/PocketChoice'
import Cut from '@/components/Cut'
import InteractionTable from '@/components/InteractionTable'
import InteractionPicker from '@/components/InteractionPicker'
import Query from '@/components/Query'
import Results from '@/components/Results'

const viewDefinition = {
  'upload-tab': {
    visible: ['ensemble', 'pocket', ['ligand', 'ligands'], 'bondMarker'],
    focus: ['ligand', 'ligands', 'ensemble']
  },
  'ligands-tab': {
    // both ligands an ligand are visible so both the choices and the chosen are visible
    visible: ['ensemble', 'pocket', 'ligands', 'ligand'],
    focus: ['ligand', 'ligands', 'pocket']
  },
  'pockets-tab': {
    visible: ['ensemble', 'pocket', 'ligand'],
    focus: ['ligand', 'pocket']
  },
  'cut-tab': {
    visible: ['ensemble', 'pocket', ['core', 'ligand'], 'bondMarker'],
    focus: ['ligand', 'pocket']
  },
  'ligand-interactions-tab': {
    visible: ['ensemble', 'pocket', 'ligand', 'bondMarker', 'ligandInteractions'],
    focus: ['ligand', 'pocket']
  },
  'water-interactions-tab': {
    visible: ['ensemble', 'pocket', 'ligand', 'bondMarker', 'waterInteractions'],
    focus: ['ligand', 'pocket']
  },
  'pocket-interactions-tab': {
    visible: ['ensemble', 'pocket', 'ligand', 'bondMarker', 'pocketInteractions', 'pocketHighlight'],
    focus: ['ligand', 'pocket']
  },
  'query-tab': {
    visible: ['ensemble', 'pocket', 'core', 'bondMarker', 'pickedInteractions'],
    focus: ['ligand', 'pocket']
  },
  'results-tab': {
    visible: ['ensemble', 'pocket', 'hit'],
    focus: ['hit', 'ligand', 'pocket']
  }
}

export default {
  name: 'FastGrow',
  components: {
    Results,
    Query,
    InteractionPicker,
    InteractionTable,
    PocketChoice,
    LigandChoice,
    StructureUpload,
    Cut
  },
  data () {
    return {
      // status defining variables
      structureSubmitError: undefined,
      cutSubmitError: undefined,
      interactionError: undefined,
      growSubmitError: undefined,
      loadingInteractions: false,
      pollingServer: false,
      baseUrl: 'http://localhost:8000', // TODO edit in production
      // data variables
      // this state is duplicated from the nglContext because the Vue proxy breaks NGL components
      ensemble: undefined,
      ligands: undefined,
      ligand: undefined,
      complexes: undefined,
      pocket: undefined,
      bondMarker: undefined,
      linker: undefined,
      anchor: undefined,
      core: undefined,
      interaction: undefined,
      ligandInteractions: undefined,
      waterInteractions: undefined,
      pocketInteractions: undefined,
      residueToInteractions: undefined,
      highlightedResidue: undefined,
      pickedInteractions: new Map(),
      fragmentSets: undefined,
      currentFragmentSet: undefined,
      growing: undefined,
      hits: new Map()
    }
  },
  watch: {
    pickedInteractions: {
      handler (newPickedInteractions) {
        if (!this.nglContext.components.has('pickedInteractions')) {
          this.nglContext.registerComponent('pickedInteractions', new InteractionSetComponent())
        }
        const pickedInteractionsComponent = this.nglContext.components.get('pickedInteractions')
        // add new interactions
        for (const [key, value] of newPickedInteractions) {
          if (pickedInteractionsComponent.interactions.has(key)) {
            continue
          }
          // copy interaction because loading a Vue proxied object to the NGL throws errors
          const loadedInteraction = _.clone(value)
          InteractionHandler.loadSearchPoint(loadedInteraction, this.stage, { opacity: 0.8 })
          pickedInteractionsComponent.interactions.set(key, loadedInteraction)
        }

        // remove unselected interactions
        for (const [key, value] of pickedInteractionsComponent.interactions) {
          if (newPickedInteractions.has(key)) {
            continue
          }
          pickedInteractionsComponent.interactions.delete(key)
          this.stage.removeComponent(value.component)
        }
      },
      deep: true
    },
    core () {
      this.growSubmitError = ''
    }
  },
  computed: {
    interactionsArray () {
      return Array.from(this.pickedInteractions.values())
    },
    hitsArray () {
      return Array.from(this.hits.values())
    }
  },
  methods: {
    /**
     * Change active tab
     * @param {string} tabTriggerId
     */
    changeTab (tabTriggerId) {
      const tabElement = document.getElementById(tabTriggerId)
      const tab = new bootstrap.Tab(tabElement)
      tab.show()
    },
    /**
     * Register an NGL listener
     * @param {string} view to register listener for
     * @param {function} listener listener to register
     */
    registerListener (view, listener) {
      this.nglContext.registerViewListener(view, listener)
    },
    removeDerivedData (derivedFrom = 'ligands') {
      const derivedData = ['ligands', 'ligand', 'pocket', 'anchor', 'linker', 'bondMarker']
      for (let index = derivedData.indexOf(derivedFrom); index < derivedData.length; index++) {
        const dataName = derivedData[index]
        if (this.nglContext.components.has(dataName)) {
          this.nglContext.deregisterComponent(dataName)
          this[dataName] = undefined
          // TODO shrink the cache?
        }
      }
    },
    async pollUpload (model, pollUrl, interval = 1000, updateCallback = undefined) {
      this.pollingServer = true
      while (model.status === 'pending') {
        await Utils.sleep(interval)
        const response = await fetch(pollUrl + model.id)
        model = await response.json()
        if (updateCallback) {
          updateCallback(model)
        }
      }
      this.pollingServer = false
      return model
    },
    async structureUpload (event) {
      event.preventDefault()
      if (!this.structureUploadHandler.validate(event)) {
        return
      }
      const formData = this.structureUploadHandler.makeFormData(event)
      try {
        const response = await fetch(this.baseUrl + '/complex', {
          method: 'post',
          body: formData
        })
        let ensemble = await response.json()
        ensemble = await this.pollUpload(ensemble, this.baseUrl + '/complex/')
        await this.structureUploadHandler.load(ensemble)
        if (this.ligand && this.pocket) {
          this.changeTab('cut-tab-trigger')
        } else if (this.ligand) {
          this.changeTab('pockets-tab-trigger')
        } else {
          this.changeTab('ligands-tab-trigger')
        }
      } catch (error) {
        console.error(error)
        this.structureSubmitError = 'An error occurred while uploading the structure'
        this.pollingServer = false
      }
    },
    async ligandChosen (ligandId) {
      const ligandComponent = this.componentCache.get('ligand_' + ligandId)
      this.ligand = ligandComponent.structureModel
      this.nglContext.registerReplaceComponent('ligand', ligandComponent)
      this.nglContext.render()
    },
    async pocketChosen (complexId) {
      const complexComponent = this.componentCache.get('complex_' + complexId)
      const complexRepresentations = complexComponent.structureModel.component.reprList
      complexRepresentations.forEach((representation) => {
        if (representation.name === 'pocketLicorice') {
          complexComponent.structureModel.component.removeRepresentation(representation)
        }
      })
      const pocketRepresentation =
        StructureUtils.addPocket(this.ligand.component, complexComponent.structureModel.component)
      this.pocket = complexComponent.structureModel
      this.nglContext.registerReplaceComponent('pocket', pocketRepresentation)
      this.nglContext.render()
    },
    async bondChosen (anchor, linker) {
      this.removeChosenBond()
      this.anchor = anchor
      this.linker = linker
      const bondMarker =
        GeometryUtils.makeExitBondMarker(this.stage, this.anchor.positionToArray(), this.linker.positionToArray())
      this.nglContext.registerReplaceComponent('bondMarker', bondMarker)
      this.bondMarker = bondMarker
      this.nglContext.render()
    },
    removeChosenBond () {
      if (this.bondMarker) {
        this.nglContext.deregisterComponent('bondMarker')
        this.stage.removeComponent(this.bondMarker)
      }
      this.anchor = undefined
      this.linker = undefined
    },
    async bondCut () {
      if (!this.cutHandler.validate(this.$data)) {
        this.cutSubmitError = 'Invalid anchor or linker'
      }
      try {
        const response = await fetch(this.baseUrl + '/core', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.cutHandler.makeData(this.$data))
        })
        let core = await response.json()
        core = await this.pollUpload(core, this.baseUrl + '/core/')
        await this.cutHandler.load(core)
        this.nglContext.render()
      } catch (error) {
        console.error(error)
        this.cutSubmitError = 'An error occurred while cutting the structure'
        this.pollingServer = false
      }
    },
    coreReset () {
      this.removeChosenBond()
      if (this.core) {
        this.nglContext.deregisterComponent('core')
        this.stage.removeComponent(this.core)
        this.nglContext.render()
      }
    },
    async updateInteractions (interaction) {
      try {
        this.loadingInteractions = true
        const response = await fetch(this.baseUrl + '/interactions', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interaction)
        })
        let searchPointData = await response.json()
        searchPointData = await this.pollUpload(searchPointData, this.baseUrl + '/interactions/')
        this.interactionHandler.load(interaction, searchPointData)
        this.loadingInteractions = false
        this.nglContext.render()
      } catch (error) {
        console.error(error)
        this.interactionError = 'An error occurred while generating interactions'
        this.loadingInteractions = false
      }
    },
    ligandInteractionPicked (interactionID) {
      this.interactionPicked(interactionID, 'ligandInteractions')
    },
    waterInteractionPicked (interactionID) {
      this.interactionPicked(interactionID, 'waterInteractions')
    },
    pocketInteractionPicked (interactionID) {
      this.interactionPicked(interactionID, 'pocketInteractions')
    },
    interactionPicked (interactionID, componentName) {
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
        this.pickedInteractions.set(geometry.id, geometryCopy)
      } else {
        this.pickedInteractions.delete(geometry.id)
      }
    },
    toggleInteractionShadows (_event) {
      const pocketInteractionComponent = this.nglContext.components.get('pocketInteractions')
      if (!pocketInteractionComponent) {
        return
      }
      pocketInteractionComponent.toggleAllShadows()
      this.nglContext.render()
    },
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
      if (this.highlightedResidue) {
        const formerInteractionIDs = this.residueToInteractions.get(this.highlightedResidue)
        if (formerInteractionIDs) {
          formerInteractionIDs.forEach((interactionID) => {
            interactionComponent.disableShadow(interactionID)
          })
        }
      }

      // switch on current shadows
      this.highlightedResidue = residueName
      const interactionIDs = this.residueToInteractions.get(this.highlightedResidue)
      if (interactionIDs) {
        interactionIDs.forEach((interactionID) => {
          interactionComponent.enableShadow(interactionID)
        })
      }
    },
    async grow (fragmentSetID) {
      this.fragmentSets.some((fragmentSet) => {
        if (fragmentSet.id === fragmentSetID) {
          this.currentFragmentSet = fragmentSet
          return true
        }
      })
      try {
        if (!this.growingHandler.validate()) {
          return
        }
        const response = await fetch(this.baseUrl + '/growing', {
          method: 'post',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.growingHandler.makeRequest())
        })
        let growing = await response.json()
        // TODO switch to results after first results
        this.changeTab('results-tab-trigger')
        growing = await this.pollUpload(growing, this.baseUrl + '/growing/', 1000, (growing) => {
          this.growingHandler.load(growing)
        })
        this.growingHandler.load(growing)
      } catch (error) {
        console.error(error)
        this.growSubmitError = 'An error occurred during growing'
        this.pollingServer = false
      }
    },
    async hitChosen (hitID) {
      const hitProxy = this.hits.get(hitID)
      if (!hitProxy) {
        return
      }
      const hit = _.clone(hitProxy)
      await this.growingHandler.loadHit(hit)
      this.nglContext.render()
    }
  },
  mounted () {
    /*
    NGL members are intentionally declared here and implicitly unwatched. Data changes will not be
    detected by Vue. If they were watched, they would be wrapped in a proxy that destroys their
    functionality.
     */
    this.stage = new NGL.Stage('viewport')
    this.nglContext = new NGLContext(this.stage, viewDefinition)
    this.nglContext.debug = true
    this.nglContext.switchView('upload-tab')
    this.componentCache = new Map()

    // handlers
    this.structureUploadHandler = new StructureUploadHandler(this.nglContext, this.$data, this.componentCache)
    this.cutHandler = new CutHandler(this.nglContext, this.$data, this.componentCache)
    this.interactionHandler = new InteractionHandler(this.nglContext, this.$data, this.componentCache)
    this.growingHandler = new GrowingHandler(this.nglContext, this.$data, this.componentCache)

    window.addEventListener('resize', () => {
      this.stage.viewer.handleResize()
    })

    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      this.nglContext.switchView(view)
    })

    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      if (view.includes('interactions') && this.ligand && this.pocket) {
        const interaction = {
          ligand_id: this.ligand.id,
          complex_id: this.pocket.id
        }
        if (_.isEqual(this.interaction, interaction)) {
          return
        }
        this.updateInteractions(interaction)
      }
    })

    window.addEventListener('remove', (event) => {
      this.removeDerivedData(event.derivedFrom)
    })

    fetch(this.baseUrl + '/fragments').then(async (response) => {
      this.fragmentSets = await response.json()
    })
  }
}
</script>

<style>
html, body {
  height: 100%;
}

#app {
  height: 100%;
}

#viewport {
  overflow: hidden;
}
</style>
