"""custom waiters for selenium web driver waits"""
from selenium.common.exceptions import NoSuchElementException

class element_has_css_class:
    """An expectation for checking that an element has a particular css class.

    :param locator: used to find the element
    :return: WebElement once it has the particular css class
    """

    def __init__(self, locator, css_class):
        self.locator = locator
        self.css_class = css_class

    def __call__(self, driver):
        element = driver.find_element(*self.locator)
        if self.css_class in element.get_attribute('class'):
            return element

        return False


class element_stays_the_same:
    """Check an element stays the same between DOM polls

    :param locator: used to find the element
    :return: True if element stayed the same
    """

    def __init__(self, locator):
        self.locator = locator
        self.element = None

    def __call__(self, driver):
        element = driver.find_element(*self.locator)
        if self.element and self.element == element:
            return True

        self.element = element
        return False

class element_not_disabled:
    """Check an element is not disabled

    :param locator: used to find the element
    :return: True if element is not disabled
    """

    def __init__(self, locator):
        self.locator = locator

    def __call__(self, driver):
        element = driver.find_element(*self.locator)
        return element.get_attribute('disabled') is not None

class js_returns_true:
    """Check JS returns true

    :param script: JS to execute
    :return: True if JS returns true
    """

    def __init__(self, script):
        self.script = script

    def __call__(self, driver):
        return driver.execute_script(self.script)

class element_does_not_exist:
    """Check an element does not exist

    :param locator: used to find the element
    :return: True if element does not exist
    """

    def __init__(self, locator):
        self.locator = locator

    def __call__(self, driver):
        try:
            element = driver.find_element(*self.locator)
            return False
        except NoSuchElementException:
            return True
