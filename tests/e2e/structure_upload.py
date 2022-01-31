"""structure upload and processing tests"""
import os
import unittest

from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait

from tests import CHROMEDRIVER, SERVER_TIMEOUT, URL, HEADLESS, TEST_FILES
from tests.utils.waiters import element_has_css_class


class StructureUploadTests(unittest.TestCase):
    """structure upload and processing tests"""

    def setUp(self):
        service = Service(CHROMEDRIVER)
        chrome_options = webdriver.ChromeOptions()
        chrome_options.headless = HEADLESS
        # prevent CORS problems when using a localhost server
        chrome_options.add_argument('--disable-web-security')
        self.driver = webdriver.Chrome(service=service, options=chrome_options)

    def tearDown(self):
        self.driver.close()

    def test_upload_pdb(self):
        """test uploading a PDB file"""
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        try:
            WebDriverWait(self.driver, SERVER_TIMEOUT).until(
                element_has_css_class((By.ID, 'ligands-tab-trigger'), 'active'))
        except TimeoutException:
            raise RuntimeError('Failure in structure upload') from None
        ligands_tab = self.driver.find_element(By.ID, 'ligands-tab')
        ligand_rows = ligands_tab.find_elements(By.TAG_NAME, 'tr')
        # 4 ligands one header row
        self.assertEqual(len(ligand_rows) - 1, 4)

    def test_upload_pdb_and_sdf(self):
        """test uploading a PDB file and an SDF"""
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        # TODO the tab that this should switch to doesn't exist yet
        try:
            WebDriverWait(self.driver, SERVER_TIMEOUT).until(
                element_has_css_class((By.ID, 'ligands-tab-trigger'), 'active'))
        except TimeoutException:
            raise RuntimeError('Failure in structure upload') from None
        ligands_tab = self.driver.find_element(By.ID, 'ligands-tab')
        ligand_rows = ligands_tab.find_elements(By.TAG_NAME, 'tr')
        # one ligand one header row
        self.assertEqual(len(ligand_rows) - 1, 1)

    def test_upload_multiple_pdbs(self):
        """test uploading multiple PDB files"""
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4S_3.pdb'))
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4W_4.pdb'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        try:
            WebDriverWait(self.driver, SERVER_TIMEOUT).until(
                element_has_css_class((By.ID, 'ligands-tab-trigger'), 'active'))
        except TimeoutException:
            raise RuntimeError('Failure in structure upload') from None
        ligands_tab = self.driver.find_element(By.ID, 'ligands-tab')
        ligand_rows = ligands_tab.find_elements(By.TAG_NAME, 'tr')
        # 7 ligands one header row
        self.assertEqual(len(ligand_rows) - 1, 7)

    def test_upload_multiple_pdbs_and_sdf(self):
        """test uploading multiple PDB files and an SDF"""
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4S_3.pdb'))
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4W_4.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        # TODO the tab that this should switch to doesn't exist yet
        try:
            WebDriverWait(self.driver, SERVER_TIMEOUT).until(
                element_has_css_class((By.ID, 'pockets-tab-trigger'), 'active'))
        except TimeoutException:
            raise AssertionError('Failure in structure upload') from None
        pockets_tab = self.driver.find_element(By.ID, 'pockets-tab')
        pocket_rows = pockets_tab.find_elements(By.TAG_NAME, 'tr')
        # 3 pockets one header row
        self.assertEqual(len(pocket_rows) - 1, 3)
