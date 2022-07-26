<template>
  <div ref="header">
    <h2>Choose Pocket Interactions</h2>
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
    <p>Pick generated counter interactions to grow toward</p>
    <div class="form-check">
      <input
        class="form-check-input"
        type="checkbox"
        id="shadow-check"
        @change="$emit('change', $event)"
      >
      <label class="form-check-label" for="shadow-check" id="shadow-check-label">
        Show all interaction shadows
      </label>
    </div>
    <table class="table">
      <thead>
      <tr>
        <th>No. <i class="bi bi-caret-down-fill"></i></th>
        <th>Type</th>
        <th>Residue</th>
        <th>Action</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="interaction in this.sortedInteractions" :key="interaction.id">
        <td>{{ interaction.id }}</td>
        <td>{{ interaction.type }}</td>
        <td>{{ interaction.residue }}</td>
        <td>
          <button class="btn btn-secondary" @click="this.removeRow">remove</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  name: 'InteractionPicker',
  emits: ['register', 'picked', 'change', 'highlight'],
  props: {
    view: String,
    interactions: Array,
    loading: Boolean,
    submitError: String
  },
  data: () => {
    return {
      pickedInteractions: new Map()
    }
  },
  computed: {
    /**
     * Compute an array of interactions sorted by ID
     * @returns {Array<object>} interactions sorted by ID
     */
    sortedInteractions () {
      const interactions = this.pickedInteractions === undefined ? [] : Array.from(this.pickedInteractions.values())
      interactions.sort(this.compareID)
      return interactions
    }
  },
  methods: {
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
     * Handle a clicked interaction
     * @param {object} pickingProxy clicked interaction
     */
    interactionClicked (pickingProxy) {
      if (!pickingProxy || !pickingProxy.sphere) {
        return
      }
      let pickedInteraction
      this.interactions.some((interaction) => {
        // deep equality necessary because objects are wrapped by vue
        if (_.isEqual(interaction.component.shape, pickingProxy.sphere.shape)) {
          pickedInteraction = interaction
          return true
        }
        return false
      })
      if (!pickedInteraction) {
        return
      }
      if (this.pickedInteractions.has(pickedInteraction.id)) {
        this.removeInteraction(pickedInteraction.id)
      } else {
        this.addInteraction(pickedInteraction)
      }
    },
    /**
     * Remove an interaction row from the picked interactions
     * @param {Event} event row clicked event
     */
    removeRow (event) {
      const row = event.target.parentElement.parentElement
      const interactionID = parseInt(row.children[0].textContent)
      this.removeInteraction(interactionID)
    },
    /**
     * Remove an interaction
     * @param {integer} interactionID ID of an interaction
     */
    removeInteraction (interactionID) {
      if (this.pickedInteractions.has(interactionID)) {
        this.pickedInteractions.delete(interactionID)
        this.$emit('picked', interactionID)
      }
    },
    /**
     * Add an interaction
     * @param {object} interaction interaction to add
     */
    addInteraction (interaction) {
      this.pickedInteractions.set(interaction.id, interaction)
      this.$emit('picked', interaction.id)
    },
    /**
     * Handle a residue highlight
     * @param {object} pickingProxy clicked residue
     */
    residueHighlighted (pickingProxy) {
      if (!pickingProxy) {
        return
      }
      let residue
      if (pickingProxy.atom) {
        residue = pickingProxy.atom.residue
      } else if (pickingProxy.bond) {
        residue = pickingProxy.bond.atom1.residue
      } else {
        return
      }
      const residueName = residue.resname + '_' + residue.chainname + '_' + residue.resno
      this.$emit('highlight', residueName)
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.$emit('register', this.view, (pickingProxy) => {
        this.interactionClicked(pickingProxy)
      })
      this.$emit('register', this.view, (pickingProxy) => {
        this.residueHighlighted(pickingProxy)
      })
    })
  }
}
</script>

<style scoped>
#shadow-check {
  margin-left: -1em;
}

#shadow-check-label {
  margin-left: 0.5em;
}
</style>
