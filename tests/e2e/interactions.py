"""ligand cutting tests"""
import os
import unittest
import time

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import CHROMEDRIVER, SERVER_TIMEOUT, URL, HEADLESS, TEST_FILES
from tests.utils.waiters import element_has_css_class, element_does_not_exist


class InteractionsTests(unittest.TestCase):
    """ligand cutting tests"""

    def setUp(self):
            service = Service(CHROMEDRIVER)
            chrome_options = webdriver.ChromeOptions()
            chrome_options.headless = HEADLESS
            # prevent CORS problems when using a localhost server
            chrome_options.add_argument('--disable-web-security')
            self.driver = webdriver.Chrome(service=service, options=chrome_options)

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
        # 7 ligands one header row
        self.assertEqual(len(interaction_rows) - 1, 7)
