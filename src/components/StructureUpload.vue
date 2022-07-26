<template>
  <form id="structure-upload-form">
    <h2>Structure Upload</h2>
    <p>Upload the system to grow in. Multiple PDBs are possible. An SD file can be uploaded to supersede the ligands in
      the PDB files. Either the ligands in the PDB files or the SD file will be cut to create the core to grow from.</p>
    <div v-if="submitError" class="text-danger">{{ submitError }}</div>
    <div v-if="formError" class="text-danger">{{ formError }}</div>
    <div class="mb-3">
      <label for="protein-file-field" class="form-label">
        Protein/Ensemble
      </label> <i class="bi bi-info-circle" title="Upload one or multiple PDB files"></i>
      <input
        class="form-control"
        type="file"
        name="ensemble"
        id="protein-file-field"
        accept=".pdb"
        @change="proteinFileCheck"
        multiple
      >
    </div>
    <div class="mb-3">
      <label for="ligand-file-field" class="form-label">
        Ligand
      </label> <i class="bi bi-info-circle" title="Upload a custom ligand SD file to replace ligands in the PDBs"></i>
      <input
        class="form-control"
        type="file"
        name="ligand"
        id="ligand-file-field"
        accept=".sdf"
        @change="ligandFileCheck"
      >
    </div>
    <button
      type="submit"
      class="btn btn-primary"
      id="structure-upload-button"
      v-bind:disabled="formError || submitError || pollingServer"
    >
      <span
        class="spinner-grow spinner-grow-sm"
        role="status"
        v-bind:aria-hidden="!pollingServer"
        v-if="pollingServer"
      ></span>
      <span class="visually-hidden" v-if="pollingServer">Loading...</span>
      Upload
    </button>
  </form>
</template>

<script>
export default {
  name: 'StructureUpload',
  props: {
    submitError: String,
    pollingServer: Boolean
  },
  data () {
    return {
      // 5 MB
      maxFileSize: 5 * 1000 * 1000,
      formError: undefined
    }
  },
  methods: {
    /**
     * Check file size and type of protein files
     * @param {Event} event change event
     */
    proteinFileCheck (event) {
      if (event.target.files.length > 5) {
        this.formError = 'Maximum ensemble size is 5 proteins'
        return
      }
      for (const file of event.target.files) {
        const extension = file.name.split('.').pop()
        if (extension !== 'pdb') {
          this.formError = `Protein file with unsupported extension: ${extension} (Supported: "pdb")`
          return
        }
        if (file.size > this.maxFileSize) {
          this.formError = 'Maximum protein file size is 5 MB'
          return
        }
        this.formError = undefined
      }
    },

    /**
     * Check file size and type of ligand file
     * @param {Event} event change event
     */
    ligandFileCheck (event) {
      const file = event.target.files[0]
      if (!file) {
        this.formError = undefined
        return
      }
      const extension = file.name.split('.').pop()
      if (extension !== 'sdf') {
        this.formError = `Ligand file with unsupported extension: ${extension} (Supported: "sdf")`
        return
      }
      if (file.size > this.maxFileSize) {
        this.formError = 'Maximum ligand file size is 5 MB'
        return
      }
      this.formError = undefined
    }
  }
}
</script>
