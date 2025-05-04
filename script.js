// script.js - Handles the main index page logic

// Assume shared.js and data.js are loaded BEFORE script.js
// Access constants and functions from shared.js and data.js directly

// --- STATE ---
let currentType = 'movie';
let currentFilter = 'all'; // Default to 'all'
let currentSort = 'popular';
let currentMovies = [];
// Watchlist is loaded from localStorage in DOMContentLoaded
let watchlist = new Set();
let logoAnimationInterval;
let promoAnimationInterval;
let currentPromoMovieIds = [-1, -1]; // Store IDs instead of indices
let notifications = []; // Will be loaded from localStorage

// --- Language State ---
let currentLanguage = 'en'; // Default language
let translations = {}; // Loaded translations


// --- DOM Elements ---
const movieGrid = document.getElementById('movie-grid');
const interestingMoviesGrid = document.getElementById('interesting-movies-grid');
const filterButtons = document.querySelectorAll('.filter-btn');
const rowTitle = document.getElementById('row-title');
const sortDropdown = document.getElementById('sort-movies');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const searchContainer = document.getElementById('search-container');
const searchSuggestions = document.getElementById('search-suggestions');
const userProfileToggle = document.getElementById('user-profile-toggle');
const accountDropdown = document.getElementById('account-dropdown');
const loadingOverlay = document.getElementById('loading-overlay'); // Keep the element reference
const navLinks = document.querySelectorAll('.main-nav a');
const appLogo = document.getElementById('app-logo');
const promoCard1 = document.getElementById('promo-card-1');
const promoCard2 = document.getElementById('promo-card-2');
const promoTitle1 = document.getElementById('promo-title-1');
const promoTitle2 = document.getElementById('promo-title-2');
const promoPlayLink1 = promoCard1?.querySelector('.promo-play-link'); // Use optional chaining
const promoPlayLink2 = promoCard2?.querySelector('.promo-play-link'); // Use optional chaining
const clearWatchlistBtn = document.getElementById('clear-watchlist-btn');
const notificationBtn = document.getElementById('notification-btn');
const notificationPanel = document.getElementById('notification-panel');
const notificationBadge = document.getElementById('notification-badge');
const notificationsList = document.getElementById('notifications-list');
const noNotificationsMessage = document.getElementById('no-notifications-message');
const userNameElement = document.getElementById('user-name');
const userStatusElement = document.getElementById('user-status');
const userAvatarElement = document.getElementById('user-avatar');
const languageSelect = document.getElementById('language-select');

// Profile Edit Modal Elements
const profileEditModal = document.getElementById('profile-edit-modal');
const avatarPreview = document.getElementById('avatar-preview');
const avatarUploadInput = document.getElementById('avatar-upload-input');
const editNameInput = document.getElementById('edit-name');
const recommendedAvatarsList = document.getElementById('recommended-avatars-list');
const saveProfileBtn = document.getElementById('save-profile-edit');
const cancelProfileBtn = document.getElementById('cancel-profile-edit');
const editProfileButton = document.getElementById('edit-profile-btn'); // Button *inside* dropdown
const logoutButton = document.getElementById('logout-btn'); // Button *inside* dropdown

// --- Language Functions ---
function loadTranslations() {
    try {
        const langDataScript = document.getElementById('lang-data');
        if (langDataScript) {
            translations = JSON.parse(langDataScript.textContent);
        } else {
             console.warn("Language data script tag not found.");
             translations = { en: {} }; // Fallback
        }

        // Load preferred language from localStorage, default to 'en'
        currentLanguage = loadFromLocalStorage(LANGUAGE_STORAGE_KEY, 'en');
        if (!translations[currentLanguage]) {
             currentLanguage = 'en'; // Fallback if stored language isn't available
        }
        // Set the dropdown to the current language
        if (languageSelect) {
             languageSelect.value = currentLanguage;
        }
    } catch (e) {
        console.error("Error loading translations:", e);
        translations = { en: {} }; // Default to empty English translations
        currentLanguage = 'en';
    }
}

function getTranslation(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key; // Fallback to English, then key itself
     for (const [placeholder, value] of Object.entries(replacements)) {
         text = text.replace(`{${placeholder}}`, value);
     }
     return text;
}

function applyTranslations() {
    document.title = getTranslation('app_title');

    // Header
    // Nav links (assuming they have IDs and spans)
    const navMovieSpan = document.getElementById('nav-movie')?.querySelector('span');
    if (navMovieSpan) navMovieSpan.textContent = getTranslation('nav_movie');
    const navSeriesSpan = document.getElementById('nav-series')?.querySelector('span');
    if (navSeriesSpan) navSeriesSpan.textContent = getTranslation('nav_series');

    // Search button title and input placeholder
    const searchBtnElement = document.getElementById('search-btn');
     if(searchBtnElement) searchBtnElement.title = getTranslation('search_title');
    if(searchInput) searchInput.placeholder = getTranslation('search_placeholder');


    // Notification Panel Header and "No notifications" message
    const notificationPanelHeader = document.querySelector('.notification-panel h4');
     if(notificationPanelHeader) notificationPanelHeader.textContent = getTranslation('notifications_title');
    if(noNotificationsMessage) noNotificationsMessage.textContent = getTranslation('no_notifications');

    // Account Dropdown Items - Use more specific selectors
    const accountDropdownUl = accountDropdown?.querySelector('ul');
    if (accountDropdownUl) {
        // Profile link (already uses href="profile.html" and has span)
        const profileLinkSpan = accountDropdownUl.querySelector('a[href="profile.html"] span');
        if (profileLinkSpan) profileLinkSpan.textContent = getTranslation('profile_link');

        // Edit Profile button (has id and span)
        const editProfileSpan = editProfileButton?.querySelector('span');
        if (editProfileSpan) editProfileSpan.textContent = getTranslation('edit_profile_btn');

        // Settings link (Find the <a> with the settings icon, then get its span)
        const settingsLinkSpan = accountDropdownUl.querySelector('a i.fa-cog')?.parentElement?.querySelector('span');
        if (settingsLinkSpan) settingsLinkSpan.textContent = getTranslation('settings_link');

        // Help Center link (Find the <a> with the help icon, then get its span)
        const helpLinkSpan = accountDropdownUl.querySelector('a i.fa-question-circle')?.parentElement?.querySelector('span');
        if (helpLinkSpan) helpLinkSpan.textContent = getTranslation('help_link');

        // Logout button (has id and span)
        const logoutButtonSpan = logoutButton?.querySelector('span');
        if (logoutButtonSpan) logoutButtonSpan.textContent = getTranslation('logout_btn');

    } else {
        console.warn("Account dropdown UL not found.");
    }


    // Promo Section (Titles handled in JS logic)
     if(promoPlayLink1) promoPlayLink1.innerHTML = `<i class="fas fa-play"></i> <span data-lang-key="play_button">${getTranslation('play_button')}</span>`;
     if(promoPlayLink2) promoPlayLink2.innerHTML = `<i class="fas fa-play"></i> <span data-lang-key="play_button">${getTranslation('play_button')}</span>`;


    // Filters - Update the span text inside the filter buttons
    filterButtons.forEach(btn => {
        const category = btn.dataset.category;
        const translationKey = `filter_${category}`;
        const span = btn.querySelector('span');
         const icon = btn.querySelector('i'); // Keep icon
        if (span) {
            span.textContent = getTranslation(translationKey);
        } else {
             // Fallback if structure is different, but try to keep icon
              let currentIconHTML = icon ? icon.outerHTML : '';
              btn.innerHTML = `${currentIconHTML} <span data-lang-key="${translationKey}">${getTranslation(translationKey)}</span>`;
        }
    });


    // Main Content Row Header - Label and Sort Options
    const sortByLabel = document.querySelector('#main-content-row .sort-controls label');
     if(sortByLabel) sortByLabel.textContent = getTranslation('sort_by');

     const sortOptions = sortDropdown?.querySelectorAll('option');
     if(sortOptions) {
         sortOptions.forEach(option => {
             const value = option.value;
             const translationKey = `sort_${value}`;
             option.textContent = getTranslation(translationKey);
              // Also update data-lang-key if it exists or add it
             option.dataset.langKey = translationKey;
         });
     }


    // Interesting Movies Row Header and Clear button title
    const interestingTitle = document.querySelector('#interesting-movies-row .row-header h3');
     if(interestingTitle) interestingTitle.textContent = getTranslation('interesting_title');
    if(clearWatchlistBtn) clearWatchlistBtn.title = getTranslation('clear_interesting_btn');

    // Profile Edit Modal
    const modalTitle = document.querySelector('#profile-edit-modal h4');
    if (modalTitle) modalTitle.textContent = getTranslation('modal_edit_profile_title');

    const nicknameLabel = document.querySelector('#profile-edit-modal label[for="edit-name"]');
    if (nicknameLabel) nicknameLabel.textContent = getTranslation('modal_nickname_label');

    const uploadButtonSpan = document.querySelector('.avatar-upload-section .upload-button-wrapper span');
    if (uploadButtonSpan) uploadButtonSpan.textContent = getTranslation('modal_upload_avatar');

    const recommendedAvatarsHeader = document.querySelector('#profile-edit-modal h5');
    if (recommendedAvatarsHeader) recommendedAvatarsHeader.textContent = getTranslation('modal_recommended_avatars');

    const cancelButton = document.querySelector('#cancel-profile-edit');
    if (cancelButton) cancelButton.textContent = getTranslation('modal_cancel');

    const saveButton = document.querySelector('#save-profile-edit');
    if (saveButton) saveButton.textContent = getTranslation('modal_save');


    // Update dynamic content that uses text/translations
    // Re-render grids to update watchlist button titles
    updateMovieGrid();
    updateInterestingMovies();
    renderNotifications(); // Re-render notifications with updated timeAgo format
    renderUserInfo(); // Update header user info

    // Update row title after updateMovieGrid to use translated filter/type names
     const typeName = getTranslation(currentType === 'movie' ? 'nav_movie' : 'nav_series') || (currentType.charAt(0).toUpperCase() + currentType.slice(1) + (currentType !== 'series' ? 's' : '')); // Use translation, fallback to simple capitalization
     const currentFilterButton = document.querySelector(`.filter-btn[data-category="${currentFilter}"]`);
     let filterName = getTranslation(`filter_${currentFilter}`); // Get translated filter name

      const rowTitleKey = currentFilter === 'all' ? 'row_title_all' : 'row_title_filtered';
      if (rowTitle) rowTitle.textContent = getTranslation(rowTitleKey, { filter: filterName, type: typeName });

}

function changeLanguage(event) {
    currentLanguage = event.target.value;
    saveToLocalStorage(LANGUAGE_STORAGE_KEY, currentLanguage);
    applyTranslations();
    // Re-setup logo animation as text might change (though not in this case)
    // setupLogoAnimation(); // Logo text is fixed, no need to re-setup
}


// Note: Loading overlay functions are removed as requested
// function showLoading() { loadingOverlay?.classList.add('visible'); } // Use optional chaining
// function hideLoading() { setTimeout(() => { loadingOverlay?.classList.remove('visible'); }, 200); } // Use optional chaining

function setupLogoAnimation() {
    if (!appLogo) { console.warn("App logo element not found."); return; }
    const logoText = "Flix.id"; // Logo text is fixed regardless of language
    appLogo.innerHTML = '';
    logoText.split('').forEach(letter => {
        const span = document.createElement('span');
        span.textContent = letter === ' ' ? '\u00A0' : letter;
        appLogo.appendChild(span);
    });
    const letters = appLogo.querySelectorAll('span');
    let letterIndex = 0;
    const intervalTime = 3000;
    const bounceDelay = 100;

    clearInterval(logoAnimationInterval); // Clear previous interval
    logoAnimationInterval = setInterval(() => {
        letterIndex = 0;
        function bounceNextLetter() {
            if (letterIndex < letters.length) {
                if (letters[letterIndex]) {
                     letters[letterIndex].classList.add('bounce');
                     setTimeout(() => {
                         if (letters[letterIndex]) { letters[letterIndex].classList.remove('bounce'); }
                     }, 500);
                     letterIndex++;
                     setTimeout(bounceNextLetter, bounceDelay);
                }
            }
        }
        bounceNextLetter();
    }, intervalTime);
}


function startPromoAnimation() {
    if (!promoCard1 || !promoCard2 || !promoTitle1 || !promoTitle2 || !promoPlayLink1 || !promoPlayLink2) {
         console.warn("One or more promo elements not found.");
         // Render placeholder or hide section if elements are missing
         if(promoCard1) promoCard1.style.display = 'none';
         if(promoCard2) promoCard2.style.display = 'none';
         return;
    }

    // Filter movies that have backdrops, titles, video URLs, and match the current type
     const potentialPromoMovies = moviesData.filter(m => m.backdrop && m.title && m.videoUrl && m.type === currentType);


    if (potentialPromoMovies.length < 1) {
        promoCard1.style.backgroundImage = 'none';
        promoTitle1.textContent = getTranslation('promo_loading');
         if(promoPlayLink1) promoPlayLink1.style.display = 'none'; // Use optional chaining
        promoCard2.style.backgroundImage = 'none';
        promoTitle2.textContent = getTranslation('promo_loading');
        if(promoPlayLink2) promoPlayLink2.style.display = 'none'; // Use optional chaining
        if(promoCard1) promoCard1.style.display = 'flex'; // Keep card 1 visible to show loading
        if(promoCard2) promoCard2.style.display = 'none'; // Hide card 2 if less than 2 movies
        currentPromoMovieIds = [-1, -1];
        return;
    }

    const promoIntervalTime = 5000;
    let movie1, movie2 = null;

    // Filter out movies currently in the promo slots if possible
    const availableMoviesForPromo = potentialPromoMovies.filter(m => !currentPromoMovieIds.includes(m.id));

    if (availableMoviesForPromo.length >= 2) {
         // Pick two distinct movies from the available ones
         const shuffledAvailable = availableMoviesForPromo.sort(() => 0.5 - Math.random());
         movie1 = shuffledAvailable[0];
         movie2 = shuffledAvailable[1];
    } else if (potentialPromoMovies.length >= 2) {
         // If not enough *new* movies, pick two distinct from the *entire* potential list
         const shuffledPotential = potentialPromoMovies.sort(() => 0.5 - Math.random());
         movie1 = shuffledPotential[0];
         movie2 = shuffledPotential.find(m => m.id !== movie1.id) || null; // Ensure movie2 is different
         if (!movie2 && potentialPromoMovies.length > 1) {
             // Fallback if find fails (shouldn't happen with shuffle but defensive)
             movie2 = potentialPromoMovies.filter(m => m.id !== movie1.id)[0] || null;
         }

    } else if (potentialPromoMovies.length === 1) {
         // Only one movie available
         movie1 = potentialPromoMovies[0];
         movie2 = null;
    } else {
         // No movies available (should be caught by the first check, but defensive)
         movie1 = null;
         movie2 = null;
    }

    currentPromoMovieIds = [movie1 ? movie1.id : -1, movie2 ? movie2.id : -1];


    function updateCard(cardElement, titleElement, playLinkElement, movie, gradStartColor, gradEndColor, textColor, btnBg, btnColor) {
         if (!cardElement || !titleElement || !playLinkElement) return;

         if (movie) {
             cardElement.classList.add('fading');
             cardElement.style.display = 'flex'; // Ensure card is visible
             setTimeout(() => {
                 titleElement.textContent = movie.title;
                 playLinkElement.dataset.movieId = movie.id;
                 playLinkElement.href = `movie_detail.html?id=${movie.id}`;
                 playLinkElement.style.display = 'inline-flex';

                 const gradient = `linear-gradient(${gradStartColor}, ${gradEndColor})`;
                 cardElement.style.backgroundImage = `${gradient}, url('${movie.backdrop}')`;
                 cardElement.style.color = textColor;
                 const promoContent = cardElement.querySelector('.promo-content');
                  if (promoContent) promoContent.style.color = textColor; // Ensure content text color is applied
                 const playButton = cardElement.querySelector('.play-button');
                 if(playButton) {
                   playButton.style.backgroundColor = btnBg;
                   playButton.style.color = btnColor;
                  }

                 cardElement.classList.remove('fading');
             }, 500); // Match the fading CSS transition duration
         } else {
             cardElement.style.display = 'none'; // Hide the card if no movie
         }
    }


    // Card 1 styles
     const grad1Start = movie1?.type === 'series' ? 'rgba(50, 100, 150, 0.7)' : 'rgba(30, 75, 143, 0.7)';
     const grad1End = movie1?.type === 'series' ? 'rgba(50, 100, 150, 0.9)' : 'rgba(30, 75, 143, 0.9)';
     const txtCol1 = 'var(--text-light)'; // Always light for card 1 default style
     const btnBg1 = 'rgba(0, 0, 0, 0.4)';
     const btnCol1 = 'var(--text-light)';


    // Card 2 styles (using existing color logic)
    const grad2Start = movie2?.type === 'series' ? 'rgba(50, 150, 100, 0.5)' : 'rgba(179, 201, 233, 0.5)';
    const grad2End = movie2?.type === 'series' ? 'rgba(50, 150, 100, 0.8)' : 'rgba(179, 201, 233, 0.8)';
    const txtCol2 = movie2?.type === 'series' ? 'var(--text-light)' : 'var(--text-dark)';
    const btnBg2 = movie2?.type === 'series' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.5)';
    const btnCol2 = movie2?.type === 'series' ? 'var(--text-light)' : 'var(--text-dark)';


    updateCard(promoCard1, promoTitle1, promoPlayLink1, movie1, grad1Start, grad1End, txtCol1, btnBg1, btnCol1);
    updateCard(promoCard2, promoTitle2, promoPlayLink2, movie2, grad2Start, grad2End, txtCol2, btnBg2, btnCol2);


    clearInterval(promoAnimationInterval); // Clear previous interval
    promoAnimationInterval = setInterval(updatePromoCards, promoIntervalTime);

    // Add click listeners to the cards themselves for easier clicking
    // Ensure listeners are only added once or removed before adding
    // A simpler approach is to use event delegation on the promo section
    const promoSection = document.querySelector('.promo-section');
    if (promoSection && !promoSection.dataset.listenersAdded) {
         promoSection.addEventListener('click', (event) => {
             const card = event.target.closest('.promo-card');
             if (card) {
                 const playLink = card.querySelector('.promo-play-link');
                 const movieId = playLink?.dataset.movieId;
                 if (movieId) {
                      window.location.href = `movie_detail.html?id=${movieId}`;
                 }
             }
         });
         promoSection.dataset.listenersAdded = 'true'; // Mark section to prevent adding multiple listeners
    }


    // Re-running the update ensures cards are updated immediately after filter/type change
    // instead of waiting for the first interval.
     // updatePromoCards(); // This function doesn't exist, the logic is inside startPromoAnimation.
     // The interval calls startPromoAnimation, so it will update after the first interval.
     // To update immediately, we just call startPromoAnimation once on type/filter change.

}

// Function called by the interval to update promo cards
function updatePromoCards() {
    startPromoAnimation(); // Re-run the animation logic to pick new movies
}


function renderMovies(movies, gridElement) {
     if (!gridElement) { console.warn("Movie grid element not found:", gridElement?.id); return; }
     gridElement.innerHTML = '';
     const isInterestingGrid = gridElement.id === 'interesting-movies-grid';
     const isEmptyList = movies.length === 0;

     if (isInterestingGrid) {
          if(clearWatchlistBtn) clearWatchlistBtn.disabled = isEmptyList; // Use optional chaining
          if (isEmptyList) {
               gridElement.innerHTML = `<p style="color: #555; width: 100%; text-align: center; padding: 20px 0;">${getTranslation('no_movies_found')}</p>`;
               return;
          }
     }

     const searchTerm = searchInput?.value.trim().toLowerCase() || ''; // Use optional chaining and default

     if (!isInterestingGrid && isEmptyList && searchTerm !== '') {
         // Only show 'no movies found' if search term is active and no results
          gridElement.innerHTML = `<p style="color: #555; width: 100%; text-align: center; padding: 20px 0;">${getTranslation('no_movies_found')}</p>`;
          return;
     } else if (!isInterestingGrid && isEmptyList && searchTerm === '') {
         // If main grid is empty and no search term, likely data is empty or filtering resulted in nothing.
         // Display a generic message.
          gridElement.innerHTML = `<p style="color: #555; width: 100%; text-align: center; padding: 20px 0;">${getTranslation('no_movies_in_category')}</p>`; // Use translated message
          return;
     }


     const userRatings = loadFromLocalStorage(RATINGS_STORAGE_KEY, {});

     movies.forEach(movie => {
          const isAdded = watchlist.has(movie.id);
          const card = document.createElement('a'); // Make the card a link
          card.classList.add('movie-card');
          card.href = `movie_detail.html?id=${movie.id}`; // Link to detail page

          // Calculate displayed rating: user's rating if available, otherwise default rating
          const displayRating = userRatings[movie.id] !== undefined ? userRatings[movie.id] : movie.rating;
          const finalDisplayRating = displayRating !== undefined ? displayRating : 0; // Ensure 0 if rating is completely missing

          card.innerHTML = `
             <img src="${movie.img || 'https://placehold.co/180x270/cccccc/333333?text=No+Image'}" alt="${movie.title || 'Untitled'}" loading="lazy">
             <button class="watchlist-btn ${isAdded ? 'added' : ''}" data-movie-id="${movie.id}" title="${getTranslation(isAdded ? 'remove_from_interesting' : 'add_to_interesting')}">
                 <i class="fas ${isAdded ? 'fa-check' : 'fa-plus'}"></i>
             </button>
             <div class="card-info">
                 <h4>${movie.title || 'Untitled'}</h4>
                 <div class="metadata">
                     <span>
                         ${getStarRatingHTML(finalDisplayRating)} ${finalDisplayRating.toFixed(1)}
                     </span>
                     <span>${movie.year || 'N/A'}</span>
                 </div>
             </div>`;
          gridElement.appendChild(card);

          // Attach event listener directly to the button inside the created card
          // This is done via event delegation on the grid itself in the main DOMContentLoaded
          // to handle cards added dynamically.
     });
}


function updateMovieGrid() {
     // Removed showLoading() call
     // Ensure moviesData is an array before filtering
     const validMoviesData = Array.isArray(moviesData) ? moviesData : [];

     let typeFilteredMovies = validMoviesData.filter(movie => movie.type === currentType);
     let categoryFilteredMovies = (currentFilter === 'all') ? typeFilteredMovies : typeFilteredMovies.filter(movie => Array.isArray(movie.categories) && movie.categories.includes(currentFilter)); // Check if categories is array

     const searchTerm = searchInput?.value.trim().toLowerCase() || ''; // Use optional chaining and default
     if (searchTerm) {
         categoryFilteredMovies = categoryFilteredMovies.filter(movie =>
             (movie.title?.toLowerCase()?.includes(searchTerm)) || // Use optional chaining
             (movie.genre?.toLowerCase()?.includes(searchTerm)) || // Use optional chaining
             (movie.description?.toLowerCase()?.includes(searchTerm)) // Also search description
         );
     }

     currentMovies = [...categoryFilteredMovies];

     switch (currentSort) {
         case 'newest': currentMovies.sort((a, b) => (parseInt(b.year, 10) || 0) - (parseInt(a.year, 10) || 0)); break; // Handle non-numeric year
         case 'rating': currentMovies.sort((a, b) => (b.rating || 0) - (a.rating || 0)); break; // Handle missing rating
         case 'title_asc': currentMovies.sort((a, b) => (a.title || '').localeCompare(b.title || '')); break; // Handle missing title
         case 'title_desc': currentMovies.sort((a, b) => (b.title || '').localeCompare(a.title || '')); break; // Handle missing title
         case 'popular': default:
             currentMovies.sort((a, b) => {
                 const pA = Array.isArray(a.categories) && a.categories.includes('popular'); // Check if categories is array
                 const pB = Array.isArray(b.categories) && b.categories.includes('popular'); // Check if categories is array
                 if (pA && !pB) return -1;
                 if (!pA && pB) return 1;
                 return (b.rating || 0) - (a.rating || 0); // Sort by rating within popular/non-popular
             });
             break;
     }

     renderMovies(currentMovies, movieGrid);

     // Update the row title
     const typeName = getTranslation(currentType === 'movie' ? 'nav_movie' : 'nav_series') || (currentType.charAt(0).toUpperCase() + currentType.slice(1) + (currentType !== 'series' ? 's' : '')); // Use translation, fallback to simple capitalization

     const currentFilterButton = document.querySelector(`.filter-btn[data-category="${currentFilter}"]`);
     let filterName = getTranslation(`filter_${currentFilter}`); // Get translated filter name

      const rowTitleKey = currentFilter === 'all' ? 'row_title_all' : 'row_title_filtered';
      if (rowTitle) rowTitle.textContent = getTranslation(rowTitleKey, { filter: filterName, type: typeName });


     // Removed hideLoading() call
 }


function updateInterestingMovies() {
    // Load the watchlist from localStorage before filtering
    watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());

     // Ensure moviesData is an array before filtering
     const validMoviesData = Array.isArray(moviesData) ? moviesData : [];
    const interestingMoviesData = validMoviesData.filter(movie => watchlist.has(movie.id));

    renderMovies(interestingMoviesData, interestingMoviesGrid);
    // No need to save here, save happens in handleWatchlistClick
}

function handleFilterClick(event) {
    const clickedButton = event.target.closest('.filter-btn');
    if (!clickedButton || clickedButton.classList.contains('active')) return;

    filterButtons.forEach(btn => btn.classList.remove('active'));
    clickedButton.classList.add('active');
    currentFilter = clickedButton.dataset.category;

     // Reset search input when changing filter
    if(searchInput) searchInput.value = '';
    if(searchContainer) searchContainer.classList.remove('active');
    if(searchSuggestions) searchSuggestions.style.display = 'none';

    updateMovieGrid();
}

function handleSortChange(event) {
    currentSort = event.target.value;
    updateMovieGrid();
}

function handleSearch() {
    if (!searchInput || !searchSuggestions) { console.warn("Search elements not found."); return; }

    const searchTerm = searchInput.value.trim().toLowerCase();
    searchSuggestions.innerHTML = '';

    if (searchTerm.length > 0) {
         // Ensure moviesData is an array before filtering
         const validMoviesData = Array.isArray(moviesData) ? moviesData : [];
        const currentTypeMovies = validMoviesData.filter(m => m.type === currentType);
        const matchingMovies = currentTypeMovies.filter(movie =>
             (movie.title?.toLowerCase()?.includes(searchTerm)) || // Use optional chaining
             (movie.genre?.toLowerCase()?.includes(searchTerm)) || // Use optional chaining
             (movie.description?.toLowerCase()?.includes(searchTerm)) // Also search description
            ).slice(0, 7); // Limit suggestions


        if (matchingMovies.length > 0) {
            const ul = document.createElement('ul');
            matchingMovies.forEach(movie => {
                const li = document.createElement('li');
                const titleLower = movie.title?.toLowerCase() || '';
                const termIndex = titleLower.indexOf(searchTerm);

                // Basic highlighting
                let highlightedTitle = movie.title || 'Untitled';
                if (termIndex !== -1) {
                     highlightedTitle = `${movie.title.substring(0, termIndex)}<strong>${movie.title.substring(termIndex, termIndex + searchTerm.length)}</strong>${movie.title.substring(termIndex + searchTerm.length)}`;
                }


                li.innerHTML = highlightedTitle;
                li.innerHTML += ` <span style="font-size:0.8em; color:#555;">(${movie.genre || 'Unknown Genre'})</span>`;
                li.dataset.movieId = movie.id;

                li.addEventListener('click', () => {
                    searchInput.value = movie.title || '';
                    searchSuggestions.style.display = 'none';
                    window.location.href = `movie_detail.html?id=${movie.id}`;
                });
                ul.appendChild(li);
            });
            searchSuggestions.appendChild(ul);
            searchSuggestions.style.display = 'block';
        } else {
            searchSuggestions.style.display = 'none';
            // Optionally refresh the main grid when search is cleared
             // updateMovieGrid(); // Already happens on toggleSearch closing
        }
    } else {
        searchSuggestions.style.display = 'none';
        // Optionally refresh the main grid when search is cleared
         // updateMovieGrid(); // Already happens on toggleSearch closing
    }
}

function handleSearchEnter(event) {
     if (event.key === 'Enter') {
          event.preventDefault(); // Prevent form submission if in a form
          const searchTerm = searchInput?.value.trim().toLowerCase() || ''; // Use optional chaining and default
          if(searchSuggestions) searchSuggestions.style.display = 'none';

          if (searchTerm && searchTerm.length > 0) {
               // Ensure moviesData is an array before filtering
               const validMoviesData = Array.isArray(moviesData) ? moviesData : [];
               const firstMatch = validMoviesData.find(m => m.type === currentType && (
                   (m.title?.toLowerCase()?.includes(searchTerm)) ||
                   (m.genre?.toLowerCase()?.includes(searchTerm)) ||
                   (m.description?.toLowerCase()?.includes(searchTerm))
               ));
               if (firstMatch) {
                   window.location.href = `movie_detail.html?id=${firstMatch.id}`;
               } else {
                   // If no direct match, just update the grid to show filtered results
                   updateMovieGrid();
               }
          } else {
               // If search is empty on Enter, just update the grid (clears filter)
               updateMovieGrid();
          }
     }
}


function toggleSearch(event) {
     event.stopPropagation();
     if (!searchContainer || !searchInput || !searchSuggestions) { console.warn("Search elements not found."); return; }

     searchContainer.classList.toggle('active');
     searchSuggestions.style.display = 'none'; // Hide suggestions when toggling

     if (searchContainer.classList.contains('active')) {
         searchInput.focus();
     } else {
         // If deactivating search, clear input and reset grid
         searchInput.value = '';
         updateMovieGrid(); // Reset grid to current filters/sort without search term
     }
 }

function toggleAccountDropdown(event) {
    event.stopPropagation();
    if (accountDropdown) accountDropdown.classList.toggle('show');
    if (userProfileToggle) userProfileToggle.classList.toggle('open');
    if (notificationPanel) notificationPanel.classList.remove('show'); // Close other panels
    if (searchSuggestions) searchSuggestions.style.display = 'none'; // Close search suggestions
}

function renderNotifications() {
    notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS);
    if (!notificationsList || !noNotificationsMessage) { console.warn("Notification list elements not found."); return; }

    notificationsList.innerHTML = '';
    if (notifications.length === 0) {
        noNotificationsMessage.style.display = 'block';
    } else {
        noNotificationsMessage.style.display = 'none';
        notifications.forEach(notif => {
            const item = document.createElement('div');
            item.classList.add('notification-item');
            // Ensure message is HTML safe if necessary, though current messages are plain text
            item.innerHTML = `${notif.message} <span class="time">${formatTimeAgo(notif.time)}</span>`;
            notificationsList.appendChild(item);
        });
    }
    updateNotificationBadge();
}

function updateNotificationBadge() {
     const unreadCount = notifications.length;
     if (notificationBadge) {
         if (unreadCount > 0) {
              notificationBadge.textContent = unreadCount;
              notificationBadge.classList.remove('hidden');
         } else {
              notificationBadge.classList.add('hidden');
         }
     }
}

function toggleNotificationPanel(event) {
    event.stopPropagation();
    if (notificationPanel) notificationPanel.classList.toggle('show');
    if (accountDropdown) accountDropdown.classList.remove('show'); // Close other panels
    if (userProfileToggle) userProfileToggle.classList.remove('open'); // Close other panels
    if (searchSuggestions) searchSuggestions.style.display = 'none'; // Close search suggestions

    if (notificationPanel?.classList.contains('show')) {
        // When showing the panel, clear the badge (mark all as read)
        // This is a simulation; a real app would track read status per notification
        // For now, just hiding the badge visually.
        if (notificationBadge) notificationBadge.classList.add('hidden');
    }
    renderNotifications(); // Re-render to potentially update time strings even if not clearing badge
}


 function handleClickOutside(event) {
      // Close Account Dropdown
      if (userProfileToggle && accountDropdown && !userProfileToggle.contains(event.target) && !accountDropdown.contains(event.target) && accountDropdown.classList.contains('show')) {
          accountDropdown.classList.remove('show');
          userProfileToggle.classList.remove('open');
      }
      // Close Search Suggestions and potentially Search Input
      if (searchContainer && searchInput && searchSuggestions && !searchContainer.contains(event.target) && !searchSuggestions.contains(event.target)) {
           searchSuggestions.style.display = 'none';
           // Only deactivate the search input if the click was not on the search button itself
           if (searchContainer.classList.contains('active') && event.target !== searchBtn) {
                searchContainer.classList.remove('active');
                searchInput.value = ''; // Clear search input
                updateMovieGrid(); // Reset grid
           }
      }
      // Close Notification Panel
      if (notificationBtn?.parentElement && notificationPanel && !notificationBtn.parentElement.contains(event.target) && !notificationPanel.contains(event.target) && notificationPanel.classList.contains('show')) { // Check parentElement for safety
          notificationPanel.classList.remove('show');
      }
      // Close Profile Edit Modal
      if (profileEditModal?.classList.contains('visible')) {
          const modalContent = profileEditModal.querySelector('.modal-content');
          if (modalContent && !modalContent.contains(event.target)) {
               hideProfileEditModal();
          }
      }
  }

 function handleWatchlistClick(event) {
      const button = event.target.closest('.watchlist-btn');
      if (!button) return;

      const movieId = parseInt(button.dataset.movieId, 10);
      if (isNaN(movieId)) return;

      // Load the current watchlist state from localStorage
      watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());

      const isAdded = watchlist.has(movieId);
      const movie = moviesData.find(m => m.id === movieId); // Find the movie for notification
      const movieTitle = movie?.title || 'Item'; // Use optional chaining

      if (isAdded) {
          watchlist.delete(movieId);
           if(movie) addNotification(`'${movieTitle}' removed from Interesting Movies.`);
      } else {
          watchlist.add(movieId);
           if(movie) addNotification(`'${movieTitle}' added to Interesting Movies.`);
      }

      // Save the updated watchlist back to localStorage
      saveToLocalStorage(WATCHLIST_STORAGE_KEY, watchlist);


      // Update the UI of the clicked button
      updateWatchlistButtonUI(button, watchlist.has(movieId));

      // Find and update the button on the *other* grid if it exists
      const otherGridElement = button.closest('#movie-grid') ? interestingMoviesGrid : movieGrid;
      const otherGridButton = otherGridElement?.querySelector(`.watchlist-btn[data-movie-id="${movieId}"]`); // Use optional chaining
      if (otherGridButton) {
          updateWatchlistButtonUI(otherGridButton, watchlist.has(movieId));
      }

      // Re-render the Interesting Movies section to reflect changes
      updateInterestingMovies();
      // Re-render notifications (optional, can just update badge)
      renderNotifications();
  }

  function updateWatchlistButtonUI(button, isAdded) {
      if (!button) return; // Safety check
      const icon = button.querySelector('i');
      if (!icon) return; // Safety check

      button.classList.toggle('added', isAdded);
      button.title = getTranslation(isAdded ? 'remove_from_interesting' : 'add_to_interesting');
      icon.className = `fas ${isAdded ? 'fa-check' : 'fa-plus'}`;
  }


 function handleTypeChange(event) {
      event.preventDefault();
      const clickedLink = event.target.closest('a');
      if (!clickedLink || clickedLink.classList.contains('type-active')) return;

      navLinks.forEach(link => link.classList.remove('type-active'));
      clickedLink.classList.add('type-active');

      currentType = clickedLink.dataset.type;

      // Reset filters to 'all' and activate the 'All' button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      const allButton = document.querySelector('.filter-btn[data-category="all"]');
      if (allButton) {
          allButton.classList.add('active');
          currentFilter = 'all';
      } else {
          // Fallback: just set the filter state
          currentFilter = 'all';
      }


      // Reset sort to 'popular'
      if (sortDropdown) {
          sortDropdown.value = 'popular';
      }
      currentSort = 'popular';

      // Clear search input and hide suggestions
      if(searchInput) searchInput.value = '';
      if(searchContainer) searchContainer.classList.remove('active');
      if(searchSuggestions) searchSuggestions.style.display = 'none';

      // Update the main grid with the new type, filter, and sort
      updateMovieGrid();
      // Restart promo animation for the new type
      startPromoAnimation();
  }


 function clearAllWatchlist() {
     // Load the current watchlist state from localStorage first
     watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());

     if (watchlist.size === 0) return; // No need to do anything if empty

     if (confirm(getTranslation('alert_clear_watchlist_confirm'))) {
         watchlist.clear();

         // Update button UI on both grids
         movieGrid?.querySelectorAll('.watchlist-btn.added').forEach(button => {
             updateWatchlistButtonUI(button, false);
         });
         interestingMoviesGrid?.querySelectorAll('.watchlist-btn.added').forEach(button => {
              updateWatchlistButtonUI(button, false);
         });

         // Save the empty watchlist
         saveToLocalStorage(WATCHLIST_STORAGE_KEY, watchlist);

         // Re-render the Interesting Movies section (will show "No movies found")
         updateInterestingMovies();
         // Disable the clear button
         if(clearWatchlistBtn) clearWatchlistBtn.disabled = true;

         // Add and render notification
         addNotification(getTranslation("alert_clear_watchlist_success"));
         renderNotifications();
     }
 }

 // --- User Profile & Settings ---
 function renderUserInfo() {
     const userInfo = getUserInfo();
     if (userNameElement) userNameElement.textContent = userInfo.name; // Use optional chaining
     if (userStatusElement) userStatusElement.textContent = userInfo.status; // Use optional chaining (translation handled by applyTranslations)
     if (userAvatarElement) userAvatarElement.src = userInfo.avatar; // Use optional chaining
     if (avatarPreview) avatarPreview.src = userInfo.avatar; // Update modal preview // Use optional chaining
 }

 function showProfileEditModal() {
     if (!profileEditModal || !editNameInput || !avatarPreview) {
         console.warn("Profile edit modal elements not found.");
         return;
     }

     const userInfo = getUserInfo();
     editNameInput.value = userInfo.name;
     avatarPreview.src = userInfo.avatar; // Load current avatar into preview

     renderRecommendedAvatars();

     profileEditModal.classList.add('visible');
      // Close dropdowns if open
     if (accountDropdown) accountDropdown.classList.remove('show');
     if (userProfileToggle) userProfileToggle.classList.remove('open');
 }

 function hideProfileEditModal() {
      if (profileEditModal) profileEditModal.classList.remove('visible');
      if (avatarUploadInput) avatarUploadInput.value = ''; // Clear the file input
      // Reset the preview to the current saved avatar in case user cancelled after choosing a file
      const userInfo = getUserInfo();
      if (avatarPreview) avatarPreview.src = userInfo.avatar;
 }

 function renderRecommendedAvatars() {
     if (!recommendedAvatarsList) { console.warn("Recommended avatars list element not found."); return; }
     recommendedAvatarsList.innerHTML = '';
     RECOMMENDED_AVATARS.forEach(url => {
         const img = document.createElement('img');
         img.src = url;
         img.alt = getTranslation('modal_recommended_avatars'); // Use translation for alt text if appropriate
         img.title = getTranslation('modal_select_avatar') || 'Select Avatar'; // Add a title
         img.addEventListener('click', () => {
             if (avatarPreview) avatarPreview.src = url; // Use optional chaining
         });
         recommendedAvatarsList.appendChild(img);
     });
 }

 function handleAvatarUpload(event) {
    if (!event.target || !avatarPreview) { // Use optional chaining
         console.warn("Avatar upload input or preview element not found.");
         return;
    }
    const file = event.target.files?.[0]; // Use optional chaining
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (avatarPreview && e.target?.result) avatarPreview.src = e.target.result; // Use optional chaining
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert(getTranslation('alert_select_image_file'));
        // Clear the file input (works differently based on browser security, setting to null often works)
        if (event.target) event.target.value = '';
        // Revert preview to current saved avatar
        const userInfo = getUserInfo();
        if (avatarPreview) avatarPreview.src = userInfo.avatar;
    }
 }


 function saveProfileChanges() {
     if (!editNameInput || !avatarPreview || !profileEditModal) { // Use optional chaining
         console.warn("Profile edit modal elements not found for saving.");
         return;
     }

     const newName = editNameInput.value.trim();
     const newAvatar = avatarPreview.src;

     if (newName && newName.trim() !== '' && newAvatar && newAvatar !== 'null' && newAvatar.trim() !== '' && newAvatar !== window.location.href) { // Added check for base href
         let userInfo = getUserInfo(); // Load current info
         userInfo.name = newName;
         userInfo.avatar = newAvatar;
         saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo); // Save updated info
         renderUserInfo(); // Update UI in header
         hideProfileEditModal(); // Close modal
         // Add and render notification
         addNotification(getTranslation("alert_profile_updated"));
         renderNotifications();
     } else {
         alert(getTranslation('alert_enter_profile_info'));
     }
 }

 // --- Simulated Logout ---
 function handleLogout() {
    if (confirm(getTranslation('alert_logout_confirm'))) {
        saveToLocalStorage(IS_LOGGED_IN_STORAGE_KEY, false);
        // Optionally clear other user-specific data on logout
        // localStorage.removeItem(USER_INFO_STORAGE_KEY);
        // localStorage.removeItem(WATCHLIST_STORAGE_KEY);
        // localStorage.removeItem(RATINGS_STORAGE_KEY);
        // localStorage.removeItem(VIEW_HISTORY_STORAGE_KEY);
        // Note: Keeping user info etc. in storage might be desired for "remember me" or quick re-login

        window.location.replace('login.html'); // Use replace for history management
    }
 }


 // Placeholder functions for other menu items
 function handleSettingsClick(event) {
     event.preventDefault();
     alert(getTranslation('alert_settings_not_implemented'));
      if (accountDropdown) accountDropdown.classList.remove('show');
      if (userProfileToggle) userProfileToggle.classList.remove('open');
    }
 function handleHelpCenterClick(event) {
     event.preventDefault();
     alert(getTranslation('alert_help_not_implemented'));
      if (accountDropdown) accountDropdown.classList.remove('show');
      if (userProfileToggle) userProfileToggle.classList.remove('open');
    }


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
     console.log("DOM Content Loaded for index.html");

     // Check login status first. If not logged in, checkLoginStatus will redirect.
     // If it returns false, stop further execution.
     if (!checkLoginStatus()) {
         // Removed hideLoading() call
         return;
     }
     console.log("User is logged in, starting index page initialization.");


     // Removed showLoading() call


     loadTranslations(); // Load translations
     // applyTranslations is called later as part of rendering updates,
     // or can be called here for initial static elements.
     // Let's call it explicitly here first.
     applyTranslations();


     // Load persistent state from localStorage using shared helpers
     watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());
     notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS);


     // Render dynamic parts based on loaded state and translations
     renderUserInfo(); // Render header user info
     renderNotifications(); // Render notification list and badge

     // Initialize grid and promo based on default/loaded state
     updateMovieGrid(); // Renders the main movie grid
     updateInterestingMovies(); // Renders the interesting movies grid

     // Setup animations
     setupLogoAnimation();
     startPromoAnimation();

     // --- EVENT LISTENERS ---
     // Navigation (Movie/Series toggle)
     navLinks.forEach(link => link.addEventListener('click', handleTypeChange));

     // Category Filters
     const categoryFiltersSection = document.querySelector('.category-filters');
     if (categoryFiltersSection) categoryFiltersSection.addEventListener('click', handleFilterClick);

     // Sorting
     if (sortDropdown) sortDropdown.addEventListener('change', handleSortChange);

     // Language Selector
     if (languageSelect) languageSelect.addEventListener('change', changeLanguage);

     // Search
     if (searchInput) searchInput.addEventListener('input', handleSearch);
     if (searchInput) searchInput.addEventListener('keyup', handleSearchEnter); // Handle Enter key
     if (searchBtn) searchBtn.addEventListener('click', toggleSearch);

     // User Profile & Account Dropdown
     if (userProfileToggle) userProfileToggle.addEventListener('click', toggleAccountDropdown);

     // Notification Panel
     if (notificationBtn) notificationBtn.addEventListener('click', toggleNotificationPanel);

     // Watchlist (Interesting Movies) Actions
     if (clearWatchlistBtn) clearWatchlistBtn.addEventListener('click', clearAllWatchlist);
     // Event delegation for watchlist buttons on the grids
     if (movieGrid) movieGrid.addEventListener('click', handleWatchlistClick);
     if (interestingMoviesGrid) interestingMoviesGrid.addEventListener('click', handleWatchlistClick);


     // Profile Edit Modal setup
     const editProfileButtonElement = document.getElementById('edit-profile-btn');
     if (editProfileButtonElement) editProfileButtonElement.addEventListener('click', showProfileEditModal);

     const saveProfileBtnElement = document.getElementById('save-profile-edit');
     if (saveProfileBtnElement) saveProfileBtnElement.addEventListener('click', saveProfileChanges);

     const cancelProfileBtnElement = document.getElementById('cancel-profile-edit');
     if (cancelProfileBtnElement) cancelProfileBtnElement.addEventListener('click', hideProfileEditModal);

     const avatarUploadInputElement = document.getElementById('avatar-upload-input');
     if (avatarUploadInputElement) avatarUploadInputElement.addEventListener('change', handleAvatarUpload);


     // Account Dropdown Menu Item listeners (using delegation on the ul)
     const accountDropdownUl = accountDropdown?.querySelector('ul');
     if (accountDropdownUl) {
          accountDropdownUl.addEventListener('click', (e) => {
              const target = e.target.closest('a, button'); // Check if the click was on an anchor or button
              if (target) {
                   // Handle Logout specifically by ID
                   if (target.id === 'logout-btn') {
                       handleLogout();
                       return; // Stop propagation if logout is handled
                   }
                   // Handle Profile link (it has an href, browser handles navigation)
                   if (target.href && target.href.endsWith('profile.html')) {
                       // Let the browser handle the navigation via href
                       // Optionally close the dropdown if the link is handled by browser
                       if (accountDropdown) accountDropdown.classList.remove('show');
                       if (userProfileToggle) userProfileToggle.classList.remove('open');
                       return; // Let href work
                   }
                   // Handle Settings and Help links (check for the icon or specific element structure)
                   const settingsLink = accountDropdownUl.querySelector('a i.fa-cog')?.parentElement; // Find the <a> element containing the settings icon
                   const helpLink = accountDropdownUl.querySelector('a i.fa-question-circle')?.parentElement; // Find the <a> element containing the help icon

                   if (target === settingsLink) {
                       handleSettingsClick(e); // Pass event object
                   } else if (target === helpLink) {
                       handleHelpCenterClick(e); // Pass event object
                   }
                   // For other clicks within the dropdown (e.g., on list items without links/buttons), do nothing or close dropdown
                    // accountDropdown.classList.remove('show'); // Optional: Close dropdown on any click inside it
                    // userProfileToggle.classList.remove('open');
              }
          });
     } else {
          console.warn("Account dropdown UL not found for event delegation.");
          // Add direct listeners to specific buttons if delegation is not preferred or fails
          // These fallback listeners were added above using getElementById
     }


     // Handle clicks outside dropdowns/panels/modals (delegated to body)
     document.body.addEventListener('click', handleClickOutside);

     // App Logo click to return to index (and reset view)
     if (appLogo) appLogo.addEventListener('click', () => {
         // Check if we are already on the index page
         const path = window.location.pathname;
         const isOnIndex = path === '/' || path === '/index.html' || path.endsWith('/index.html');

         if (!isOnIndex) {
             window.location.href = 'index.html'; // Navigate if not on index
         } else {
             // If already on index, reset filters/sort/search to default (movie, all, popular, empty search)
             navLinks.forEach(link => link.classList.remove('type-active'));
             const movieNavLink = document.getElementById('nav-movie');
             if (movieNavLink) movieNavLink.classList.add('type-active');
             currentType = 'movie';

             filterButtons.forEach(btn => btn.classList.remove('active'));
             const allFilterButton = document.querySelector('.filter-btn[data-category="all"]');
             if (allFilterButton) allFilterButton.classList.add('active');
             currentFilter = 'all';

             if (sortDropdown) sortDropdown.value = 'popular';
             currentSort = 'popular';

             if (searchInput) searchInput.value = '';
             if (searchContainer) searchContainer.classList.remove('active');
             if (searchSuggestions) searchSuggestions.style.display = 'none';

             // Update the UI
             updateMovieGrid();
             startPromoAnimation(); // Restart promo animation based on 'movie' type
             // No need to call updateInterestingMovies as it loads from storage which isn't reset by logo click
         }
     });


     // Removed hideLoading() call
     console.log("Index page initialization complete.");

});