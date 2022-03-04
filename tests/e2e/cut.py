"""ligand cutting tests"""
import os
import unittest
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import CHROME, CHROMEDRIVER, SERVER_TIMEOUT, URL, HEADLESS, TEST_FILES
from tests.utils.waiters import element_has_css_class, element_not_disabled, js_returns_true
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
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'cut-tab-trigger'), 'active'))
        pick_bond = """
        bond = {
            atom1: {
                atomname: 'N2',
                element: 'N',
                index: 1,
                positionToArray() { return [-23.982999801635742, 21.07200050354004, -26.30699920654297] }
            },
            atom2: {
                atomname: 'C8',
                element: 'C',
                index: 7,
                positionToArray() { return [-23.488000869750977, 22.29400062561035, -26.614999771118164] }
            }
        };
        app.$refs.clip.setAtoms(bond);
        """
        self.driver.execute_script(pick_bond)
        cut_button = self.driver.find_element(By.ID, 'clip-button')
        time.sleep(1)  # race condition fear
        cut_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_not_disabled((By.ID, 'clip-button')))
        # check that a core was set
        WebDriverWait(self.driver, 5).until(js_returns_true('return app.$data.core !== undefined'))
