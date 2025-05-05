// data.js - Contains the hardcoded movie/series data

// Declare moviesData here ONCE using const or var
const moviesData = [
     // ========================================================
     //  ADD YOUR CUSTOM VIDEO OBJECTS BELOW THIS LINE
     // =======================================================
     //
     //  Each video should be an object following this structure:
     //
     //  {
     //      id: UNIQUE_NUMBER,          // MUST be a unique number for each video/series (e.g., 1, 2, 3...)
     //      title: "Your Video Title",
     //      year: YEAR_OF_VIDEO,        // e.g., 2024
     //      rating: OPTIONAL_RATING,    // e.g., 7.5 (This is a default display rating before a user rates it)
     //      genre: "Your Genre",        // e.g., "Animation", "Action", "Romance", "Horror", "Fantasy", "Comedy", "Adventure"
     //      categories: ["category1", "category2"], // An array of strings. Use categories like "action", "romance", "animation", "horror", "fantasy", "comedy", "adventure". You can also add "popular" and "newest" to make them appear in those sorted lists on the main page.
     //      img: "URL_TO_YOUR_POSTER_IMAGE",      // Link to the video's poster image (e.g., hosted on Imgur, your server, etc.)
     //      backdrop: "URL_TO_YOUR_BACKGROUND_IMAGE", // Link to a larger background image for the detail page
     //      videoUrl: "YOUTUBE_EMBED_URL_OR_OTHER_EMBED_LINK", // !! IMPORTANT: This MUST be an embed URL for the player to work.
     //                                                      // For YouTube, it's typically "https://www.youtube.com/embed/VIDEO_ID"
     //                                                      // For Vimeo, it's typically "https://player.vimeo.com/video/VIDEO_ID"
     //                                                      // You can often add parameters like "?autoplay=1&rel=0&modestbranding=1"
     //      type: 'movie',              // Or 'series' - determines which main tab it appears under
     //      description: "A detailed description of your video.",
     //      trailers: ["Official Trailer", "Behind the Scenes"], // An array of strings naming the trailers (these names appear as buttons)
     //      trailerUrl: "OPTIONAL_YOUTUBE_EMBED_URL_FOR_TRAILER" // OPTIONAL: Link to a separate trailer video (must also be an embed URL). If not provided, clicking a trailer name will play the main `videoUrl`.
     //  },
     //
     //  Example entry:
     //  {
     //      id: 101,
     //      title: "My Awesome Short Film",
     //      year: 2024,
     //      rating: 8.8,
     //      genre: "Sci-Fi",
     //      categories: ["action", "adventure", "newest"],
     //      img: "https://example.com/images/shortfilm_poster.jpg",
     //      backdrop: "https://example.com/images/shortfilm_bg.jpg",
     //      videoUrl: "https://www.youtube.com/embed/YOUR_SHORT_FILM_ID?autoplay=1",
     //      type: 'movie',
     //      description: "A thrilling journey through time and space.",
     //      trailers: ["Trailer 1", "Sneak Peek"],
     //      trailerUrl: "https://www.youtube.com/embed/YOUR_TRAILER_ID"
     //  },
     //  {
     //      id: 102,
     //      title: "Coding Tutorial Series",
     //      year: 2023,
     //      rating: 9.5,
     //      genre: "Educational", // Add new genres if needed, update filters accordingly
     //      categories: ["newest", "popular"], // Use categories that fit
     //      img: "https://example.com/images/tutorial_poster.png",
     //      backdrop: "https://example.com/images/tutorial_bg.png",
     //      videoUrl: "https://player.vimeo.com/video/YOUR_TUTORIAL_ID", // Example using Vimeo embed URL
     //      type: 'series',
     //      description: "Learn to code from scratch with this comprehensive series.",
     //      trailers: ["Intro Trailer"],
     //      trailerUrl: "" // No separate trailer URL, clicking "Intro Trailer" will play the main videoUrl
     //  },
     //
     //  =======================================================
     //  END OF YOUR CUSTOM VIDEO OBJECTS
     // =======================================================

     // Movie: Artur, RICK - Дай (ID 100)
     {
         id: 100,
         title: "Artur, RICK - Дай",
         year: 2025,
         rating: 8.5,
         genre: "Romance",
         categories: ["romance", "popular"],
         img: "https://i.ytimg.com/vi/m-bFaxtq0Q4/maxresdefault.jpg",
         backdrop: "https://i.ytimg.com/vi/m-bFaxtq0Q4/maxresdefault.jpg",
         videoUrl: "https://player.vimeo.com/video/1081236520?h=28f54bd25e&badge=0&autopause=0&player_id=0&app_id=58479",
         type: 'movie',
         description: `Текст песни:

Дай мне тобой надышатся
Начинаю задыхаться
Мама она так прекрасна
Она заставляет меня улыбаться

Я вспоминаю наши дни
Там горят огни
Там где я и ты
Мадам
Тебя прошу со мной поговори
Всему так  вопреки
Кем бы не были мы
Не предам
Давай расскажи что ты хочешь
Я приеду к тебе среде ночи
Ты пишешь как всегда многоточие
Ты видимо меня так не хочешь

Ты очень хороша на самом деле
Ты будешь в меня верить
Когда никто не верит
Ты моя королева, королева Империй
Все будет хорошо
У нас ключи от нашей цели

А я ищу темы
Чтоб ты больше не смотрела цены
Я с тобой такой какой я есть
С другими таким не был
За окном зима ,
А я влюблен будто в апреле
Постоянно холода
Меня только твои ладони грели
Ели ели
мы научились никому не верить
Теперь дом полон улыбок радости
и  нет истерик,  не играй в эти качели
Ты без косметики лучше модели
Запах шанели
твой не заменит`, // Corrected to use backticks for multi-line string
         trailers: ["Behind the Scenes"],
         trailerUrl: "https://player.vimeo.com/video/1081238068?h=a6de06a8b5&badge=0&autopause=0&player_id=0&app_id=58479"
     },

     // Adding the second requested video:
     // Movie: Jah Khalib - В открытый космос (ID 101)
     {
         id: 101, // Use the requested ID
         title: "Jah Khalib - В открытый космос",
         year: 2018,
         rating: 7.2,
         genre: "Romance", // Based on lyrics, can also be Pop or Hip-Hop
         categories: ["action", "romance"], // User requested action, lyrics suggest romance
         img: "https://i.ytimg.com/vi/4X_3iNYblwY/maxresdefault.jpg", // Provided poster image
         backdrop: "https://i.ytimg.com/vi/4X_3iNYblwY/maxresdefault.jpg", // Using the same for backdrop
         // Extracted embed URL from the provided iframe HTML
         videoUrl: "https://player.vimeo.com/video/1081239241?h=3ca1c6ae38&badge=0&autopause=0&player_id=0&app_id=58479",
         type: 'movie', // Specified type
         description: `Текст песни
Тает ночь, я спешу в наш дом, чтоб дышать тобой.
Море звёзд плывёт над землей, одна за другой.
Я хочу, чтоб они падали над моей головой.
Загадав сотню желаний, чтоб ты стала мне судьбой!
В наших окнах светит солнце, ты ждёшь, забыв про сон.
Открыл дверь – ты стоишь в моей футболке босиком.
Открыл глаза – я стою один, вокруг холодный дом.
Знаешь, мы с тобой не можем больше жить вчерашним днём`, // Corrected to use backticks for multi-line string
         trailers: ["Official Video"], // Assuming the main video is the official one
         trailerUrl: "" // No separate trailer, the "Official Video" button will play videoUrl
     },
 ];

 // Ensure moviesData is defined and is an array before processing
 if (typeof moviesData !== 'undefined' && Array.isArray(moviesData)) {
     // Ensure all movies have default values if certain fields are missing
     moviesData.forEach(movie => {
         // Ensure categories is an array, default to empty if missing
         if (!Array.isArray(movie.categories)) {
              movie.categories = [];
         }

         // Ensure trailers is an array, default to empty if missing
         if (!Array.isArray(movie.trailers)) {
             movie.trailers = [];
         }
         // Add default trailerUrl if not present, to avoid errors later
         if (movie.trailerUrl === undefined) {
              movie.trailerUrl = "";
         }

         // Add a placeholder description if missing
         if (!movie.description) {
              // Attempt to create a basic description using available data
              const type = movie.type || 'item';
              const genre = movie.genre || 'Unknown Genre';
              const year = movie.year ? `from ${movie.year}` : '';
              const rating = movie.rating !== undefined ? `, with a rating of ${movie.rating.toFixed(1)}` : '';
              movie.description = `Details for "${movie.title}". This ${genre} ${type} ${year}${rating}.`; // Removed developer note
         }

          // Ensure genre is present, default if missing
          if (!movie.genre) {
               movie.genre = "Uncategorized"; // Default genre if none provided
          }
          // Ensure type is present, default to 'movie' if missing or invalid
          if (movie.type !== 'movie' && movie.type !== 'series') {
               movie.type = 'movie';
          }
          // Ensure rating is a number, default to 0 if missing or invalid
          if (typeof movie.rating !== 'number' || isNaN(movie.rating)) {
               movie.rating = 0;
          }
          // Ensure year is present, default to 'N/A' if missing or invalid
          if (typeof movie.year !== 'number' || isNaN(movie.year) || movie.year === 0) {
               movie.year = 'N/A';
          }

     });
 } else {
     console.error("moviesData is not defined or is not an array!");
     // Define an empty array as a fallback to prevent errors in other scripts
     const moviesData = [];
 }
