const OMDbApiKey = "bf7f805e";
const cardTemplate = document.querySelector("[data-movie-card-template]");
const cardsContainer = document.querySelector("[data-movie-cards-container");

let movies = [];
//Get user data, clone card template, add user data and map it to users array
fetch(`http://www.omdbapi.com/?s=start&apikey=${OMDbApiKey}`)
  .then((res) => res.json())
  .then((data) => {
    console.log(data);
    movies = data.Search.map((movie) => {
      const card = cardTemplate.content.cloneNode(true).children[0];
      const image = card.querySelector("[data-image]");
      const title = card.querySelector("[data-title]");
      const year = card.querySelector("[data-year]");
      const type = card.querySelector("[data-type]");

      image.src = movie.Poster;
      title.textContent = movie.Title;
      year.textContent = movie.Year;
      type.textContent = movie.Type;
      cardsContainer.append(card);
      return { title: movie.Title.toLowerCase(), element: card };
    });
  });
