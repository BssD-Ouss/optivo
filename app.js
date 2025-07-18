document.addEventListener("DOMContentLoaded", () => {
  
  // Vérification Profile
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
  /*
//***********************************logique des bilans chaque mois*************************************

// ✅ ARCHIVAGE automatique des interventions du mois précédent
(function archiverMoisPrecedent() {
  const now = new Date();
  const moisActuel = now.getMonth(); // 0 = janvier
  const anneeActuelle = now.getFullYear();

  // Marqueur pour ne pas archiver plusieurs fois
  const cleDernierArchivage = "dernierArchivage";
  const dernierArchivage = localStorage.getItem(cleDernierArchivage);

  // Si déjà archivé ce mois-ci, on ne refait rien
  const cleArchivageCourante = `${moisActuel + 1}_${anneeActuelle}`;
  if (dernierArchivage === cleArchivageCourante) return;

  // Sinon on traite
  const interventionsCourantes = [];
  const interventionsArchivees = [];

  interventions.forEach(i => {
    const dateI = new Date(i.date);
    const moisI = dateI.getMonth();
    const anneeI = dateI.getFullYear();

    if (moisI === moisActuel && anneeI === anneeActuelle) {
      interventionsCourantes.push(i);
    } else if (
      // On archive seulement le mois précédent
      (moisI === (moisActuel === 0 ? 11 : moisActuel - 1)) &&
      (anneeI === (moisActuel === 0 ? anneeActuelle - 1 : anneeActuelle))
    ) {
      interventionsArchivees.push(i);
    } else {
      // Tout ce qui est plus ancien est aussi archivé dans le même lot
      interventionsArchivees.push(i);
    }
  });

  if (interventionsArchivees.length > 0) {
    const moisNom = [
      "janvier", "fevrier", "mars", "avril", "mai", "juin",
      "juillet", "aout", "septembre", "octobre", "novembre", "decembre"
    ];
    const nomCleArchive = `interventions_${moisNom[(moisActuel === 0 ? 11 : moisActuel - 1)]}_${moisActuel === 0 ? anneeActuelle - 1 : anneeActuelle}`;

    localStorage.setItem(nomCleArchive, JSON.stringify(interventionsArchivees));
    localStorage.setItem("interventions", JSON.stringify(interventionsCourantes));
    localStorage.setItem(cleDernierArchivage, cleArchivageCourante);
  }
})();*/
//************************************************************************
  
  
  
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

    const tdgeton = document.createElement("td");
    tdgeton.setAttribute("data-label", "geton");
    tdgeton.textContent = item.geton;
    tr.appendChild(tdgeton);

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
  if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") {
    total += 50;
  } else if (item.sousType === "souterrain") {
    total += 40; // ✅ correction ici
  } else {
    total += 45;
  }
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


  function isgetonUnique(geton) {
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


    if (!isgetonUnique(geton)) {
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
const previsiongetonInput = document.getElementById("previsiongeton");
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
 const geton = previsiongetonInput.value.trim();
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
  const container = document.getElementById("profilHeader");
  // Remplit le bloc profil avec photo et message
  container.innerHTML = `
    <img src="${profil.photo}" alt="Photo de profil" class="mini-photo">
    <span id="greetingText">Bonjour ${profil.prenom}</span>
  `;
}

// Generer le BILAN
document.getElementById("btnGenererBilan").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const profil = JSON.parse(localStorage.getItem("profilTechnicien")) || {};
  const interventions = JSON.parse(localStorage.getItem("interventions")) || [];

  // Infos technicien
  doc.setFontSize(16);
  doc.text("Bilan mensuel du technicien", 14, 20);

  doc.setFontSize(12);
  doc.text(`Nom : ${profil.nom || "N/A"}`, 14, 30);
  doc.text(`Prénom : ${profil.prenom || "N/A"}`, 14, 37);
  doc.text(`Email : ${profil.email || "N/A"}`, 14, 44);
  doc.text(`Matricule : ${profil.matricule || "N/A"}`, 14, 51);

  // Corps des interventions
  const rows = interventions.map(i => [
    i.date || "",
    i.geton || "",
    i.grille || "",
    i.type || "",
    i.sousType || "",
    i.resultat || "",
    i.etatBox || "",
    i.motif || "",
    i.note || ""
  ]);

  doc.autoTable({
    startY: 60,
    head: [["Date", "geton", "Grille", "Type", "Sous-type", "Résultat", "État Box", "Motif", "Note"]],
    body: rows,
    styles: {
      fontSize: 9,
      cellPadding: 2
    },
    headStyles: {
      fillColor: [232, 0, 0]
    }
  });

  // Calcul des totaux
  const totalGain = interventions.reduce((sum, i) => sum + (parseFloat(i.gain) || 0), 0);
  const totalInterventions = interventions.length;

  const totalY = doc.previousAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Nombre total d'interventions : ${totalInterventions}`, 14, totalY);
  doc.text(`Chiffre d'affaires total : ${totalGain.toFixed(2)} €`, 14, totalY + 7);

  // Télécharger
  doc.save("bilan_technicien.pdf");
});


});
