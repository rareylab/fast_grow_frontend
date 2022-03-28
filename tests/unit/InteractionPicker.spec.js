import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import InteractionPicker from '@/components/InteractionPicker'
import { TestData } from '../test_files/TestData'
import _ from 'lodash'

describe('InteractionPicker', () => {
  it('adds a picked interaction', () => {
    const shape = {}
    const interactions = _.cloneDeep(TestData.interactions)
    interactions.forEach((interaction) => {
      interaction.component = {}
    })
    interactions[0].component = { shape: shape }
    const wrapper = shallowMount(InteractionPicker, {
      props: { interactions: interactions }
    })
    const mockPickingProxy = { sphere: { shape: shape } }
    wrapper.vm.interactionClicked(mockPickingProxy)
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().picked).to.not.be.undefined
    expect(wrapper.emitted().picked[0][0]).to.equal(interactions[0].id)
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.vm.$data.pickedInteractions.has(interactions[0].id)).to.be.true
  })
  it('removes an interaction', () => {
    const shape = {}
    const interactions = _.cloneDeep(TestData.interactions)
    interactions.forEach((interaction) => {
      interaction.component = {}
    })
    interactions[0].component = { shape: shape }
    const wrapper = shallowMount(InteractionPicker, {
      props: { interactions: interactions }
    })
    const mockPickingProxy = { sphere: { shape: shape } }
    wrapper.vm.interactionClicked(mockPickingProxy)
    wrapper.vm.removeInteraction(interactions[0].id)
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().picked).to.not.be.undefined
    expect(wrapper.emitted().picked[0][0]).to.equal(interactions[0].id)
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.vm.$data.pickedInteractions.has(interactions[0].id)).to.be.false
  })
})
