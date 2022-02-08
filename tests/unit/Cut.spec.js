import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import Cut from '@/components/Cut'

describe('Cut', () => {
  it('emits a picked bond', () => {
    const mockBond = {
      atom1: {
        element: 'C',
        atomname: 'a'
      },
      atom2: {
        element: 'N',
        atomname: 'b'
      }
    }

    const wrapper = shallowMount(Cut)
    wrapper.vm.setAtoms(mockBond)
    const bond = wrapper.emitted().bondChosen[0]
    // eslint-disable-next-line no-unused-expressions
    expect(bond).to.not.be.undefined
    const [anchor, linker] = bond
    expect(anchor.atomname).to.eql('a')
    expect(linker.atomname).to.eql('b')
  })

  it('disables cut if a submission error occurred', () => {
    const wrapper = shallowMount(Cut, {
      props: { submitError: 'test error' }
    })
    // error div has appeared
    const errorElement = wrapper.find('.text-danger')
    // eslint-disable-next-line no-unused-expressions
    expect(errorElement).to.not.be.undefined
    // is displaying the test error
    expect(errorElement.text()).to.equal('test error')
  })

  it('disables cut if currently polling', () => {
    const wrapper = shallowMount(Cut, {
      props: { pollingServer: true }
    })
    const divs = wrapper.findAll('span')
    expect(divs.length).to.equal(2)
    expect(divs[0].classes()).to.contain('spinner-grow')
    expect(divs[1].text()).to.equal('Loading...')
  })
})
