"""tests has interoperating python submodules and is therefore a module itself"""
import os

CHROMEDRIVER = os.path.join(os.path.dirname(__file__), '..', 'bin', 'chromedriver')
TEST_FILES = os.path.join(os.path.dirname(__file__), 'test_files')
SERVER_TIMEOUT = os.environ['SERVER_TIMEOUT'] if 'SERVER_TIMEOUT' in os.environ else 10  # seconds
HEADLESS = 'HEADLESS' in os.environ if 'HEADLESS' in os.environ else False
URL = os.environ['URL'] if 'URL' in os.environ else 'http://localhost:8080'
