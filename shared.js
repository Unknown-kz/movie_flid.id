// shared.js - Contains shared constants and helper functions

// --- localStorage Keys ---
const WATCHLIST_STORAGE_KEY = 'flixid_watchlist';
const USER_INFO_STORAGE_KEY = 'flixid_userInfo';
const NOTIFICATIONS_STORAGE_KEY = 'flixid_notifications';
const RATINGS_STORAGE_KEY = 'flixid_ratings';
const COMMENTS_STORAGE_KEY_PREFIX = 'flixid_comments_'; // Suffix with movie ID
const VIEW_HISTORY_STORAGE_KEY = 'flixid_view_history';
const IS_LOGGED_IN_STORAGE_KEY = 'flixid_is_logged_in'; // For simulated login
const LANGUAGE_STORAGE_KEY = 'flixid_lang'; // Key for language preference

// --- Default User Info ---
const DEFAULT_USER_INFO = {
    name: 'Guest',
    avatar: 'https://i.pravatar.cc/40?img=1', // Default placeholder
    status: 'Free' // Example status
};

// --- Default Notifications ---
const DEFAULT_NOTIFICATIONS = [
    { id: 1, message: "Welcome to Flix.id! Log in to personalize your experience.", time: new Date().toISOString() },
    { id: 2, message: "Explore movies and series with various filters.", time: new Date(Date.now() - 3600000).toISOString() }, // 1 hour ago
];

// --- Dummy User Credentials (for simulated login) ---
// In a real app, NEVER store credentials like this!
const DUMMY_CREDENTIALS = {
    username: 'testuser',
    password: 'password123'
};

// --- Recommended Avatars ---
const RECOMMENDED_AVATARS = [
    'https://i.pravatar.cc/40?img=1',
    'https://i.pravatar.cc/40?img=2',
    'https://i.pravatar.cc/40?img=3',
    'https://i.pravatar.cc/40?img=4',
    'https://i.pravatar.cc/40?img=5',
    'https://i.pravatar.cc/40?img=6',
    'https://i.pravatar.cc/40?img=7',
    'https://i.pravatar.cc/40?img=8',
    'https://i.pravatar.cc/40?img=9',
    'https://i.pravatar.cc/40?img=10',
    'https://i.pravatar.cc/40?img=11',
    'https://i.pravatar.cc/40?img=12',
    'https://i.pravatar.cc/40?img=13',
    'https://i.pravatar.cc/40?img=14',
    'https://i.pravatar.cc/40?img=15',
    'https://i.pravatar.cc/40?img=16',
    'https://i.pravatar.cc/40?img=17',
    'https://i.pravatar.cc/40?img=18',
    'https://i.pravatar.cc/40?img=19',
    'https://i.pravatar.cc/40?img=20',
];


// --- Sample Emojis for Picker (Expanded) ---
const EMOJIS = ['😊', '😂', '😍', '👍', '🔥', '🎉', '⭐', '❤️', '💯', '🤣', '😢', '😁', '😎', '💖', '✨', '👏', '🥳', '👍', '👎', '🌟', '🎬',
 '😃', '😄', '😁', '😆', '🥹', '😅', '🤣', '🥲', '☺️', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳', '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '😱', '😨', '😰', '😥', '😓', '🤗', '🫠', '🫢', '🤫', '🤥', '😶', '🫥', '😐', '🫤', '😑', '😒', '🙄', '😬', '😮‍💨', '😴', '🤤', '🤒', '🤕', '😷', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤥', '🤫', '🫡', '🥹', '🫣', '🫶', '🤝', '👍', '👎', '✊', '👊', '🤛', '🤜', '🤞', '✌️', '🫰', '🤟', '🤘', '🤙', '👋', '🤚', '🖐️', '✋', '🖖', '🤏', '🫲', '🫱', '👇', '☝️', '👆', '🖕', '🫵'];


// --- Local Storage Helpers ---
function loadFromLocalStorage(key, defaultValue) {
    try {
        const item = localStorage.getItem(key);
        if (item === null || item === 'undefined') {
            return defaultValue;
        }
        // Special handling for Set
        if (defaultValue instanceof Set) {
            const array = JSON.parse(item);
            // Filter out any potential null/undefined values during parsing for safety
            // Ensure array is actually an array before using filter
            return new Set(Array.isArray(array) ? array.filter(val => val !== null && val !== undefined) : []);
        }
         const parsedItem = JSON.parse(item);
         // Handle potential empty arrays from JSON.parse for Sets/Arrays
         if (Array.isArray(parsedItem) && parsedItem.length === 0 && defaultValue instanceof Set) {
              return new Set();
         }
        return parsedItem;

    } catch (e) {
        console.error(`Error loading from localStorage key "${key}":`, e);
        // If loading fails, return the default value and clean up localStorage (optional but good practice)
        // localStorage.removeItem(key); // Be cautious with auto-removing
        return defaultValue;
    }
}

function saveToLocalStorage(key, value) {
    try {
        // Special handling for Set
        if (value instanceof Set) {
            localStorage.setItem(key, JSON.stringify([...value]));
        } else {
            localStorage.setItem(key, JSON.stringify(value));
        }
    } catch (e) {
        console.error(`Error saving to localStorage key "${key}":`, e);
        // Decide how to handle save errors (e.g., notify user, log)
    }
}

// Helper function to get current user info
function getUserInfo() {
    // Load user info, if not found, set default and save it for next time
    let userInfo = loadFromLocalStorage(USER_INFO_STORAGE_KEY, DEFAULT_USER_INFO);
    // Ensure default avatar is set if somehow missing after load
    if (!userInfo.avatar || userInfo.avatar.trim() === '') {
         userInfo.avatar = DEFAULT_USER_INFO.avatar;
         saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo);
    }
     // Ensure default name is set if somehow missing or empty after load
    if (!userInfo.name || userInfo.name.trim() === '') {
        userInfo.name = DEFAULT_USER_INFO.name;
        saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo);
    }
    return userInfo;
}

// Helper function to simulate adding a notification (used by index and detail pages)
function addNotification(message) {
    let notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS);
    const newNotification = {
        id: Date.now() + Math.random(), // Simple unique ID
        message: message,
        time: new Date().toISOString() // Use ISO string for better date handling
    };
    // Add the new notification at the beginning, keep only latest 50
    notifications.unshift(newNotification);
    notifications = notifications.slice(0, 50);
    saveToLocalStorage(NOTIFICATIONS_STORAGE_KEY, notifications);
    console.log("Notification added:", message);
}

// Helper function to get star rating HTML (consistent across pages)
function getStarRatingHTML(rating, maxStars = 5) {
    // Convert rating from 0-10 scale to 0-5 scale for star display
    const ratingOutOf5 = rating / 2;

    if (ratingOutOf5 === undefined || ratingOutOf5 === null || isNaN(ratingOutOf5) || ratingOutOf5 < 0) return ''; // Handle invalid ratings

    const percentage = (ratingOutOf5 / maxStars); // Percentage of the way through 5 stars
    let fullStars = Math.floor(percentage);
    const decimalPart = percentage % 1;
    let halfStar = false;

     // Determine half star based on decimal part
     if (decimalPart >= 0.25 && decimalPart < 0.75) { // Consider 0.25 to 0.74 as half star
         halfStar = true;
     } else if (decimalPart >= 0.75) { // Round up to full star if 0.75 or more
         fullStars++;
     }

    // Cap full stars at maxStars
    fullStars = Math.min(fullStars, maxStars);

    const emptyStars = maxStars - fullStars - (halfStar ? 1 : 0);

    let starsHTML = '';
    for (let i = 0; i < fullStars; i++) { starsHTML += '<i class="fas fa-star"></i>'; }
    if (halfStar) { starsHTML += '<i class="fas fa-star-half-alt"></i>'; }
    for (let i = 0; i < emptyStars; i++) { starsHTML += '<i class="far fa-star"></i>'; }

    return starsHTML;
}


// Helper function to format time for notifications/comments
function formatTimeAgo(isoString) {
    if (!isoString) return 'Unknown time';
    try {
        const date = new Date(isoString);
         if (isNaN(date.getTime())) return 'Unknown time'; // Handle invalid date strings

        const now = new Date();
        const seconds = Math.round((now.getTime() - date.getTime()) / 1000);

        if (seconds < 0) return 'just now'; // Or handle future dates differently
        if (seconds < 10) return 'just now';
        if (seconds < 60) return `${seconds} seconds ago`;
        if (seconds < 3600) return `${Math.round(seconds / 60)} minutes ago`;
        if (seconds < 86400) return `${Math.round(seconds / 3600)} hours ago`;
        if (seconds < 2592000) return `${Math.round(seconds / 86400)} days ago`; // Approx 30 days
        // For older dates, maybe just show the date?
        const dateOptions = { year: 'numeric', month: 'short', day: 'numeric' };
        return date.toLocaleDateString(navigator.language, dateOptions);

    } catch (e) {
        console.error("Error formatting time ago:", isoString, e);
        return 'Unknown time';
    }
}

// Simulated check for login status and redirect if necessary
// redirectPage is the page to go to if NOT logged in. Defaults to login.html.
// If already logged in and on the login page, redirects to index.html.
function checkLoginStatus(redirectPage = 'login.html') {
    const isLoggedIn = loadFromLocalStorage(IS_LOGGED_IN_STORAGE_KEY, false);
    const currentPagePath = window.location.pathname;
    const loginPagePath = `/${redirectPage}`; // Assumes login.html is at root or simple path

    // Ensure paths are comparable (handle leading/trailing slashes, index.html vs /)
    const normalizePath = (path) => path.replace(/^\/|\/$/g, '').replace('index.html', '').replace('.html', '').toLowerCase();

    const normalizedCurrentPath = normalizePath(currentPagePath);
    const normalizedLoginPagePath = normalizePath(loginPagePath);
    const normalizedIndexPath = normalizePath('/index.html'); // Normalize index path

    const isOnLoginPage = normalizedCurrentPath === normalizedLoginPagePath || currentPagePath.endsWith(redirectPage);
     const isOnIndexPage = normalizedCurrentPath === normalizedIndexPath || currentPagePath.endsWith('index.html') || currentPagePath === '/'; // Also handle root path

    // console.log(`Check Login Status: Is Logged In: ${isLoggedIn}, Current Page: ${currentPagePath}`);
    // console.log(`Normalized: Current: ${normalizedCurrentPath}, Login: ${normalizedLoginPagePath}, Index: ${normalizedIndexPath}`);


    if (!isLoggedIn && !isOnLoginPage) {
        console.log(`Not logged in and not on login page. Redirecting to ${redirectPage}...`);
        // Add current page to session storage so login page can redirect back
        sessionStorage.setItem('lastPage', window.location.href);
        window.location.replace(redirectPage); // Use replace so back button doesn't go to the page they were blocked from
        return false; // Not logged in, redirection happening
    }
    if (isLoggedIn && isOnLoginPage) {
         console.log("Already logged in and on login page. Redirecting away...");
          const lastPage = sessionStorage.getItem('lastPage');
          sessionStorage.removeItem('lastPage'); // Clear after reading
          // Redirect back to the last visited page if available and not login page, otherwise go to index
           const normalizedLastPage = lastPage ? new URL(lastPage, window.location.origin).pathname.replace(/^\/|\/$/g, '').replace('index.html', '').replace('.html', '').toLowerCase() : null;

          if (lastPage && normalizedLastPage !== normalizedLoginPagePath && normalizedLastPage !== '') { // Check if lastPage is valid and not login/root
             window.location.replace(lastPage);
          } else {
             window.location.replace('index.html'); // Otherwise, go to index
          }
         return true; // Logged in, redirection happening
    }
    // User is logged in and on a non-login page, or not logged in and on the login page (correct state)
    console.log("Login status OK for current page.");
    return isLoggedIn;
}

// Global access to movie data (assuming data.js is loaded)
// data.js *must* declare moviesData using `const` or `var` at the top level
// We don't need a fallback here because data.js is explicitly loaded before scripts
// (moviesData will be available if data.js is loaded)

// Helper function to track view history
function trackViewHistory(movieId) {
    if (typeof moviesData === 'undefined' || !Array.isArray(moviesData)) {
         console.warn("moviesData not available or not an array to track history.");
         return;
    }
    const movie = moviesData.find(m => m.id === movieId);
    if (!movie) {
         console.warn("Movie not found for history tracking:", movieId);
         return;
    }

    let history = loadFromLocalStorage(VIEW_HISTORY_STORAGE_KEY, []);
     // Ensure history is an array
     if (!Array.isArray(history)) {
          history = [];
     }

    const now = new Date().toISOString();

    // Find existing entry
    const existingIndex = history.findIndex(item => item.movieId === movieId);

    if (existingIndex > -1) {
        // Update timestamp for existing entry and move to front
        history[existingIndex].timestamp = now;
        const [movedItem] = history.splice(existingIndex, 1);
        history.unshift(movedItem);
    } else {
        // Add new entry to the front
        history.unshift({ movieId: movieId, timestamp: now });
    }

    // Keep history size manageable (e.g., latest 100)
    history = history.slice(0, 100);

    saveToLocalStorage(VIEW_HISTORY_STORAGE_KEY, history);
    console.log("View history updated for movie ID:", movieId);
}