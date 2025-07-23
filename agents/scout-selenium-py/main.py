import os
import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from bs4 import BeautifulSoup


def get_env_or_fail(var_name):
    value = os.environ.get(var_name)
    if not value:
        raise RuntimeError(f"Missing required environment variable: {var_name}")
    return value


def main():
    # --- Config ---
    LINKEDIN_USER = get_env_or_fail('LINKEDIN_USER')
    LINKEDIN_PASS = get_env_or_fail('LINKEDIN_PASS')
    SALES_NAVIGATOR_URL = get_env_or_fail('SALES_NAVIGATOR_URL')
    CSV_FILENAME = os.environ.get('CSV_FILENAME', 'sales_navigator_results.csv')

    # --- Setup Selenium WebDriver ---
    chrome_options = Options()
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--disable-gpu')
    chrome_options.add_argument('--window-size=1920,1080')
    chrome_options.add_argument('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')

    driver = webdriver.Chrome(options=chrome_options)
    print("[Scout-Selenium-Py] WebDriver initialized successfully.")

    all_scraped_data = []
    page_count = 1

    try:
        # --- Login ---
        print("[Scout-Selenium-Py] Navigating to LinkedIn login page...")
        driver.get("https://www.linkedin.com/login")
        time.sleep(3)
        user_field = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "username"))
        )
        user_field.send_keys(LINKEDIN_USER)
        pass_field = driver.find_element(By.ID, "password")
        pass_field.send_keys(LINKEDIN_PASS)
        login_button = driver.find_element(By.XPATH, "//button[@type='submit']")
        login_button.click()
        print("[Scout-Selenium-Py] Login submitted.")
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CLASS_NAME, "global-nav__search-input"))
        )
        print("[Scout-Selenium-Py] Login successful.")

        # --- Data Extraction & Pagination ---
        print(f"[Scout-Selenium-Py] Navigating to Sales Navigator URL: {SALES_NAVIGATOR_URL}")
        driver.get(SALES_NAVIGATOR_URL)
        while True:
            print(f"\n--- Scraping Page {page_count} ---")
            results_container_selector = "ol.artdeco-list"
            WebDriverWait(driver, 20).until(
                EC.visibility_of_element_located((By.CSS_SELECTOR, results_container_selector))
            )
            print("[Scout-Selenium-Py] Search results page loaded.")
            time.sleep(3)
            soup = BeautifulSoup(driver.page_source, 'html.parser')
            contact_list_items = soup.select(f"{results_container_selector} > li.artdeco-list__item")
            print(f"[Scout-Selenium-Py] Found {len(contact_list_items)} contacts on this page.")
            if not contact_list_items:
                print("[Scout-Selenium-Py] No contacts found on page, ending pagination.")
                break
            for contact in contact_list_items:
                try:
                    name_element = contact.select_one("a.ember-view.link-without-visited-state")
                    title_element = contact.select_one("div.artdeco-entity-lockup__subtitle > span")
                    name = name_element.text.strip() if name_element else "N/A"
                    title = title_element.text.strip() if title_element else "N/A"
                    all_scraped_data.append({"Name": name, "Title": title})
                except Exception as e:
                    print(f"[Scout-Selenium-Py] Could not parse a contact item: {e}")
            try:
                next_button = driver.find_element(By.XPATH, "//button[contains(@aria-label, 'Next')]")
                if not next_button.is_enabled():
                    print("[Scout-Selenium-Py] 'Next' button is disabled. Reached the last page.")
                    break
                driver.execute_script("arguments[0].click();", next_button)
                page_count += 1
                print("[Scout-Selenium-Py] 'Next' button clicked. Moving to next page...")
            except NoSuchElementException:
                print("[Scout-Selenium-Py] 'Next' button not found. Assuming it is the only page.")
                break
    except Exception as e:
        print(f"[Scout-Selenium-Py] ❌ An error occurred: {e}")
    finally:
        if all_scraped_data:
            df = pd.DataFrame(all_scraped_data)
            print(f"\n[Scout-Selenium-Py] ✅ Pagination and scraping complete. Total contacts found: {len(all_scraped_data)}")
            print(f"[Scout-Selenium-Py] 💾 Saving results to {CSV_FILENAME}...")
            try:
                df.to_csv(CSV_FILENAME, index=False, encoding='utf-8-sig')
                print(f"[Scout-Selenium-Py] ✅ Successfully saved results to {CSV_FILENAME}.")
            except Exception as e:
                print(f"[Scout-Selenium-Py] ❌ Failed to save CSV file: {e}")
        else:
            print("[Scout-Selenium-Py] No data was scraped.")
        if driver:
            driver.quit()
            print("[Scout-Selenium-Py] WebDriver closed.")

if __name__ == "__main__":
    main() 