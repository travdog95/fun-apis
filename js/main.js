const OMDbApiKey = "bf7f805e";
const searchInput = document.querySelector("[data-search-input]");
const searchButton = document.querySelector("[data-search-button]");
const message = document.querySelector("[data-message]");
const cardTemplate = document.querySelector("[data-movie-card-template]");
const cardsContainer = document.querySelector("[data-movie-cards-container");
const primaryMetaDataContainer = document.querySelector("[data-primary-meta-data-container]");

const movieDetailsCard = document.querySelector("[data-movie-details-card");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseButton = movieDetailsCard.querySelector("[data-modal-close-button]");

const paginationContainer = document.querySelector("[data-pagination-container]");
const firstRecordSpan = document.querySelector("[data-first-record]");
const lastRecordSpan = document.querySelector("[data-last-record]");
const totalResultsSpan = document.querySelector("[data-total-results]");
const previousPageButton = document.querySelector("[data-previous-page]");
const nextPageButton = document.querySelector("[data-next-page]");
const pageButtonsContainer = document.querySelector("[data-page-buttons-container]");

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
let searchString = "";
const debug = false;

searchButton.disabled = true;
searchInput.focus();

//Event Handlers
searchButton.addEventListener("click", (event) => {
  if (searchInput.value !== "") {
    clearPaginationData();
    searchString = searchInput.value;
    searchMovies(searchString);
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
    searchString = event.target.value;
    searchMovies(searchString);
  }
});

modalCloseButton.addEventListener("click", (e) => {
  modalContainer.classList.add("hidden");
});

previousPageButton.addEventListener("click", (e) => {
  searchMovies(searchString, pagination.previousPage);
});

nextPageButton.addEventListener("click", (e) => {
  searchMovies(searchString, pagination.nextPage);
});

//Functions
const searchMovies = async (searchText, pageNumber = 1) => {
  //Get user data, clone card template, add user data and map it to users array
  message.textContent = "";

  const response = await fetch(
    `https://www.omdbapi.com/?s=${searchText}&type=movie&page=${pageNumber}&apikey=${OMDbApiKey}`
  );

  //Clear exiting results
  cardsContainer.innerHTML = "";

  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    if (debug) console.log(data);

    if (data.Response === "True") {
      pagination = updatePaginationData(data, pageNumber);
      if (debug) console.log(pagination);
      updatePaginationUI();
      paginationContainer.classList.remove("hidden");

      data.Search.forEach((movie) => {
        const card = cardTemplate.content.cloneNode(true).children[0];
        const poster = card.querySelector("[data-poster]");
        const title = card.querySelector("[data-title]");
        const year = card.querySelector("[data-year]");
        const type = card.querySelector("[data-type]");

        poster.src =
          movie.Poster === "N/A"
            ? "https://via.placeholder.com/40x56/C2C2C2/757575/?text=N/A"
            : movie.Poster;

        title.textContent = movie.Title;
        year.textContent = movie.Year;
        type.textContent = movie.Type;
        card.addEventListener("click", (e) => {
          showMovieDetails(movie.imdbID);
        });
        cardsContainer.append(card);
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
    `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${OMDbApiKey}`
  );

  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    if (debug) console.log(data);

    const poster = movieDetailsCard.querySelector("[data-poster]");
    const title = movieDetailsCard.querySelector("[data-title]");
    const plot = movieDetailsCard.querySelector("[data-plot]");
    const genres = movieDetailsCard.querySelector("[data-genres]");
    const actors = movieDetailsCard.querySelector("[data-actors]");

    poster.src =
      data.Poster === "N/A"
        ? "https://via.placeholder.com/300x466/C2C2C2/757575/?text=N/A"
        : data.Poster;

    title.textContent = data.Title;
    plot.textContent = data.Plot;

    const primaryMetaData = [];

    if (data.Year !== "N/A") primaryMetaData.push(data.Year);
    if (data.Rated !== "N/A") primaryMetaData.push(data.Rated);
    if (data.Runtime !== "N/A") primaryMetaData.push(data.Runtime);
    if (data.imdbRating !== "N/A") primaryMetaData.push(`${data.imdbRating}/10`);

    let metaDataHtml = "";
    if (primaryMetaData.length > 0) {
      primaryMetaData.forEach((metaData) => {
        metaDataHtml += `<div>${metaData}</div>`;
      });

      primaryMetaDataContainer.innerHTML = metaDataHtml;
    }

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

const updatePaginationData = (data, currentPage) => {
  const numPages = Math.ceil(data.totalResults / paginationDefaults.resultsPerPage);
  currentPage = parseInt(currentPage);
  return {
    totalResults: parseInt(data.totalResults),
    numPages,
    currentPage: currentPage,
    previousPage: currentPage === 1 ? null : currentPage - 1,
    nextPage: currentPage + 1 <= numPages ? currentPage + 1 : null,
    resultsDisplayed: data.Search.length,
    resultsPerPage: paginationDefaults.resultsPerPage,
  };
};

const updatePaginationUI = () => {
  let firstRecord = 0;
  let lastRecord = 0;
  let firstPage = 0;

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

  firstPage =
    pagination.currentPage <= 3 ? 1 : pagination.currentPage - Math.floor(maxNumPageButtons / 2);

  let html = "";
  for (let i = 0; i < numPageButtons; i++) {
    const page = firstPage + i;
    const activeButtonClass = page === pagination.currentPage ? "btn-active" : "";
    html += `<button class="btn btn-pagination ${activeButtonClass}" data-page="${page}">${page}</button>`;
  }

  pageButtonsContainer.innerHTML = html;

  document.querySelectorAll("[data-page]").forEach((pageButton) => {
    pageButton.addEventListener("click", (e) => {
      const page = e.target.dataset.page;
      searchMovies(searchString, page);
    });
  });
};

const clearPaginationData = () => {
  pagination = paginationDefaults;
  paginationContainer.classList.add("hidden");
};

// showMovieDetails("tt0076759");
