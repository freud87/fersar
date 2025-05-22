// charger les fichiers
async function loadFiles() {
  const listContainer = document.querySelector('.filelist');
  listContainer.innerHTML = ''; // vider avant de remplir
  const { data, error } = await supabase.storage
    .from('documents')
    .list('uploads', { limit: 100 });
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

    const a = document.createElement('a');
    a.href = fileLink;
    a.textContent = file.name;
    a.target = '_blank';
    listContainer.appendChild(a);
    listContainer.appendChild(document.createElement('br'));
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
  const filePath = `uploads/${Date.now()}_${sanitizedName}`;

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

