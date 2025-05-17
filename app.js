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

      const tdGeton = document.createElement("td");
      tdGeton.setAttribute("data-label", "Geton");
      tdGeton.textContent = item.geton;
      tr.appendChild(tdGeton);

      const tdType = document.createElement("td");
      tdType.setAttribute("data-label", "Type");
      tdType.textContent = item.type.toUpperCase();
      tr.appendChild(tdType);

      const tdSousType = document.createElement("td");
      tdSousType.setAttribute("data-label", "Sous-type");
      tdSousType.textContent = item.sousType;
      tr.appendChild(tdSousType);

      const tdResultat = document.createElement("td");
      tdResultat.setAttribute("data-label", "Résultat");
      tdResultat.textContent = item.resultat.toUpperCase();
      tr.appendChild(tdResultat);

      const tdEtatBox = document.createElement("td");
      tdEtatBox.setAttribute("data-label", "État Box");

      if (item.resultat === "success") {
        const boxStateRaw = item.etatBox.trim();
        const boxState = removeAccents(boxStateRaw.toLowerCase());

        tdEtatBox.textContent = boxStateRaw.toUpperCase();

        if (boxState === "ok") {
          tdEtatBox.classList.add("etat-ok");
        } else if (boxState === "etape 9" || boxState === "etape9") {
          tdEtatBox.classList.add("etat-etape9");
        } else {
          tdEtatBox.classList.add("etat-nok");
        }
      } else {
        tdEtatBox.textContent = "NOK";
        tdEtatBox.classList.add("etat-nok");
      }

      tr.appendChild(tdEtatBox);

      const tdMotif = document.createElement("td");
      tdMotif.setAttribute("data-label", "Motif");
      tdMotif.textContent = item.resultat === "echec" ? (item.motif || "--") : "--";
      tr.appendChild(tdMotif);

      historiqueTableBody.appendChild(tr);

      if (item.resultat === "success") {
        if (item.type === "installation") {
          if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") total += 50;
          else total += 45;
        } else if (item.type === "plp") total += 20;
        else if (item.type === "sav") total += 15;
      }
    });

    //totalElement.textContent = `${total}€`;
	// Statistiques
const totalCount = interventions.length;
const successCount = interventions.filter(i => i.resultat === "success").length;
const echecCount = interventions.filter(i => i.resultat === "echec").length;

const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0;
const echecRate = totalCount > 0 ? ((echecCount / totalCount) * 100).toFixed(1) : 0;

// Mise à jour du dashboard
document.getElementById("stat-total").textContent = totalCount;
document.getElementById("stat-success-count").textContent = successCount;
document.getElementById("stat-success-rate").textContent = `${successRate}%`;
document.getElementById("stat-echec-count").textContent = echecCount;
document.getElementById("stat-echec-rate").textContent = `${echecRate}%`;
document.getElementById("stat-total-gain").textContent = `${total}€`;
  }

  function isGetonUnique(geton) {
    return !interventions.some(item => item.geton === geton);
  }

  // Gère affichage dynamique au changement de sélection
  function handleResultatDisplay(value) {
    etatBoxContainer.style.display = value === "success" ? "block" : "none";
    motifInput.style.display = value === "echec" ? "block" : "none";
  }

  // Initialiser l'affichage selon la valeur par défaut
  handleResultatDisplay(resultatInput.value);

  resultatInput.addEventListener("change", () => {
    handleResultatDisplay(resultatInput.value);
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

    // Remettre l'affichage correct selon la valeur actuelle de resultat
setTimeout(() => {
  handleResultatDisplay(resultatInput.value);
}, 0);
  });

  updateHistorique();
});
