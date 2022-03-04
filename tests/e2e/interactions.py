"""interactions tests"""
import os
import unittest

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import SERVER_TIMEOUT, URL, TEST_FILES
from tests.utils.waiters import element_has_css_class, element_does_not_exist
from tests.utils.webdriver import setup_webdriver


class InteractionsTests(unittest.TestCase):
    """interactions tests"""

    def setUp(self):
        self.driver = setup_webdriver()

    def tearDown(self):
        self.driver.close()

    def test_interaction_loading(self):
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'cut-tab-trigger'), 'active'))
        ligand_tab_trigger = self.driver.find_element(By.ID, 'interactions-dropdown')
        ligand_tab_trigger.click()
        ligand_tab_trigger = self.driver.find_element(By.ID, 'ligand-interactions-tab-trigger')
        ligand_tab_trigger.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'ligand-interactions-tab'), 'active'))
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_does_not_exist((By.CLASS_NAME, 'spinner-grow')))
        interactions_tab = self.driver.find_element(By.ID, 'ligand-interactions-tab')
        interaction_rows = interactions_tab.find_elements(By.TAG_NAME, 'tr')
        # 7 interactions one header row
        self.assertEqual(len(interaction_rows) - 1, 7)
