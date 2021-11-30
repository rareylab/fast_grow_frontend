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
   * @param {Object} stage NGL stage
   * @param {Object} structure structure object
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
}
