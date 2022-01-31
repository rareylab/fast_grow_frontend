<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <div class="col-7 h-100">
        <div id="viewport" class="h-100"></div>
      </div>
      <div class="col-5 h-100 d-flex flex-column">
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
                id="structure-tab-trigger"
                class="nav-link active"
                data-bs-toggle="tab"
                data-bs-target="#structure-tab"
                type="button"
                role="tab"
                aria-controls="structure-tab"
                aria-selected="true"
            >
              Structure
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
                id="ligands-tab-trigger"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#ligands-tab"
                type="button"
                role="tab"
                aria-controls="ligands-tab"
            >
              Ligands
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button
                id="pockets-tab-trigger"
                class="nav-link"
                data-bs-toggle="tab"
                data-bs-target="#pockets-tab"
                type="button"
                role="tab"
                aria-controls="pockets-tab"
            >
              Pockets
            </button>
          </li>
        </ul>
        <div class="tab-content flex-grow-1" id="tab-content">
          <div
              class="tab-pane fade show active"
              id="structure-tab"
              role="tabpanel"
              aria-labelledby="structure-tab"
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
                :view="'pockets-tab'"
            ></pocket-choice>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as bootstrap from 'bootstrap'
import * as NGL from 'ngl'
import { NGLContext } from '@/internal/NGLContext'
import { Utils } from '@/internal/Utils'

// components
import StructureUpload from '@/components/StructureUpload'
import LigandChoice from '@/components/LigandChoice'
import { StructureUploadHandler } from '@/internal/StructureUploadHandler'
import PocketChoice from '@/components/PocketChoice'
import { StructureUtils } from '@/internal/StructureUtils'

const viewDefinition = {
  'structure-tab': {
    visible: ['ensemble', 'pocket', ['ligand', 'ligands']],
    focus: ['ligand', 'ligands', 'ensemble']
  },
  'ligands-tab': {
    // both ligands an ligand are visible so both the choices and the chosen are visible
    visible: ['ensemble', 'pocket', 'ligands', 'ligand'],
    focus: ['ligand', 'ligands', 'protein']
  },
  'pockets-tab': {
    visible: ['ensemble', 'pocket', 'ligand'],
    focus: ['ligand', 'protein']
  }
}

export default {
  name: 'FastGrow',
  components: {
    PocketChoice,
    LigandChoice,
    StructureUpload
  },
  data () {
    return {
      structureSubmitError: undefined,
      pollingServer: false,
      baseUrl: 'http://localhost:8000', // TODO edit in production
      // this state is duplicated from the nglContext because the Vue proxy breaks NGL components
      ligands: [],
      ligand: undefined,
      complexes: [],
      pocket: undefined
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
      const derivedData = ['ligands', 'ligand', 'pocket']
      for (let index = derivedData.indexOf(derivedFrom); index < derivedData.length; index++) {
        const dataName = derivedData[index]
        if (this.nglContext.components.has(dataName)) {
          this.nglContext.deregisterComponent(dataName)
          this[dataName] = undefined
          // TODO shrink the cache?
        }
      }
    },
    async pollUpload (model, pollUrl, interval = 1000) {
      this.pollingServer = true
      while (model.status === 'pending') {
        await Utils.sleep(interval)
        const response = await fetch(pollUrl + model.id)
        model = await response.json()
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
          // TODO handle switch to bond choice
          this.changeTab('ligands-tab-trigger')
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
      const pocketRepresentation = StructureUtils.addPocket(
        this.ligand.component,
        complexComponent.structureModel.component
      )
      this.pocket = pocketRepresentation
      this.nglContext.registerReplaceComponent('pocket', pocketRepresentation)
      this.nglContext.render()
    }
  },
  mounted () {
    /*
    NGL members are intentionally declared here and implicitly unwatched. Data changes will not be
    detected by Vue. If they were watched they would be wrapped in a proxy that destroys their
    functionality.
     */
    this.stage = new NGL.Stage('viewport')
    this.nglContext = new NGLContext(this.stage, viewDefinition)
    this.nglContext.debug = true
    this.nglContext.switchView('structure-tab')
    this.componentCache = new Map()

    // handlers
    this.structureUploadHandler = new StructureUploadHandler(this.$data, this.nglContext, this.componentCache)

    window.addEventListener('resize', () => {
      this.stage.viewer.handleResize()
    })
    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      this.nglContext.switchView(view)
    })
    window.addEventListener('remove', (event) => {
      this.removeDerivedData(event.derivedFrom)
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
