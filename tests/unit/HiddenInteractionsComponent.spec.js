import { expect } from 'chai'
import { MockComponent } from '../utils/Mocks'
import { HiddenInteractionsComponent } from '@/nglComponents/HiddenInteractionsComponent'

describe('HiddenInteractionCollectionComponent', () => {
  it('renders interaction shadows', () => {
    const components = [
      new MockComponent(),
      new MockComponent(),
      new MockComponent()
    ]
    const geometries = []
    components.forEach((component, index) => {
      component.addRepresentation()
      component.visible = false
      component.reprList[0].parameters.opacity = 0.5
      geometries.push({
        component: component,
        id: index
      })
    })
    const interactionComponent = new HiddenInteractionsComponent(geometries)
    interactionComponent.setVisibility(true)
    geometries.forEach((geometry) => {
      // eslint-disable-next-line no-unused-expressions
      expect(geometry.component.visible).to.be.false
    })
    interactionComponent.toggleAllShadows()
    interactionComponent.setVisibility(true)
    geometries.forEach((geometry) => {
      // eslint-disable-next-line no-unused-expressions
      expect(geometry.component.visible).to.be.true
    })
    interactionComponent.toggleAllShadows()
    interactionComponent.setVisibility(true)
    geometries.forEach((geometry) => {
      // eslint-disable-next-line no-unused-expressions
      expect(geometry.component.visible).to.be.false
    })

    // highlighted components are never switched off
    interactionComponent.toggleAllShadows()
    interactionComponent.setVisibility(true)
    interactionComponent.toggleHighlight(geometries[0].id)
    interactionComponent.toggleAllShadows()
    interactionComponent.setVisibility(true)
    // eslint-disable-next-line no-unused-expressions
    expect(geometries[0].component.visible).to.be.true
  })

  it('toggles highlights', () => {
    const geometry = {
      id: 0,
      component: new MockComponent()
    }
    const representation = geometry.component.addRepresentation()
    representation.parameters.opacity = 0.5
    const interactionComponent = new HiddenInteractionsComponent([geometry])
    interactionComponent.showAllShadows = true
    interactionComponent.setVisibility(true)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.true
    interactionComponent.toggleHighlight(geometry.id)
    expect(geometry.component.reprList[0].parameters.opacity).to.equal(0.8)
    interactionComponent.toggleHighlight(geometry.id)
    expect(geometry.component.reprList[0].parameters.opacity).to.equal(0.5)

    // switch off shadows when highlight is remove and not all shadows are shown
    interactionComponent.toggleHighlight(geometry.id)
    interactionComponent.showAllShadows = false
    interactionComponent.toggleHighlight(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.false
  })

  it('toggles individual shadows', () => {
    const geometry = {
      id: 0,
      component: new MockComponent()
    }
    const representation = geometry.component.addRepresentation()
    representation.parameters.opacity = 0.5
    const interactionComponent = new HiddenInteractionsComponent([geometry])
    interactionComponent.showAllShadows = false
    interactionComponent.setVisibility(true)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.false
    interactionComponent.enableShadow(geometry.id)
    interactionComponent.setVisibility(true)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.true
    interactionComponent.disableShadow(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.false

    // does not disable highlighted components
    interactionComponent.showAllShadows = false
    interactionComponent.enableShadow(geometry.id)
    interactionComponent.toggleHighlight(geometry.id)
    interactionComponent.disableShadow(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.true
    interactionComponent.toggleHighlight(geometry.id)
    interactionComponent.disableShadow(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.false

    // does not disable components when all shadows are shown
    interactionComponent.showAllShadows = true
    interactionComponent.enableShadow(geometry.id)
    interactionComponent.disableShadow(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.true
    interactionComponent.showAllShadows = false
    interactionComponent.disableShadow(geometry.id)
    // eslint-disable-next-line no-unused-expressions
    expect(geometry.component.visible).to.be.false
  })
})
