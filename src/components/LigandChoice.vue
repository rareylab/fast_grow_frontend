<template>
  <h2 ref="title">Choose Ligand</h2>
  <div class="table-field" ref="table-field">
    <p>Click on the ligand in the viewer or the corresponding row in the table</p>
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="ligand in this.ligands" :key="ligand.id">
        <td>{{ ligand.id }}</td>
        <td>{{ ligand.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'LigandChoice',
  emits: ['register', 'ligandChosen'],
  props: {
    ligands: Array,
    view: String
  },
  methods: {
    /**
     * Update the table size responsively
     */
    updateTableSize () {
      const tableField = this.$refs['table-field']
      const title = this.$refs.title
      const margin = 8 // bootstrap adds bottom-margin to titles
      // Sometimes table field doesn't exist. Sometimes it does. Ask the Vue developers why.
      if (!tableField || !title) {
        return
      }
      tableField.style.height = 0 + 'px' // reduce height to avoid changing parent height
      tableField.style.height = (tableField.parentElement.clientHeight - title.clientHeight - margin) + 'px'
    },
    /**
     * NGL listener to chose ligands by clicking the structure
     * @param {object} pickingProxy pickingProxy of a ligand structure
     */
    ligandClicked (pickingProxy) {
      if (!pickingProxy || !pickingProxy.component) {
        return
      }
      // if the name is not of a ligand it won't be found
      const name = pickingProxy.component.structure.name
      const rows = this.$refs['table-body'].querySelectorAll('tr')
      for (let i = 0; i < rows.length; i++) {
        const rowName = rows[i].children[1].textContent
        if (name === rowName) {
          this.applyRow(rows[i])
          return
        }
      }
    },
    /**
     * Apply a row of the ligand choice table
     * @param {HTMLElement} row row to apply
     */
    applyRow (row) {
      const rowID = row.children[0].textContent
      this.$emit('ligandChosen', rowID)
      const rows = this.$refs['table-body'].querySelectorAll('tr.highlighted')
      for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove('highlighted')
      }
      row.classList.add('highlighted')
    }
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.updateTableSize()
    })
    window.addEventListener('shown.bs.tab', () => {
      this.updateTableSize()
    })
    // table click listener
    this.$refs['table-body'].addEventListener('click', (event) => {
      this.applyRow(event.target.parentElement)
    })
    // listeners must be registered on a tick after mounting because the NGL viewer is only
    // initialized after everything is mounted
    this.$nextTick(() => {
      this.$emit('register', this.view, (pickingProxy) => {
        this.ligandClicked(pickingProxy)
      })
    })
  }
}
</script>

<style>
.table-field {
  overflow-y: auto;
}

.highlighted {
  color: blue;
}
</style>
