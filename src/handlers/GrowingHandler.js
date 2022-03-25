import { StructureModelComponent } from '@/nglComponents/StructureModelComponent'
import { StructureUtils } from '@/utils/StructureUtils'
import _ from 'lodash'
import { Utils } from '@/utils/Utils'

export class GrowingHandler {
  constructor (nglContext, model, componentCache) {
    this.nglContext = nglContext
    this.model = model
    this.componentCache = componentCache
  }

  validate (ensemble, core) {
    if (!ensemble) {
      this.model.growSubmitError = 'No structure data'
      return false
    }
    if (!core) {
      this.model.growSubmitError = 'No core defined'
      return false
    }
    if (!this.model.currentFragmentSet) {
      this.model.growSubmitError = 'No fragments defined'
      return false
    }
    return true
  }

  makeRequest (ensemble, core, interactions) {
    const request = {
      ensemble: ensemble.id,
      core: core.id,
      fragment_set: this.model.currentFragmentSet.id
    }
    if (interactions.length > 0) {
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

  async grow (core, ensemble, interactions, fragmentSetID, baseUrl) {
    this.model.fragmentSets.some((fragmentSet) => {
      if (fragmentSet.id === fragmentSetID) {
        this.model.currentFragmentSet = fragmentSet
        return true
      }
    })
    try {
      if (!this.validate(ensemble, core)) {
        return
      }
      window.dispatchEvent(new CustomEvent('pollingOn', { bubbles: true }))
      const response = await fetch(baseUrl + '/growing', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.makeRequest(ensemble, core, interactions))
      })
      let growing = await response.json()
      // TODO switch to results after first results
      window.dispatchEvent(new CustomEvent('changeTab', {
        bubbles: true,
        detail: { tabTrigger: 'results-tab-trigger' }
      }))
      growing = await Utils.pollUpload(growing, baseUrl + '/growing/', 1000, (growing) => {
        this.load(growing)
      })
      this.load(growing)
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
    } catch (error) {
      window.dispatchEvent(new CustomEvent('pollingOff', { bubbles: true }))
      console.error(error)
      this.model.growSubmitError = 'An error occurred during growing'
      this.pollingServer = false
    }
  }

  load (growing) {
    this.model.growing = growing
    if (growing.hits) {
      const newHits = new Map()
      // keep all hits that have been loaded before
      for (const hitID of this.model.hits.keys()) {
        if (this.componentCache.has('hit_' + hitID)) {
          newHits.set(hitID, this.model.hits.get(hitID))
        }
      }
      growing.hits.forEach((hit) => {
        newHits.set(hit.id, hit)
      })
      this.model.hits = newHits
      this.model.hitsArray = Array.from(newHits.values())
    }
  }

  async hitChosen (hitID) {
    const hitProxy = this.model.hits.get(hitID)
    if (!hitProxy) {
      return
    }
    const hit = _.clone(hitProxy)
    await this.loadHit(hit)
    this.nglContext.render()
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
