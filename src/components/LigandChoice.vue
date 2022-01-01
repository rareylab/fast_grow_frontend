<template>
  <div class="table-field" ref="table-field">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">Name</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="ligand in this.ligands" :key="ligand.id">
        <td>{{ ligand.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'LigandChoice',
  props: {
    ligands: Array,
    view: String
  },
  computed: {
    rows () {
      return this.$refs['table-body'].querySelectorAll('tr')
    }
  },
  methods: {
    /**
     * Update the table size responsively
     */
    updateTableSize () {
      const tableField = this.$refs['table-field']
      // Sometimes table field doesn't exist. Sometimes it does. Ask the Vue developers why.
      if (!tableField) {
        return
      }
      tableField.style.height = 0 + 'px' // reduce height to avoid changing parent height
      tableField.style.height = tableField.parentElement.clientHeight + 'px'
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
      for (let i = 0; i < this.rows.length; i++) {
        const rowName = this.rows[i].children[0].textContent
        if (name === rowName) {
          this.applyRow(this.rows[i])
          return
        }
      }
    },
    /**
     * Apply a row of the ligand choice table
     * @param {HTMLElement} row row to apply
     */
    applyRow (row) {
      const rowName = row.children[0].textContent
      this.$emit('ligandChosen', rowName)
      for (let i = 0; i < this.rows.length; i++) {
        this.rows[i].classList.remove('highlighted')
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
