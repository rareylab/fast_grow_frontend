"""growing tests"""
import time
import unittest

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import SERVER_TIMEOUT, URL
from tests.utils.actions import upload_pdb_and_sdf, cut_ligand, get_ligand_interactions, \
    upload_ensemble_and_sdf, switch_tab
from tests.utils.waiters import element_has_css_class, element_does_not_exist
from tests.utils.webdriver import setup_webdriver


class GrowingTests(unittest.TestCase):
    """growing tests"""

    def setUp(self):
        self.driver = setup_webdriver()

    def tearDown(self):
        self.driver.close()

    def get_nof_complexes(self):
        """Get nof query complexes in the growing query"""
        query_complexes_table = self.driver.find_element(By.ID, 'query-complexes')
        query_complexes = query_complexes_table.find_elements(By.TAG_NAME, 'td')
        return len(query_complexes)

    def get_query_core(self):
        """Get name of the query core"""
        query_core_field = self.driver.find_element(By.ID, 'query-core')
        return query_core_field.get_attribute('value')

    def get_nof_interactions(self):
        """Get nof query interactions in the growing query"""
        query_interactions_table = self.driver.find_element(By.ID, 'query-interactions')
        query_interactions = query_interactions_table.find_elements(By.TAG_NAME, 'tr')
        return len(query_interactions) - 1  # remove header

    def perform_growing(self):
        """Perform a growing and wait until it finishes"""
        grow_button = self.driver.find_element(By.ID, 'grow-button')
        grow_button.click()
        WebDriverWait(self.driver, SERVER_TIMEOUT).until(
            element_has_css_class((By.ID, 'results-tab'), 'active'))
        time.sleep(SERVER_TIMEOUT)

    def get_nof_hits(self):
        """Get nof hits in the growing results"""
        query_tab = self.driver.find_element(By.ID, 'results-tab')
        # one header row, the rest are hits
        return len(query_tab.find_elements(By.TAG_NAME, 'tr')) - 1

    def get_nof_headers(self):
        """Get nof headers in the result table"""
        query_tab = self.driver.find_element(By.ID, 'results-tab')
        return len(query_tab.find_elements(By.TAG_NAME, 'th'))

    def test_growing(self):
        """Test a simple growing with one complex and one ligand"""
        self.driver.get(URL)
        upload_pdb_and_sdf(self.driver)
        cut_ligand(self.driver)

        switch_tab(self.driver, 'query-tab', 'growing-dropdown')
        self.assertEqual(self.get_nof_complexes(), 1)
        self.assertEqual(self.get_query_core(), '7A4R_1_8_2')

        self.perform_growing()
        self.assertGreater(self.get_nof_hits(), 0)

    def test_growing_interactions(self):
        """Test a growing with an interaction"""
        self.driver.get(URL)
        upload_pdb_and_sdf(self.driver)
        cut_ligand(self.driver)
        get_ligand_interactions(self.driver)

        # pick interaction
        interactions_tab = self.driver.find_element(By.ID, 'ligand-interactions-tab')
        interaction_rows = interactions_tab.find_elements(By.TAG_NAME, 'tr')
        interaction_rows[4].click()

        switch_tab(self.driver, 'query-tab', 'growing-dropdown')
        self.assertEqual(self.get_nof_complexes(), 1)
        self.assertEqual(self.get_query_core(), '7A4R_1_8_2')
        self.assertEqual(self.get_nof_interactions(), 1)

        self.perform_growing()
        self.assertGreater(self.get_nof_hits(), 0)

    def test_growing_ensemble(self):
        """Test a growing with an ensemble"""
        self.driver.get(URL)
        upload_ensemble_and_sdf(self.driver)
        pockets_tab = self.driver.find_element(By.ID, 'pockets-tab')
        pocket_rows = pockets_tab.find_elements(By.TAG_NAME, 'tr')
        pocket_rows[1].click()

        switch_tab(self.driver, 'cut-tab')
        cut_ligand(self.driver)

        switch_tab(self.driver, 'query-tab', 'growing-dropdown')
        self.assertEqual(self.get_nof_complexes(), 3)
        self.assertEqual(self.get_query_core(), '7A4R_1_8_2')

        self.perform_growing()
        self.assertGreater(self.get_nof_hits(), 0)
        self.assertEqual(self.get_nof_headers() - 3, 3)  # 3 fixed headers and 3 proteins in ensemble
