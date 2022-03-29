<template>
  <div ref="header">
    <h2>Results</h2>
    <p v-if="this.loading">
      <span
        class="spinner-grow spinner-grow-sm"
        role="status"
      >
      </span>
      Growing...
    </p>
  </div>
  <div class="table-field" ref="table-field">
    <table class="table">
      <thead ref="table-head">
      <tr>
        <th>ID</th>
        <th>Score <i :class="'bi bi-caret-down' + ('score' === this.sortKey ? '-fill' : '')"></i></th>
        <th v-for="name in this.ensembleNames" :key="this.ensembleNames.indexOf(name)">
          {{ name }}<i :class="'bi bi-caret-down' + (name === this.sortKey ? '-fill' : '')"></i>
        </th>
        <th>Name</th>
      </tr>
      </thead>
      <tbody ref="table-body">
      <tr v-for="hit in this.sortedHits" :key="hit.id">
        <td>{{ hit.id }}</td>
        <td>{{ hit.score.toFixed(2) }}</td>
        <td v-for="name in this.ensembleNames" :key="this.ensembleNames.indexOf(name)">
          {{ hit.ensemble_scores[name].toFixed(2) }}
        </td>
        <td>{{ hit.name }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>

import * as _ from 'lodash'

export default {
  name: 'Results',
  emits: ['picked'],
  props: ['hits', 'loading'],
  data: () => {
    return {
      manualSelection: false,
      currentHitID: undefined,
      sortKey: 'score'
    }
  },
  computed: {
    /**
     * Compute a list of hits sorted by score
     * @returns {Array<object>}
     */
    sortedHits () {
      if (!this.hits || this.hits.length === 0) {
        return []
      }
      const sortedHits = Array.from(this.hits)
      sortedHits.sort((firstHit, secondHit) => {
        const firstSortValue = this.sortValue(firstHit)
        const secondSortValue = this.sortValue(secondHit)
        if (firstSortValue < secondSortValue) {
          return -1
        } else if (firstSortValue > secondSortValue) {
          return 1
        }
        return 0
      })
      return sortedHits
    },
    ensembleNames () {
      if (!this.hits || this.hits.length === 0 || _.isEmpty(this.hits[0].ensemble_scores)) {
        return []
      }
      return Array.from(Object.keys(this.hits[0].ensemble_scores))
    }
  },
  updated () {
    this.updateTableSize()
    if (this.sortedHits.length === 0) {
      return
    }
    let hitID
    if (this.manualSelection) {
      hitID = this.currentHitID
    } else {
      hitID = this.sortedHits[0].id
    }
    const rows = this.$refs['table-body'].querySelectorAll('tr')
    for (let i = 0; i < rows.length; i++) {
      const rowID = parseInt(rows[i].children[0].textContent)
      if (hitID === rowID) {
        this.applyRow(rows[i])
        break
      }
    }
  },
  methods: {
    /**
     * Update the table size responsively
     */
    updateTableSize () {
      const tableField = this.$refs['table-field']
      const title = this.$refs.header
      const margin = 16 // bootstrap adds bottom-margin to titles
      // Sometimes table field doesn't exist. Sometimes it does. Ask the Vue developers why.
      if (!tableField || !title) {
        return
      }
      tableField.style.height = 0 + 'px' // reduce height to avoid changing parent height
      tableField.style.height = (tableField.parentElement.clientHeight - title.clientHeight - margin) + 'px'
    },
    /**
     * Apply a hit row
     * @param row hit row
     */
    applyRow (row) {
      const rowID = parseInt(row.children[0].textContent)
      this.currentHitID = rowID
      this.$emit('picked', rowID)
      const rows = this.$refs['table-body'].querySelectorAll('tr.highlighted')
      for (let i = 0; i < rows.length; i++) {
        rows[i].classList.remove('highlighted')
      }
      row.classList.add('highlighted')
    },
    setSortKey (event) {
      let header = event.target
      if (header.tagName !== 'TH') {
        header = header.parentElement
      }
      // only headers with carets are sortable, headers without carets don't have children
      if (header.children.length === 0) {
        return
      }
      if (header.textContent.trim() === 'Score') {
        this.sortKey = 'score'
      } else {
        this.sortKey = header.textContent
      }
    },
    /**
     * Get sort value
     */
    sortValue (hit) {
      if (this.sortKey === 'score') {
        return hit[this.sortKey]
      }
      return hit.ensemble_scores[this.sortKey]
    }
  },
  mounted () {
    window.addEventListener('resize', () => {
      this.updateTableSize()
    })
    window.addEventListener('shown.bs.tab', () => {
      this.updateTableSize()
    })
    this.$refs['table-head'].addEventListener('click', (event) => {
      this.setSortKey(event)
    })
    // table click listener
    this.$refs['table-body'].addEventListener('click', (event) => {
      this.manualSelection = true
      this.applyRow(event.target.parentElement)
    })
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
