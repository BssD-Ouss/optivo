document.addEventListener("DOMContentLoaded", () => {
  const { jsPDF } = window.jspdf;
  const listeBilans = document.getElementById("listeBilans");

  Object.keys(localStorage).forEach(key => {
    if (key.startsWith("interventions_")) {
      const interventions = JSON.parse(localStorage.getItem(key));
      const li = document.createElement("li");
      li.style.marginBottom = "10px";

      const nomBilan = key.replace("interventions_", "").replace("_", " ");
      li.innerHTML = `<strong>${nomBilan.toUpperCase()}</strong> - ${interventions.length} intervention(s)`;

      const btn = document.createElement("button");
      btn.textContent = "📥 Télécharger";
      btn.addEventListener("click", () => {
        const doc = new jsPDF();
        const profil = JSON.parse(localStorage.getItem("profilTechnicien")) || {};

        doc.setFontSize(16);
        doc.text(`Bilan : ${nomBilan.toUpperCase()}`, 14, 20);

        doc.setFontSize(12);
        doc.text(`Nom : ${profil.nom || "N/A"}`, 14, 30);
        doc.text(`Prénom : ${profil.prenom || "N/A"}`, 14, 37);
        doc.text(`Email : ${profil.email || "N/A"}`, 14, 44);

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
            fillColor: [0, 100, 200]
          }
        });

        doc.save(`bilan_${nomBilan}.pdf`);
      });

      li.appendChild(btn);
      listeBilans.appendChild(li);
    }
  });

  if (listeBilans.children.length === 0) {
    listeBilans.innerHTML = "<p>Aucun bilan enregistré.</p>";
  }
});
