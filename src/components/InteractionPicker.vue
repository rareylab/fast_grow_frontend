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
        <th>No. <i class="bi bi-caret-down"></i></th>
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
    sortedInteractions () {
      const interactions = this.pickedInteractions === undefined ? [] : Array.from(this.pickedInteractions.values())
      interactions.sort(this.compareID)
      return interactions
    }
  },
  methods: {
    compareID (first, second) {
      if (first.id < second.id) {
        return -1
      }
      return 1
    },
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
    removeRow (event) {
      const row = event.target.parentElement.parentElement
      const interactionID = parseInt(row.children[0].textContent)
      this.removeInteraction(interactionID)
    },
    removeInteraction (interactionID) {
      this.pickedInteractions.delete(interactionID)
      this.$emit('picked', interactionID)
    },
    addInteraction (interaction) {
      this.pickedInteractions.set(interaction.id, interaction)
      this.$emit('picked', interaction.id)
    },
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
