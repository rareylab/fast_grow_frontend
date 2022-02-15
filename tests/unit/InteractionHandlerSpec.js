import { expect } from 'chai'
import { TestData } from '../test_files/TestData'
import { InteractionHandler } from '@/handlers/InteractionHandler'
import { MockStage } from '../utils/Mocks'
import { GeometryUtils } from '@/utils/GeometryUtils'

// mock functions that interact with NGL
GeometryUtils.makeHBondInteraction = (stage) => {
  stage.addComponentFromObject()
}
GeometryUtils.makeHydrophobicPoint = (stage) => {
  stage.addComponentFromObject()
}

describe('InteractionHandler', () => {
  it('loads ligand search point data', () => {
    const ligandSearchPoints = TestData.searchPointData.data.ligandSearchPoints
    const stage = new MockStage()
    const ligandInteractionsComponent =
      InteractionHandler.loadLigandInteractions(ligandSearchPoints, stage)
    // eslint-disable-next-line no-unused-expressions
    expect(ligandInteractionsComponent).to.not.be.undefined
    expect(stage.components.length).to.equal(ligandSearchPoints.length)
  })
})
