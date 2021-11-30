import { NGLContext } from '@/internal/NGLContext'
import { EnsembleLoader } from '@/internal/EnsembleLoader'

describe('EnsembleLoader', () => {
  class MockStructure {
    constructor () {
      this.file_string = 'mock'
      this.file_type = 'mock'
    }
  }

  class MockComponent {
    // eslint-disable-next-line no-useless-constructor
    constructor () {}

    addRepresentation () {
      return {}
    }
  }

  class MockStage {
    // eslint-disable-next-line no-useless-constructor
    constructor () {}

    loadFile () {
      return new Promise((resolve) => { resolve(new MockComponent()) })
    }
  }

  it('loads an ensemble', async () => {
    const ensemble = {
      complexes: [new MockStructure(), new MockStructure(), new MockStructure()],
      ligands: [new MockStructure(), new MockStructure()]
    }
    const componentMap = new Map()
    const nglContext = new NGLContext(new MockStage())
    await new EnsembleLoader(ensemble, componentMap, nglContext).run()
    expect(componentMap.size).toEqual(3)
    expect(componentMap.has('protein'))
    expect(componentMap.has('ensemble'))
    expect(componentMap.has('ligands'))
    expect(nglContext.components.size).toEqual(2)
    expect(nglContext.components.has('protein'))
    expect(nglContext.components.has('ligands'))
  })
})
