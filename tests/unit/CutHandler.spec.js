import { expect } from 'chai'
import { CutHandler } from '@/handlers/CutHandler'
import { NGLContext } from '@/NGLContext'
import { MockStage } from '../utils/Mocks'
import { TestData } from '../test_files/TestData'
import _ from 'lodash'

describe('CutHandler', () => {
  it('chooses a bond', () => {
    const nglContext = new NGLContext(new MockStage())
    const model = {}
    const mockAnchor = {
      positionToArray () {
        return [0, 0, 0]
      }
    }
    const mockLinker = {
      positionToArray () {
        return [1, 0, 0]
      }
    }
    const cutHandler = new CutHandler(nglContext, model)
    cutHandler.bondChosen(mockAnchor, mockLinker)
    expect(model.anchor).to.equal(mockAnchor)
    expect(model.linker).to.equal(mockLinker)
    // eslint-disable-next-line no-unused-expressions
    expect(model.bondMarker).to.not.be.undefined
    // eslint-disable-next-line no-unused-expressions
    expect(nglContext.components.has('bondMarker')).to.be.true
  })

  it('loads a core', async () => {
    const nglContext = new NGLContext(new MockStage())
    const model = {}
    const cutHandler = new CutHandler(nglContext, model)
    const core = _.cloneDeep(TestData.core)
    await cutHandler.load(core)
    // eslint-disable-next-line no-unused-expressions
    expect(core.component).to.not.be.undefined
    expect(model.core).to.equal(core)
    // eslint-disable-next-line no-unused-expressions
    expect(nglContext.components.has('core')).to.be.true
    cutHandler.coreReset()
    // eslint-disable-next-line no-unused-expressions
    expect(model.core).to.be.undefined
    // eslint-disable-next-line no-unused-expressions
    expect(nglContext.components.has('core')).to.be.false
  })
})
