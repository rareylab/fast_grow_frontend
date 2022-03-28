import { expect } from 'chai'
import { TestData } from '../test_files/TestData'
import { InteractionHandler } from '@/handlers/InteractionHandler'
import { MockStage } from '../utils/Mocks'
import { GeometryUtils } from '@/utils/GeometryUtils'
import _ from 'lodash'

// mock functions that interact with NGL
GeometryUtils.makeHBondInteraction = (stage) => {
  return stage.addComponentFromObject()
}
GeometryUtils.makeHydrophobicPoint = (stage) => {
  return stage.addComponentFromObject()
}

describe('InteractionHandler', () => {
  it('loads ligand search point data', () => {
    const ligandSearchPoints = _.cloneDeep(TestData.searchPointData.data.ligandSearchPoints)
    const stage = new MockStage()
    const ligandInteractionsComponent =
      InteractionHandler.loadInteractions(ligandSearchPoints, stage)
    // eslint-disable-next-line no-unused-expressions
    expect(ligandInteractionsComponent).to.not.be.undefined
    expect(stage.components.size).to.equal(ligandSearchPoints.length)
  })

  it('loads residue search point data', () => {
    const residueSearchPoints = _.cloneDeep(TestData.searchPointData.data.activeSiteSearchPoints)
    const stage = new MockStage()
    const [residueToInteractions, pocketInteractionsComponent] =
      InteractionHandler.loadResidueInteractions(residueSearchPoints, stage)
    const residues = new Set()
    residueSearchPoints.mapping.forEach((mapping) => residues.add(mapping[1]))
    expect(residueToInteractions.size).to.equal(residues.size)
    expect(pocketInteractionsComponent.geometryMap.size).to.equal(residueSearchPoints.searchPoints.length)
  })
})
