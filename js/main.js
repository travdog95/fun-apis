const OMDbApiKey = "bf7f805e";
const searchInput = document.querySelector("[data-search-input]");
const searchButton = document.querySelector("[data-search-button]");
const message = document.querySelector("[data-message]");
const cardTemplate = document.querySelector("[data-movie-card-template]");
const cardsContainer = document.querySelector("[data-movie-cards-container");

const movieDetailsTemplate = document.querySelector("[data-movie-details-template]");
const movieDetailsContainer = document.querySelector("[data-movie-details-container");
const modalContainer = document.querySelector("[data-modal-container]");
let movies = [];

searchButton.disabled = true;
searchInput.focus();

//Event Handlers
searchButton.addEventListener("click", (event) => {
  if (searchInput.value !== "") {
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
  if (event.key === "Enter" && searchButton.disabled === false)
    searchMovies(event.target.value.toLowerCase());
});

//Functions
const searchMovies = (searchText) => {
  //Get user data, clone card template, add user data and map it to users array

  fetch(`http://www.omdbapi.com/?s=${searchText}&apikey=${OMDbApiKey}`)
    .then(checkAjaxError)
    .then((data) => {
      console.log(data);
      if (data.Response === "True") {
        //Clear exiting results
        cardsContainer.innerHTML = "";

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
    })
    .catch((error) => {
      message.textContent = error;
      searchInput.value = "";
      searchInput.focus();
    });
};

const showMovieDetails = async (imdbID) => {
  //Fetch movie details and load into HTML
  const response = await fetch(
    `http://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${OMDbApiKey}`
  );
  if (response.status >= 200 && response.status <= 299) {
    const data = await response.json();
    console.log(data);

    const movieDetails = movieDetailsTemplate.content.cloneNode(true).children[0];
    const poster = movieDetails.querySelector("[data-poster]");
    const title = movieDetails.querySelector("[data-title]");
    const year = movieDetails.querySelector("[data-year]");
    const rating = movieDetails.querySelector("[data-rating]");
    const runtime = movieDetails.querySelector("[data-runtime]");
    const plot = movieDetails.querySelector("[data-plot]");
    const imdbRating = movieDetails.querySelector("[data-imdb-rating]");
    const modalCloseButton = movieDetails.querySelector("[data-modal-close-button]");

    poster.src = data.Poster;
    title.textContent = data.Title;
    year.textContent = data.Year;
    rating.textContent = data.Rating;
    runtime.textContent = data.Runtime;
    plot.textContent = data.Plot;
    year.textContent = data.Year;
    imdbRating.textContent = imdbRating.Year;

    movieDetailsContainer.append(movieDetails);

    modalCloseButton.addEventListener("click", (e) => {
      modalContainer.classList.add("hidden");
      movieDetailsContainer.innerHTML = "";
    });
  } else {
    // Handle errors
    console.log(response.status, response.statusText);
    message.textContent = response.statusText;
  }
  //Open movie details card
  modalContainer.classList.remove("hidden");
};

const checkAjaxError = (response) => {
  if (response.status >= 200 && response.status <= 299) {
    return response.json();
  } else {
    throw Error(response.statusText);
  }
};
