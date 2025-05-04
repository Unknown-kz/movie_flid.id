// movie_detail.js - Handles the movie detail page logic

// Assume shared.js and data.js are loaded BEFORE movie_detail.js

// --- Language State ---
let currentLanguage = 'en';
let translations = {};

// --- DOM Elements ---
const detailPageTitle = document.getElementById('detail-page-title');
const detailBackdrop = document.getElementById('detail-backdrop');
const detailPosterImg = document.getElementById('detail-poster-img');
const detailTitle = document.getElementById('detail-title');
const detailYear = document.getElementById('detail-year');
const detailGenre = document.getElementById('detail-genre');
const detailRating = document.getElementById('detail-rating');
const detailWatchlistBtn = document.getElementById('detail-watchlist-btn');
const detailDescription = document.getElementById('detail-description');
const playerPlaceholder = document.getElementById('player-placeholder');
const trailersContainer = document.getElementById('trailers-container');

const ratingTitle = document.getElementById('rating-title');
const rateThisLabel = document.getElementById('rate-this-label');
const userRatingStarsContainer = document.getElementById('user-rating-stars');
const userRatedValueElement = document.getElementById('user-rated-value');

const commentsTitle = document.getElementById('comments-title');
const commentInput = document.getElementById('comment-input');
const postCommentBtn = document.getElementById('post-comment-btn');
const commentsListElement = document.getElementById('comments-list');
const noCommentsMessage = document.getElementById('no-comments-message');
const emojiButton = document.getElementById('emoji-button');
const emojiPicker = document.getElementById('emoji-picker');
const parentCommentIdInput = document.getElementById('parent-comment-id');
const cancelReplyButton = document.getElementById('cancel-reply-btn'); // Get the cancel reply button


// --- Header Elements (Duplicated from index.html) ---
// Note: These elements have '-detail' suffix in movie_detail.html
const detailHeader = document.querySelector('header.app-header');
const notificationBtnDetail = document.getElementById('notification-btn-detail');
const notificationPanelDetail = document.getElementById('notification-panel-detail');
const notificationBadgeDetail = document.getElementById('notification-badge-detail');
const notificationsListDetail = document.getElementById('notifications-list-detail');
const noNotificationsMessageDetail = document.getElementById('no-notifications-message-detail');
const languageSelectDetail = document.getElementById('language-select-detail');
const userProfileToggleDetail = document.getElementById('user-profile-toggle-detail');
const accountDropdownDetail = document.getElementById('account-dropdown-detail');
const userNameElementDetail = document.getElementById('user-name-detail');
const userStatusElementDetail = document.getElementById('user-status-detail');
const userAvatarElementDetail = document.getElementById('user-avatar-detail');
const editProfileButtonDetail = document.getElementById('edit-profile-btn-detail'); // Button *inside* dropdown
const logoutButtonDetail = document.getElementById('logout-btn-detail'); // Button *inside* dropdown
const appLogoDetail = document.getElementById('app-logo-detail');


// Profile Edit Modal Elements (Duplicated for detail page)
// Note: These elements have '-detail' suffix in movie_detail.html
const profileEditModalDetail = document.getElementById('profile-edit-modal-detail');
const avatarPreviewDetail = document.getElementById('avatar-preview-detail');
const avatarUploadInputDetail = document.getElementById('avatar-upload-input-detail');
const editNameInputDetail = document.getElementById('edit-name-detail');
const recommendedAvatarsListDetail = document.getElementById('recommended-avatars-list-detail');
const saveProfileBtnDetail = document.getElementById('save-profile-edit-detail');
const cancelProfileBtnDetail = document.getElementById('cancel-profile-edit-detail');


// --- STATE ---
let currentMovie = null;
let userRatings = loadFromLocalStorage(RATINGS_STORAGE_KEY, {});
let movieComments = []; // Comments specific to the current movie
let watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set()); // Watchlist state loaded from storage
let notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS); // Notifications state


// --- Language Functions ---
function loadTranslations() {
    try {
        const langDataScript = document.getElementById('lang-data-detail');
        if (langDataScript) {
             translations = JSON.parse(langDataScript.textContent);
        } else {
            console.warn("Language data script tag with id 'lang-data-detail' not found.");
            translations = { en: {} }; // Fallback
        }
        currentLanguage = loadFromLocalStorage(LANGUAGE_STORAGE_KEY, 'en');
        if (!translations[currentLanguage]) {
             currentLanguage = 'en'; // Fallback
        }
         // Set the dropdown to the current language
         if (languageSelectDetail) {
              languageSelectDetail.value = currentLanguage;
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

     // Apply translations to main detail content that might be dynamic
     if (currentMovie) {
          const displayRating = userRatings[currentMovie.id] !== undefined ? userRatings[currentMovie.id] : currentMovie.rating;
          const finalDisplayRating = displayRating !== undefined ? displayRating : 0; // Ensure 0 if rating is completely missing
          if(detailRating) detailRating.innerHTML = `${getStarRatingHTML(finalDisplayRating)} ${finalDisplayRating.toFixed(1)}`;

          renderComments(); // Re-render comments to update timestamps and reply button text

          if(detailWatchlistBtn) {
              const isAdded = watchlist.has(currentMovie.id);
              detailWatchlistBtn.title = getTranslation(isAdded ? 'remove_from_interesting' : 'add_to_interesting');
          }
          renderTrailers(currentMovie); // Re-render trailers to update button text
     } else {
         // Apply translations to error/loading states if movie not found
         if(detailPageTitle) detailPageTitle.textContent = getTranslation('detail_page_title'); // Ensure title is translated even if movie fails
         if(detailTitle) detailTitle.textContent = getTranslation('details_unavailable');
         if(detailYear) detailYear.textContent = "";
         if(detailGenre) detailGenre.textContent = "";
         if(detailRating) detailRating.innerHTML = "";
         if(detailBackdrop) detailBackdrop.style.backgroundImage = "";
         if(detailPosterImg) { detailPosterImg.src = ""; detailPosterImg.alt = getTranslation('details_unavailable'); } // Clear image
         if(playerPlaceholder) playerPlaceholder.style.display = 'none';
         if(detailWatchlistBtn) detailWatchlistBtn.style.display = 'none';
         if(detailDescription) detailDescription.textContent = getTranslation('details_unavailable');
         if(trailersContainer) trailersContainer.innerHTML = `<p style='color:rgba(240,240,240,0.7); font-size:0.9em;'>${getTranslation('no_trailers_available')}</p>`;
         const ratingSection = document.querySelector('.rating-section');
         if(ratingSection) ratingSection.style.display = 'none';
         const commentsSection = document.querySelector('.comments-section');
         if(commentsSection) commentsSection.style.display = 'none';
     }

     // Header translations applied via data-lang-key.
     // Re-render header dynamic parts if necessary (e.g. notifications)
     renderNotificationsDetail();

     // Apply translation to the Cancel Reply button specifically if it's visible
      if (cancelReplyButton && cancelReplyButton.classList.contains('visible')) {
          // Assuming 'Cancel Reply' is not a single translatable string but 'Cancel' + ' Reply'
          // If 'modal_cancel' is "Отмена", this would be "Отмена Reply".
          // If the full string "Cancel Reply" is needed as a key, add it to lang data.
          // For now, using the existing structure.
          cancelReplyButton.textContent = getTranslation('modal_cancel') + ' Reply'; // Update text including the static ' Reply' part
      }

      // Update comment input placeholder if it's not currently in "replying to" state
      if (commentInput && !parentCommentIdInput?.value) {
           commentInput.placeholder = getTranslation('comment_placeholder');
      }

}


// --- FUNCTIONS ---

// Note: Loading overlay functions are removed as requested
// function showLoading() { loadingOverlay?.classList.add('visible'); }
// function hideLoading() { setTimeout(() => { loadingOverlay?.classList.remove('visible'); }, 200); }


function loadMovieData(movieId) {
    if (typeof moviesData === 'undefined') {
        console.error("moviesData is not loaded!");
        return null;
    }
     // Ensure moviesData is an array before trying to find on it
    if (!Array.isArray(moviesData)) {
         console.error("moviesData is not an array!");
         return null;
    }
    return moviesData.find(m => m.id === movieId);
}

function renderMovieDetail(movie) {
    if (!movie) {
        // Use applyTranslations for displaying "not found" state
        // applyTranslations called separately after renderMovieDetail
        console.warn("Movie data not found for rendering detail page.");
        if(detailPageTitle) detailPageTitle.textContent = getTranslation('detail_page_title');
        if(detailTitle) detailTitle.textContent = getTranslation('details_unavailable');
        if(detailYear) detailYear.textContent = "";
        if(detailGenre) detailGenre.textContent = "";
        if(detailRating) detailRating.innerHTML = "";
        if(detailBackdrop) detailBackdrop.style.backgroundImage = "";
        if(detailPosterImg) { detailPosterImg.src = ""; detailPosterImg.alt = getTranslation('details_unavailable'); } // Clear image
        if(playerPlaceholder) playerPlaceholder.style.display = 'none';
        if(detailWatchlistBtn) detailWatchlistBtn.style.display = 'none';
        if(detailDescription) detailDescription.textContent = getTranslation('details_unavailable');
        if(trailersContainer) trailersContainer.innerHTML = `<p style='color:rgba(240,240,240,0.7); font-size:0.9em;'>${getTranslation('no_trailers_available')}</p>`;
        const ratingSection = document.querySelector('.rating-section');
        if(ratingSection) ratingSection.style.display = 'none';
        const commentsSection = document.querySelector('.comments-section');
        if(commentsSection) commentsSection.style.display = 'none';
        return;
    }

    currentMovie = movie;

    if(detailPageTitle) detailPageTitle.textContent = `Flix.id - ${movie.title}`;
    if(detailTitle) detailTitle.textContent = movie.title;
    if(detailYear) detailYear.textContent = movie.year || ''; // Handle missing year
    if(detailGenre) detailGenre.textContent = movie.genre || ''; // Handle missing genre

    const displayRating = userRatings[movie.id] !== undefined ? userRatings[movie.id] : movie.rating;
    const finalDisplayRating = displayRating !== undefined ? displayRating : 0; // Ensure 0 if rating is completely missing
    if(detailRating) detailRating.innerHTML = `${getStarRatingHTML(finalDisplayRating)} ${finalDisplayRating.toFixed(1)}`;


    if(detailBackdrop) detailBackdrop.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.8)), url('${movie.backdrop}')`;
    if(detailPosterImg) { detailPosterImg.src = movie.img; detailPosterImg.alt = `${movie.title} Poster`; }

    // Load watchlist state and update button
    watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());
    const isAdded = watchlist.has(movie.id);
    if(detailWatchlistBtn) {
        detailWatchlistBtn.classList.toggle('added', isAdded);
        detailWatchlistBtn.querySelector('i').className = `fas ${isAdded ? 'fa-check' : 'fa-plus'}`;
        detailWatchlistBtn.title = getTranslation(isAdded ? 'remove_from_interesting' : 'add_to_interesting');
        detailWatchlistBtn.dataset.movieId = movie.id;
        detailWatchlistBtn.style.display = 'flex'; // Ensure button is visible
    }


    if (playerPlaceholder) {
         if (movie.videoUrl) {
              playerPlaceholder.style.display = 'flex';
              playerPlaceholder.innerHTML = '<i class="fas fa-play-circle"></i>';
              playerPlaceholder.dataset.videoUrl = movie.videoUrl;
              playerPlaceholder.style.cursor = 'pointer';
              playerPlaceholder.classList.remove('playing'); // Reset player state
              // Remove any existing iframe when rendering
              const existingIframe = playerPlaceholder.querySelector('iframe');
              if(existingIframe) existingIframe.remove();

         } else {
              playerPlaceholder.style.display = 'none'; // Hide player if no videoUrl
         }
    }


    if(detailDescription) detailDescription.textContent = movie.description || ''; // Handle missing description

    renderTrailers(movie); // Renders trailers section

    renderUserRating(movie.id); // Renders rating stars section

    // Load comments for this specific movie
    movieComments = loadFromLocalStorage(COMMENTS_STORAGE_KEY_PREFIX + movie.id, []);
    renderComments(); // Renders comments section

    trackViewHistory(movie.id); // Track this view in history
}


function renderTrailers(movie) {
     if(!trailersContainer) { console.warn("Trailers container not found."); return; }
     trailersContainer.innerHTML = ''; // Clear previous content

     // Determine the URL to use for trailer clicks - prefer trailerUrl if available
     const trailerPlaybackUrl = movie.trailerUrl || movie.videoUrl;

     // Only show trailer items if there are trailer names listed AND a playable URL exists
     if (movie.trailers && Array.isArray(movie.trailers) && movie.trailers.length > 0 && trailerPlaybackUrl) {
         movie.trailers.forEach(trailerName => {
             const trailerItem = document.createElement('div');
             trailerItem.classList.add('trailer-item');
             // Use the determined playback URL
             trailerItem.innerHTML = `<i class="fas fa-play-circle"></i> ${trailerName || getTranslation('play_trailer_button')}`; // Fallback text
             trailerItem.addEventListener('click', () => {
                  playVideo(trailerPlaybackUrl); // <--- MODIFIED LINE
             });
             trailersContainer.appendChild(trailerItem);
         });
     } else {
         // If no trailers listed OR no playable URL exists
         trailersContainer.innerHTML = `<p style='color:rgba(240,240,240,0.7); font-size:0.9em;'>${getTranslation('no_trailers_available')}</p>`;
     }
}


function playVideo(videoUrl) {
     if (!videoUrl || !playerPlaceholder) {
         console.warn("Cannot play video: URL or player placeholder missing.");
         return;
     }

     // Remove existing iframe if any
     const existingIframe = playerPlaceholder.querySelector('iframe');
     if (existingIframe) {
         existingIframe.remove();
         // Don't restore placeholder icon immediately, the iframe will take over
         // playerPlaceholder.innerHTML = '<i class="fas fa-play-circle"></i>'; // Restore placeholder icon
         // playerPlaceholder.style.cursor = 'pointer'; // Restore cursor
         // playerPlaceholder.classList.remove('playing'); // Remove playing class
     }

     // Only proceed if a video URL is provided
     if (!videoUrl) {
         console.warn("No video URL provided to playVideo.");
         return;
     }

     const iframe = document.createElement('iframe');
     // Ensure autoplay is enabled and other parameters are preserved
     try {
          const embedSrc = new URL(videoUrl);
          embedSrc.searchParams.set('autoplay', '1');
          embedSrc.searchParams.set('rel', '0'); // Optional: hide related videos
          embedSrc.searchParams.set('modestbranding', '1'); // Optional: hide youtube logo
          embedSrc.searchParams.set('showinfo', '0'); // Optional: hide video title/uploader
          embedSrc.searchParams.set('origin', window.location.origin); // Essential for some embeds

          iframe.src = embedSrc.toString(); // Use the constructed URL
     } catch (e) {
          console.error("Invalid video URL:", videoUrl, e);
          // Display an error message to the user
          if (playerPlaceholder) {
               playerPlaceholder.innerHTML = `<p style="color: red; font-size: 0.9em;">Error loading video. Invalid URL: ${videoUrl}</p>`;
               playerPlaceholder.style.cursor = 'default';
               playerPlaceholder.classList.remove('playing');
          }
          return; // Stop if URL is invalid
     }


     iframe.allow = 'autoplay; fullscreen; picture-in-picture'; // Added more permissions
     iframe.setAttribute('allowfullscreen', '');
     iframe.setAttribute('frameborder', '0');
     iframe.width = '100%';
     iframe.height = '100%';

     playerPlaceholder.innerHTML = ''; // Clear placeholder icon
     playerPlaceholder.appendChild(iframe); // Insert the iframe
     playerPlaceholder.style.cursor = 'default'; // Change cursor to default
     playerPlaceholder.classList.add('playing'); // Add playing class
}


// --- User Rating ---
function renderUserRating(movieId) {
    if (!userRatingStarsContainer || !userRatedValueElement) {
         console.warn("Rating elements not found."); return;
    }
    // Ensure userRatings is loaded
    userRatings = loadFromLocalStorage(RATINGS_STORAGE_KEY, {});
    const userRating = userRatings[movieId] || 0; // Default to 0 if no rating exists
    userRatingStarsContainer.innerHTML = ''; // Clear existing stars

    // Display "Rate this:" label using translation
    const rateThisLabelElement = document.getElementById('rate-this-label');
    if(rateThisLabelElement) rateThisLabelElement.textContent = getTranslation('rate_this_label');


    for (let i = 1; i <= 5; i++) {
        const starValue = i * 2; // Values are 2, 4, 6, 8, 10
        const star = document.createElement('span');
        star.classList.add('star');
        star.dataset.value = starValue;

        // Determine if the star should be filled based on userRating
        // Using getStarRatingHTML logic for visual representation
        const iconClass = userRating >= starValue ? 'fas' : 'far';
        star.innerHTML = `<i class="${iconClass} fa-star"></i>`;

        // Add a 'rated' class to stars that are part of the user's current rating
        // (Visual feedback for which stars represent the current rating)
        if (userRating >= starValue) {
             star.classList.add('rated-visual');
        } else {
             star.classList.remove('rated-visual');
        }


        star.addEventListener('click', handleStarClick); // Attach click listener
        userRatingStarsContainer.appendChild(star);
    }
    updateUserRatingDisplay(userRating);

     // Add/remove 'rated' class on the container for hover effects
     if (userRatingStarsContainer) {
         if (userRating > 0) {
             userRatingStarsContainer.classList.add('rated-container'); // Use a distinct class
         } else {
             userRatingStarsContainer.classList.remove('rated-container');
         }
     }
}

function handleStarClick(event) {
    if (!currentMovie) return; // Need a movie to rate
    const clickedStar = event.target.closest('.star');
    if (!clickedStar) return; // Ensure a star element was clicked

    const rating = parseInt(clickedStar.dataset.value, 10);
    const movieId = currentMovie.id;

    // Update the rating in the state and storage
    userRatings[movieId] = rating;
    saveToLocalStorage(RATINGS_STORAGE_KEY, userRatings);

    // Re-render the stars to reflect the new rating
    renderUserRating(movieId);

    // Update the overall rating display (using user's rating)
    // This update will happen when applyTranslations is called after DOMContentLoaded,
    // but also update it directly here for immediate feedback.
     const displayRating = userRatings[currentMovie.id];
     if(detailRating) detailRating.innerHTML = `${getStarRatingHTML(displayRating)} ${displayRating.toFixed(1)}`;


    // Add a notification
    addNotification(`You rated '${currentMovie.title}' ${rating/2}/5 stars.`); // Convert 10-scale to 5-scale for notification
    // Render notifications to show the new one
    renderNotificationsDetail();
}

function updateUserRatingDisplay(rating) {
    if (userRatedValueElement) {
        if (rating > 0) {
             userRatedValueElement.textContent = `${rating.toFixed(1)} / 10`; // Display on 10-scale
        } else {
             userRatedValueElement.textContent = ''; // Clear if rating is 0
        }
    }
}

// --- Comments ---
// Recursive function to render comments and their replies
function renderComments(comments = movieComments, parentId = null, targetElement = null) {
    if (!commentsListElement) { console.warn("Comments list element not found."); return; }

    const commentsToRender = comments.filter(comment => comment.parentId === parentId);

    let currentTargetElement = targetElement;

    if (parentId === null) {
        // This is the initial call for top-level comments
        currentTargetElement = commentsListElement;
        currentTargetElement.innerHTML = ''; // Clear previous content of the main list

        // Display "No comments yet." message based on total comments
        if (comments.length === 0) {
            if(noCommentsMessage) noCommentsMessage.style.display = 'block';
        } else {
            if(noCommentsMessage) noCommentsMessage.style.display = 'none';
        }
         // Sort top-level comments by newest (timestamp descending)
         commentsToRender.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } else {
         // This is for replies, find the parent comment's reply list
         const parentCommentElement = commentsListElement.querySelector(`.comment-item[data-comment-id="${parentId}"]`);
          if (!parentCommentElement) {
              console.error(`Could not find parent element for replies to comment ID ${parentId}`);
              return; // Stop if parent element is missing
          }
         // Find or create the nested UL for replies
         let replyList = parentCommentElement.querySelector('ul.comments-list');
         if (!replyList) {
              replyList = document.createElement('ul');
              replyList.classList.add('comments-list');
              replyList.style.paddingLeft = '0'; // Remove default ul padding
              parentCommentElement.appendChild(replyList);
         }
         currentTargetElement = replyList;
         currentTargetElement.innerHTML = ''; // Clear previous replies for this parent

         // Sort replies by oldest (timestamp ascending)
         commentsToRender.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }

     // If there are no comments to render at this level (and it's not the initial empty state)
     if (commentsToRender.length === 0 && parentId !== null) {
         // If a reply list was created but is now empty, maybe hide it?
         // Or just leave it empty. Clearing it is done above.
         return; // Stop recursion for branches with no replies
     }


    // Render each comment in the current level
    commentsToRender.forEach(comment => {
        const commentItem = document.createElement('li');
        commentItem.classList.add('comment-item');
        if (parentId !== null) {
             commentItem.classList.add('reply'); // Add 'reply' class for styling
        }
        commentItem.dataset.commentId = comment.id; // Add data attribute for ID

        commentItem.innerHTML = `
            <strong>${comment.user}</strong>
            <p>${comment.text}</p>
            <span class="comment-time">${formatTimeAgo(comment.timestamp)}</span>
            ${parentId === null ? `<button class="reply-button" data-comment-id="${comment.id}" data-lang-key="reply_button">${getTranslation('reply_button')}</button>` : ''}
             <ul class="comments-list" style="padding-left: 0;"></ul> <!-- Placeholder for nested replies -->
        `;

        if (currentTargetElement) {
             currentTargetElement.appendChild(commentItem);
        } else {
             console.error("Target element for comment append is null.");
             return; // Stop if target is null
        }


        // Recursively render replies for this comment
        const nestedList = commentItem.querySelector(`ul.comments-list`);
         if (nestedList) {
              renderComments(movieComments, comment.id, nestedList);
         } else {
             console.warn("Nested UL for replies not found for comment ID:", comment.id);
         }
    });

     // Add event listeners for reply buttons *after* they are rendered (only for top-level comments)
     if (parentId === null && commentsListElement) {
         commentsListElement.querySelectorAll('.comment-item:not(.reply) > .reply-button').forEach(button => {
              button.addEventListener('click', handleReplyButtonClick);
         });
     }
}


function handleReplyButtonClick(event) {
    const commentId = parseInt(event.target.dataset.commentId, 10);
    if (isNaN(commentId)) {
        console.warn("Invalid comment ID for reply.");
        return;
    }

    const comment = movieComments.find(c => c.id === commentId);
     if (!comment) { console.warn("Clicked reply button for non-existent comment ID:", commentId); return; }

    if(parentCommentIdInput) parentCommentIdInput.value = commentId; // Set the parent ID
    if(commentInput) {
         // Update placeholder to indicate who is being replied to
         commentInput.placeholder = getTranslation('replying_to', { user: comment.user });
         commentInput.focus(); // Focus the input field
         // Optional: Scroll the input field into view if needed
         // commentInput.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
         console.warn("Comment input field not found.");
         return;
    }

    // Show the "Cancel Reply" button
    if (cancelReplyButton) {
        cancelReplyButton.style.display = 'block';
         cancelReplyButton.classList.add('visible'); // Add visible class for CSS transition
        cancelReplyButton.textContent = getTranslation('modal_cancel') + ' Reply'; // Set text, ensure translation might need updating
        // Ensure cancel button has correct translation applied if language changes later
        cancelReplyButton.dataset.langKey = 'modal_cancel'; // Use generic cancel key for now
    } else {
         console.warn("Cancel reply button not found.");
    }
}

function cancelReply() {
     if(parentCommentIdInput) parentCommentIdInput.value = ''; // Clear the parent ID
     if(commentInput) commentInput.placeholder = getTranslation('comment_placeholder'); // Restore default placeholder
     if (cancelReplyButton) {
         cancelReplyButton.style.display = 'none'; // Hide the cancel button
         cancelReplyButton.classList.remove('visible');
     }
     if(commentInput) commentInput.focus(); // Focus input after cancelling
}


function postComment() {
    if (!currentMovie || !commentInput || !parentCommentIdInput || !commentsListElement) {
        console.warn("Cannot post comment: missing elements or current movie.");
        return;
    }
    const commentText = commentInput.value.trim();
    if (commentText === '') {
        alert(getTranslation('alert_empty_comment')); // Use translated alert
        return;
    }

    const userInfo = getUserInfo(); // Get current user info from shared helper
    const parentId = parentCommentIdInput.value ? parseInt(parentCommentIdInput.value, 10) : null; // Get parent ID

    const newComment = {
        id: Date.now() + Math.random(), // Simple unique ID
        user: userInfo.name, // Use user's name from userInfo
        text: commentText,
        timestamp: new Date().toISOString(), // Use ISO string for better sorting and timeago
        parentId: parentId // Include parent ID
    };

    // Add the new comment to the local array
    movieComments.push(newComment);
    // Save the updated comments array for this movie
    saveToLocalStorage(COMMENTS_STORAGE_KEY_PREFIX + currentMovie.id, movieComments);

    // Clear the input field and reset reply state
    commentInput.value = '';
    cancelReply(); // Clear parent ID and hide cancel button

    // Re-render the comments section to show the new comment/reply
    renderComments();

    // Optional: Add a notification for the new comment/reply
    // addNotification(`New comment on '${currentMovie.title}' by ${userInfo.name}.`);
}

// --- Emoji Picker ---
function renderEmojiPicker() {
    if (!emojiPicker) { console.warn("Emoji picker element not found."); return; }
    emojiPicker.innerHTML = ''; // Clear previous emojis
    EMOJIS.forEach(emoji => {
        const span = document.createElement('span');
        span.textContent = emoji;
        span.addEventListener('click', () => {
            insertEmoji(emoji);
        });
        emojiPicker.appendChild(span);
    });
}

function insertEmoji(emoji) {
    const textarea = commentInput;
    if (!textarea) { console.warn("Comment textarea not found for emoji insertion."); return; }
    const start = textarea.selectionStart; // Get cursor position
    const end = textarea.selectionEnd;
    const value = textarea.value;
    // Insert emoji at cursor position
    textarea.value = value.substring(0, start) + emoji + value.substring(end);
    // Move cursor after the inserted emoji
    textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
    textarea.focus(); // Keep focus on the textarea
}

function toggleEmojiPicker(event) {
    event.stopPropagation(); // Prevent click from closing picker immediately
    if (!emojiPicker || !emojiButton) { console.warn("Emoji picker or button not found."); return; }

    // Toggle display state
    const isVisible = emojiPicker.style.display === 'grid';
    emojiPicker.style.display = isVisible ? 'none' : 'grid';

    if (!isVisible) {
         // Position the picker relative to the textarea's bottom right corner
         const textareaRect = commentInput.getBoundingClientRect();
         const pickerRect = emojiPicker.getBoundingClientRect(); // Get picker size before positioning

         // Position above the textarea if there's enough space above or not enough below
         const spaceBelow = window.innerHeight - textareaRect.bottom;
         const spaceAbove = textareaRect.top;

         if (spaceAbove > pickerRect.height || spaceAbove > spaceBelow) {
              // Position above the textarea
              emojiPicker.style.bottom = `${window.innerHeight - textareaRect.top + 5}px`; // 5px above textarea top
              emojiPicker.style.top = 'auto';
         } else {
              // Position below the textarea
              emojiPicker.style.top = `${textareaRect.bottom + 5}px`; // 5px below textarea bottom
              emojiPicker.style.bottom = 'auto';
         }

         // Position aligned with the right edge of the textarea
         emojiPicker.style.left = 'auto';
         emojiPicker.style.right = `${window.innerWidth - textareaRect.right}px`; // Align right edges

         // Adjust left/right if it goes off screen
         // Re-calculate pickerRect after setting top/bottom if needed, though usually not necessary for width
         const currentPickerRect = emojiPicker.getBoundingClientRect();
         if (currentPickerRect.left < 0) {
              emojiPicker.style.left = '0';
              emojiPicker.style.right = 'auto';
         }
         if (currentPickerRect.right > window.innerWidth) {
              emojiPicker.style.right = `${window.innerWidth - textareaRect.right}px`; // Stick to right edge
              emojiPicker.style.left = 'auto';
             // If still off screen, maybe left align? (More complex)
         }

         // Ensure it's within the modal if applicable (this needs more complex positioning logic
         // if the modal itself is positioned dynamically. For now, relying on fixed/absolute within modal)
         // For simplicity with a fixed modal, just ensure it stays within viewport bounds.


    }
}

function hideEmojiPicker() {
    if (emojiPicker) emojiPicker.style.display = 'none';
}


// --- Header Functionality (Detail Page) ---
// Define these functions BEFORE they are called in the DOMContentLoaded listener
function renderUserInfoDetail() {
    const userInfo = getUserInfo(); // Get user info from shared helper
    if (userNameElementDetail) userNameElementDetail.textContent = userInfo.name;
    if (userStatusElementDetail) userStatusElementDetail.textContent = userInfo.status;
    if (userAvatarElementDetail) userAvatarElementDetail.src = userInfo.avatar;
     // Also update the avatar preview in the modal
     if (avatarPreviewDetail) avatarPreviewDetail.src = userInfo.avatar;
}

function renderNotificationsDetail() {
    notifications = loadFromLocalStorage(NOTIFICATIONS_STORAGE_KEY, DEFAULT_NOTIFICATIONS); // Load from shared storage
    if (!notificationsListDetail || !noNotificationsMessageDetail) { console.warn("Notifications list elements not found (detail)."); return; }

    notificationsListDetail.innerHTML = ''; // Clear list
    if (notifications.length === 0) {
        noNotificationsMessageDetail.style.display = 'block';
    } else {
        noNotificationsMessageDetail.style.display = 'none';
        notifications.forEach(notif => {
            const item = document.createElement('div');
            item.classList.add('notification-item');
             // Ensure message is HTML safe if necessary
            item.innerHTML = `${notif.message} <span class="time">${formatTimeAgo(notif.time)}</span>`; // Use shared time formatter
            notificationsListDetail.appendChild(item);
        });
    }
    updateNotificationBadgeDetail();
}

function updateNotificationBadgeDetail() {
     const unreadCount = notifications.length; // Badge shows total notifications for this simulation
     if (notificationBadgeDetail) {
         if (unreadCount > 0) {
              notificationBadgeDetail.textContent = unreadCount;
              notificationBadgeDetail.classList.remove('hidden');
         } else {
              notificationBadgeDetail.classList.add('hidden');
         }
     }
}

function toggleAccountDropdownDetail(event) {
    event.stopPropagation();
    if (accountDropdownDetail) accountDropdownDetail.classList.toggle('show');
    if (userProfileToggleDetail) userProfileToggleDetail.classList.toggle('open');
    if (notificationPanelDetail) notificationPanelDetail.classList.remove('show'); // Close other panels
    hideEmojiPicker(); // Close emoji picker
}

function toggleNotificationPanelDetail(event) {
    event.stopPropagation();
    if (notificationPanelDetail) notificationPanelDetail.classList.toggle('show');
    if (accountDropdownDetail) accountDropdownDetail.classList.remove('show'); // Close other panels
    if (userProfileToggleDetail) userProfileToggleDetail.classList.remove('open'); // Close other panels
    hideEmojiPicker(); // Close emoji picker


    if (notificationPanelDetail?.classList.contains('show')) {
        // When showing the panel, clear the badge (mark all as read)
        // This is a simulation; a real app would track read status per notification
        // For now, just hiding the badge visually.
        if (notificationBadgeDetail) notificationBadgeDetail.classList.add('hidden');
    }
    // Re-render notifications to potentially update time strings even if not clearing badge
    renderNotificationsDetail();
}

function handleClickOutsideDetail(event) {
    // Close Account Dropdown
    if (userProfileToggleDetail && accountDropdownDetail && !userProfileToggleDetail.contains(event.target) && !accountDropdownDetail.contains(event.target) && accountDropdownDetail.classList.contains('show')) { // Check contains for dropdown too
        accountDropdownDetail.classList.remove('show');
        userProfileToggleDetail.classList.remove('open');
    }
    // Close Notification Panel
    if (notificationBtnDetail?.parentElement && notificationPanelDetail && !notificationBtnDetail.parentElement.contains(event.target) && !notificationPanelDetail.contains(event.target) && notificationPanelDetail.classList.contains('show')) { // Check contains for panel too
         notificationPanelDetail.classList.remove('show');
    }
     // Close Emoji Picker
     if (emojiPicker && !emojiPicker.contains(event.target) && event.target !== emojiButton && !emojiButton?.contains(event.target) && !emojiButton?.parentElement?.contains(event.target)) { // Check emoji button and its parent too
        hideEmojiPicker();
     }
     // Close Profile Edit Modal
     if (profileEditModalDetail?.classList.contains('visible')) {
         const modalContent = profileEditModalDetail.querySelector('.modal-content');
         if (modalContent && !modalContent.contains(event.target)) {
              hideProfileEditModalDetail();
         }
     }
}

function showProfileEditModalDetail() {
    if (!profileEditModalDetail || !editNameInputDetail || !avatarPreviewDetail) {
        console.warn("Profile edit modal elements not found (detail).");
        return;
    }
    const userInfo = getUserInfo(); // Get user info from shared helper
    editNameInputDetail.value = userInfo.name;
    avatarPreviewDetail.src = userInfo.avatar; // Load current avatar

    renderRecommendedAvatarsDetail(); // Populate recommended avatars

    profileEditModalDetail.classList.add('visible');
     // Close dropdowns if open
     if (accountDropdownDetail) accountDropdownDetail.classList.remove('show');
     if (userProfileToggleDetail) userProfileToggleDetail.classList.remove('open');
}

function hideProfileEditModalDetail() {
     if (profileEditModalDetail) profileEditModalDetail.classList.remove('visible');
     if (avatarUploadInputDetail) avatarUploadInputDetail.value = ''; // Clear the file input
      // Reset the preview to the current saved avatar in case user cancelled after choosing a file
     const userInfo = getUserInfo(); // Get current user info
     if (avatarPreviewDetail) avatarPreviewDetail.src = userInfo.avatar;
}

function renderRecommendedAvatarsDetail() {
     if (!recommendedAvatarsListDetail) {
         console.warn("Recommended avatars list element not found (detail).");
         return;
     }
     recommendedAvatarsListDetail.innerHTML = ''; // Clear previous avatars
     RECOMMENDED_AVATARS.forEach(url => { // Use shared Recommended Avatars list
         const img = document.createElement('img');
         img.src = url;
         img.alt = getTranslation('modal_recommended_avatars'); // Use translated alt text
         img.title = getTranslation('modal_select_avatar') || 'Select Avatar'; // Add a title
         img.addEventListener('click', () => {
             if (avatarPreviewDetail) avatarPreviewDetail.src = url; // Use optional chaining
         });
         recommendedAvatarsListDetail.appendChild(img);
     });
}

function handleAvatarUploadDetail(event) {
    if (!event.target || !avatarPreviewDetail) { // Use optional chaining
         console.warn("Avatar upload input or preview element not found (detail modal).");
         return;
    }
    const file = event.target.files?.[0]; // Use optional chaining
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (avatarPreviewDetail && e.target?.result) avatarPreviewDetail.src = e.target.result; // Use optional chaining
        };
        reader.readAsDataURL(file);
    } else if (file) {
        alert(getTranslation('alert_select_image_file')); // Use translated alert
        // Clear the file input (works differently based on browser security, setting to null often works)
        if (event.target) event.target.value = '';
         // Revert preview to current saved avatar
        const userInfo = getUserInfo(); // Get current user info
        if (avatarPreviewDetail) avatarPreviewDetail.src = userInfo.avatar;
    }
 }

 function saveProfileChangesDetail() {
     if (!editNameInputDetail || !avatarPreviewDetail || !profileEditModalDetail) { // Use optional chaining
         console.warn("Profile edit modal elements not found for saving (detail).");
         return; // Cannot proceed without required elements
     }

     const newName = editNameInputDetail.value.trim();
     const newAvatar = avatarPreviewDetail.src;

      // Check if name and avatar are valid (non-empty, avatar src is not just the base href)
     if (newName && newName.trim() !== '' && newAvatar && newAvatar !== 'null' && newAvatar.trim() !== '' && newAvatar !== window.location.href) {
         let userInfo = getUserInfo(); // Load current info
         userInfo.name = newName;
         userInfo.avatar = newAvatar;
         saveToLocalStorage(USER_INFO_STORAGE_KEY, userInfo); // Save updated info
         renderUserInfoDetail(); // Update header UI
         hideProfileEditModalDetail(); // Close modal
         // Add and render notification
         addNotification(getTranslation("alert_profile_updated"));
         renderNotificationsDetail();
     } else {
         alert(getTranslation('alert_enter_profile_info')); // Use translated alert
     }
 }

 // Simulated Logout (Detail Page)
 function handleLogoutDetail() {
    if (confirm(getTranslation('alert_logout_confirm'))) { // Use translated confirm
        saveToLocalStorage(IS_LOGGED_IN_STORAGE_KEY, false);
        // Optionally clear other user data
        // localStorage.removeItem(USER_INFO_STORAGE_KEY);
        // localStorage.removeItem(WATCHLIST_STORAGE_KEY);
        // localStorage.removeItem(RATINGS_STORAGE_KEY);
        // localStorage.removeItem(VIEW_HISTORY_STORAGE_KEY);

        window.location.replace('login.html'); // Use replace for history management
    }
 }

 // Placeholder functions for other menu items (Detail Page)
 function handleSettingsClickDetail(event) { event.preventDefault(); alert(getTranslation('alert_settings_not_implemented')); if (accountDropdownDetail) accountDropdownDetail.classList.remove('show'); if (userProfileToggleDetail) userProfileToggleDetail.classList.remove('open');}
 function handleHelpCenterClickDetail(event) { event.preventDefault(); alert(getTranslation('alert_help_not_implemented')); if (accountDropdownDetail) accountDropdownDetail.classList.remove('show'); if (userProfileToggleDetail) userProfileToggleDetail.classList.remove('open');}

 // Logo click handler for detail page
 function handleAppLogoClickDetail() {
     window.location.href = 'index.html'; // Navigate back to the main page
 }


 // Handle watchlist click specifically on the detail page button
 function handleDetailWatchlistClick(event) {
     const button = event.target.closest('.detail-watchlist-btn');
      if (!button || !currentMovie) return; // Need button and current movie

     const movieId = currentMovie.id; // Use current movie ID

     // Load the current watchlist state from localStorage
     watchlist = loadFromLocalStorage(WATCHLIST_STORAGE_KEY, new Set());

     const isAdded = watchlist.has(movieId);
      const movieTitle = currentMovie.title || 'Item'; // Get movie title for notification

     if (isAdded) {
         watchlist.delete(movieId);
         addNotification(`'${movieTitle}' removed from Interesting Movies.`); // Add notification
     } else {
         watchlist.add(movieId);
         addNotification(`'${movieTitle}' added to Interesting Movies.`); // Add notification
     }

     // Save the updated watchlist back to localStorage
     saveToLocalStorage(WATCHLIST_STORAGE_KEY, watchlist);

     // Update the UI of the button
     updateWatchlistButtonUI(button, watchlist.has(movieId));

     // Note: The Interesting Movies section on the index page will only update when navigating back
     // or when the index page reloads/updates its sections.
     // Add notification
      renderNotificationsDetail();
 }

 function updateWatchlistButtonUI(button, isAdded) {
      if (!button) return;
      const icon = button.querySelector('i');
      if (!icon) return;

      button.classList.toggle('added', isAdded);
      button.title = getTranslation(isAdded ? 'remove_from_interesting' : 'add_to_interesting'); // Update title for translation
      icon.className = `fas ${isAdded ? 'fa-check' : 'fa-plus'}`;
  }


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded for movie_detail.html");

    // Check login status first. If not logged in, checkLoginStatus will redirect.
     // If it returns false, stop further execution.
     if (!checkLoginStatus()) {
          // Loading overlay removed from detail page - no explicit hide needed here
          return;
     }
     console.log("User is logged in, starting detail page initialization.");

    loadTranslations(); // Load translations

    const urlParams = new URLSearchParams(window.location.search);
    const movieId = parseInt(urlParams.get('id'), 10);

    // --- Initialize Header on Detail Page ---
    renderUserInfoDetail(); // Render header user info
    renderNotificationsDetail(); // Render notification list and badge

    if (userProfileToggleDetail) userProfileToggleDetail.addEventListener('click', toggleAccountDropdownDetail);
    if (notificationBtnDetail) notificationBtnDetail.addEventListener('click', toggleNotificationPanelDetail);
    if (languageSelectDetail) languageSelectDetail.addEventListener('change', (event) => {
         currentLanguage = event.target.value;
         saveToLocalStorage(LANGUAGE_STORAGE_KEY, currentLanguage);
         applyTranslations(); // Re-apply all translations on language change
    });
     if (appLogoDetail) appLogoDetail.addEventListener('click', handleAppLogoClickDetail);


     // --- Initialize Profile Edit Modal on Detail Page ---
     const editProfileBtnDetailElement = document.getElementById('edit-profile-btn-detail');
     if (editProfileBtnDetailElement) editProfileBtnDetailElement.addEventListener('click', showProfileEditModalDetail);

     const saveProfileBtnDetailElement = document.getElementById('save-profile-edit-detail');
     if (saveProfileBtnDetailElement) saveProfileBtnDetailElement.addEventListener('click', saveProfileChangesDetail);

     const cancelProfileBtnDetailElement = document.getElementById('cancel-profile-edit-detail');
     if (cancelProfileBtnDetailElement) cancelProfileBtnDetailElement.addEventListener('click', hideProfileEditModalDetail);

     const avatarUploadInputDetailElement = document.getElementById('avatar-upload-input-detail');
     if (avatarUploadInputDetailElement) avatarUploadInputDetailElement.addEventListener('change', handleAvatarUploadDetail);


      // Account Dropdown Menu Item listeners (using delegation on the ul)
      const accountDropdownUlDetail = accountDropdownDetail?.querySelector('ul');
      if (accountDropdownUlDetail) {
           accountDropdownUlDetail.addEventListener('click', (e) => {
               const target = e.target.closest('a, button'); // Check if the click was on an anchor or button
               if (target) {
                    // Handle Logout specifically by ID
                    if (target.id === 'logout-btn-detail') {
                        handleLogoutDetail();
                        return; // Stop propagation if logout is handled
                    }
                    // Handle Profile link (it has an href, browser handles navigation)
                    if (target.href && target.href.endsWith('profile.html')) {
                        // Let the browser handle the navigation via href
                        // Optionally close the dropdown if the link is handled by browser
                        if (accountDropdownDetail) accountDropdownDetail.classList.remove('show');
                        if (userProfileToggleDetail) userProfileToggleDetail.classList.remove('open');
                        return; // Let href work
                    }
                    // Handle Settings and Help links (check for the icon or specific element structure)
                    const settingsLink = accountDropdownUlDetail.querySelector('a i.fa-cog')?.parentElement; // Find the <a> element containing the settings icon
                    const helpLink = accountDropdownUlDetail.querySelector('a i.fa-question-circle')?.parentElement; // Find the <a> element containing the help icon

                    if (target === settingsLink) {
                        handleSettingsClickDetail(e); // Pass event object
                    } else if (target === helpLink) {
                        handleHelpCenterClickDetail(e); // Pass event object
                    }
                    // For other clicks within the dropdown (e.g., on list items without links/buttons), do nothing or close dropdown
                     // accountDropdownDetail.classList.remove('show'); // Optional: Close dropdown on any click inside it
                     // userProfileToggleDetail.classList.remove('open');
               }
           });
      } else {
           console.warn("Account dropdown UL not found for event delegation (detail).");
           // Add direct listeners to specific buttons if delegation is not preferred or fails
           // These fallback listeners were added above using getElementById
      }


    // --- Load and Render Movie Details ---
    if (isNaN(movieId)) {
        console.error("Invalid movie ID in URL:", urlParams.get('id'));
        renderMovieDetail(null); // Render 'details unavailable' state
        applyTranslations(); // Apply translations to the error state
        return; // Stop execution
    }

    const movie = loadMovieData(movieId); // Load movie from data.js

    if (movie) {
        renderMovieDetail(movie); // Render the details
        applyTranslations(); // Apply translations after rendering

        // --- EVENT LISTENERS (Movie Specific) ---
        // Watchlist Button
        if (detailWatchlistBtn) detailWatchlistBtn.addEventListener('click', handleDetailWatchlistClick);

        // Comments Section
        if (postCommentBtn) postCommentBtn.addEventListener('click', postComment);
         // Add listener for Cancel Reply button
        if (cancelReplyButton) cancelReplyButton.addEventListener('click', cancelReply);

        // Player Placeholder (Click to play)
        if (playerPlaceholder) {
            playerPlaceholder.addEventListener('click', (event) => {
                // Only trigger play if the click is on the placeholder itself or its icon, not the iframe that gets inserted
                if (!playerPlaceholder.classList.contains('playing') && (event.target === playerPlaceholder || event.target.closest('i.fa-play-circle'))) {
                     const videoUrlToPlay = playerPlaceholder.dataset.videoUrl;
                     if (videoUrlToPlay) {
                         playVideo(videoUrlToPlay);
                     } else {
                          console.warn("No video URL found on player placeholder dataset.");
                     }
                }
            });
        } else {
            console.warn("Player placeholder element not found.");
        }


        // Rating Stars (Listeners are added inside renderUserRating)

        // Trailers (Listeners are added inside renderTrailers)

        // Emoji Picker
        if (emojiButton) emojiButton.addEventListener('click', toggleEmojiPicker); else console.warn("Emoji button not found.");
        renderEmojiPicker(); // Populate emoji picker on load

        // Close emoji picker when clicking outside
        // Handled by body click listener below

        // Allow posting comment by Enter key (Shift+Enter for newline)
        if (commentInput) {
             commentInput.addEventListener('keypress', function(event) {
                 if (event.key === 'Enter' && !event.shiftKey) {
                     event.preventDefault(); // Prevent default newline
                     postComment(); // Post the comment
                 }
             });
        } else {
            console.warn("Comment input not found for keypress listener.");
        }


    } else {
        console.error("Movie not found for ID:", movieId);
        renderMovieDetail(null); // Render 'details unavailable' state
        applyTranslations(); // Apply translations to the error state
    }

    // Handle clicks outside dropdowns/panels/modals/emoji picker (delegated to body)
     document.body.addEventListener('click', handleClickOutsideDetail);


    console.log("Movie detail page initialization complete.");
});