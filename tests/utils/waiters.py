"""custom waiters for selenium web driver waits"""

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
