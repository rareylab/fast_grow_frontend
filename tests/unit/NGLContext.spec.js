import { NGLContext, CustomComponent } from '@/internal/NGLContext'

describe('NGLContext', () => {
  // intentionally written in a JSON style
  const staticViewDefinition = {
    ligandView: {
      visible: ['ligand'],
      focus: ['ligand']
    },
    proteinView: {
      visible: ['protein'],
      focus: ['protein']
    },
    complexView: {
      visible: [
        ['protein', 'otherProtein'],
        'ligand'
      ],
      focus: ['ligand']
    }
  }

  class MockComponent extends CustomComponent {
    // eslint-disable-next-line no-useless-constructor
    constructor () {
      super()
    }

    setVisibility (_value) {
    }

    autoView (_duration) {
    }
  }

  class MockFocusComponent extends CustomComponent {
    constructor () {
      super()
      this.focused = false
    }

    setVisibility (_visible) {
    }

    autoView (_duration) {
      this.focused = true
    }
  }

  class EnsembleComponent extends CustomComponent {
    constructor (complexRepresentations) {
      super()
      this.representations = complexRepresentations
      this.parents = []
      this.representations.forEach((representation) => {
        this.parents.push(representation.parent)
      })
    }

    setVisibility (value) {
      this.representations.forEach((representation) => representation.setVisibility(value))
    }

    autoView (duration) {
    }
  }

  it('renders a registered component', () => {
    const nglContext = new NGLContext({}, staticViewDefinition)
    const firstComponent = new MockComponent()
    const secondComponent = new MockComponent()
    nglContext.registerComponent('protein', firstComponent)
    expect(nglContext.components.get('protein')).toBeDefined()
    nglContext.switchView('proteinView')
    expect(nglContext.currentView).toBe('proteinView')
    expect(firstComponent.visible)
    expect(nglContext.components.get('protein').visible)

    // components can only be registered once under one name
    expect(() => {
      nglContext.registerComponent('protein', firstComponent)
    }).toThrow(new Error('Tried to re-register an already registered component'))
    expect(() => {
      nglContext.registerComponent('otherProtein', firstComponent)
    }).toThrow(new Error('Tried to re-register an already registered component'))
    expect(() => {
      nglContext.replaceComponent('otherProtein', secondComponent)
    }).toThrow(new Error('Tried to replace non-existent component'))
    nglContext.replaceComponent('protein', secondComponent)
    nglContext.deregisterComponent('protein')
  })

  it('rejects invalid components', () => {
    const nglContext = new NGLContext({})
    expect(() => {
      nglContext.registerComponent('component', {})
    }).toThrow(new Error('Tried to register invalid component'))
    const structure = new MockComponent()
    // fake a structure component
    structure.structure = {}
    expect(() => {
      nglContext.registerComponent('component', structure)
    }).toThrow(new Error('Tried to add structure component instead of representation'))
  })

  it('clears components', () => {
    const nglContext = new NGLContext({})
    const firstComponent = new MockComponent()
    const secondComponent = new MockComponent()
    nglContext.registerComponent('protein', firstComponent)
    nglContext.registerComponent('other', secondComponent)
    nglContext.clearComponents()
    expect(nglContext.components.size).toEqual(0)
    expect(nglContext.componentSet.size).toEqual(0)
  })

  it('renders a fallback component', () => {
    const nglContext = new NGLContext({}, staticViewDefinition)
    const mockComponent = new MockComponent()
    nglContext.registerComponent('otherProtein', mockComponent)
    nglContext.switchView('complexView')
    expect(mockComponent.visible)
  })

  it('renders independent views', () => {
    const nglContext = new NGLContext({}, staticViewDefinition)
    const proteinComponent = new MockComponent()
    nglContext.registerComponent('protein', proteinComponent)
    const ligandComponent = new MockComponent()
    nglContext.registerComponent('ligand', ligandComponent)
    expect(nglContext.currentView).toBeUndefined()
    nglContext.switchView('ligandView')
    expect(ligandComponent.visible)
    expect(!proteinComponent.visible)
    nglContext.switchView('proteinView')
    expect(!ligandComponent.visible)
    expect(proteinComponent.visible)
    nglContext.switchView('complexView')
    expect(ligandComponent.visible)
    expect(proteinComponent.visible)
  })

  it('initializes a static view definition', () => {
    const nglContext = new NGLContext({}, staticViewDefinition)
    expect(nglContext.stage)
    expect(nglContext.views)
    expect(nglContext.views.get('complexView'))
    expect(nglContext.getViewDefinition()).toEqual(staticViewDefinition)
  })

  it('rejects an invalid static view', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext({}, { view: 'invalid' })
    }).toThrow(new Error('Invalid view definition: view'))
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext({}, { view: {} })
    }).toThrow(new Error('Missing or invalid view components for: view'))
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext({}, { view: { visible: [] } })
    }).toThrow(new Error('Invalid focus components for: view'))
  })

  it('builds a view definition dynamically', () => {
    const nglContext = new NGLContext({})
    nglContext
      .addView('ligandView')
      .addViewComponent('ligandView', 'ligand')
      .setFocusComponents('ligandView', ['ligand'])
      .addView('proteinView')
      .addViewComponent('proteinView', 'protein')
      .setFocusComponents('proteinView', ['protein'])
      .addView('complexView')
      .addViewComponent('complexView', ['protein', 'otherProtein'])
      .addViewComponent('complexView', 'ligand')
      .setFocusComponents('complexView', ['ligand'])
      .addView('invalidView')
      .removeView('invalidView')
      .addViewComponent('complexView', 'invalidComponent')
      .removeViewComponent('complexView', 'invalidComponent')
    expect(nglContext.getViewDefinition()).toEqual(staticViewDefinition)
  })

  it('renders custom components', () => {
    const nglContext = new NGLContext({}, {
      ensembleView: {
        visible: new Set(['ensemble']),
        focus: ['ensemble']
      }
    })
    const mockComponent = new MockComponent()
    const otherMockComponent = new MockComponent()
    const ensembleComponent =
      new EnsembleComponent([mockComponent, otherMockComponent])
    nglContext.registerComponent('ensemble', ensembleComponent)
    nglContext.switchView('ensembleView')
    expect(mockComponent.visible)
    expect(otherMockComponent.visible)
  })

  it('focuses components', () => {
    const nglContext = new NGLContext({}, {
      focusView: {
        visible: new Set(['focusComponent']),
        focus: ['focusComponent']
      }
    })
    const focusComponent = new MockFocusComponent()
    nglContext.registerComponent('focusComponent', focusComponent)
    nglContext.switchView('focusView')
    expect(focusComponent.focused)
  })
})
