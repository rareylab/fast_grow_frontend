<template>
  <form id="structure-upload-form">
    <h2>Query</h2>
    <div v-if="this.submitError" class="text-danger">{{ this.submitError }}</div>
    <div class="mb-3">
      <label for="query-fragment-set" class="form-label">
        Fragment Set
      </label> <i class="bi bi-info-circle" title="Fragments to grow with"></i>
      <select id="query-fragment-set" name="fragment-sets" class="form-select">
        <option
          v-for="fragmentSet in this.fragmentSets"
          :key="fragmentSet.id"
          :value="fragmentSet.id"
          :title="fragmentSet.description"
        >{{ fragmentSet.name }}
        </option>
      </select>
    </div>
    <div class="mb-3">
      <label for="query-complexes" class="form-label">
        Protein/Ensemble
      </label> <i class="bi bi-info-circle" title="Chosen complexes"></i>
      <div class="border rounded immutable-table">
        <table id="query-complexes" class="table">
          <thead>
          <tr>
            <th>Name</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="complex in this.complexes" :key="complex.id">
            <td>{{ complex.name }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="mb-3">
      <label for="query-core" class="form-label">
        Core
      </label> <i class="bi bi-info-circle" title="Core to grow"></i>
      <input
        class="form-control"
        type="text"
        name="core"
        id="query-core"
        :value="this.coreName"
        disabled
      >
    </div>
    <div class="mb-3">
      <label for="query-interactions" class="form-label">
        Interactions
      </label> <i class="bi bi-info-circle" title="Interactions / pharmacophoric constraints to use in growing"></i>
      <div class="border rounded immutable-table">
        <table id="query-interactions" class="table">
          <thead>
          <tr>
            <th>Source</th>
            <th>Type</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="interaction in this.sortedInteractions" :key="interaction.id">
            <td>{{ interaction.source }}</td>
            <td>{{ interaction.type }}</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="mb-3">
      <button
        class="btn btn-primary"
        id="grow-button"
        @click="this.submit"
        v-bind:disabled="submitError || pollingServer"
      >
        <span
          class="spinner-grow spinner-grow-sm"
          role="status"
          v-bind:aria-hidden="!pollingServer"
          v-if="pollingServer"
        >
        </span>
        <span class="visually-hidden" v-if="pollingServer">Loading...</span>
        Grow
      </button>
    </div>
  </form>
</template>

<script>
export default {
  name: 'Query',
  props: ['fragmentSets', 'complexes', 'core', 'interactions', 'submitError', 'pollingServer'],
  computed: {
    coreName () {
      return this.core ? this.core.name : ''
    },
    /**
     * Compute a list of interactions sorted by source
     * @returns {Array<object>}
     */
    sortedInteractions () {
      const sortedInteractions = this.interactions === undefined ? [] : this.interactions.slice()
      sortedInteractions.sort((interaction, otherInteraction) => {
        if (interaction.source === otherInteraction.source) {
          return 0
        }
        if (interaction.source < otherInteraction.source) {
          return -1
        }
        return 1
      })
      return sortedInteractions
    }
  },
  methods: {
    submit (event) {
      event.preventDefault()
      const fragmentSetID = parseInt(document.getElementById('query-fragment-set').value)
      this.$emit('grow', fragmentSetID)
    }
  }
}
</script>

<style scoped>
.immutable-table {
  background-color: #e9ecef
}
</style>
