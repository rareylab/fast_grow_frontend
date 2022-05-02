import * as NGL from 'ngl'

export class StructureUtils {
  /**
   * Add a structure using a structure object. The structure model must have
   * the following members:
   *   structure = {
   *     file_string: String,
   *     file_type: String ('pdb', 'sdf'),
   *     name: String
   *   }
   *
   * @param {object} stage NGL stage
   * @param {object} structure structure object
   * @returns {Promise} structure promise
   */
  static addStructure (stage, structure) {
    if (!structure.file_string || !structure.file_type) {
      throw new TypeError('Tried to add invalid structure object')
    }
    // don't actually throw an error because of name
    const name = structure.name
    const blob = new Blob([structure.file_string], { type: 'text/plain' })
    return stage.loadFile(
      blob,
      {
        ext: structure.file_type,
        name: name
      })
  };

  /**
   * Color for pocket residues
   */
  static pocketCarbons = NGL.ColormakerRegistry.addSelectionScheme([
    ['lightblue', '_C'],
    ['red', '_O'],
    ['blue', '_N'],
    ['yellow', '_S'],
    ['orange', '_Se']
  ], 'pocketCarbons')

  /**
   * Add a pocket representation for the ligand component to the protein component
   *
   * @param {object} ligandComponent component of the ligand to generate pocket for
   * @param {object} proteinComponent component of the protein to add pocket to
   * @param {number} pocketRadius
   * @returns {object} pocket representation component
   */
  static addPocket (
    ligandComponent,
    proteinComponent,
    pocketRadius = 10.0) {
    const activeSiteAtoms =
      StructureUtils.getActiveSiteAtoms(ligandComponent, proteinComponent, pocketRadius)
    const [activeSiteResidueAtoms, activeSiteWaters] =
      StructureUtils.getActiveSiteResidues(activeSiteAtoms, proteinComponent)

    const selectionString = activeSiteResidueAtoms.toSeleString() + activeSiteWaters.toSeleString()
    return proteinComponent.addRepresentation('licorice', {
      sele: selectionString,
      name: 'pocketLicorice',
      color: this.pocketCarbons,
      visible: false
    })
  };

  /**
   * Get active site atoms for the ligand and the protein
   *
   * @param {object} ligandComponent
   * @param {object} proteinComponent
   * @param {number} pocketRadius
   * @returns {Uint8Array} active atom set
   */
  static getActiveSiteAtoms (ligandComponent, proteinComponent, pocketRadius) {
    // get the set of atoms that is with pocketRadius of a ligand component atom
    const pocketAtomSet = proteinComponent.structure.getAtomSet(false)
    ligandComponent.structure.eachAtom(function (atom) {
      // I really hope this is an indexed query
      proteinComponent.structure.spatialHash.within(atom.x, atom.y, atom.z, pocketRadius).forEach(function (idx) {
        pocketAtomSet.set(idx)
      })
    })
    return pocketAtomSet
  }

  /**
   * Get active site residues and waters
   *
   * @param {object} activeSiteAtoms
   * @param {object} proteinComponent
   * @returns {Uint8Array[]}
   */
  static getActiveSiteResidues (activeSiteAtoms, proteinComponent) {
    const atomProxy = proteinComponent.structure.getAtomProxy()
    const residueSet = new Set()

    const proteinAtoms = proteinComponent.structure.getAtomSet(new NGL.Selection('not water'))
    const proteinWater = proteinComponent.structure.getAtomSet(new NGL.Selection('water and not hydrogen'))
    const activeAtomSet = proteinComponent.structure.getAtomSet(false)
    const activeWaterSet = proteinComponent.structure.getAtomSet(false)
    activeSiteAtoms.forEach(function (idx) {
      /*
       * There are no atoms there are only atom reading frames or
       * AtomProxies, thus we shift the reading frame to the current atom.
       */
      atomProxy.index = idx
      // include complete residues of the found atoms
      const residue = atomProxy.residue
      // skip atoms of residues we have seen before
      if (!residueSet.has(residue.index)) {
        residueSet.add(residue.index)
        // is the atom a residue atom
        if (proteinAtoms.isSet(idx)) {
          residue.eachAtom(function (atom) {
            activeAtomSet.set(atom.index)
          })
        }
        // is the atom a water atom
        if (proteinWater.isSet(idx)) {
          activeWaterSet.set(idx)
        }
      }
    })
    return [activeAtomSet, activeWaterSet]
  }

  /**
   * Check if a structure contains an atom
   * @param {object} structure structure to check in
   * @param {object} atom atom to check for
   * @returns {boolean} atom is in structure
   */
  static structureContainsAtom (structure, atom) {
    if (atom.structure.name !== structure.name) {
      return false
    }
    const retrievedAtom = structure.atomMap.get(atom.index)
    if (!retrievedAtom) {
      return false
    }
    return retrievedAtom.atomname === atom.atomname
  }

  /**
   * Check if a structure contains a bond
   * @param {object} structure structure to check in
   * @param {object} bond bond to check for
   * @returns {boolean} bond is in structure
   */
  static structureContainsBond (structure, bond) {
    return StructureUtils.structureContainsAtom(structure, bond.atom1) &&
      StructureUtils.structureContainsAtom(structure, bond.atom2)
  }

  /**
   * Check if the atoms of a bond are in the same ring.
   * @param {object} bond bond to check the atoms of
   * @return {boolean} in the same ring
   */
  static inSameRing (bond) {
    if (!bond.atom1.isRing() || !bond.atom2.isRing()) {
      return false
    }
    const rings = bond.atom1.residueType.getRings().rings
    return rings.some(function (ring) {
      return ring.includes(bond.atom1.index) && ring.includes(bond.atom2.index)
    })
  }

  /**
   * Pink carbons
   */
  static pocketHighlight = NGL.ColormakerRegistry.addSelectionScheme([
    ['pink', '_C'],
    ['red', '_O'],
    ['blue', '_N'],
    ['yellow', '_S'],
    ['orange', '_Se']
  ], 'pocketHighlight')

  /**
   * Add a highlight to a protein pocket
   * @param {object} proteinComponent
   * @param {string} selection
   * @returns {object} representation component
   */
  static addPocketHighlight (proteinComponent, selection) {
    return proteinComponent.addRepresentation('licorice', {
      sele: selection,
      name: 'pocketHighlight',
      color: this.pocketHighlight
    })
  }
}
