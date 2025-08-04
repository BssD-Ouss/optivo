document.addEventListener("DOMContentLoaded", () => {
  const moisSelect = document.getElementById("moisSelect");
  const tableBody = document.querySelector("#tableArchives tbody");

  // Chargement des options de mois disponibles
  const archivesKeys = Object.keys(localStorage).filter(key =>
    key.startsWith("interventions_")
  );

  archivesKeys.forEach(key => {
    const option = document.createElement("option");
    const label = key.replace("interventions_", "").replace("_", " ").toUpperCase();
    option.value = key;
    option.textContent = label;
    moisSelect.appendChild(option);
  });

moisSelect.addEventListener("change", () => {
  const selectedKey = moisSelect.value;
  if (!selectedKey) return;

  const data = JSON.parse(localStorage.getItem(selectedKey) || "[]");
  const compteur = document.getElementById("compteurInterventions");
  const totalGainDisplay = document.getElementById("totalGain");
  tableBody.innerHTML = "";

  // Fonction pour supprimer les accents
  const removeAccents = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // Logique des gains personnalisée
  let totalGain = 0;
  data.forEach(item => {
    const resultat = item.resultat;
    const type = item.type;
    const sousType = item.sousType;
    const etatBox = item.etatBox;
    const resultatSuccess = resultat === "success";

    if (resultatSuccess) {
      const boxState = removeAccents((etatBox || "").trim().toLowerCase());
      const isBoxValide = boxState === "ok" || boxState === "etape 9" || boxState === "etape9";

      if (type === "brassage") {
        totalGain += 0;
      } else if (sousType === "standard" && isBoxValide) {
        if (type === "installation" || type === "remplacement") totalGain += 25;
        else if (type === "plp") totalGain += 20;
        else if (type === "sav") totalGain += 15;
      } else {
        if (type === "installation" || type === "remplacement") {
          if (sousType === "aerienne" || sousType === "aerosouterrain") {
            totalGain += 50;
          } else if (sousType === "souterrain") {
            totalGain += 40;
          } else {
            totalGain += 45;
          }
        } else if (type === "plp") totalGain += 20;
        else if (type === "sav") totalGain += 15;
      }
    }
  });

  // Affichage du compteur et des gains
  const moisNom = selectedKey.replace("interventions_", "").replace("_", " ").toUpperCase();
  compteur.textContent = `🧾 ${data.length} intervention(s) affichée(s) pour ${moisNom}`;
  totalGainDisplay.textContent = `💰 Gain total : ${totalGain} €`;

  // Remplir le tableau
  data.forEach(item => {
    const tr = document.createElement("tr");

    const date = new Date(item.date);
    tr.innerHTML = `
      <td>${date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}</td>
      <td>${item.geton || "--"}</td>
      <td>${item.grille || "--"}</td>
      <td>${item.type?.toUpperCase() || "--"}</td>
      <td>${item.sousType || "--"}</td>
      <td>${item.resultat?.toUpperCase() || "--"}</td>
      <td>${item.resultat === "success" ? item.etatBox?.toUpperCase() || "--" : "NOK"}</td>
      <td>${item.resultat === "echec" ? item.motif || "--" : "--"}</td>
      <td>${item.note || "--"}</td>
    `;
    tableBody.appendChild(tr);
  });
});

});
