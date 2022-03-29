import { shallowMount } from '@vue/test-utils'
import Results from '@/components/Results'
import { TestData } from '../test_files/TestData'
import { expect } from 'chai'

describe('Results', () => {
  it('applies a row', async () => {
    const wrapper = shallowMount(Results, {
      props: { hits: TestData.growing.hits }
    })
    const tableData = wrapper.findAll('td')
    await tableData[0].trigger('click')
    const row = tableData[0].element.parentElement
    // eslint-disable-next-line no-unused-expressions
    expect(row.classList.contains('highlighted')).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().picked).to.not.be.undefined
    expect(wrapper.emitted().picked[0][0]).to.equal(TestData.growing.hits[0].id)
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.vm.manualSelection).to.be.true
    expect(wrapper.vm.currentHitID).to.equal(TestData.growing.hits[0].id)
  })

  it('sorts rows by headers', async () => {
    const wrapper = shallowMount(Results, {
      props: { hits: TestData.ensembleHits }
    })
    let rows = wrapper.findAll('tr').slice(1)
    for (let i = 0; i < rows.length - 1; i++) {
      const firstScore = parseFloat(rows[i].element.children[1].textContent)
      const secondScore = parseFloat(rows[i + 1].element.children[1].textContent)
      // eslint-disable-next-line no-unused-expressions
      expect(firstScore <= secondScore).to.be.true
    }
    const headers = wrapper.findAll('th')
    const clickedHeaderIndex = 4
    await headers[clickedHeaderIndex].trigger('click')
    rows = wrapper.findAll('tr').slice(1)
    for (let i = 0; i < rows.length - 1; i++) {
      const firstScore = parseFloat(rows[i].element.children[4].textContent)
      const secondScore = parseFloat(rows[i + 1].element.children[4].textContent)
      // eslint-disable-next-line no-unused-expressions
      expect(firstScore <= secondScore).to.be.true
    }
  })
})
