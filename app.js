document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("interventionForm");
  const getonInput = document.getElementById("geton");
  const typeInput = document.getElementById("type");
  const sousTypeInput = document.getElementById("sousType");
  const resultatInput = document.getElementById("resultat");
  const etatBoxInput = document.getElementById("etatBox");
  const motifInput = document.getElementById("motif");
  const etatBoxContainer = document.getElementById("etatBoxContainer");
  const historiqueTableBody = document.querySelector("#historique tbody");
  const totalElement = document.getElementById("total");

  let interventions = JSON.parse(localStorage.getItem("interventions") || "[]");

  function updateHistorique() {
	   historiqueTableBody.innerHTML = "";
  let total = 0;

  interventions.forEach((item, index) => {
    const tr = document.createElement("tr");

    // Colonne Supprimer
    const tdDel = document.createElement("td");
    const btnDel = document.createElement("button");
    btnDel.textContent = "🗑️";
    btnDel.title = "Supprimer cette intervention";
    btnDel.style.cursor = "pointer";
    btnDel.addEventListener("click", () => {
      if (confirm(`Supprimer l'intervention ${item.geton} ?`)) {
        interventions.splice(index, 1);
        localStorage.setItem("interventions", JSON.stringify(interventions));
        updateHistorique();
      }
    });
    tdDel.appendChild(btnDel);
    tr.appendChild(tdDel);

    // Colonne Date
    const tdDate = document.createElement("td");
    const dateObj = new Date(item.date);
    tdDate.textContent = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    tr.appendChild(tdDate);

    // Colonne Geton
    const tdGeton = document.createElement("td");
    tdGeton.textContent = item.geton;
    tr.appendChild(tdGeton);

    // Colonne Type
    const tdType = document.createElement("td");
    tdType.textContent = item.type.toUpperCase();
    tr.appendChild(tdType);

    // Colonne Sous-type
    const tdSousType = document.createElement("td");
    tdSousType.textContent = item.sousType;
    tr.appendChild(tdSousType);

    // Colonne Résultat
    const tdResultat = document.createElement("td");
    tdResultat.textContent = item.resultat.toUpperCase();
    tr.appendChild(tdResultat);

    // Colonne État Box / Motif
    const tdEtatMotif = document.createElement("td");
    if (item.resultat === "success") {
      tdEtatMotif.textContent = `État Box: ${item.etatBox.toUpperCase()}`;
    } else {
      tdEtatMotif.textContent = `Motif: ${item.motif}`;
    }
    tr.appendChild(tdEtatMotif);

    historiqueTableBody.appendChild(tr);

    // Calcul total
    if (item.resultat === "success") {
      if (item.type === "installation") {
        if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") total += 50;
        else total += 45;
      } else if (item.type === "plp") total += 20;
      else if (item.type === "sav") total += 15;
    }
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
    etatBoxContainer.style.display = "none";
    motifInput.style.display = "none";
  });

  updateHistorique();
});
