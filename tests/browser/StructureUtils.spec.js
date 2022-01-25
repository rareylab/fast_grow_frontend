/* eslint-disable no-undef */
import { expect } from 'chai'
import * as NGL from 'ngl'
import { StructureUtils } from '@/internal/StructureUtils'
import { TestData } from '../test_files/TestData'

describe('StructureUtils', () => {
  let stage

  before(function () {
    const element = document.createElement('div')
    element.setAttribute('id', 'viewport')
    document.body.append(element)
  })

  after(function () {
    document.getElementById('viewport').remove()
  })

  beforeEach(() => {
    stage = new NGL.Stage('viewport')
  })

  afterEach(function () {
    stage.dispose()
  })

  it('adds a molecule structure', async function () {
    const componentPromise = StructureUtils.addStructure(stage, TestData.molecule)
    await componentPromise
    expect(stage.compList.length).to.equal(1)
    expect(stage.compList[0].name).to.equal(TestData.molecule.name)
  })

  it('adds a protein structure', async function () {
    const componentPromise = StructureUtils.addStructure(stage, TestData.protein)
    await componentPromise
    expect(stage.compList.length).to.equal(1)
    expect(stage.compList[0].name).to.equal(TestData.protein.name)
  })

  it('gets active atoms', async function () {
    const ligandPromise = StructureUtils.addStructure(stage, TestData.molecule)
    await ligandPromise
    const proteinPromise = StructureUtils.addStructure(stage, TestData.protein)
    await proteinPromise
    const [ligandComponent, proteinComponent] = stage.compList
    const activeSiteAtoms = StructureUtils.getActiveSiteAtoms(ligandComponent, proteinComponent, 10)
    const nofAtoms = activeSiteAtoms.toSeleString().split(',').length
    expect(nofAtoms).to.equal(614)
  })

  it('get active residues and waters', async function () {
    const ligandPromise = StructureUtils.addStructure(stage, TestData.molecule)
    await ligandPromise
    const proteinPromise = StructureUtils.addStructure(stage, TestData.protein)
    await proteinPromise
    const [ligandComponent, proteinComponent] = stage.compList
    const activeSiteAtoms = StructureUtils.getActiveSiteAtoms(ligandComponent, proteinComponent, 10)
    const [activeSiteResidueAtoms, activeSiteWaters] = StructureUtils.getActiveSiteResidues(activeSiteAtoms, proteinComponent)
    const nofAtoms = activeSiteResidueAtoms.toSeleString().split(',').length
    expect(nofAtoms).to.equal(621)
    const nofWaters = activeSiteWaters.toSeleString().split(',').length
    expect(nofWaters).to.equal(50)
  })

  it('detects a bond in the same ring', async function () {
    const ligandPromise = StructureUtils.addStructure(stage, TestData.bridgedRingMolecule)
    await ligandPromise
    const structure = stage.compList[0].structure
    // in same ring
    let inRing = StructureUtils.inSameRing(structure.getBondProxy(0))
    expect(inRing)
    // in two different rings
    inRing = StructureUtils.inSameRing(structure.getBondProxy(6))
    expect(!inRing)
    // one atom in ring
    inRing = StructureUtils.inSameRing(structure.getBondProxy(13))
    expect(!inRing)
    // neither atom in ring
    inRing = StructureUtils.inSameRing(structure.getBondProxy(24))
    expect(!inRing)
  })
})
