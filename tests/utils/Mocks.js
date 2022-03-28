import { CustomComponent } from '@/NGLContext'

export class MockStage {
  // eslint-disable-next-line no-useless-constructor
  constructor () {
    this.signals = {
      clicked: new Set()
    }
    this.components = new Set()
  }

  loadFile () {
    return new Promise((resolve) => {
      setTimeout(() => {
        const component = new MockComponent()
        this.components.add(component)
        resolve(component)
      }, 100)
    })
  }

  addComponentFromObject (_object) {
    const component = new MockComponent()
    this.components.add(component)
    return component
  }

  removeComponent (component) {
    this.components.delete(component)
  }
}

export class MockComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor () {
    this.visible = true
    this.reprList = []
  }

  addRepresentation () {
    const representation = new MockRepresentation(this)
    this.reprList.push(representation)
    return representation
  }

  setVisibility (value) {
    this.visible = value
  }
}

export class MockRepresentation {
  constructor (component) {
    this.parent = component
    this.parameters = { opacity: 0 }
    this.visible = false
  }

  getParameters () {
    return this.parameters
  }

  setParameters (parameters) {
    this.parameters = parameters
  }

  setVisibility (value) {
    this.visible = value
  }
}

export class MockCustomComponent extends CustomComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor () {
    super()
  }

  get parents () {
    return []
  }

  get visible () {
    return true
  }

  setVisibility (_value) {
  }

  autoView (_duration) {
  }
}

export class MockFocusComponent extends CustomComponent {
  constructor () {
    super()
    this.focused = false
  }

  get parents () {
    return []
  }

  get visible () {
    return true
  }

  setVisibility (_visible) {
  }

  autoView (_duration) {
    this.focused = true
  }
}

export class MockEnsembleComponent extends CustomComponent {
  constructor (complexRepresentations) {
    super()
    this.representations = complexRepresentations
    this.representations.forEach((representation) => {
      this.parents.push(representation.parent)
    })
  }

  get parents () {
    return []
  }

  get visible () {
    return this.representations.some((representation) => representation.visible)
  }

  setVisibility (value) {
    this.representations.forEach((representation) => representation.setVisibility(value))
  }

  autoView (duration) {
  }
}
