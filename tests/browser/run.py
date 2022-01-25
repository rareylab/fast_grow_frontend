"""Open the RUNNER in chrome and report the results"""
import os
import sys

from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service

from tests import CHROMEDRIVER, HEADLESS, SERVER_TIMEOUT
from tests.utils.waiters import element_stays_the_same

RUNNER = os.path.join(os.path.dirname(__file__), 'SpecRunner.html')


def print_stats(driver, failures):
    """Print a mocha runs stats

    Stats are passes, failures, and duration
    :param driver: webdriver
    """
    passes_element = driver.find_element(By.CLASS_NAME, 'passes')
    failures_element = driver.find_element(By.CLASS_NAME, 'failures')
    duration_element = driver.find_element(By.CLASS_NAME, 'duration')
    print(f'  {passes_element.text}  {duration_element.text}')
    if failures:
        print(f'  {failures_element.text}')


def print_test(test_element):
    """Print a mocha test
    :param test_element: DOM element of the test
    """
    title_element = test_element.find_element(By.TAG_NAME, 'h2')
    title = title_element.text.split('\n')[0]
    classes = test_element.get_attribute('class')
    if 'fail' in classes:
        print(f'    ✕ {title}')
        return

    # mocha only displays duration on "medium" and "slow" running tests
    duration_element = title_element.find_element(By.TAG_NAME, 'span')
    if duration_element.text:
        title = title.split(duration_element.text)[0]
        print(f'    ✓ {title} ({duration_element.text})')
    else:
        print(f'    ✓ {title}')


def print_suite(suite):
    """Print a mocha test suite
    :param suite: test suite DOM element
    """
    title_element = suite.find_element(By.TAG_NAME, 'h1')
    print(f'  {title_element.text}')
    test_elements = suite.find_elements(By.TAG_NAME, 'li')
    for test_element in test_elements:
        print_test(test_element)
    print()


def print_report(driver):
    """Print a mocha test report

    :param driver: webdriver
    """
    report_element = driver.find_element(By.ID, 'mocha-report')
    suites = report_element.find_elements(By.CLASS_NAME, 'suite')
    for suite in suites:
        print_suite(suite)


def has_failures(driver):
    """Were there mocha unit test failures
    :param driver: webdriver
    :return: number of failures
    """
    failure_elements = driver.find_elements(By.CLASS_NAME, 'fail')
    return len(failure_elements)


def main():
    """Open the RUNNER in chrome and report the results

    Will exit with a positive exit code on unit test failures
    """
    service = Service(CHROMEDRIVER)
    chrome_options = webdriver.ChromeOptions()
    chrome_options.headless = HEADLESS
    driver = webdriver.Chrome(service=service, options=chrome_options)
    try:
        driver.get('file://' + RUNNER)
        WebDriverWait(driver, SERVER_TIMEOUT).until(
            element_stays_the_same((By.CLASS_NAME, 'duration')))
        print_report(driver)
        print()
        print()
        failures = has_failures(driver)
        print_stats(driver, failures)
    finally:
        driver.quit()
    if failures:
        sys.exit(1)


if __name__ == '__main__':
    main()
