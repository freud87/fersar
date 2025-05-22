// charger les fichiers
async function loadFiles() {
  const listContainer = document.querySelector('.filelist');
  listContainer.innerHTML = '';

  const { data, error } = await supabase.storage
    .from('documents')
    .list('', { limit: 100 });

  if (error) {
    console.error('Erreur lors du chargement des fichiers :', error.message);
    return;
  }

  for (const file of data) {
    const filePath = `uploads/${file.name}`;
    const { data: publicUrlData } = supabase
      .storage
      .from('documents')
      .getPublicUrl(filePath);

    const fileLink = publicUrlData.publicUrl;

    // Nettoyer le nom du fichier : retirer l'horodatage + remplacer _ par espaces
    const cleanName = file.name.replace(/^\d+_/, '').replace(/_/g, ' ');

    const a = document.createElement('a');
    a.href = fileLink;
    a.textContent = cleanName;
    a.target = '_blank';
    a.style.display = 'block';       // lien en ligne séparée
    a.style.margin = '4px 0';        // petit espacement
    a.style.textDecoration = 'none'; // pas de souligné
    a.style.color = '#0077cc';       // couleur personnalisée
    a.onmouseover = () => a.style.textDecoration = 'underline';
    a.onmouseout = () => a.style.textDecoration = 'none';

    listContainer.appendChild(a);
  }
}
//pretify le nom du fichier
function sanitizeFileName(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

document.getElementById('addfile').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const sanitizedName = sanitizeFileName(file.name);
  const filePath = `${Date.now()}_${sanitizedName}`;

  // Upload vers Supabase Storage
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

  // Obtenir l'URL publique
  const { data: publicUrlData } = supabase
    .storage
    .from('documents')
    .getPublicUrl(filePath);

  const fileLink = publicUrlData.publicUrl;

  // Afficher le lien dans la liste
  const list = document.querySelector('.filelist');
  const a = document.createElement('a');
  a.href = fileLink;
  a.textContent = sanitizedName;
  a.target = '_blank';
  list.appendChild(a);
  list.appendChild(document.createElement('br'));

  alert('Fichier ajouté avec succès !');
});
//lors du chargement
window.addEventListener('DOMContentLoaded', () => {
  loadFiles();
});

