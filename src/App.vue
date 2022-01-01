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
        </ul>
        <div class="tab-content flex-grow-1" id="tab-content">
          <div
              class="tab-pane fade show active"
              id="structure-tab"
              role="tabpanel"
              aria-labelledby="structure-tab"
          >
            <structure-upload
                @submit="structureUpload"
                @change="structureSubmitError = undefined"
                :submit-error="structureSubmitError"
                :polling-server="pollingServer"
            ></structure-upload>
          </div>
          <div
              class="tab-pane fade h-100"
              id="ligands-tab"
              role="tabpanel"
              aria-labelledby="ligands-tab"
          >
            <ligand-choice
                @register="registerListener"
                @ligandChosen="ligandChosen"
                :ligands="ligands"
                :view="'ligands-tab'"
            ></ligand-choice>
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
import { EnsembleLoader } from '@/internal/EnsembleLoader'

// components
import StructureUpload from '@/components/StructureUpload'
import LigandChoice from '@/components/LigandChoice'
import { StructureUtils } from '@/internal/StructureUtils'

const viewDefinition = {
  'structure-tab': {
    visible: ['protein', 'pocket', ['ligand', 'ligands']],
    focus: ['ligand', 'ligands', 'protein']
  },
  'ligands-tab': {
    // both ligands an ligand are visible so both the choices and the chosen are visible
    visible: ['protein', 'pocket', 'ligands', 'ligand'],
    focus: ['ligand', 'ligands', 'protein']
  }
}

export default {
  name: 'FastGrow',
  components: {
    LigandChoice,
    StructureUpload
  },
  data () {
    return {
      structureSubmitError: undefined,
      pollingServer: false,
      baseUrl: 'http://localhost:8000', // TODO edit in production
      ligands: []
    }
  },
  methods: {
    /**
     * Change active tab
     * @param {HTMLElement} tabTrigger
     */
    changeTab (tabTrigger) {
      const tabElement = document.getElementById(tabTrigger)
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
    async structureUpload (event) {
      event.preventDefault()
      const formData = new FormData()
      const ensembleField = event.target.ensemble
      if (ensembleField.files.length < 1) {
        this.structureSubmitError = 'At least 1 protein is required'
        return
      }
      for (const protein of ensembleField.files) {
        formData.append('ensemble[]', protein)
      }
      formData.append('ligand', event.target.ligand.files[0])
      try {
        const ensemble = await this.pollUpload(formData)
        this.nglContext.clearComponents()
        await new EnsembleLoader(ensemble, this.structureComponents, this.nglContext).run()
        this.ligands = this.structureComponents.get('ligands').structureModels
        this.changeTab('ligands-tab-trigger')
      } catch (error) {
        this.structureSubmitError = 'An error occurred while uploading the structure'
        this.pollingServer = false
      }
    },
    async pollUpload (formData) {
      this.pollingServer = true
      const response = await fetch(this.baseUrl + '/complex', {
        method: 'post',
        body: formData
      })
      let ensemble = await response.json()
      while (ensemble.status === 'pending') {
        await Utils.sleep(1000)
        const response = await fetch(this.baseUrl + '/complex/' + ensemble.id)
        ensemble = await response.json()
      }
      this.pollingServer = false
      return ensemble
    },
    async ligandChosen (name) {
      if (!this.nglContext.components.has('ligand')) {
        this.nglContext.registerComponent('ligand', this.structureComponents.get(name))
      } else {
        this.nglContext.replaceComponent('ligand', this.structureComponents.get(name))
      }
      const ligand = this.nglContext.components.get('ligand').parents[0]
      const protein = this.nglContext.components.get('protein').parents[0]
      const pocketRepresentation = StructureUtils.addPocket(ligand, protein)
      if (!this.nglContext.components.has('pocket')) {
        this.nglContext.registerComponent('pocket', pocketRepresentation)
      } else {
        this.nglContext.replaceComponent('pocket', pocketRepresentation)
      }
      this.nglContext.render()
    }
  },
  mounted () {
    this.stage = new NGL.Stage('viewport')
    this.nglContext = new NGLContext(this.stage, viewDefinition)
    this.nglContext.debug = true
    this.nglContext.switchView('structure-tab')
    this.structureComponents = new Map()
    window.addEventListener('resize', () => {
      this.stage.viewer.handleResize()
    })
    window.addEventListener('show.bs.tab', (event) => {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      this.nglContext.switchView(view)
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
