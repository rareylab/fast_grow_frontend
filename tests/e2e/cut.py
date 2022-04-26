"""ligand cutting tests"""
import unittest

from selenium.webdriver.support.ui import WebDriverWait

from tests import URL
from tests.utils.actions import upload_pdb_and_sdf, cut_ligand
from tests.utils.waiters import js_returns_true
from tests.utils.webdriver import setup_webdriver


class CutTests(unittest.TestCase):
    """ligand cutting tests"""

    def setUp(self):
        self.driver = setup_webdriver()

    def tearDown(self):
        self.driver.close()

    def test_ligand_cut(self):
        """test cutting a ligand"""
        self.driver.get(URL)
        upload_pdb_and_sdf(self.driver)
        cut_ligand(self.driver)
        # check that a core was set
        WebDriverWait(self.driver, 5)\
            .until(js_returns_true('return app.$data.cutModel.core !== undefined'))
