import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import StructureUpload from '@/components/StructureUpload'

describe('StructureUpload', () => {
  it('disables submit if files are invalid', async () => {
    const wrapper = shallowMount(StructureUpload)
    await wrapper.setData({ formError: 'test error' })
    const divs = wrapper.findAll('div')
    // error div has appeared
    expect(divs.length).to.equal(3)
    // is displaying the test error
    expect(divs[0].text()).to.equal('test error')
  })

  it('disables submit if a submission error occurred', () => {
    const wrapper = shallowMount(StructureUpload, {
      props: { submitError: 'test error' }
    })
    const errorElement = wrapper.find('.text-danger')
    // eslint-disable-next-line no-unused-expressions
    expect(errorElement).to.not.be.undefined
    // is displaying the test error
    expect(errorElement.text()).to.equal('test error')
  })

  it('disables submit if currently polling', () => {
    const wrapper = shallowMount(StructureUpload, {
      props: { pollingServer: true }
    })
    const divs = wrapper.findAll('span')
    expect(divs.length).to.equal(2)
    expect(divs[0].classes()).to.contain('spinner-grow')
    expect(divs[1].text()).to.equal('Loading...')
  })
})
