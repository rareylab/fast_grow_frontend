<template>
  <h2 ref="title">Choose Pocket</h2>
  <div class="table-field" ref="table-field">
    <table class="table">
      <thead>
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Name</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="complex in this.complexes" :key="complex.id">
        <td>{{ complex.id }}</td>
        <td>{{ complex.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'PocketChoice',
  emits: ['register', 'pocketChosen'],
  props: {
    complexes: Array,
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
     * Apply a row of the pocket choice table
     * @param {HTMLElement} row row to apply
     */
    applyRow (row) {
      const rowID = row.children[0].textContent
      this.$emit('pocketChosen', rowID)
      const rows = this.$refs['table-body'].querySelectorAll('tr')
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
  }
}
</script>

<style scoped>

</style>
