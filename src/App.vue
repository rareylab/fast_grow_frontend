<template>
  <div class="container-fluid h-100">
    <div class="row h-100">
      <div class="col-7 h-100">
        <div id="viewport" class="h-100"></div>
      </div>
      <div class="col-5 h-100">
        <ul class="nav nav-tabs" role="tablist">
          <li class="nav-item" role="presentation">
            <button
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
        </ul>
        <div class="tab-content">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as NGL from 'ngl'
import { NGLContext } from '@/internal/NGLContext'
import StructureUpload from '@/components/StructureUpload'
import { Utils } from '@/internal/Utils'
import { EnsembleLoader } from '@/internal/EnsembleLoader'

const viewDefinition = {
  'structure-tab': {
    visible: ['protein', ['ligand', 'ligands']],
    focus: ['ligand', 'ligands', 'protein']
  }
}

export default {
  name: 'FastGrow',
  components: {
    StructureUpload
  },
  data () {
    return {
      structureSubmitError: undefined,
      pollingServer: false,
      baseUrl: 'http://localhost:8000' // TODO edit in production
    }
  },
  methods: {
    changeTab (event) {
      const view = event.target.getAttribute('data-bs-target').slice(1)
      console.log(view)
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
      const ensemble = await this.pollUpload(formData)
      this.nglContext.clearComponents()
      await new EnsembleLoader(ensemble, this.structureComponents, this.nglContext).run()
      this.nglContext.render()
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
      this.changeTab(event)
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
