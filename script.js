
// Helper: fetch and parse a JSON file
function loadJSON(path) {
  return fetch(path).then(res => res.json());
}

// Global state
let models = [];
let modelCards = [];
let filteredModels = [];
let start = 0;
const batchSize = 30;

const db = firebase.firestore();

async function fetchModelsFromFirestore() {
  const snapshot = await db.collection("models").get();
  return snapshot.docs.map(doc => doc.data());
}

fetchModelsFromFirestore().then(modelList => {
  models = modelList;

  models.sort((a, b) => a.name.localeCompare(b.name));

  const search = document.getElementById("search");
  const filters = document.querySelectorAll(".filter-button");

  let activeAgency = "all";

  applyFilters();
  resetAndRender();

  search.addEventListener("input", () => {
    applyFilters();
    resetAndRender();
  });

  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      activeAgency = button.dataset.agency.toLowerCase();
      applyFilters();
      resetAndRender();
    });
  });

  window.addEventListener("scroll", () => {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (scrollBottom && start < filteredModels.length) {
      renderBatch();
    }
  });

  function applyFilters() {
    const query = search.value.trim().toLowerCase();
    filteredModels = models.filter(model => {
      const nameMatch = model.name.toLowerCase().includes(query);
      const agencyMatch = activeAgency === "all" || model.agency.toLowerCase() === activeAgency;
      return nameMatch && agencyMatch;
    });
  }

  function resetAndRender() {
    document.getElementById("gallery").innerHTML = "";
    modelCards = [];
    start = 0;
    renderBatch();
  }
});

function renderBatch() {
  const gallery = document.getElementById("gallery");
  const end = Math.min(start + batchSize, filteredModels.length);
  for (let i = start; i < end; i++) {
    const model = filteredModels[i];
    const card = document.createElement("div");
    card.className = "model-card";

    const imageList = model.sample_images.split(";");
    let currentIndex = 0;

    const thumbWrapper = document.createElement("div");
    thumbWrapper.className = "thumb-wrapper";

    const thumb = document.createElement("img");
    thumb.className = "thumb";
    thumb.src = imageList[currentIndex];

    thumbWrapper.appendChild(thumb);
    card.appendChild(thumbWrapper);

    const infoBlock = document.createElement("div");
    infoBlock.className = "info-block";

    const name = document.createElement("a");
    name.className = "name";
    name.href = model.profile_url;
    name.target = "_blank";
    name.rel = "noopener noreferrer";
    name.textContent = model.name.toUpperCase();

    const agency = document.createElement("div");
    agency.className = "agency";
    agency.textContent = model.agency;

    infoBlock.appendChild(name);
    infoBlock.appendChild(agency);
    card.appendChild(infoBlock);

    card.addEventListener("click", () => {
      currentIndex = (currentIndex + 1) % imageList.length;
      thumb.src = imageList[currentIndex];
    });

    gallery.appendChild(card);

    modelCards.push({
      element: card,
      name: model.name.toLowerCase(),
      agency: model.agency.toLowerCase()
    });
  }

  start = end;
}
