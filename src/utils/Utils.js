export class Utils {
  /**
   * Pause execution of the Program for time ms
   * @param {Number} time time in ms
   */
  static sleep (time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }

  static async pollUpload (model, pollUrl, interval = 1000, updateCallback = undefined) {
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
