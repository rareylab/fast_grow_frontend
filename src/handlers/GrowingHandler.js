import { StructureModelComponent } from '@/nglComponents/StructureModelComponent'
import { StructureUtils } from '@/utils/StructureUtils'

export class GrowingHandler {
  constructor (nglContext, data, componentCache) {
    this.nglContext = nglContext
    this.data = data
    this.componentCache = componentCache
  }

  validate () {
    if (!this.data.ensemble) {
      this.data.growSubmitError = 'No structure data'
      return false
    }
    if (!this.data.core) {
      this.data.growSubmitError = 'No core defined'
      return false
    }
    if (!this.data.currentFragmentSet) {
      this.data.growSubmitError = 'No fragments defined'
      return false
    }
    return true
  }

  makeRequest () {
    const request = {
      ensemble: this.data.ensemble.id,
      core: this.data.core.id,
      fragment_set: this.data.currentFragmentSet.id
    }
    if (this.data.pickedInteractions.size > 0) {
      const interactions = Array.from(this.data.pickedInteractions.values())
      request.search_points = GrowingHandler.makeSearchPointQuery(interactions)
    }
    return request
  }

  static makeSearchPointQuery (interactions, radius = 3.0) {
    if (interactions.length === 0) {
      return undefined
    }
    return this.makeSearchPointQueryRecursive(interactions, radius)
  }

  static makeSearchPointQueryRecursive (interactions, radius) {
    if (interactions.length === 1) {
      return {
        type: 'MATCH',
        mode: 'INCLUDE',
        radius: radius,
        searchPoint: interactions[0]
      }
    }
    return {
      type: 'BOOLEAN',
      relation: 'AND',
      // splice() changes the object in place, cutting off the first element
      left: this.makeSearchPointQueryRecursive(interactions.splice(0, 1), radius),
      // interactions without the first element are passed here
      right: this.makeSearchPointQueryRecursive(interactions, radius)
    }
  }

  load (growing) {
    this.data.growing = growing
    if (growing.hits) {
      const newHits = new Map()
      // keep all hits that have been loaded before
      for (const hitID of this.data.hits.keys()) {
        if (this.componentCache.has('hit_' + hitID)) {
          newHits.set(hitID, this.data.hits.get(hitID))
        }
      }
      growing.hits.forEach((hit) => {
        newHits.set(hit.id, hit)
      })
      this.data.hits = newHits
    }
  }

  async loadHit (hit) {
    const currentHitComponent = this.nglContext.components.get('hit')
    if (currentHitComponent && currentHitComponent.structureModel.id === hit.id) {
      return
    }
    let hitComponent
    if (this.componentCache.has('hit_' + hit.id)) {
      hitComponent = this.componentCache.get('hit_' + hit.id)
    } else {
      const component = await StructureUtils.addStructure(this.nglContext.stage, hit)
      hit.component = component
      const hitRepr = component.addRepresentation('licorice', {
        visible: false,
        multipleBond: true
      })
      hitComponent = new StructureModelComponent(hit, hitRepr)
      this.componentCache.set('hit_' + hit.id, hitComponent)
    }
    this.nglContext.registerReplaceComponent('hit', hitComponent)
  }
}
