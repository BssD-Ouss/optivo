document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('intervention-form');
  const geton = document.getElementById('geton');
  const type = document.getElementById('type');
  const resultat = document.getElementById('resultat');
  const etatBox = document.getElementById('etatBox');
  const motifEchec = document.getElementById('motifEchec');
  const succesFields = document.getElementById('succes-fields');
  const echecFields = document.getElementById('echec-fields');
  const liste = document.getElementById('liste-interventions');
  const totalGain = document.getElementById('total-gain');

  let interventions = JSON.parse(localStorage.getItem('interventions')) || [];

  const gainMap = {
    installation: 50,
    plp: 20,
    sav: 15
  };

  function updateBilan() {
    liste.innerHTML = '';
    let total = 0;
    interventions.forEach(item => {
      const li = document.createElement('li');
      li.textContent = `${item.date} - ${item.geton} - ${item.type} - ${item.resultat}`;
      liste.appendChild(li);
      if (item.resultat === 'succes') {
        total += gainMap[item.type] || 0;
      }
    });
    totalGain.textContent = `Gain total : ${total}€`;
  }

  resultat.addEventListener('change', () => {
    if (resultat.value === 'succes') {
      succesFields.style.display = 'block';
      echecFields.style.display = 'none';
    } else {
      succesFields.style.display = 'none';
      echecFields.style.display = 'block';
    }
  });

  form.addEventListener('submit', e => {
    e.preventDefault();
    const newItem = {
      geton: geton.value,
      type: type.value,
      resultat: resultat.value,
      etatBox: resultat.value === 'succes' ? etatBox.value : null,
      motifEchec: resultat.value === 'echec' ? motifEchec.value : null,
      date: new Date().toLocaleDateString('fr-FR')
    };
    interventions.push(newItem);
    localStorage.setItem('interventions', JSON.stringify(interventions));
    form.reset();
    succesFields.style.display = 'none';
    echecFields.style.display = 'none';
    updateBilan();
  });

  updateBilan();
});