import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import LigandInteractions from '@/components/InteractionTable'

describe('InteractionTable', () => {
  it('applies a clicked row', async () => {
    const interactions = [
      {
        id: 0,
        ligandInteraction: {
          position: [
            -20.499,
            24.1,
            -25.774
          ],
          type: 'ACCEPTOR'
        },
        score: 0.11417357582581605,
        siteInteraction: {
          position: [
            -17.618,
            26.215,
            -26.535
          ],
          type: 'DONOR'
        }
      },
      {
        id: 1,
        ligandInteraction: {
          position: [
            -23.915,
            25.22,
            -28.609
          ],
          type: 'DONOR'
        },
        score: 0.7019329651758045,
        siteInteraction: {
          position: [
            -26.813,
            25.672,
            -29.377
          ],
          type: 'ACCEPTOR'
        }
      },
      {
        id: 2,
        ligandInteraction: {
          position: [
            -23.915,
            25.22,
            -28.609
          ],
          type: 'DONOR'
        },
        score: 0.028332915991302356,
        siteInteraction: {
          position: [
            -26.813,
            25.672,
            -29.377
          ],
          type: 'ACCEPTOR'
        }
      }
    ]
    const wrapper = shallowMount(LigandInteractions, {
      props: { data: interactions }
    })
    const tableData = wrapper.findAll('td')
    await tableData[0].trigger('click')
    const row = tableData[0].element.parentElement
    // eslint-disable-next-line no-unused-expressions
    expect(row.classList.contains('highlighted')).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().picked).to.not.be.undefined
    expect(wrapper.emitted().picked[0][0]).to.equal(0)
    await tableData[0].trigger('click')
    // eslint-disable-next-line no-unused-expressions
    expect(row.classList.contains('highlighted')).to.be.false
  })

  it('applies a clicked interaction', () => {
    const interactions = [
      {
        id: 0,
        ligandInteraction: {
          position: [
            -20.499,
            24.1,
            -25.774
          ],
          type: 'ACCEPTOR'
        },
        score: 0.11417357582581605,
        siteInteraction: {
          position: [
            -17.618,
            26.215,
            -26.535
          ],
          type: 'DONOR'
        },
        component: {
          shape: {
            id: 'mockShape'
          }
        }
      }
    ]
    const wrapper = shallowMount(LigandInteractions, {
      props: { data: interactions }
    })
    const mockPickingProxy = {
      cylinder: interactions[0].component
    }
    wrapper.vm.interactionClicked(mockPickingProxy)
    const rows = wrapper.findAll('tr')
    // rows[0] is the header, rows[1] is the first data row
    // eslint-disable-next-line no-unused-expressions
    expect(rows[1].element.classList.contains('highlighted')).to.be.true
    // eslint-disable-next-line no-unused-expressions
    expect(wrapper.emitted().picked).to.not.be.undefined
    expect(wrapper.emitted().picked[0][0]).to.equal(0)
  })
})
