const baseUrl =
  "https://api.themoviedb.org/3/movie/popular?api_key=ec90af707a599c7b1267e264bad8a7b7&language=en-US";
const configUrl = "https://image.tmdb.org/t/p";
const listContainer = document.querySelector(".list-container");
const container = document.getElementById("container");
const prev = document.getElementById("prev");
const next = document.getElementById("next");
const pageInfo = document.getElementById("page-info");
const detail = document.getElementById("detail");
const indicator = document.getElementById("indicator");
const movieList = document.getElementById("movie-list");
const logo = document.getElementById("logo");
const config = document.getElementById("config");
const configClose = document.getElementById("config-close");

const colorList = {
  Action: "#5d8aa8",
  Adventure: "#e32636",
  Animation: "#ffbf00",
  Comedy: "#9966cc",
  Crime: "#a4c639",
  Documentory: "#cd9575",
  Drama: "#7fffd4",
  Family: "#b2beb5",
  Fantasy: "#ff9966",
  History: "#a52a2a",
  Horror: "#007fff",
  Music: "#f4c2c2",
  Mystery: "#873260",
  Romance: "#bf94e4",
  "Science Fiction": "#800020",
  "TV Movie": "#1e4d2b",
  Thriller: "#ffa700",
  War: "#003366",
  Werstern: "#ff00ff",
};
let likeList = [];
let page = 1;

async function listMovies(page) {
  listContainer.innerHTML = "";
  let url = baseUrl;
  if (page) {
    url = `${baseUrl}&page=${page}`;
  }
  const { results } = await (await fetch(url)).json();
  results.forEach(({ title, id, poster_path }) => {
    const imageUrl = `${configUrl}/w200${poster_path}`;
    const item = document.createElement("span");
    item.className = "item";
    item.dataset.id = `${id}`;
    item.innerHTML = `
    <img src=${imageUrl} alt=${title} class="poster">
    <img src="./asset/expand.png" class="expand">
    <img src="./asset/heart.png" class="heart">
    <span class="title">${title}</span>
    `;
    listContainer.appendChild(item);
  });
}

function buttonHandler() {
  //next page will load when button clicked
  next.addEventListener("click", (e) => {
    page = ++page > 500 ? 500 : page;
    pageInfo.innerText = "";
    pageInfo.innerText = `Page ${page} of 500 
    Total results 10,000`;
    prev.disabled = page === 1 ? true : false;
    listMovies(page);
  });

  //handles the functionality of previous button
  prev.addEventListener("click", (e) => {
    page = --page < 1 ? 1 : page;
    pageInfo.innerText = "";
    pageInfo.innerText = `Page ${page} of 500 
    Total results 10,000`;
    prev.disabled = page === 1 ? true : false;
    listMovies(page);
  });
}

function detailHandler() {
  //get details of a movie
  listContainer.addEventListener("click", async (e) => {
    const movieId = e.target.parentNode.dataset.id;
    if (e.target.className === "heart") {
      if (!likeList.includes(movieId)) {
        likeList.push(movieId);
      }
      indicator.innerText = "";
      indicator.innerText = `${likeList.length === 0 ? "" : likeList.length}`;
      indicator.style.display = `${likeList.length === 0 ? "none" : "inline"}`;
    } else {
      if (movieId) {
        const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=ec90af707a599c7b1267e264bad8a7b7&language=en-US`;
        const data = await (await fetch(url)).json();
        const {
          overview,
          poster_path,
          genres,
          production_companies,
          title,
          backdrop_path,
        } = data;

        const tags = genres.reduce((acc, { name }) => {
          acc += `<h4 style="background: ${colorList[name]}">${name}</h4>`;
          return acc;
        }, "");

        const logos = production_companies.reduce(
          (acc, { logo_path, name }) => {
            logo_path
              ? (acc += `<img src="${configUrl}/w92${logo_path}" alt="${name}" class="logo">`)
              : (acc += `<h2>${name}</h2>`);
            return acc;
          },
          ""
        );

        detail.innerHTML = `
            <img src="./asset/close.png" id="close">
            <img src="${configUrl}/w300${poster_path}">
            <img src="${configUrl}/w1280${backdrop_path}" class="detail-bg">
            <div class="detail-content">
            <h2>${title}</h2><span class="tags">${tags}</span><p>${overview}</p>
            <div class="company-logo">${logos}</div>
            </div>
          `;
        detail.style.display = "flex";
      }
    }
  });

  //close detail when clicked on close icon
  detail.addEventListener("click", (e) => {
    if (e.target.id === "close") {
      detail.style.display = "none";
    }
  });
}

function likeListHandler() {
  movieList.addEventListener("click", () => {
    container.innerHTML = "";
    container.style.display = "flex";
    config.style.display = "flex";
    likeList.forEach(async (movieId) => {
      const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=ec90af707a599c7b1267e264bad8a7b7&language=en-US`;
      const data = await (await fetch(url)).json();
      const { poster_path, title } = data;
      const imageUrl = `${configUrl}/w154${poster_path}`;
      const item = document.createElement("span");
      item.innerHTML = `
        <img src=${imageUrl} alt=${title} class="list-img">
        <p class="list-p">${title}</p>
      `;
      container.appendChild(item);
    });
  });
}

function configHandler() {
  config.addEventListener("click", (e) => {
    const configContainer = document.getElementById("config-container");
    configContainer.style.display = "flex";
    const list = document.querySelector("ul");
    list.innerHTML = "";
    likeList.forEach(async (movieId, index) => {
      const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=ec90af707a599c7b1267e264bad8a7b7&language=en-US`;
      const { title } = await (await fetch(url)).json();
      const movie = document.createElement("li");
      movie.classList.add("movie");
      movie.setAttribute("id", index);
      movie.draggable = true;
      movie.ondragstart = (e) => {
        e.dataTransfer.setData("text", e.target.id);
      };
      movie.ondragover = (e) => e.preventDefault();
      movie.ondrop = (e) => {
        e.preventDefault();
        const parent = document.querySelector("ul");
        const data = e.dataTransfer.getData("text");
        const previous = document.getElementById(data);
        if (e.target.id !== data) {
          const sibling =
            e.target.nextSibling === previous ? e.target : e.target.nextSibling;
          parent.insertBefore(e.target, previous);
          parent.insertBefore(previous, sibling);

          [likeList[e.target.id], likeList[data]] = [
            likeList[data],
            likeList[e.target.id],
          ];

          function loadList() {
            container.innerHTML = "";
            container.style.display = "flex";
            config.style.display = "flex";
            likeList.forEach(async (movieId) => {
              const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=ec90af707a599c7b1267e264bad8a7b7&language=en-US`;
              const data = await (await fetch(url)).json();
              const { poster_path, title } = data;
              const imageUrl = `${configUrl}/w154${poster_path}`;
              const item = document.createElement("span");
              item.innerHTML = `
        <img src=${imageUrl} alt=${title} class="list-img">
        <p class="list-p">${title}</p>
      `;
              container.appendChild(item);
            });
          }
          loadList();
        }
      };
      movie.innerText = `${title}`;
      list.appendChild(movie);
    });
    configContainer.appendChild(list);
  });

  configClose.addEventListener("click", (e) => {
    e.target.parentNode.style.display = "none";
  });
}

function renderMovies() {
  listMovies();
  buttonHandler();
  detailHandler();
  likeListHandler();
  configHandler();
}

renderMovies();
