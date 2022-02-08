<template>
  <h2>Clip Ligand</h2>
  <div v-if="submitError" class="text-danger">{{ submitError }}</div>
  <div class="mb-3 row">
    <div class="col-auto">
      <label for="anchor-field" class="form-label">Anchor</label>
    </div>
    <div class="col-auto">
      <input
          type="text"
          id="anchor-field"
          class="form-control"
          name="anchor"
          :value="anchorName"
          readonly
      >
    </div>
  </div>
  <div class="mb-3">
    <button class="btn btn-secondary" id="switch-button" @click="switchAtoms">Switch</button>
  </div>
  <div class="mb-3 row">
    <div class="col-auto">
      <label for="linker-field" class="form-label">Linker</label>
    </div>
    <div class="col-auto">
      <input
          type="text"
          id="linker-field"
          class="form-control"
          name="linker"
          :value="linkerName"
          readonly
      >
    </div>
  </div>
  <div class="mb-3 row">
    <div class="col-auto">
      <button
          class="btn btn-primary"
          id="clip-button"
          @click="$emit('cut')"
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
        Clip
      </button>
    </div>
    <div class="col-auto">
      <button class="btn btn-secondary" id="reset-button" @click="$emit('reset')">Reset</button>
    </div>
  </div>
</template>

<script>
import { StructureUtils } from '@/internal/StructureUtils'

export default {
  name: 'Cut',
  emits: ['register', 'bondChosen', 'cut', 'reset'],
  props: {
    submitError: String,
    pollingServer: Boolean,
    view: String,
    ligand: Object
  },
  data: () => {
    return {
      anchor: undefined,
      linker: undefined
    }
  },
  computed: {
    anchorName () {
      return this.anchor ? this.anchor.atomname : ''
    },
    linkerName () {
      return this.linker ? this.linker.atomname : ''
    }
  },
  methods: {
    /**
     * Sets a clicked bond as the cut bond
     * @param {object} pickingProxy picking event
     */
    bondClicked (pickingProxy) {
      if (!pickingProxy || !pickingProxy.bond) {
        return
      }
      const bond = pickingProxy.bond
      const structure = this.ligand.component.structure
      if (!StructureUtils.structureContainsBond(structure, bond)) {
        return
      }

      if (StructureUtils.inSameRing(bond)) {
        return
      }
      this.setAtoms(bond)
    },
    /**
     * Reverses a cut bond when the bond marker is clicked
     * @param {object} pickingProxy picking event
     */
    bondMarkerClicked (pickingProxy) {
      if (!pickingProxy || !pickingProxy.arrow) {
        return
      }
      if (pickingProxy.arrow.shape.name === 'exitBondMarker') {
        this.switchAtoms()
      }
    },
    /**
     * Set the atoms of a bond to the anchor and linker
     * @param {object} bond NGL bond proxy
     */
    setAtoms (bond) {
      this.anchor = bond.atom1
      this.linker = bond.atom2
      if (bond.atom1.element === 'R#' ||
          (bond.atom2.element === 'C' && bond.atom1.element !== 'C')) {
        this.anchor = bond.atom2
        this.linker = bond.atom1
      }
      this.$emit('bondChosen', this.anchor, this.linker)
    },
    /**
     * Switch anchor and linker atoms
     */
    switchAtoms () {
      const tmp = this.anchor
      this.anchor = this.linker
      this.linker = tmp
      this.$emit('bondChosen', this.anchor, this.linker)
    }
  },
  mounted () {
    // listeners must be registered on a tick after mounting because the NGL viewer is only
    // initialized after everything is mounted
    this.$nextTick(() => {
      this.$emit('register', this.view, (pickingProxy) => {
        this.bondClicked(pickingProxy)
      })
      this.$emit('register', this.view, (pickingProxy) => {
        this.bondMarkerClicked(pickingProxy)
      })
    })
  }
}
</script>

<style scoped>

</style>
