"""tests has interoperating python submodules and is therefore a module itself"""
import os

PROJECT_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
# This is the default search path on linux
# CHROME = os.path.join('usr', 'bin', 'google-chrome')
CHROME = os.path.join(PROJECT_PATH, 'bin', 'chrome')
CHROMEDRIVER = os.path.join(PROJECT_PATH, 'bin', 'chromedriver')
SERVER_TIMEOUT = os.environ['SERVER_TIMEOUT'] if 'SERVER_TIMEOUT' in os.environ else 10  # seconds
HEADLESS = 'HEADLESS' in os.environ if 'HEADLESS' in os.environ else False
URL = os.environ['URL'] if 'URL' in os.environ else 'http://localhost:8080'
TEST_FILES = os.path.join(PROJECT_PATH, 'tests', 'test_files')
