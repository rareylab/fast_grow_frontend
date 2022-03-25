# FastGrow Frontend

## Project Setup

Manage a locally installed node environment with [nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

To install the package dependencies execute:
```
npm install
```

The browser and end-to-end tests require a python environment and selenium. If
you are already in a conda environment (for example the backend conda
environment) you can install selenium with:
```
conda install selenium
```
Otherwise please refer to [conda installation instructions](https://conda.io/projects/conda/en/latest/user-guide/install/index.html)

Selenium requires a version of chrome and a chromedriver to run. Paths to the
chrome binary and the chromedriver can be set in `tests/__init__.py`. The
default paths point to `bin/chrome` and `bin/chromedriver`. Make sure chrome
and the chromedriver have the same version.

### Compile and hot-reload for development
```
npm run serve
```

### Compile and minifiy for production
```
npm run build
```

Besides the default build there is also the `BROWSERTEST` build configuration.
It is defined in `vue.vonfig.js` and is exclusively used in the browser tests.

### Run unit tests
```
npm run test:unit
```

### Run  browser tests

Browser tests are mocha + chai unit tests that are run in the browser.
Everything with a `*.spec.js` in the `tests/browser` directory will be compiled
into a special bundle in `tests/browser/dist` and run using selenium.

```
npm run test:browser
```

### Run end-to-end tests

Before running end-to-end tests ensure that all necessary servers are running.
At a minimum this means running `npm run serve`. If the frontend performs calls
to the backend it must also be running.

```
npm run test:e2e
```

You can rerun e2e tests without rebuilding by executing:
```
python -m unittest tests.e2e
```

You can rerun single e2e tests by referring to them inside their python module like this:
```
python -m unittest tests.e2e.grow.GrowingTests.test_growing
```

### Lint and fix files

Lint js files with ESLint using the StandardJS configuration.

```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
