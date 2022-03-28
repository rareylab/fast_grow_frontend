import { expect } from 'chai'
import { GrowingHandler } from '@/handlers/GrowingHandler'
import { NGLContext } from '@/NGLContext'
import { TestData } from '../test_files/TestData'
import _ from 'lodash'
import { MockStage } from '../utils/Mocks'

describe('GrowingHandler', () => {
  it('makes request bodies', () => {
    const nglContext = new NGLContext(new MockStage())
    const model = { currentFragmentSet: { id: 1 } }
    const growingHandler = new GrowingHandler(nglContext, model)
    const request = growingHandler.makeRequest({ id: 1 }, { id: 1 }, _.cloneDeep(TestData.pickedInteractions))
    expect(JSON.stringify(request)).to.equal(JSON.stringify(TestData.query))
  })

  it('loads a growing', () => {
    const nglContext = new NGLContext(new MockStage())
    const model = { hits: new Map() }
    const componentCache = new Map()
    const growingHandler = new GrowingHandler(nglContext, model, componentCache)
    const growing = _.cloneDeep(TestData.growing)
    const firstHits = growing.hits.slice(3)
    const nextHits = growing.hits.slice(1, growing.hits.length)
    growing.hits = firstHits
    growingHandler.load(growing)
    expect(model.growing).to.equal(growing)
    expect(model.hits.size).to.equal(firstHits.length)
    growing.hits = nextHits
    growingHandler.load(growing)
    expect(model.growing).to.equal(growing)
    expect(model.hits.size).to.equal(TestData.growing.hits.length - 1)
  })
})
