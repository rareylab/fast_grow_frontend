export class Utils {
  /**
   * Pause execution of the Program for time ms
   * @param {number} time time in ms
   */
  static sleep (time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  /**
   * Poll the status of a model until it is not 'pending anymore'
   * @param {object} model model to poll
   * @param {string} pollUrl URL to poll
   * @param {number} interval time to wait in betweens polls
   * @param {function} updateCallback function to call after every update of the model
   * @returns {Promise<object>} non-pending model
   */
  static async pollModel (model, pollUrl, interval = 1000, updateCallback = undefined) {
    while (model.status === 'pending') {
      await Utils.sleep(interval)
      const response = await fetch(pollUrl + model.id)
      model = await response.json()
      if (updateCallback) {
        updateCallback(model)
      }
    }
    return model
  }
}
