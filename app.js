document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("interventionForm");
  const getonInput = document.getElementById("geton");
  const typeInput = document.getElementById("type");
  const sousTypeInput = document.getElementById("sousType");
  const resultatInput = document.getElementById("resultat");
  const etatBoxInput = document.getElementById("etatBox");
  const motifInput = document.getElementById("motif");
  const etatBoxContainer = document.getElementById("etatBoxContainer");
  const historiqueList = document.getElementById("historique");
  const totalElement = document.getElementById("total");

  let interventions = JSON.parse(localStorage.getItem("interventions") || "[]");

  function updateHistorique() {
    historiqueList.innerHTML = "";
    let total = 0;

    interventions.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `#${item.geton} - ${item.type.toUpperCase()} (${item.sousType}) - ${item.resultat.toUpperCase()}${item.resultat === "success" ? " - État Box: " + item.etatBox.toUpperCase() : " - Motif: " + item.motif}`;
      
      if (item.resultat === "success") {
        if (item.type === "installation") {
          if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") total += 50;
          else total += 45;
        } else if (item.type === "plp") total += 20;
        else if (item.type === "sav") total += 15;
      }

      historiqueList.appendChild(li);
    });

    totalElement.textContent = `${total}€`;
  }

  function isGetonUnique(geton) {
    return !interventions.some(item => item.geton === geton);
  }

  resultatInput.addEventListener("change", () => {
    const value = resultatInput.value;
    etatBoxContainer.style.display = value === "success" ? "block" : "none";
    motifInput.style.display = value === "echec" ? "block" : "none";
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const geton = getonInput.value.trim();
    const type = typeInput.value;
    const sousType = sousTypeInput.value;
    const resultat = resultatInput.value;
    const etatBox = etatBoxInput.value;
    const motif = motifInput.value.trim();

    if (!isGetonUnique(geton)) {
      alert("Ce geton existe déjà !");
      return;
    }

    const newEntry = {
      geton,
      type,
      sousType,
      resultat,
      etatBox: resultat === "success" ? etatBox : "",
      motif: resultat === "echec" ? motif : "",
      date: new Date().toISOString()
    };

    interventions.push(newEntry);
    localStorage.setItem("interventions", JSON.stringify(interventions));
    updateHistorique();
    form.reset();
    motifInput.style.display = "none";
  });

  updateHistorique();
});
