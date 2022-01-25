import { expect } from 'chai'
import { NGLContext } from '@/internal/NGLContext'
import { MockStage, MockCustomComponent, MockEnsembleComponent, MockFocusComponent } from '../utils/Mocks'

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

  it('renders a registered component', () => {
    const nglContext = new NGLContext(new MockStage(), staticViewDefinition)
    const firstComponent = new MockCustomComponent()
    const secondComponent = new MockCustomComponent()
    nglContext.registerComponent('protein', firstComponent)
    expect(nglContext.components.get('protein') !== undefined)
    nglContext.switchView('proteinView')
    expect(nglContext.currentView).to.equal('proteinView')
    expect(firstComponent.visible)
    expect(nglContext.components.get('protein').visible)

    // components can only be registered once under one name
    expect(() => {
      nglContext.registerComponent('protein', firstComponent)
    }).to.throw(Error, 'Tried to re-register an already registered component')
    expect(() => {
      nglContext.registerComponent('otherProtein', firstComponent)
    }).to.throw(Error, 'Tried to re-register an already registered component')
    expect(() => {
      nglContext.replaceComponent('otherProtein', secondComponent)
    }).to.throw(Error, 'Tried to replace non-existent component')
    nglContext.replaceComponent('protein', secondComponent)
    nglContext.deregisterComponent('protein')
  })

  it('rejects invalid components', () => {
    const nglContext = new NGLContext(new MockStage())
    expect(() => {
      nglContext.registerComponent('component', {})
    }).to.throw(Error, 'Tried to register invalid component')
    const structure = new MockCustomComponent()
    // fake a structure component
    structure.structure = {}
    expect(() => {
      nglContext.registerComponent('component', structure)
    }).to.throw(Error, 'Tried to add structure component instead of representation')
  })

  it('clears components', () => {
    const nglContext = new NGLContext(new MockStage())
    const firstComponent = new MockCustomComponent()
    const secondComponent = new MockCustomComponent()
    nglContext.registerComponent('protein', firstComponent)
    nglContext.registerComponent('other', secondComponent)
    nglContext.clearComponents()
    expect(nglContext.components.size).to.equal(0)
    expect(nglContext.componentSet.size).to.equal(0)
  })

  it('renders a fallback component', () => {
    const nglContext = new NGLContext(new MockStage(), staticViewDefinition)
    const mockComponent = new MockCustomComponent()
    nglContext.registerComponent('otherProtein', mockComponent)
    nglContext.switchView('complexView')
    expect(mockComponent.visible)
  })

  it('renders independent views', () => {
    const nglContext = new NGLContext(new MockStage(), staticViewDefinition)
    const proteinComponent = new MockCustomComponent()
    nglContext.registerComponent('protein', proteinComponent)
    const ligandComponent = new MockCustomComponent()
    nglContext.registerComponent('ligand', ligandComponent)
    expect(nglContext.currentView === undefined)
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
    const nglContext = new NGLContext(new MockStage(), staticViewDefinition)
    expect(nglContext.stage)
    expect(nglContext.views)
    expect(nglContext.views.get('complexView'))
    expect(nglContext.getViewDefinition()).to.eql(staticViewDefinition)
  })

  it('rejects an invalid static view', () => {
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext(new MockStage(), { view: 'invalid' })
    }).to.throw(Error, 'Invalid view definition: view')
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext(new MockStage(), { view: {} })
    }).to.throw(Error, 'Missing or invalid view components for: view')
    expect(() => {
      // eslint-disable-next-line no-new
      new NGLContext(new MockStage(), { view: { visible: [] } })
    }).to.throw(Error, 'Invalid focus components for: view')
  })

  it('builds a view definition dynamically', () => {
    const nglContext = new NGLContext(new MockStage())
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
    expect(nglContext.getViewDefinition()).to.eql(staticViewDefinition)
  })

  it('renders custom components', () => {
    const nglContext = new NGLContext(new MockStage(), {
      ensembleView: {
        visible: new Set(['ensemble']),
        focus: ['ensemble']
      }
    })
    const mockComponent = new MockCustomComponent()
    const otherMockComponent = new MockCustomComponent()
    const ensembleComponent =
      new MockEnsembleComponent([mockComponent, otherMockComponent])
    nglContext.registerComponent('ensemble', ensembleComponent)
    nglContext.switchView('ensembleView')
    expect(mockComponent.visible)
    expect(otherMockComponent.visible)
  })

  it('focuses components', () => {
    const nglContext = new NGLContext(new MockStage(), {
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

  it('registers and deregisters view listeners', () => {
    const nglContext = new NGLContext(new MockStage())
    const listener = () => {}
    nglContext.registerViewListener('test', listener)
    expect(nglContext.viewListeners.has('test'))
    expect(nglContext.viewListeners.get('test').has(listener()))
    nglContext.deregisterViewListener('test', listener)
    expect(nglContext.viewListeners.get('test').size).to.equal(0)
  })
})
