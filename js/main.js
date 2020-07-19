const debounce = (fn, debounceTime) => {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.call(this, ...args), debounceTime);
  };
};

function getRepositories(query = "") {
  return fetch(`https://api.github.com/search/repositories?q=${query}`)
    .then((resp) => resp.json())
    .catch((error) => error);
}
function getAddedRepoHtml(item = {}) {
  return `
  <div class="added-repo">
    <div class="added-repo__text">Name: ${item?.name}</div>
    <div class="added-repo__text">Owner: ${item?.login}</div>
    <div class="added-repo__text">Stars: ${item?.stars}</div>
    <div class="delete added-repo__delete"></div>
  </div>
`;
}
function getFoundedRepoHtml(item = {}) {
  return `<div class="suggest" data-name=${item.name} data-login=${item?.owner?.login} data-stars=${item?.stargazers_count}>${item.name}</div>`;
}
function updateRepos(repos = []) {
  if (!repos.length) {
    showError("Совпадений не найдено");
    hideSuggests();
    return;
  }
  const firstFiveRepos = [];
  const reposLength = repos.length >= 5 ? 5 : repos.length;
  for (let i = 0; i < reposLength; i++) {
    firstFiveRepos.push(repos[i]);
  }
  const suggestsElem = document.getElementById("suggests");
  suggestsElem.innerHTML = "";
  firstFiveRepos.forEach((item) => {
    suggestsElem.insertAdjacentHTML("beforeend", getFoundedRepoHtml(item));
  });
}
function showError(error = "") {
  document.getElementById("error").innerText = error;
}
function hideSuggests() {
  const suggestsElem = document.getElementById("suggests");
  suggestsElem.innerHTML = "";
}
function inputEventHandler(query = "") {
  if (query) {
    getRepositories(query).then((resp) =>
      resp.items ? updateRepos(resp?.items) : showError(resp?.message),
    );
  } else {
    hideSuggests();
    showError("");
  }
}
function deleteRepoFromList(event = {}) {
  event.target?.closest(".added-repo").remove();
}
function addRepoToList(element = {}) {
  const addedReposElem = document.getElementById("addedRepos");
  const elementDataList = element.dataset;
  const itemObj = {
    name: elementDataList.name,
    login: elementDataList.login,
    stars: elementDataList.stars,
  };
  addedReposElem.insertAdjacentHTML("beforeend", getAddedRepoHtml(itemObj));
}
document.getElementById("search").addEventListener("input", (event) => {
  const query = event.target.value;
  debounce(
    (function () {
      inputEventHandler(query);
    })(),
    500,
  );
});
document.getElementById("suggests").addEventListener("click", (event) => {
  if (event.target.closest(".suggest")) {
    addRepoToList(event.target.closest(".suggest"));
    document.getElementById("search").value = "";
    hideSuggests();
    showError("");
  }
});
document.getElementById("addedRepos").addEventListener("click", (event) => {
  if (event.target.closest(".added-repo__delete")) {
    deleteRepoFromList(event);
  }
});
