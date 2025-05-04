// login.js - Handles the simulated login page logic

// Assume shared.js is loaded BEFORE login.js

// --- Language State ---
let currentLanguage = 'en';
let translations = {};

// --- Language Functions ---
function loadTranslations() {
    try {
        const langDataScript = document.getElementById('lang-data-login');
        if (langDataScript) {
             translations = JSON.parse(langDataScript.textContent);
        } else {
            console.warn("Language data script tag with id 'lang-data-login' not found.");
            translations = { en: {} }; // Fallback
        }
        currentLanguage = loadFromLocalStorage(LANGUAGE_STORAGE_KEY, 'en');
        if (!translations[currentLanguage]) {
             currentLanguage = 'en'; // Fallback
        }
        // Removed language selector logic as it doesn't exist on login.html
    } catch (e) {
        console.error("Error loading translations:", e);
        translations = { en: {} };
        currentLanguage = 'en';
    }
}

function getTranslation(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;
     for (const [placeholder, value] of Object.entries(replacements)) {
         text = text.replace(`{${placeholder}}`, value);
     }
     return text;
}

function applyTranslations() {
    // Find all elements with data-lang-key and apply translation
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.dataset.langKey;
        if (key) {
            if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = getTranslation(key);
            } else if (element.title !== undefined) {
                 element.title = getTranslation(key);
            } else {
                 element.textContent = getTranslation(key);
            }
        }
    });
     // Apply translation to the login message if it's visible
     const loginMessageElement = document.getElementById('login-message');
     if (loginMessageElement && loginMessageElement.dataset.langKeyMessage) {
         // Re-set the translated message if it was previously set by the script
          const key = loginMessageElement.dataset.langKeyMessage;
          // Check if there's an actual message text before translating a potentially empty string
          if (loginMessageElement.textContent.trim() !== '') {
               loginMessageElement.textContent = getTranslation(key);
          }
     }
}


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded for login.html");

    // Load translations first
     loadTranslations();
     applyTranslations(); // Apply initial translations

    // Check if already logged in, redirect to index if so
    // checkLoginStatus already handles redirection if necessary
    if (!checkLoginStatus('login.html')) { // Pass login.html as the redirect page
        // checkLoginStatus initiated a redirect because user is NOT logged in and NOT on login page
        // or user IS logged in and IS on login page.
        // In either case, if it returns false, it means a redirect is happening.
        // In the context of login.js, if checkLoginStatus returns FALSE, it means the user is NOT logged in.
        // If they are currently on login.html, we proceed with the login form. If they were not on login.html,
        // checkLoginStatus would have redirected them *to* login.html, and the script would restart.
        // So, if we reach this point and checkLoginStatus returned FALSE, it's the correct state to show the login form.
        console.log("checkLoginStatus returned false, user is not logged in. Proceeding with login form.");

    } else {
         // This branch means checkLoginStatus returned TRUE, meaning the user *was* logged in.
         // checkLoginStatus should have already handled the redirect away from login.html if they were logged in.
         // If we somehow reach here and are still on login.html, it's an unexpected state, but let's proceed defensively.
         console.log("checkLoginStatus returned true, but still on login page. This is unexpected, but proceeding cautiously.");
    }


    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password'); // Added password input
    const loginMessage = document.getElementById('login-message');
    if (!loginForm || !usernameInput || !passwordInput || !loginMessage) {
         console.error("Login form elements not found!");
         return; // Cannot proceed without required elements
    }


    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const enteredUsername = usernameInput.value.trim();
        const enteredPassword = passwordInput.value; // Get entered password

        // Simulated login check (using dummy credentials)
        if (enteredUsername === DUMMY_CREDENTIALS.username && enteredPassword === DUMMY_CREDENTIALS.password) {
             saveToLocalStorage(IS_LOGGED_IN_STORAGE_KEY, true);

             let userInfo = loadFromLocalStorage(USER_INFO_STORAGE_KEY, DEFAULT_USER_INFO);
             // Only update name if it's the default guest name or empty
             if (userInfo.name === DEFAULT_USER_INFO.name || !userInfo.name || userInfo.name.trim() === '') {
                 userInfo.name = enteredUsername;
             }
             // Ensure avatar is set if somehow missing
             if (!userInfo.avatar || userInfo.avatar.trim() === '') {
                 userInfo.avatar = DEFAULT_USER_INFO.avatar;
             }
             saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo);

             // Add a welcome notification
             addNotification(`Welcome, ${enteredUsername}! You have logged in.`);

             // Redirect to the last page visited, or index.html
             const lastPage = sessionStorage.getItem('lastPage');
             sessionStorage.removeItem('lastPage'); // Clear the stored page after retrieving
             const normalizedLoginPagePath = new URL('login.html', window.location.origin).pathname.replace(/^\/|\/$/g, '').replace('.html', '').toLowerCase();
             const normalizedLastPage = lastPage ? new URL(lastPage, window.location.origin).pathname.replace(/^\/|\/$/g, '').replace('index.html', '').replace('.html', '').toLowerCase() : null;

             if (lastPage && normalizedLastPage !== normalizedLoginPagePath && normalizedLastPage !== '') { // Check if lastPage is valid and not login/root
                  window.location.replace(lastPage);
             } else {
                 window.location.replace('index.html'); // Use replace for history management
             }


        } else {
             // Update message for invalid credentials
            loginMessage.textContent = getTranslation('login_message_invalid_credentials');
            loginMessage.style.color = 'red';
            loginMessage.dataset.langKeyMessage = 'login_message_invalid_credentials'; // Store key for language switch
             console.warn("Invalid login attempt.");
        }
    });

    // Apply translation specifically to the placeholder if it gets set initially
     if (usernameInput) { // Ensure element exists before accessing placeholder
          usernameInput.placeholder = getTranslation('login_username_label'); // Use username label as placeholder
     }
     if (passwordInput) { // Ensure element exists before accessing placeholder
          passwordInput.placeholder = getTranslation('login_password_label'); // Use password label as placeholder
     }
});