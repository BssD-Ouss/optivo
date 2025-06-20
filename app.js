document.addEventListener("DOMContentLoaded", () => {

 const profil = JSON.parse(localStorage.getItem("profilTechnicien"));
  
  if (!profil || !profil.nom || !profil.prenom || !profil.email) {
    // Redirige vers la page de profil si des champs sont manquants
    window.location.href = "profile.html";
  } else {
    afficherBadgeProfilOK();
  }	
	
  const form = document.getElementById("interventionForm");
  const getonInput = document.getElementById("geton")
 const grilleInput = document.getElementById("grille");
  const typeInput = document.getElementById("type");
  const sousTypeInput = document.getElementById("sousType");
  const resultatInput = document.getElementById("resultat");
  const etatBoxInput = document.getElementById("etatBox");
  const motifInput = document.getElementById("motif");
  const etatBoxContainer = document.getElementById("etatBoxContainer");
  const historiqueTableBody = document.querySelector("#historique tbody");
  const heureInterventionInput = document.getElementById("heureIntervention");
  const noteInput = document.getElementById("note");


  let interventions = JSON.parse(localStorage.getItem("interventions") || "[]");
  
// Variables pour affichage du total des gains
const gainElement = document.getElementById("stat-total-gain");
const toggleBtn = document.getElementById("toggleGainVisibility");
let isGainVisible = true;
const storedVisibility = localStorage.getItem("gainVisible");
if (storedVisibility !== null) {
  isGainVisible = storedVisibility === "true"; // ⚠️ localStorage retourne tout en string
}
let lastGainValue = "0€";

  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function updateHistorique(filteredList = null) {
  const list = filteredList || interventions;
  historiqueTableBody.innerHTML = "";
  let total = 0;

  list.forEach((item, index) => {
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

    const tdHeure = document.createElement("td");
    tdHeure.setAttribute("data-label", "Heure prévue");
    tdHeure.textContent = item.heureIntervention || "--";
    tdHeure.classList.add("heure-prevue");
    tr.appendChild(tdHeure);

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

    const tdGrille = document.createElement("td");
    tdGrille.setAttribute("data-label", "Grille");
    tdGrille.textContent = item.grille || "--";
    tr.appendChild(tdGrille);

    const tdType = document.createElement("td");
    tdType.setAttribute("data-label", "Type");
    let labelType = item.type;
    if (labelType === "installation") labelType = "INSTALLATION COMPLÈTE";
    else if (labelType === "remplacement") labelType = "REMPLACEMENT/DÉPLACEMENT PRISE";
    else if (labelType === "brassage") labelType = "BRASSAGE AU PM";
    else labelType = labelType.toUpperCase();
    tdType.textContent = labelType;
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
      tdEtatBox.textContent = item.etatBox.toUpperCase();
      tdEtatBox.classList.add("etat-ok");
      const boxState = removeAccents(item.etatBox.trim().toLowerCase());
      const isBoxValide = boxState === "ok" || boxState === "etape 9" || boxState === "etape9";
      if (item.type === "brassage") {
        total += 0;
      }
      else if (item.sousType === "standard" && isBoxValide) {
        if (item.type === "installation" || item.type === "remplacement") total += 25;
        else if (item.type === "plp") total += 20;
        else if (item.type === "sav") total += 15;
      } else {
        if (item.type === "installation" || item.type === "remplacement") {
          if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") total += 50;
          else total += 45;
        } else if (item.type === "plp") total += 20;
        else if (item.type === "sav") total += 15;
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

    const tdNote = document.createElement("td");
    tdNote.setAttribute("data-label", "Note");
    tdNote.textContent = item.note || "--";
    tr.appendChild(tdNote);

    historiqueTableBody.appendChild(tr);
  });

  // Statistiques
  const totalCount = list.length;
  const successCount = list.filter(i => i.resultat === "success").length;
  const echecCount = list.filter(i => i.resultat === "echec").length;

  const successRate = totalCount > 0 ? ((successCount / totalCount) * 100).toFixed(1) : 0;
  const echecRate = totalCount > 0 ? ((echecCount / totalCount) * 100).toFixed(1) : 0;

  document.getElementById("stat-total").textContent = totalCount;
  document.getElementById("stat-success-count").textContent = successCount;
  document.getElementById("stat-success-rate").textContent = `${successRate}%`;
  document.getElementById("stat-echec-count").textContent = echecCount;
  document.getElementById("stat-echec-rate").textContent = `${echecRate}%`;

  lastGainValue = `${total}€`;
  if (isGainVisible) {
    gainElement.textContent = lastGainValue;
    toggleBtn.textContent = "🚫";
  } else {
    gainElement.textContent = "••••";
    toggleBtn.textContent = "✅​";
  }
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
	const heureIntervention = heureInterventionInput.value;
    const geton = getonInput.value.trim();
    const type = typeInput.value;
    const sousType = sousTypeInput.value;
    const resultat = resultatInput.value;
    const etatBox = etatBoxInput.value;
    const motif = motifInput.value.trim();
	const note = noteInput.value.trim();
    const grille = grilleInput.value.trim();


    if (!isGetonUnique(geton)) {
      alert("Ce geton existe déjà !");
      return;
    }

    const newEntry = {
      geton,
      type,
      sousType,
	  note,
	  heureIntervention,
      resultat,
      etatBox: resultat === "success" ? etatBox : "",
      motif: resultat === "echec" ? motif : "",
	  grille,
      date: new Date().toISOString()
    };

    interventions.push(newEntry);
    localStorage.setItem("interventions", JSON.stringify(interventions));
    updateHistorique();
	updatePrevisionsUI();
    form.reset();

    // Remettre l'affichage correct selon la valeur actuelle de resultat
setTimeout(() => {
  handleResultatDisplay(resultatInput.value);
}, 0);
  });

  updateHistorique();
  
  //oeil gains
toggleBtn.addEventListener("click", () => {
  isGainVisible = !isGainVisible;
  localStorage.setItem("gainVisible", isGainVisible); // 🔐 Sauvegarde

  if (isGainVisible) {
    gainElement.textContent = lastGainValue;
    toggleBtn.textContent = "🚫️";
  } else {
    gainElement.textContent = "••••";
    toggleBtn.textContent = "✅​​";
  }
});

  
  // =============== GESTION DES PREVISIONS DU LENDEMAIN =============== //
const previsionForm = document.getElementById("previsionForm");
const previsionGetonInput = document.getElementById("previsionGeton");
const previsionGrilleInput = document.getElementById("previsionGrille");
const previsionHeureInput = document.getElementById("previsionHeure");
const listePrevisions = document.getElementById("listePrevisions");
const btnComparer = document.getElementById("btnComparer");

// Chargement des prévisions depuis localStorage
let previsions = JSON.parse(localStorage.getItem("previsions") || "[]");

// Fonction d'affichage des prévisions
function updatePrevisionsUI() {
  listePrevisions.innerHTML = "";
  if (previsions.length === 0) {
    btnComparer.style.display = "none";
    return;
  }

  previsions.forEach((prevision, index) => {
    const li = document.createElement("li");
	li.textContent = `${prevision.geton} (Grille: ${prevision.grille}, Heure: ${prevision.heure}) `;
    const existe = interventions.some(i => i.geton === prevision.geton);
    const actionBtn = document.createElement("button");

    if (existe) {
      actionBtn.textContent = "✅";
      actionBtn.disabled = true;
      actionBtn.style.cursor = "default";
      actionBtn.title = "Déjà saisi";
      li.style.color = "green";
    } else {
      actionBtn.textContent = "❌";
      actionBtn.title = "Supprimer cette prévision";
      actionBtn.addEventListener("click", () => {
        previsions.splice(index, 1);
        localStorage.setItem("previsions", JSON.stringify(previsions));
        updatePrevisionsUI();
      });
    }

    li.appendChild(actionBtn);
    listePrevisions.appendChild(li);
  });

  btnComparer.style.display = "inline-block";
}


// Ajout d'une prévision
previsionForm.addEventListener("submit", (e) => {
  e.preventDefault();
 const geton = previsionGetonInput.value.trim();
 const grille = previsionGrilleInput.value.trim();
 const heure = previsionHeureInput.value;
if (geton && !previsions.some(p => p.geton === geton)) {
  previsions.push({ geton, grille, heure });
    localStorage.setItem("previsions", JSON.stringify(previsions));
    updatePrevisionsUI();
    previsionForm.reset();
  }
});

// Comparaison avec les interventions saisies
btnComparer.addEventListener("click", () => {
	const nonSaisis = previsions.filter(p =>
  !interventions.some(i => i.geton === p.geton)
);
  if (nonSaisis.length === 0) {
    alert("✅ Toutes les interventions prévues ont été saisies !");
    previsions = [];
    localStorage.removeItem("previsions");
    updatePrevisionsUI();
  } else {
  const details = nonSaisis.map(p => {
  return `➡️ ${p.geton} | Grille: ${p.grille || "--"} | Heure: ${p.heure || "--"}`;
}).join("\n");

alert("⚠️ Il reste des interventions non saisies :\n\n" + details);

  
  }
});

// Vérification automatique à midi
function verifierEtNotifier() {
  const now = new Date();
  const heure = now.getHours();
  const minute = now.getMinutes();

  if (heure === 14 && minute === 15 && previsions.length > 0) {
    const nonSaisis = previsions.filter(p =>
      !interventions.some(i => i.geton === p.geton)
    );

    if (nonSaisis.length > 0) {
      if (Notification.permission === "granted") {
        new Notification("⚠️ Saisie incomplète", {
          body: `Il reste ${nonSaisis.length} intervention(s) non saisie(s) !`,
        });
      }
    }
  }
}

// Lancer un minuteur toutes les 60 secondes pour checker midi
setInterval(verifierEtNotifier, 30000);

// Demander la permission de notification
if ("Notification" in window && Notification.permission !== "granted") {
  Notification.requestPermission();
}

// Mise à jour initiale
updatePrevisionsUI();

// === FILTRE PAR DATE ===
const filterDateInput = document.getElementById("filterDate");
const clearFilterBtn = document.getElementById("clearDateFilter");

filterDateInput.addEventListener("change", () => {
  const selectedDate = filterDateInput.value;
  if (!selectedDate) return updateHistorique(); // rien choisi, on réinitialise

  const filtered = interventions.filter(item => {
    const itemDate = new Date(item.date).toISOString().split("T")[0];
    return itemDate === selectedDate;
  });

  updateHistorique(filtered); // on filtre
});

clearFilterBtn.addEventListener("click", () => {
  filterDateInput.value = "";
  updateHistorique(); // reset
});

// Vérification profile complete ou non 
function afficherBadgeProfilOK() {
  const badge = document.getElementById("profilBadge");
  if (badge) {
    badge.innerHTML = `
      <span style="
        display: inline-flex;
        align-items: center;
        background-color: #e0f7e9;
        color: #2e7d32;
        font-weight: bold;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 13px;
      ">
        ✅ Profil complété
      </span>
    `;
  }
}


});
