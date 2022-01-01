import { CustomComponent } from '@/internal/NGLContext'

export class MockStage {
  // eslint-disable-next-line no-useless-constructor
  constructor () {
    this.signals = {
      clicked: new Set()
    }
  }

  loadFile () {
    return new Promise((resolve) => { resolve(new MockComponent()) })
  }
}

export class MockComponent {
  // eslint-disable-next-line no-useless-constructor
  constructor () {}

  addRepresentation () {
    return new MockRepresentation(this)
  }
}

export class MockRepresentation {
  constructor (component) {
    this.parent = component
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
