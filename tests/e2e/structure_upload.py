"""structure upload and processing tests"""
import os
import unittest

from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import SERVER_TIMEOUT, URL, TEST_FILES
from tests.utils.actions import upload_pdb_and_sdf, upload_ensemble_and_sdf
from tests.utils.waiters import element_has_css_class
from tests.utils.webdriver import setup_webdriver


class StructureUploadTests(unittest.TestCase):
    """structure upload and processing tests"""

    def setUp(self):
        self.driver = setup_webdriver()

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
        try:
            upload_pdb_and_sdf(self.driver)
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
        try:
            upload_ensemble_and_sdf(self.driver)
        except TimeoutException:
            raise AssertionError('Failure in structure upload') from None
        pockets_tab = self.driver.find_element(By.ID, 'pockets-tab')
        pocket_rows = pockets_tab.find_elements(By.TAG_NAME, 'tr')
        # 3 pockets one header row
        self.assertEqual(len(pocket_rows) - 1, 3)
