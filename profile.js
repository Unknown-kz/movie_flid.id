// profile.js - Handles the user profile page logic

// Assume shared.js and data.js are loaded BEFORE profile.js

// --- Language State ---
let currentLanguage = 'en';
let translations = {};

// --- DOM Elements ---
const profilePageTitle = document.getElementById('profile-page-title');
const profileAvatar = document.getElementById('profile-avatar');
const profileName = document.getElementById('profile-name');
const profileStatus = document.getElementById('profile-status');
const historyTitle = document.getElementById('history-title');
const historyListElement = document.getElementById('history-list');
const noHistoryMessage = document.getElementById('no-history-message');

const profileCommentsTitle = document.getElementById('profile-comments-title');
const profileCommentsListElement = document.getElementById('profile-comments-list');
const noCommentsProfileMessage = document.getElementById('no-comments-profile-message');

const profileRatingsTitle = document.getElementById('profile-ratings-title');
const profileRatingsListElement = document.getElementById('profile-ratings-list');
const noRatingsProfileMessage = document.getElementById('no-ratings-profile-message');

const loadingOverlay = document.getElementById('loading-overlay'); // Keep the element reference

// --- Header Elements (Duplicated from index.html) ---
const profileHeaderSection = document.querySelector('header.app-header');
const notificationBtnProfile = document.getElementById('notification-btn-profile');
const notificationPanelProfile = document.getElementById('notification-panel-profile');
const notificationBadgeProfile = document.getElementById('notification-badge-profile');
const notificationsListProfile = document.getElementById('notifications-list-profile');
const noNotificationsMessageProfile = document.getElementById('no-notifications-message-profile');
const languageSelectProfile = document.getElementById('language-select-profile'); // Keep reference for language change handler
const userProfileToggleProfile = document.getElementById('user-profile-toggle-profile');
const accountDropdownProfile = document.getElementById('account-dropdown-profile');
const userNameElementProfile = document.getElementById('user-name-profile');
const userStatusElementProfile = document.getElementById('user-status-profile');
const userAvatarElementProfile = document.getElementById('user-avatar-profile');
const editProfileButtonProfile = document.getElementById('edit-profile-btn-profile');
const logoutButtonProfile = document.getElementById('logout-btn-profile');
const appLogoProfile = document.getElementById('app-logo-profile');

// Profile Edit Modal Elements (Duplicated for profile page)
const profileEditModalProfile = document.getElementById('profile-edit-modal-profile');
const avatarPreviewProfile = document.getElementById('avatar-preview-profile');
const avatarUploadInputProfile = document.getElementById('avatar-upload-input-profile');
const editNameInputProfile = document.getElementById('edit-name-profile');
const recommendedAvatarsListProfile = document.getElementById('recommended-avatars-list-profile');
const saveProfileBtnProfile = document.getElementById('save-profile-edit-profile');
const cancelProfileBtnProfile = document.getElementById('cancel-profile-edit-profile');


// --- Language Functions ---
function loadTranslations() {
    try {
        const langDataScript = document.getElementById('lang-data-profile');
        if (langDataScript) {
             translations = JSON.parse(langDataScript.textContent);
        } else {
            console.warn("Language data script tag with id 'lang-data-profile' not found.");
            translations = { en: {} };
        }
        currentLanguage = loadFromLocalStorage(LANGUAGE_STORAGE_KEY, 'en');
        if (!translations[currentLanguage]) {
             currentLanguage = 'en';
        }
         // Set the dropdown to the current language if it exists
         if (languageSelectProfile) {
             languageSelectProfile.value = currentLanguage;
         }
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
     // Apply translations to elements with data-lang-key attributes
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

     // Re-render dynamic lists that include translations
     renderHistory();
     renderUserComments();
     renderUserRatings();

     // Apply translations to header elements that might not have data-lang-key
     renderNotificationsProfile();
     renderUserInfoProfile(); // Update user info text like status if translated
}


// --- FUNCTIONS ---
// Note: Loading overlay functions are removed as requested
// function showLoading() { loadingOverlay.classList.add('visible'); }
// function hideLoading() { setTimeout(() => { loadingOverlay.classList.remove('visible'); }, 200); }


function renderProfile() {
     // Removed showLoading() call
     if (!checkLoginStatus('login.html')) {
          // Removed hideLoading() call
          return;
     }

    const userInfo = getUserInfo();
    if(profileAvatar) profileAvatar.src = userInfo.avatar;
    if(profileName) profileName.textContent = userInfo.name;
    if(profileStatus) profileStatus.textContent = userInfo.status; // Translation applied via applyTranslations

    // Render all sections
    renderHistory();
    renderUserComments();
    renderUserRatings();

    // Removed hideLoading() call
}

function renderHistory() {
    const history = loadFromLocalStorage(VIEW_HISTORY_STORAGE_KEY, []);
    if (!historyListElement) { console.warn("History list element not found."); return; }
    historyListElement.innerHTML = '';

    // Ensure moviesData is loaded and is an array before iterating
    if (typeof moviesData === 'undefined' || !Array.isArray(moviesData)) {
         console.warn("moviesData is not available or not an array when trying to render history.");
         if (noHistoryMessage) noHistoryMessage.style.display = 'block'; // Show no history message
         return;
    }


    if (history.length === 0) {
        if (noHistoryMessage) noHistoryMessage.style.display = 'block';
    } else {
        if (noHistoryMessage) noHistoryMessage.style.display = 'none';
        // Sort by timestamp descending (newest first)
        history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        history.forEach(item => {
            const movie = moviesData.find(m => m.id === item.movieId);
            if (movie) {
                const historyItem = document.createElement('li');
                historyItem.classList.add('history-item');

                const timeString = formatTimeAgo(item.timestamp); // Use shared formatter

                historyItem.innerHTML = `
                     <a href="movie_detail.html?id=${movie.id}#"> <!-- Link to detail page -->
                        <span>${movie.title || 'Unknown Title'}</span>
                        <span>${getTranslation('watched_on')} ${timeString}</span>
                     </a>
                `;

                historyListElement.appendChild(historyItem);
            }
        });
    }
}

function renderUserComments() {
    const userInfo = getUserInfo();
    if (!profileCommentsListElement) { console.warn("Profile comments list element not found."); return; }
    profileCommentsListElement.innerHTML = '';

    const allUserComments = [];
     // Ensure moviesData is loaded and is an array before iterating
    if (typeof moviesData !== 'undefined' && Array.isArray(moviesData)) {
        moviesData.forEach(movie => {
            const comments = loadFromLocalStorage(COMMENTS_STORAGE_KEY_PREFIX + movie.id, []);
             // Ensure comments is an array
             if (Array.isArray(comments)) {
                  comments.forEach(comment => {
                      // Check if user matches OR if it's a reply and the parent comment's user matches (more complex logic,
                      // but for simplicity here, we'll just list comments where the current user is the author)
                      if (comment.user === userInfo.name) {
                          allUserComments.push({
                              ...comment,
                              movieTitle: movie.title || 'Unknown Title',
                              movieId: movie.id
                          });
                      }
                  });
             } else {
                  console.warn(`Comments data for movie ID ${movie.id} is not an array.`);
             }
        });
    } else {
         console.warn("moviesData is not available or not an array when trying to render user comments.");
    }


    allUserComments.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Newest first

    if (allUserComments.length === 0) {
        if (noCommentsProfileMessage) noCommentsProfileMessage.style.display = 'block';
    } else {
        if (noCommentsProfileMessage) noCommentsProfileMessage.style.display = 'none';
        allUserComments.forEach(comment => {
            const commentItem = document.createElement('li');
            commentItem.classList.add('profile-comment-item');

            const timeString = formatTimeAgo(comment.timestamp); // Use shared formatter

            commentItem.innerHTML = `
                 <a href="movie_detail.html?id=${comment.movieId}#comments-section"> <!-- Link to comments section -->
                     <span>${comment.movieTitle}</span>
                     <span>${getTranslation('commented_on')} ${timeString}</span>
                     <span class="comment-preview">${comment.text}</span>
                 </a>
            `;
            profileCommentsListElement.appendChild(commentItem);
        });
    }
}


function renderUserRatings() {
    if (!profileRatingsListElement) { console.warn("Profile ratings list element not found."); return; }
    profileRatingsListElement.innerHTML = '';

    const userRatings = loadFromLocalStorage(RATINGS_STORAGE_KEY, {});
    const ratedMovieIds = Object.keys(userRatings).map(id => parseInt(id, 10)).filter(id => !isNaN(id)); // Filter out invalid IDs

     // Ensure moviesData is loaded and is an array before filtering
    if (typeof moviesData === 'undefined' || !Array.isArray(moviesData)) {
         console.warn("moviesData is not available or not an array when trying to render user ratings.");
         if (noRatingsProfileMessage) noRatingsProfileMessage.style.display = 'block'; // Show no ratings message
         return;
    }

    const ratedMovies = moviesData.filter(movie => ratedMovieIds.includes(movie.id));

    ratedMovies.sort((a, b) => (a.title || '').localeCompare(b.title || '')); // Sort by title (handle missing titles)


    if (ratedMovies.length === 0) {
        if (noRatingsProfileMessage) noRatingsProfileMessage.style.display = 'block';
    } else {
        if (noRatingsProfileMessage) noRatingsProfileMessage.style.display = 'none';
        ratedMovies.forEach(movie => {
            const rating = userRatings[movie.id];

             // Only show ratings that are valid numbers > 0
             if (typeof rating !== 'number' || isNaN(rating) || rating <= 0) return;

            const ratingItem = document.createElement('li');
            ratingItem.classList.add('profile-rating-item');

            ratingItem.innerHTML = `
                 <a href="movie_detail.html?id=${movie.id}#rating-section"> <!-- Link to rating section -->
                     <span>${movie.title || 'Unknown Title'}</span>
                     <span class="rating-display">
                          ${getStarRatingHTML(rating)} ${rating.toFixed(1)}/10
                     </span>
                 </a>
            `;
            profileRatingsListElement.appendChild(ratingItem);
        });
    }
}

// --- Header Functionality (Profile Page) ---
function renderUserInfoProfile() {
    const userInfo = getUserInfo();
    if (userNameElementProfile) userNameElementProfile.textContent = userInfo.name; else console.warn("userNameElementProfile not found");
    if (userStatusElementProfile) userStatusElementProfile.textContent = userInfo.status; else console.warn("userStatusElementProfile not found");
    if (userAvatarElementProfile) userAvatarElementProfile.src = userInfo.avatar; else console.warn("userAvatarElementProfile not found");
    if (avatarPreviewProfile) avatarPreviewProfile.src = userInfo.avatar;
}

function renderNotificationsProfile() {
    notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS);
    if (notificationsListProfile) notificationsListProfile.innerHTML = ''; else { console.warn("Notifications list element not found (profile)."); return; }

    if (notifications.length === 0) {
        if (noNotificationsMessageProfile) noNotificationsMessageProfile.style.display = 'block';
    } else {
        if (noNotificationsMessageProfile) noNotificationsMessageProfile.style.display = 'none';
        notifications.forEach(notif => {
            const item = document.createElement('div');
            item.classList.add('notification-item');
            item.innerHTML = `${notif.message} <span class="time">${formatTimeAgo(notif.time)}</span>`;
            if (notificationsListProfile) notificationsListProfile.appendChild(item);
        });
    }
    updateNotificationBadgeProfile();
}

function updateNotificationBadgeProfile() {
     const unreadCount = notifications.length;
     if (notificationBadgeProfile) {
         if (unreadCount > 0) {
              notificationBadgeProfile.textContent = unreadCount;
              notificationBadgeProfile.classList.remove('hidden');
         } else {
              notificationBadgeProfile.classList.add('hidden');
         }
     }
}

function toggleAccountDropdownProfile(event) {
    event.stopPropagation();
    if (accountDropdownProfile) accountDropdownProfile.classList.toggle('show');
    if (userProfileToggleProfile) userProfileToggleProfile.classList.toggle('open');
    if (notificationPanelProfile) notificationPanelProfile.classList.remove('show');
}

function toggleNotificationPanelProfile(event) {
    event.stopPropagation();
    if (notificationPanelProfile) notificationPanelProfile.classList.toggle('show');
    if (accountDropdownProfile) accountDropdownProfile.classList.remove('show');
    if (userProfileToggleProfile) userProfileToggleProfile.classList.remove('open');

    if (notificationPanelProfile?.classList.contains('show')) {
         // Simulated marking all as read
        if (notificationBadgeProfile) notificationBadgeProfile.classList.add('hidden');
    }
    renderNotificationsProfile();
}

function handleClickOutsideProfile(event) {
    if (userProfileToggleProfile && accountDropdownProfile && !userProfileToggleProfile.contains(event.target) && !accountDropdownProfile.contains(event.target) && accountDropdownProfile.classList.contains('show')) {
        accountDropdownProfile.classList.remove('show');
        userProfileToggleProfile.classList.remove('open');
    }
    if (notificationBtnProfile?.parentElement && notificationPanelProfile && !notificationBtnProfile.parentElement.contains(event.target) && !notificationPanelProfile.contains(event.target) && notificationPanelProfile.classList.contains('show')) {
         notificationPanelProfile.classList.remove('show');
    }
     if (profileEditModalProfile?.classList.contains('visible')) {
          const modalContent = profileEditModalProfile.querySelector('.modal-content');
          if (modalContent && !modalContent.contains(event.target)) {
               hideProfileEditModalProfile();
          }
     }
}

function showProfileEditModalProfile() {
    const userInfo = getUserInfo();
    if (editNameInputProfile) editNameInputProfile.value = userInfo.name;
    if (avatarPreviewProfile) avatarPreviewProfile.src = userInfo.avatar;

    renderRecommendedAvatarsProfile();

    if (profileEditModalProfile) profileEditModalProfile.classList.add('visible');
     if (accountDropdownProfile) accountDropdownProfile.classList.remove('show');
     if (userProfileToggleProfile) userProfileToggleProfile.classList.remove('open');
}

function hideProfileEditModalProfile() {
     if (profileEditModalProfile) profileEditModalProfile.classList.remove('visible');
     if (avatarUploadInputProfile) avatarUploadInputProfile.value = '';
     const userInfo = getUserInfo();
     if (avatarPreviewProfile) avatarPreviewProfile.src = userInfo.avatar;
}

function renderRecommendedAvatarsProfile() {
     if (!recommendedAvatarsListProfile) return;
     recommendedAvatarsListProfile.innerHTML = '';
     RECOMMENDED_AVATARS.forEach(url => {
         const img = document.createElement('img');
         img.src = url;
         img.alt = getTranslation('modal_recommended_avatars');
         img.title = getTranslation('modal_select_avatar') || 'Select Avatar';
         img.addEventListener('click', () => {
             if (avatarPreviewProfile) avatarPreviewProfile.src = url;
         });
         recommendedAvatarsListProfile.appendChild(img);
     });
}

function handleAvatarUploadProfile(event) {
    const file = event.target.files?.[0]; // Use optional chaining
    if (!avatarPreviewProfile) {
         console.warn("Avatar preview element not found (profile modal).");
         return;
    }
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (avatarPreviewProfile && e.target?.result) avatarPreviewProfile.src = e.target.result;
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert(getTranslation('alert_select_image_file'));
        if (event.target) event.target.value = ''; // Clear the file input
        const userInfo = getUserInfo();
        if (avatarPreviewProfile) avatarPreviewProfile.src = userInfo.avatar; // Revert preview
    }
 }

 function saveProfileChangesProfile() {
     const newName = editNameInputProfile?.value.trim();
     const newAvatar = avatarPreviewProfile?.src;

     if (!editNameInputProfile || !avatarPreviewProfile || !profileEditModalProfile) {
          console.warn("Profile edit modal elements not found for saving (profile).");
          alert(getTranslation('alert_enter_profile_info')); // Or a more specific error
          return;
     }

     if (newName && newName.trim() !== '' && newAvatar && newAvatar !== 'null' && newAvatar.trim() !== '' && newAvatar !== window.location.href) {
         let userInfo = getUserInfo();
         userInfo.name = newName;
         userInfo.avatar = newAvatar;
         saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo);
         renderUserInfoProfile(); // Update header UI on profile page
         hideProfileEditModalProfile();
         addNotification(getTranslation("alert_profile_updated") || "Your profile has been updated!");
         renderNotificationsProfile(); // Re-render notifications
         renderProfile(); // Re-render profile content to update name/avatar/lists
     } else {
         alert(getTranslation('alert_enter_profile_info'));
     }
 }

 // Simulated Logout (Profile Page)
 function handleLogoutProfile() {
    if (confirm(getTranslation('alert_logout_confirm'))) {
        saveToLocalStorage(IS_LOGGED_IN_STORAGE_KEY, false);
        // Optionally clear other user-specific data on logout
        // localStorage.removeItem(USER_INFO_STORAGE_KEY);
        // localStorage.removeItem(WATCHLIST_STORAGE_KEY);
        // localStorage.removeItem(RATINGS_STORAGE_KEY);
        // localStorage.removeItem(VIEW_HISTORY_STORAGE_KEY);
        window.location.replace('login.html'); // Use replace
    }
 }

 // Placeholder functions for other menu items (Profile Page)
 function handleSettingsClickProfile(event) { event.preventDefault(); alert(getTranslation('alert_settings_not_implemented')); if (accountDropdownProfile) accountDropdownProfile.classList.remove('show'); if (userProfileToggleProfile) userProfileToggleProfile.classList.remove('open');}
 function handleHelpCenterClickProfile(event) { event.preventDefault(); alert(getTranslation('alert_help_not_implemented')); if (accountDropdownProfile) accountDropdownProfile.classList.remove('show'); if (userProfileToggleProfile) userProfileToggleProfile.classList.remove('open');}

 // Logo click handler for profile page
 function handleAppLogoClickProfile() {
     window.location.href = 'index.html';
 }


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
     console.log("DOM Content Loaded for profile.html");

     loadTranslations();

    renderProfile();
    // applyTranslations is called inside renderProfile and handles sub-renders

     // --- Header Event Listeners (Profile Page) ---
    // renderUserInfoProfile(); // Called inside renderProfile -> applyTranslations
    // renderNotificationsProfile(); // Called inside renderProfile -> applyTranslations

    if (userProfileToggleProfile) userProfileToggleProfile.addEventListener('click', toggleAccountDropdownProfile);
    if (notificationBtnProfile) notificationBtnProfile.addEventListener('click', toggleNotificationPanelProfile);
    // Removed language selector listener as it doesn't exist on profile.html
    if (languageSelectProfile) languageSelectProfile.addEventListener('change', (event) => {
         currentLanguage = event.target.value;
         saveToLocalStorage(LANGUAGE_STORAGE_KEY, currentLanguage);
         applyTranslations();
    });
    if (appLogoProfile) appLogoProfile.addEventListener('click', handleAppLogoClickProfile);

    // --- Profile Edit Modal Event Listeners (Profile Page) ---
    const editProfileButtonProfileElement = document.getElementById('edit-profile-btn-profile');
    if (editProfileButtonProfileElement) editProfileButtonProfileElement.addEventListener('click', showProfileEditModalProfile);

    const saveProfileBtnProfileElement = document.getElementById('save-profile-edit-profile');
    if (saveProfileBtnProfileElement) saveProfileBtnProfileElement.addEventListener('click', saveProfileChangesProfile);

    const cancelProfileBtnProfileElement = document.getElementById('cancel-profile-edit-profile');
    if (cancelProfileBtnProfileElement) cancelProfileBtnProfileElement.addEventListener('click', hideProfileEditModalProfile);

    const avatarUploadInputProfileElement = document.getElementById('avatar-upload-input-profile');
    if (avatarUploadInputProfileElement) avatarUploadInputProfileElement.addEventListener('change', handleAvatarUploadProfile);


    // Updated delegation for dropdown items
    if (accountDropdownProfile) {
         accountDropdownProfile.querySelector('ul')?.addEventListener('click', (e) => {
             const target = e.target.closest('a, button');
             if (target) {
                 if (target.id === 'logout-btn-profile') handleLogoutProfile();
                  const settingsLink = accountDropdownProfile.querySelector('a i.fa-cog')?.parentElement;
                  const helpLink = accountDropdownProfile.querySelector('a i.fa-question-circle')?.parentElement;
                  if (target === settingsLink) handleSettingsClickProfile(e);
                  else if (target === helpLink) handleHelpCenterClickProfile(e);
             }
         });
    }

    document.body.addEventListener('click', handleClickOutsideProfile);

});
