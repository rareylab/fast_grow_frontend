import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import PocketChoice from '@/components/PocketChoice'

describe('PocketChoice', () => {
  it('applies a clicked row', async () => {
    const complexes = [{
      name: 'a',
      id: 1
    }, {
      name: 'b',
      id: 2
    }, {
      name: 'c',
      id: 3
    }]
    const wrapper = shallowMount(PocketChoice, {
      props: { complexes: complexes }
    })
    const rows = wrapper.findAll('td')
    await rows[0].trigger('click')
    expect(rows[0].wrapperElement.classList.contains('highlight'))
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().pocketChosen).to.not.be.undefined
    expect(wrapper.emitted().pocketChosen[0][0]).to.equal('1')
  })
})
