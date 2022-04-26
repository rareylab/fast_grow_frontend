"""interactions tests"""
import unittest

from selenium.webdriver.common.by import By

from tests import URL
from tests.utils.actions import upload_pdb_and_sdf, get_ligand_interactions
from tests.utils.webdriver import setup_webdriver


class InteractionsTests(unittest.TestCase):
    """interactions tests"""

    def setUp(self):
        self.driver = setup_webdriver()

    def tearDown(self):
        self.driver.close()

    def test_interaction_loading(self):
        """Test that interactions are loaded on switch to an interaction tab"""
        self.driver.get(URL)
        upload_pdb_and_sdf(self.driver)
        get_ligand_interactions(self.driver)
        interactions_tab = self.driver.find_element(By.ID, 'ligand-interactions-tab')
        interaction_rows = interactions_tab.find_elements(By.TAG_NAME, 'tr')
        # 7 interactions one header row
        self.assertEqual(len(interaction_rows) - 1, 7)
