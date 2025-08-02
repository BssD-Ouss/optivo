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
        doc.text(`Nom : ${profil.nom || "N/A"} ${profil.prenom || ""}`, 14, 30);
        doc.text(`Email : ${profil.email || "N/A"}`, 14, 37);
        if (profil.matricule) {
          doc.text(`Matricule : ${profil.matricule}`, 14, 44);
        }

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

        // Gain calculation
        let totalGains = 0;
        interventions.forEach(i => {
          const isSuccess = i.resultat === "success";
          const box = (i.etatBox || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
          const isValidBox = box === "ok" || box === "etape 9" || box === "etape9";

          if (!isSuccess || !isValidBox) return;

          const type = i.type;
          const sousType = (i.sousType || "").toLowerCase();

          if (type === "brassage") return; // 0 €
          if (type === "sav") totalGains += 15;
          else if (type === "plp") totalGains += 20;
          else if (type === "installation" || type === "remplacement") {
            if (sousType === "aerienne" || sousType === "aerosouterrain") totalGains += 50;
            else if (sousType === "souterrain") totalGains += 40;
            else if (sousType === "standard") totalGains += 25;
            else totalGains += 45;
          }
        });

        doc.autoTable({
          startY: 50,
          head: [["Date", "Geton", "Grille", "Type", "Sous-type", "Résultat", "État Box", "Motif", "Note"]],
          body: rows,
          styles: {
            fontSize: 9,
            cellPadding: 2
          },
          headStyles: {
            fillColor: [0, 100, 200]
          }
        });

        const finalY = doc.lastAutoTable.finalY + 10;

        doc.setFontSize(12);
        doc.text(`Nombre total d'interventions : ${interventions.length}`, 14, finalY);
        doc.text(`Gains cumulés : ${totalGains} €`, 14, finalY + 8);

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
