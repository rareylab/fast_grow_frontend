"""Collection of coming actions. Be aware of the context these are called in."""
import os
import time

from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait

from tests import SERVER_TIMEOUT, TEST_FILES
from tests.utils.waiters import element_has_css_class, element_not_disabled, element_does_not_exist


def upload_pdb_and_sdf(driver):
    """Upload a PDB and an SDF using the frontend"""
    protein_file_field = driver.find_element(By.ID, 'protein-file-field')
    protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
    ligand_file_field = driver.find_element(By.ID, 'ligand-file-field')
    ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
    upload_button = driver.find_element(By.ID, 'structure-upload-button')
    upload_button.click()
    WebDriverWait(driver, SERVER_TIMEOUT).until(
        element_has_css_class((By.ID, 'cut-tab-trigger'), 'active'))


def upload_ensemble_and_sdf(driver):
    """Upload multiple PDBs and one SDF"""
    protein_file_field = driver.find_element(By.ID, 'protein-file-field')
    protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.pdb'))
    protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4S_3.pdb'))
    protein_file_field.send_keys(os.path.join(TEST_FILES, '7A4W_4.pdb'))
    ligand_file_field = driver.find_element(By.ID, 'ligand-file-field')
    ligand_file_field.send_keys(os.path.join(TEST_FILES, '7A4R_1.sdf'))
    upload_button = driver.find_element(By.ID, 'structure-upload-button')
    upload_button.click()
    WebDriverWait(driver, SERVER_TIMEOUT).until(
        element_has_css_class((By.ID, 'pockets-tab-trigger'), 'active'))


def cut_ligand(driver):
    """Pick and cut a bond in 7A4R_1.sdf"""
    # These coordinates and atom indexes only fit for 7A4R_1.sdf
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
    driver.execute_script(pick_bond)
    cut_button = driver.find_element(By.ID, 'clip-button')
    time.sleep(1)  # race condition fear
    cut_button.click()
    WebDriverWait(driver, SERVER_TIMEOUT).until(
        element_not_disabled((By.ID, 'clip-button')))


def get_ligand_interactions(driver):
    """Switch to the ligand interactions tab and wait for the interactions to load"""
    switch_tab(driver, 'ligand-interactions-tab', 'interactions-dropdown')
    WebDriverWait(driver, SERVER_TIMEOUT).until(
        element_does_not_exist((By.CLASS_NAME, 'spinner-grow')))


def switch_tab(driver, tab_name, dropdown_name=None):
    """Switch frontend to a tab"""
    if dropdown_name:
        ligand_tab_trigger = driver.find_element(By.ID, dropdown_name)
        ligand_tab_trigger.click()
    ligand_tab_trigger = driver.find_element(By.ID, tab_name + '-trigger')
    ligand_tab_trigger.click()
    WebDriverWait(driver, SERVER_TIMEOUT).until(
        element_has_css_class((By.ID, tab_name), 'active'))
