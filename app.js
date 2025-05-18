document.addEventListener("DOMContentLoaded", () => {
  // --- Variables et éléments HTML ---
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

  const previsionForm = document.getElementById("previsionForm");
  const previsionInput = document.getElementById("prevision-geton");
  const previsionList = document.getElementById("prevision-list");
  const checkPrevisionsBtn = document.getElementById("checkPrevisions");
  const previsionStatus = document.getElementById("prevision-status");

  // --- Données locales ---
  let interventions = JSON.parse(localStorage.getItem("interventions") || "[]");
  let previsions = JSON.parse(localStorage.getItem("previsions") || "[]");

  function removeAccents(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  // --- Mise à jour de l'historique ---
  function updateHistorique() {
    historiqueTableBody.innerHTML = "";
    let total = 0;

    interventions.forEach((item, index) => {
      const tr = document.createElement("tr");

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

      const dateObj = new Date(item.date);
      tr.innerHTML += `
        <td>${dateObj.toLocaleDateString("fr-FR", {
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit"
        })}</td>
        <td>${item.geton}</td>
        <td>${item.type.toUpperCase()}</td>
        <td>${item.sousType}</td>
        <td>${item.resultat.toUpperCase()}</td>
        <td class="${item.resultat === 'success' && item.etatBox.toLowerCase().includes("9") ? 'etat-etape9' : 'etat-ok'}">${item.resultat === 'success' ? item.etatBox.toUpperCase() : 'NOK'}</td>
        <td>${item.resultat === 'echec' ? (item.motif || "--") : "--"}</td>
      `;
      historiqueTableBody.appendChild(tr);

      // Calcul du total
      if (item.resultat === "success") {
        if (item.type === "installation") {
          total += ["aerienne", "aerosouterrain"].includes(item.sousType) ? 50 : 45;
        } else if (item.type === "plp") total += 20;
        else if (item.type === "sav") total += 15;
      }
    });

    // Statistiques
    const totalCount = interventions.length;
    const successCount = interventions.filter(i => i.resultat === "success").length;
    const echecCount = interventions.filter(i => i.resultat === "echec").length;
    const successRate = totalCount ? ((successCount / totalCount) * 100).toFixed(1) : 0;
    const echecRate = totalCount ? ((echecCount / totalCount) * 100).toFixed(1) : 0;

    document.getElementById("stat-total").textContent = totalCount;
    document.getElementById("stat-success-count").textContent = successCount;
    document.getElementById("stat-success-rate").textContent = `${successRate}%`;
    document.getElementById("stat-echec-count").textContent = echecCount;
    document.getElementById("stat-echec-rate").textContent = `${echecRate}%`;
    document.getElementById("total").textContent = `${total}€`;
  }

  function isGetonUnique(geton) {
    return !interventions.some(item => item.geton === geton);
  }

  // --- Affichage dynamique : succès/échec ---
  function handleResultatDisplay(value) {
    etatBoxContainer.style.display = value === "success" ? "block" : "none";
    motifInput.style.display = value === "echec" ? "block" : "none";
  }

  handleResultatDisplay(resultatInput.value);
  resultatInput.addEventListener("change", () => {
    handleResultatDisplay(resultatInput.value);
  });

  // --- Soumission d'intervention ---
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

    setTimeout(() => handleResultatDisplay(resultatInput.value), 0);
  });

  // --- Prévisions pour demain ---
  function updatePrevisionList() {
    previsionList.innerHTML = "";
    previsions.forEach((geton, idx) => {
      const li = document.createElement("li");
      li.textContent = geton;
      const btn = document.createElement("button");
      btn.textContent = "❌";
      btn.style.marginLeft = "10px";
      btn.onclick = () => {
        previsions.splice(idx, 1);
        localStorage.setItem("previsions", JSON.stringify(previsions));
        updatePrevisionList();
      };
      li.appendChild(btn);
      previsionList.appendChild(li);
    });
  }

  previsionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const geton = previsionInput.value.trim();
    if (geton && !previsions.includes(geton)) {
      previsions.push(geton);
      localStorage.setItem("previsions", JSON.stringify(previsions));
      updatePrevisionList();
      previsionInput.value = "";
    }
  });

  // --- Vérification manuelle des prévisions ---
  function checkPrevisions() {
    const getonsAjoutes = interventions.map(i => i.geton);
    const manquants = previsions.filter(p => !getonsAjoutes.includes(p));

    if (manquants.length === 0 && previsions.length > 0) {
      previsionStatus.textContent = "✅ Toutes les prévisions ont été ajoutées.";
      previsions = [];
      localStorage.removeItem("previsions");
      updatePrevisionList();
    } else if (manquants.length > 0) {
      previsionStatus.textContent = `⚠️ ${manquants.length} intervention(s) prévue(s) non encore saisie(s) !`;
    } else {
      previsionStatus.textContent = "ℹ️ Aucune prévision enregistrée.";
    }
  }

  checkPrevisionsBtn.addEventListener("click", checkPrevisions);

  // --- Notification automatique à midi ---
  function verifierAutoPrevisions() {
    const now = new Date();
    const heure = now.getHours();
    const minute = now.getMinutes();

    if (heure === 12 && minute < 10) {
      const getonsAjoutes = interventions.map(i => i.geton);
      const manquants = previsions.filter(p => !getonsAjoutes.includes(p));
      if (manquants.length > 0) {
        alert(`⚠️ Il vous reste ${manquants.length} intervention(s) prévue(s) non saisie(s) ! Pensez à les ajouter.`);
      }
    }
  }

  // Vérifie à chaque chargement de page
  verifierAutoPrevisions();

  // Lancement initial
  updateHistorique();
  updatePrevisionList();
});
