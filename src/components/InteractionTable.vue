<template>
  <div ref="header">
    <h2>Choose {{ this.title }} Interactions</h2>
    <p v-if="this.loading">
      <span
        class="spinner-grow spinner-grow-sm"
        role="status"
      >
      </span>
      Loading...
    </p>
    <div v-if="submitError" class="text-danger">{{ submitError }}</div>
  </div>
  <div class="table-field" ref="table-field">
    <table class="table">
      <thead>
      <tr>
        <th>No. <i class="bi bi-caret-down"></i></th>
        <th>Type</th>
        <th>Score</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="interaction in this.sortedInteractions" :key="interaction.id">
        <td>{{ interaction.id }}</td>
        <td>{{ interaction.ligandInteraction.type }}</td>
        <td>{{ interaction.score.toFixed(2) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'InteractionTable',
  emits: ['register', 'picked'],
  props: {
    title: String,
    view: String,
    interactions: Array,
    loading: Boolean,
    submitError: String
  },
  computed: {
    /**
     * Compute an array of interactions sorted by ID
     * @returns {Array<object>} interactions sorted by ID
     */
    sortedInteractions () {
      const interactions = this.interactions === undefined ? [] : this.interactions.slice()
      interactions.sort(this.compareID)
      return interactions
    }
  },
  methods: {
    /**
     * Update the table size responsively
     */
    updateTableSize () {
      const tableField = this.$refs['table-field']
      const header = this.$refs.header
      const margin = 16 // bootstrap adds bottom-margin to titles
      // Sometimes table field doesn't exist. Sometimes it does. Ask the Vue developers why.
      if (!tableField || !header) {
        return
      }
      tableField.style.height = 0 + 'px' // reduce height to avoid changing parent height
      tableField.style.height = (tableField.parentElement.clientHeight - header.clientHeight - margin) + 'px'
    },
    /**
     * sorting by ascending ID
     * @param {object} first first element with ID
     * @param {object} second second element with ID
     * @returns {number} result of the comparison
     */
    compareID (first, second) {
      if (first.id < second.id) {
        return -1
      }
      return 1
    },
    /**
     * Apply a clicked interation row
     * @param row interaction row
     */
    applyRow (row) {
      const rowID = row.children[0].textContent
      this.$emit('picked', parseInt(rowID))
      if (row.classList.contains('highlighted')) {
        row.classList.remove('highlighted')
      } else {
        row.classList.add('highlighted')
      }
    },
    /**
     * Handle a clicked interaction
     * @param {objects} pickingProxy clicked interaction
     */
    interactionClicked (pickingProxy) {
      if (!pickingProxy || (!pickingProxy.cylinder && !pickingProxy.sphere)) {
        return
      }
      const pickedInteractionShape = pickingProxy.cylinder || pickingProxy.sphere
      let pickedInteraction
      this.sortedInteractions.some((interaction) => {
        // deep equality necessary because objects are wrapped by vue
        if (_.isEqual(interaction.component.shape, pickedInteractionShape.shape)) {
          pickedInteraction = interaction
          return true
        }
        return false
      })
      if (!pickedInteraction) {
        return
      }
      const rows = this.$refs['table-body'].querySelectorAll('tr')
      for (let i = 0; i < rows.length; i++) {
        const rowID = parseInt(rows[i].children[0].textContent)
        if (rowID === pickedInteraction.id) {
          this.applyRow(rows[i])
          return
        }
      }
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
        this.interactionClicked(pickingProxy)
      })
    })
  },
  updated () {
    this.updateTableSize()
  }
}
</script>

<style scoped>
.table-field {
  overflow-y: auto;
}

.highlighted {
  color: blue;
}
</style>
