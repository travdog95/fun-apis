const OMDbApiKey = "bf7f805e";
const searchInput = document.querySelector("[data-search-input]");
const searchButton = document.querySelector("[data-search-button]");
const message = document.querySelector("[data-message]");
const cardTemplate = document.querySelector("[data-movie-card-template]");
const cardsContainer = document.querySelector("[data-movie-cards-container");

const movieDetailsCard = document.querySelector("[data-movie-details-card");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseButton = movieDetailsCard.querySelector("[data-modal-close-button]");

const paginationContainer = document.querySelector("[data-pagination-container]");
const firstRecordSpan = document.querySelector("[data-first-record]");
const lastRecordSpan = document.querySelector("[data-last-record]");
const totalResultsSpan = document.querySelector("[data-total-results]");
const previousPageButton = document.querySelector("[data-previous-page]");
const nextPageButton = document.querySelector("[data-next-page]");

let movies = [];
const paginationDefaults = {
  currentPage: 0,
  previousPage: null,
  nextPage: null,
  totalResults: 0,
  numPages: 0,
  resultsPerPage: 10,
  resultsDisplayed: 0,
};

let pagination = {};

searchButton.disabled = true;
searchInput.focus();

//Event Handlers
searchButton.addEventListener("click", (event) => {
  if (searchInput.value !== "") {
    clearPaginationData();

    searchMovies(searchInput.value.toLowerCase());
  }
});

searchInput.addEventListener("input", (event) => {
  if (event.target.value == "") {
    searchButton.disabled = true;
  } else {
    searchButton.disabled = false;
  }
});

searchInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter" && searchButton.disabled === false) {
    clearPaginationData();
    searchMovies(event.target.value.toLowerCase());
  }
});

modalCloseButton.addEventListener("click", (e) => {
  modalContainer.classList.add("hidden");
});

previousPageButton.addEventListener("click", (e) => {
  searchMovies(searchInput.value.toLowerCase(), pagination.previousPage);
});

nextPageButton.addEventListener("click", (e) => {
  searchMovies(searchInput.value.toLowerCase(), pagination.nextPage);
});

//Functions
const searchMovies = async (searchText, pageNumber = 1) => {
  //Get user data, clone card template, add user data and map it to users array
  message.textContent = "";

  const response = await fetch(
    `http://www.omdbapi.com/?s=${searchText}&type=movie&page=${pageNumber}&apikey=${OMDbApiKey}`
  );

  //Clear exiting results
  cardsContainer.innerHTML = "";

  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    console.log(data);

    if (data.Response === "True") {
      pagination = calcPaginationData(data, pageNumber);
      updatePaginationData();
      paginationContainer.classList.remove("hidden");

      movies = data.Search.map((movie) => {
        const card = cardTemplate.content.cloneNode(true).children[0];
        const poster = card.querySelector("[data-poster]");
        const title = card.querySelector("[data-title]");
        const year = card.querySelector("[data-year]");
        const type = card.querySelector("[data-type]");

        poster.src = movie.Poster;
        title.textContent = movie.Title;
        year.textContent = movie.Year;
        type.textContent = movie.Type;
        card.addEventListener("click", (e) => {
          showMovieDetails(movie.imdbID);
        });
        cardsContainer.append(card);
        return { title: movie.Title.toLowerCase(), element: card };
      });
    } else {
      message.textContent = data.Error;
      searchInput.value = "";
      searchInput.focus();
    }
  }
};

const showMovieDetails = async (imdbID) => {
  //Fetch movie details and load into HTML
  const response = await fetch(
    `http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${OMDbApiKey}`
  );
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    console.log(data);

    const poster = movieDetailsCard.querySelector("[data-poster]");
    const title = movieDetailsCard.querySelector("[data-title]");
    const year = movieDetailsCard.querySelector("[data-year]");
    const rated = movieDetailsCard.querySelector("[data-rated]");
    const runtime = movieDetailsCard.querySelector("[data-runtime]");
    const plot = movieDetailsCard.querySelector("[data-plot]");
    const imdbRating = movieDetailsCard.querySelector("[data-imdb-rating]");
    const genres = movieDetailsCard.querySelector("[data-genres]");
    const actors = movieDetailsCard.querySelector("[data-actors]");

    poster.src = data.Poster;
    title.textContent = data.Title;
    year.textContent = data.Year === "N/A" ? "" : data.Year;
    rated.textContent = data.Rated === "N/A" ? "" : data.Rated;
    runtime.textContent = data.Runtime === "N/A" ? "" : data.Runtime;
    plot.textContent = data.Plot;
    imdbRating.textContent = data.imdbRating === "N/A" ? "" : `${data.imdbRating}/10`;

    const genresArray = data.Genre.split(",");
    let genresHtml = "";
    if (genresArray.length > 0) {
      genresArray.forEach((genre) => {
        genresHtml += `<div class="genre">${genre}</div>`;
      });

      genres.innerHTML = genresHtml;
    }

    const actorsArray = data.Actors.split(",");
    let actorsHtml = "";
    if (actorsArray.length > 0) {
      actorsArray.forEach((actor) => {
        actorsHtml += `<div class="actor">${actor}</div>`;
      });

      actors.innerHTML = actorsHtml;
    }
  } else {
    // Handle errors
    console.log(response.status, response.statusText);
    message.textContent = response.statusText;
  }
  //Open movie details card
  modalContainer.classList.remove("hidden");
};

const calcPaginationData = (data, currentPage) => {
  const numPages = Math.ceil(data.totalResults / paginationDefaults.resultsPerPage);
  return {
    totalResults: data.totalResults,
    numPages,
    currentPage: currentPage,
    previousPage: currentPage === 1 ? null : currentPage - 1,
    nextPage: currentPage + 1 <= numPages ? currentPage + 1 : null,
    resultsDisplayed: data.Search.length,
    resultsPerPage: paginationDefaults.resultsPerPage,
  };
};

const updatePaginationData = () => {
  let firstRecord = 0;
  let lastRecord = 0;

  if (pagination.currentPage > 0) {
    firstRecord =
      pagination.currentPage * pagination.resultsPerPage - pagination.resultsPerPage + 1;
    lastRecord = firstRecord + pagination.resultsDisplayed - 1;
  }

  totalResultsSpan.textContent = pagination.totalResults;
  firstRecordSpan.textContent = firstRecord;
  lastRecordSpan.textContent = lastRecord;

  previousPageButton.disabled = pagination.previousPage === null ? true : false;
  nextPageButton.disabled = pagination.nextPage === null ? true : false;

  //Page buttons
  const maxNumPageButtons = 5;

  const numPageButtons =
    pagination.totalResults > maxNumPageButtons * pagination.resultsPerPage
      ? maxNumPageButtons
      : pagination.numPages;

  console.log("numPageButtons", numPageButtons);
};

const clearPaginationData = () => {
  pagination = paginationDefaults;
  paginationContainer.classList.add("hidden");
};

// showMovieDetails("tt0076759");
