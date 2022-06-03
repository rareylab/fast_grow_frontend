const fs = require('fs')
const path = require('path')

const browserTestPath = './tests/browser'

module.exports = {
  // configure alternative build target for browser based unit tests
  outputDir: process.env.BROWSERTEST === 'true' ? path.join(browserTestPath, 'dist') : 'dist',
  filenameHashing: false,
  configureWebpack: config => {
    if (process.env.BROWSERTEST === 'true') {
      const testFiles = []
      fs.readdirSync(browserTestPath).forEach((fileName) => {
        const splitFileName = fileName.split('.')
        if (splitFileName.includes('spec') && splitFileName.includes('js')) {
          // the './' at the beginning of the path is necessary for webpack to find the file
          testFiles.push('./' + path.join(browserTestPath, fileName))
        }
      })
      return {
        entry: testFiles
      }
    }
  }
}
