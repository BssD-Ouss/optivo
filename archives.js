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
	
	// ➕ Affichage du nombre d’interventions
  const compteur = document.getElementById("compteurInterventions");
  compteur.textContent = `🧾 ${data.length} intervention(s) affichée(s) pour ${selectedKey.replace("interventions_", "").replace("_", " ").toUpperCase()}`;


    tableBody.innerHTML = "";
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
