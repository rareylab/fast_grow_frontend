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
              :polling-server="this.pollingServer"
              :submit-error="this.structureUploadModel.structureSubmitError"
              @submit="this.structureUpload"
              @change="this.structureUploadModel.structureSubmitError = undefined"
            ></structure-upload>
          </div>
          <div
            class="tab-pane fade h-100"
            id="ligands-tab"
            role="tabpanel"
            aria-labelledby="ligands-tab"
          >
            <ligand-choice
              :view="'ligands-tab'"
              :ligands="this.structureUploadModel.ligands"
              @register="this.registerListener"
              @ligandChosen="this.ligandChosen"
            ></ligand-choice>
          </div>
          <div
            class="tab-pane fade h-100"
            id="pockets-tab"
            role="tabpanel"
            aria-labelledby="pockets-tab"
          >
            <pocket-choice
              :complexes="this.structureUploadModel.complexes"
              @pocketChosen="this.pocketChosen"
            ></pocket-choice>
          </div>
          <div
            class="tab-pane fade h-100"
            id="cut-tab"
            role="tabpanel"
            aria-labelledby="cut-tab"
          >
            <cut
              :view="'cut-tab'"
              :polling-server="this.pollingServer"
              :submit-error="this.cutModel.cutSubmitError"
              :ligand="this.structureUploadModel.ligand"
              ref="clip"
              @register="this.registerListener"
              @bondChosen="this.bondChosen"
              @cut="this.bondCut"
              @reset="this.coreReset"
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
              :submit-error="this.interactionModel.interactionError"
              :loading="this.interactionModel.loadingInteractions"
              :interactions="this.interactionModel.ligandInteractions"
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
              :submit-error="this.interactionModel.interactionError"
              :loading="this.interactionModel.loadingInteractions"
              :interactions="this.interactionModel.waterInteractions"
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
              :interactions="this.interactionModel.pocketInteractions"
              :loading="this.interactionModel.loadingInteractions"
              :submit-error="this.interactionModel.interactionError"
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
              :polling-server="this.pollingServer"
              :submit-error="this.growingModel.growSubmitError"
              :fragment-sets="this.growingModel.fragmentSets"
              :complexes="this.structureUploadModel.complexes"
              :core="this.cutModel.core"
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
              :loading="this.pollingServer"
              :hits="this.growingModel.hitsArray"
              :download="this.growingModel.growing ? this.baseUrl + '/growing/' + this.growingModel.growing.id + '/download' : ''"
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
    // both ligands and ligand are visible so both the choices and the chosen are visible
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
      pollingServer: false,
      baseUrl: 'http://localhost:8000', // TODO edit in production
      // data variables
      // this state is duplicated from the nglContext because the Vue proxy breaks NGL components
      pickedInteractions: new Map(),
      structureUploadModel: {
        structureSubmitError: undefined,
        ensemble: undefined,
        complexes: undefined,
        ligands: undefined,
        ligand: undefined,
        pocket: undefined
      },
      cutModel: {
        cutSubmitError: undefined,
        bondMarker: undefined,
        linker: undefined,
        anchor: undefined,
        core: undefined
      },
      interactionModel: {
        interactionError: undefined,
        loadingInteractions: false,
        currentInteractions: undefined,
        ligandInteractions: undefined,
        waterInteractions: undefined,
        pocketInteractions: undefined,
        residueToInteractions: undefined,
        highlightedResidue: undefined
      },
      growingModel: {
        growSubmitError: undefined,
        fragmentSets: undefined,
        currentFragmentSet: undefined,
        growing: undefined,
        hits: new Map(),
        hitsArray: []
      }
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
          // copy interaction because loading a Vue proxied object into the NGL throws errors
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
    }
  },
  computed: {
    interactionsArray () {
      return Array.from(this.pickedInteractions.values())
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
      while (model.status === 'pending') {
        await Utils.sleep(interval)
        const response = await fetch(pollUrl + model.id)
        model = await response.json()
        if (updateCallback) {
          updateCallback(model)
        }
      }
      return model
    },
    async structureUpload (event) {
      await this.structureUploadHandler.structureUpload(event, this.baseUrl)
    },
    ligandChosen (event) {
      this.structureUploadHandler.ligandChosen(event)
    },
    pocketChosen (event) {
      this.structureUploadHandler.pocketChosen(event)
    },
    bondChosen (anchor, linker) {
      this.cutHandler.bondChosen(anchor, linker)
    },
    async bondCut () {
      const ligand = this.structureUploadModel.ligand
      await this.cutHandler.bondCut(ligand, this.baseUrl)
    },
    coreReset () {
      this.cutHandler.coreReset()
    },
    async updateInteractions (interactions) {
      await this.interactionHandler.updateInteractions(interactions, this.baseUrl)
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
      this.interactionHandler.toggleInteractionShadows()
    },
    toggleResidueShadows (event) {
      this.interactionHandler.toggleResidueShadows(event)
    },
    async grow (fragmentSetID) {
      const ensemble = this.structureUploadModel.ensemble
      const core = this.cutModel.core
      await this.growingHandler.grow(core, ensemble, this.interactionsArray, fragmentSetID, this.baseUrl)
    },
    async hitChosen (event) {
      await this.growingHandler.hitChosen(event)
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
    this.structureUploadHandler = new StructureUploadHandler(this.nglContext, this.$data.structureUploadModel, this.componentCache)
    this.cutHandler = new CutHandler(this.nglContext, this.$data.cutModel, this.componentCache)
    this.interactionHandler = new InteractionHandler(this.nglContext, this.$data.interactionModel, this.componentCache)
    this.growingHandler = new GrowingHandler(this.nglContext, this.$data.growingModel, this.componentCache)

    window.addEventListener('resize', () => {
      this.stage.viewer.handleResize()
    })

    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      this.nglContext.switchView(view)
    })

    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      if (view.includes('interactions') && this.structureUploadModel.ligand && this.structureUploadModel.pocket) {
        const interactions = {
          ligand_id: this.structureUploadModel.ligand.id,
          complex_id: this.structureUploadModel.pocket.id
        }
        if (_.isEqual(this.interactionModel.currentInteractions, interactions)) {
          return
        }
        this.updateInteractions(interactions)
      }
    })

    window.addEventListener('remove', (event) => {
      this.removeDerivedData(event.derivedFrom)
    })

    window.addEventListener('pollingOn', () => {
      this.pollingServer = true
    })

    window.addEventListener('pollingOff', () => {
      this.pollingServer = false
    })

    window.addEventListener('changeTab', (event) => {
      this.changeTab(event.detail.tabTrigger)
    })

    fetch(this.baseUrl + '/fragments').then(async (response) => {
      this.growingModel.fragmentSets = await response.json()
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
