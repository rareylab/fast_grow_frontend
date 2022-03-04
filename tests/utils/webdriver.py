"""utilities for working with selenium web drivers"""
from selenium import webdriver
from selenium.webdriver.chrome.service import Service

from tests import CHROME, CHROMEDRIVER, HEADLESS


def setup_webdriver():
    """Setup a chrome web driver

    Options for the webdriver are taken from the __init__.py

    :return: chrome web driver
    """
    service = Service(CHROMEDRIVER)
    chrome_options = webdriver.ChromeOptions()
    chrome_options.headless = HEADLESS
    chrome_options.binary_location = CHROME
    # prevent CORS problems when using a localhost server
    chrome_options.add_argument('--disable-web-security')
    return webdriver.Chrome(service=service, options=chrome_options)
