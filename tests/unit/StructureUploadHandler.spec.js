import { expect } from 'chai'
import { StructureUploadHandler } from '@/handlers/StructureUploadHandler'
import { MockStage } from '../utils/Mocks'

describe('StructureHandler', () => {
  class MockStructure {
    constructor (id) {
      this.id = id
      this.file_string = 'mock'
      this.file_type = 'mock'
    }
  }

  it('loads an ensemble', async () => {
    const ensemble = {
      complexes: [new MockStructure(1), new MockStructure(2), new MockStructure(3)],
      ligands: [new MockStructure(1), new MockStructure(2)]
    }
    const [complexRepresentations, ligandChoiceRepresentations, ligandComponents] =
      await StructureUploadHandler.loadEnsemble(ensemble, new MockStage())
    expect(complexRepresentations.length).to.equal(3)
    expect(ligandChoiceRepresentations.length).to.equal(2)
    expect(ligandComponents.length).to.equal(2)
    ensemble.complexes.forEach((complex) => {
      expect(complex.component)
    })
    ensemble.ligands.forEach((ligand) => {
      expect(ligand.component)
    })
  })

  it('caches loaded components', async () => {
    const ensemble = {
      complexes: [new MockStructure(1), new MockStructure(2), new MockStructure(3)],
      ligands: [new MockStructure(1), new MockStructure(2)]
    }
    const componentCache = new Map()
    const structureUploadHandler = new StructureUploadHandler({}, {}, componentCache)
    const [complexRepresentations, , ligandComponents] =
      await StructureUploadHandler.loadEnsemble(ensemble, new MockStage())
    structureUploadHandler.cacheChoiceComponents(ensemble, complexRepresentations, ligandComponents)
    expect(componentCache.size).to.equal(ensemble.complexes.length + ensemble.ligands.length)
    ensemble.complexes.forEach((complex) => {
      expect(componentCache.has('complex_' + complex.id))
    })
    ensemble.ligands.forEach((ligand) => {
      expect(componentCache.has('ligand_' + ligand.id))
    })
  })
})
