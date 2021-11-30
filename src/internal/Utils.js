export class Utils {
  /**
   * Pause execution of the Program for time ms
   * @param {Number} time time in ms
   */
  static sleep (time) {
    return new Promise(resolve => setTimeout(resolve, time))
  }
}
