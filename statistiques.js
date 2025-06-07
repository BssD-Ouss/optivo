document.addEventListener("DOMContentLoaded", () => {
  const historique = JSON.parse(localStorage.getItem("historique")) || [];
  const totalInterventions = historique.length;

  const categories = {
    installation: "Installation complète",
    plp: "PLP",
    sav: "SAV",
    brassage: "Brassage au PM",
    remplacement: "Remplacement/Déplacement prise"
  };

  const statsContainer = document.getElementById("statsContainer");

  Object.entries(categories).forEach(([type, label]) => {
    const data = historique.filter(item => item.type === type);
    const total = data.length;

    const successData = data.filter(item =>
      item.resultat === "success" &&
      (item.etatBox?.toLowerCase().includes("ok") || item.etatBox?.toLowerCase().includes("etape9"))
    );

    const echec = total - successData.length;
    const etatOK = successData.filter(item => item.etatBox?.toLowerCase().includes("ok")).length;
    const etape9 = successData.filter(item => item.etatBox?.toLowerCase().includes("etape9")).length;

    // Calcule des gains
    let gain = 0;
    data.forEach(item => {
      if (type === "brassage") return; // gain 0
      if (type === "sav") gain += 15;
      else if (type === "plp") gain += 20;
      else if (type === "installation" || type === "remplacement") {
        if (item.sousType === "aerienne" || item.sousType === "aerosouterrain") gain += 50;
        else gain += 45;
      }
    });

    const percent = totalInterventions ? ((total / totalInterventions) * 100).toFixed(1) : "0";

    const bloc = document.createElement("div");
    bloc.className = "cat-stat";
    bloc.innerHTML = `
      <h2>${label}</h2>
      <p><strong>Total :</strong> ${total} interventions</p>
      <p><strong>Succès :</strong> ${successData.length} (${etatOK} OK + ${etape9} Étape 9)</p>
      <p><strong>Échecs :</strong> ${echec}</p>
      <p><strong>Gain :</strong> ${gain} €</p>
      <p><strong>Part du total :</strong> ${percent}%</p>
    `;
    statsContainer.appendChild(bloc);
  });
});
