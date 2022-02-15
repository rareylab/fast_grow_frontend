import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import LigandChoice from '@/components/LigandChoice'

describe('LigandChoice', () => {
  it('applies a clicked row', async () => {
    const ligands = [{
      name: 'a',
      id: 1
    }, {
      name: 'b',
      id: 2
    }, {
      name: 'c',
      id: 3
    }]
    const wrapper = shallowMount(LigandChoice, {
      props: { ligands: ligands }
    })
    const tableData = wrapper.findAll('td')
    await tableData[0].trigger('click')
    const row = tableData[0].element.parentElement
    // eslint-disable-next-line no-unused-expressions
    expect(row.classList.contains('highlighted')).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().ligandChosen).to.not.be.undefined
    expect(wrapper.emitted().ligandChosen[0][0]).to.equal('1')
  })

  it('applies a clicked ligand', async () => {
    const ligands = [{
      name: 'a',
      id: 1
    }, {
      name: 'b',
      id: 2
    }, {
      name: 'c',
      id: 3
    }]
    const wrapper = shallowMount(LigandChoice, {
      props: { ligands: ligands }
    })
    const name = 'a'
    wrapper.vm.ligandClicked({ component: { structure: { name: name } } })
    const highlightedRow = wrapper.find('tr.highlighted')
    expect(highlightedRow.wrapperElement.children[0].textContent).to.equal('1')
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().ligandChosen).to.not.be.undefined
    expect(wrapper.emitted().ligandChosen[0][0]).to.equal('1')
  })
})
