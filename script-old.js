
// Helper: fetch and parse a JSON file
function loadJSON(path) {
  return fetch(path).then(res => res.json());
}

// Load both JSON files and tag each model with its agency
Promise.all([
  loadJSON("/models/chadwick_models.json"),
  loadJSON("/models/chic_models.json"),
  loadJSON("models/viviens_models.json")
]).then(([chadwickModels, chicModels, viviensModels]) => {
  const models = [
    ...chadwickModels.map(m => ({ ...m, agency: "Chadwick" })),
    ...chicModels.map(m => ({ ...m, agency: "Chic" })),
    ...viviensModels.map(m => ({ ...m, agency: "Viviens" }))
  ];

  models.sort((a, b) => a.name.localeCompare(b.name));

  const gallery = document.getElementById("gallery");
  const search = document.getElementById("search");
  const filters = document.querySelectorAll(".filter-button");

  const modelCards = [];

  let start = 0;
  const batchSize = 30;

  function renderBatch() {
    const end = Math.min(start + batchSize, models.length);
    for (let i = start; i < end; i++) {
      const model = models[i];
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

  renderBatch();

  window.addEventListener("scroll", () => {
    const scrollBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 100;
    if (scrollBottom && start < models.length) {
      renderBatch();
      applyFilters();
    }
  });

  search.addEventListener("input", applyFilters);

  let activeAgency = "all";

  filters.forEach(button => {
    button.addEventListener("click", () => {
      filters.forEach(b => b.classList.remove("active"));
      button.classList.add("active");
      activeAgency = button.dataset.agency.toLowerCase();
      applyFilters();
    });
  });

  function applyFilters() {
    const query = search.value.trim().toLowerCase();

    modelCards.forEach(({ element, name, agency }) => {
      const matchesSearch = name.includes(query);
      const matchesAgency = activeAgency === "all" || agency === activeAgency;
      element.style.display = (matchesSearch && matchesAgency) ? "block" : "none";
    });
  }
});
