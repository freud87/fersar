// Charger les fichiers
async function loadFiles() {
  const listContainer = document.querySelector('.filelist');
  const viewer = document.querySelector('.fileshow');
  listContainer.innerHTML = '';
  viewer.innerHTML = '';

  const { data, error } = await supabase.storage
    .from('documents')
    .list('', { limit: 100 });

  if (error) {
    console.error('Erreur lors du chargement des fichiers :', error.message);
    return;
  }

  for (const file of data) {
    const filePath = `${file.name}`;
    const { data: publicUrlData } = supabase
      .storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileLink = publicUrlData.publicUrl;

    // Nettoyer le nom du fichier
    const cleanName = file.name.replace(/^\d+_/, '').replace(/_/g, ' ');

    const a = document.createElement('a');
    a.href = '#';
    a.textContent = cleanName;
    a.style.display = 'block';
    a.style.margin = '4px 0';
    a.style.textDecoration = 'none';
    a.style.color = '#0077cc';
    a.onmouseover = () => a.style.textDecoration = 'underline';
    a.onmouseout = () => a.style.textDecoration = 'none';

    // 📄 Lorsqu'on clique sur le lien → affichage dans `.fileshow`
    a.addEventListener('click', (e) => {
      e.preventDefault();
      viewer.innerHTML = ''; // vider avant d’afficher

      if (file.name.toLowerCase().endsWith('.pdf')) {
        const iframe = document.createElement('iframe');
        iframe.src = fileLink;
        iframe.width = '100%';
        iframe.height = '100%';
        iframe.style.border = '1px solid #ccc';
        viewer.appendChild(iframe);
      } else if (/\.(jpe?g|png|gif|webp)$/i.test(file.name)) {
        const img = document.createElement('img');
        img.src = fileLink;
        img.style.maxWidth = '100%';
        img.style.border = '1px solid #ccc';
        viewer.appendChild(img);
      } else {
        const message = document.createElement('p');
        message.textContent = "Fichier non prévisualisable. Cliquez ci-dessous pour télécharger.";
        const downloadLink = document.createElement('a');
        downloadLink.href = fileLink;
        downloadLink.textContent = "Télécharger le fichier";
        downloadLink.target = "_blank";
        viewer.appendChild(message);
        viewer.appendChild(downloadLink);
      }
    });

    listContainer.appendChild(a);
  }
}

// Nettoyer les noms de fichiers
function sanitizeFileName(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

// Déclencher le sélecteur de fichiers
document.getElementById('addfile').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

// Upload de fichier
document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const sanitizedName = sanitizeFileName(file.name);
  const filePath = `${Date.now()}_${sanitizedName}`;

  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    alert('Erreur lors de l’upload : ' + error.message);
    return;
  }

  alert('Fichier ajouté avec succès !');
  loadFiles(); // ⬅️ Recharger la liste avec le nouveau fichier
});

// Charger au démarrage
window.addEventListener('DOMContentLoaded', () => {
  loadFiles();
});
