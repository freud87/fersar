document.getElementById('addfile').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const filePath = `uploads/${Date.now()}_${file.name}`; // nom unique

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

  // Récupération de l'URL publique
  const { data: publicUrl } = supabase
    .storage
    .from('documents')
    .getPublicUrl(filePath);

  const fileLink = publicUrl.publicUrl;

  // Insérer le lien dans la table Supabase (ex: dernière ligne ajoutée)
  const { error: updateError } = await supabase
    .from('rappels')
    .update({ fichier: fileLink })
    .order('id', { ascending: false })
    .limit(1);

  if (updateError) {
    alert('Erreur enregistrement du lien : ' + updateError.message);
    return;
  }

  // Affichage du lien dans .filelist
  const list = document.querySelector('.filelist');
  const a = document.createElement('a');
  a.href = fileLink;
  a.textContent = file.name;
  a.target = '_blank';
  list.appendChild(a);
  list.appendChild(document.createElement('br'));

  alert('Fichier ajouté avec succès !');
});
