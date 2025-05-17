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
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
  function updateHistorique() {
	   historiqueTableBody.innerHTML = "";
  let total = 0;

  interventions.forEach((item, index) => {
    const tr = document.createElement("tr");

    // Supprimer
    const tdDel = document.createElement("td");
    tdDel.setAttribute("data-label", "Supprimer");
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

    // Date
    const tdDate = document.createElement("td");
    tdDate.setAttribute("data-label", "Date");
    const dateObj = new Date(item.date);
    tdDate.textContent = dateObj.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
    tr.appendChild(tdDate);

    // Geton
    const tdGeton = document.createElement("td");
    tdGeton.setAttribute("data-label", "Geton");
    tdGeton.textContent = item.geton;
    tr.appendChild(tdGeton);

    // Type
    const tdType = document.createElement("td");
    tdType.setAttribute("data-label", "Type");
    tdType.textContent = item.type.toUpperCase();
    tr.appendChild(tdType);

    // Sous-type
    const tdSousType = document.createElement("td");
    tdSousType.setAttribute("data-label", "Sous-type");
    tdSousType.textContent = item.sousType;
    tr.appendChild(tdSousType);

    // Résultat
    const tdResultat = document.createElement("td");
    tdResultat.setAttribute("data-label", "Résultat");
    tdResultat.textContent = item.resultat.toUpperCase();
    tr.appendChild(tdResultat);

// État Box
const tdEtatBox = document.createElement("td");
tdEtatBox.setAttribute("data-label", "État Box");

let etatBoxText = "";
let etatBoxClass = "";

if (item.resultat === "success") {
  etatBoxText = item.etatBox.trim().toUpperCase();
  const normalized = removeAccents(etatBoxText);  // On enlève les accents

  if (normalized === "OK") {
    etatBoxClass = "etat-ok";
  } else if (normalized === "ETAPE 9") {
    etatBoxClass = "etat-etape9";
  } else {
    etatBoxClass = "etat-unknown";
  }
} else {
  etatBoxText = "NOK";
  etatBoxClass = "etat-nok";
}

tdEtatBox.textContent = etatBoxText;
tdEtatBox.classList.add(etatBoxClass);
tr.appendChild(tdEtatBox);

    // Motif
    const tdMotif = document.createElement("td");
    tdMotif.setAttribute("data-label", "Motif");
    if (item.resultat === "echec") {
      tdMotif.textContent = item.motif || "--";
    } else {
      tdMotif.textContent = "--";
    }
    tr.appendChild(tdMotif);

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
    motifInput.style.display = "none";
  });

  updateHistorique();
});
