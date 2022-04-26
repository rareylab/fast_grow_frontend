"""growing tests"""
import os
import time
import unittest

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import SERVER_TIMEOUT, URL, TEST_FILES
from tests.utils.waiters import element_has_css_class, element_not_disabled, element_does_not_exist
from tests.utils.webdriver import setup_webdriver


class GrowingTests(unittest.TestCase):
    """growing tests"""

    def setUp(self):
        self.driver = setup_webdriver()

    def tearDown(self):
        self.driver.close()

    def test_growing(self):
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'cut-tab-trigger'), 'active'))

        # bond cutting
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

        # growing query
        growing_dropdown_trigger = self.driver.find_element(By.ID, 'growing-dropdown')
        growing_dropdown_trigger.click()
        query_tab_trigger = self.driver.find_element(By.ID, 'query-tab-trigger')
        query_tab_trigger.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'query-tab'), 'active'))

        # check complexes
        query_complexes_table = self.driver.find_element(By.ID, 'query-complexes')
        query_complexes = query_complexes_table.find_elements(By.TAG_NAME, 'td')
        nof_query_complexes = len(query_complexes)
        self.assertEqual(nof_query_complexes, 1)

        # check core
        query_core_field = self.driver.find_element(By.ID, 'query-core')
        query_core = query_core_field.get_attribute('value')
        self.assertEqual(query_core, '7A4R_1_8_2')

        # check interactions
        query_interactions_table = self.driver.find_element(By.ID, 'query-interactions')
        query_interactions = query_interactions_table.find_elements(By.TAG_NAME, 'tr')
        nof_query_interactions = len(query_interactions) - 1  # remove header
        self.assertEqual(nof_query_interactions, 0)

        grow_button = self.driver.find_element(By.ID, 'grow-button')
        grow_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'results-tab'), 'active'))
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_does_not_exist((By.CLASS_NAME, 'spinner-grow')))
        query_tab = self.driver.find_element(By.ID, 'results-tab')
        # one header row, the rest are hits
        nof_hits = len(query_tab.find_elements(By.TAG_NAME, 'tr')) - 1
        self.assertGreater(nof_hits, 0)

    def test_growing_interactions(self):
        self.driver.get(URL)
        protein_file_field = self.driver.find_element(By.ID, 'protein-file-field')
        protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
        ligand_file_field = self.driver.find_element(By.ID, 'ligand-file-field')
        ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
        upload_button = self.driver.find_element(By.ID, 'structure-upload-button')
        upload_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'cut-tab-trigger'), 'active'))

        # bond cutting
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

        # interactions
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
        interaction_rows[4].click()

        # growing query
        growing_dropdown_trigger = self.driver.find_element(By.ID, 'growing-dropdown')
        growing_dropdown_trigger.click()
        query_tab_trigger = self.driver.find_element(By.ID, 'query-tab-trigger')
        query_tab_trigger.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'query-tab'), 'active'))

        # check complexes
        query_complexes_table = self.driver.find_element(By.ID, 'query-complexes')
        query_complexes = query_complexes_table.find_elements(By.TAG_NAME, 'td')
        nof_query_complexes = len(query_complexes)
        self.assertEqual(nof_query_complexes, 1)

        # check core
        query_core_field = self.driver.find_element(By.ID, 'query-core')
        query_core = query_core_field.get_attribute('value')
        self.assertEqual(query_core, '7A4R_1_8_2')

        # check interactions
        query_interactions_table = self.driver.find_element(By.ID, 'query-interactions')
        query_interactions = query_interactions_table.find_elements(By.TAG_NAME, 'tr')
        nof_query_interactions = len(query_interactions) - 1  # remove header
        self.assertEqual(nof_query_interactions, 1)

        grow_button = self.driver.find_element(By.ID, 'grow-button')
        grow_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'results-tab'), 'active'))
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_does_not_exist((By.CLASS_NAME, 'spinner-grow')))
        query_tab = self.driver.find_element(By.ID, 'results-tab')
        # one header row, the rest are hits
        nof_hits = len(query_tab.find_elements(By.TAG_NAME, 'tr')) - 1
        self.assertGreater(nof_hits, 0)
