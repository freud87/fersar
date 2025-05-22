function sanitizeFileName(name) {
  return name
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Supprime accents
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");              // Remplace caractères spéciaux
}

document.getElementById('addfile').addEventListener('click', () => {
  document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const sanitizedName = sanitizeFileName(file.name);
  const filePath = `uploads/${Date.now()}_${sanitizedName}`;

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

  // Récupérer l'URL publique
  const { data: publicUrlData } = supabase
    .storage
    .from('documents')
    .getPublicUrl(filePath);

  const fileLink = publicUrlData.publicUrl;

  // Mettre à jour le champ `fichier` de la dernière ligne insérée dans `rappels`
  const { data: lastRow, error: selectError } = await supabase
    .from('rappels')
    .select('id')
    .order('id', { ascending: false })
    .limit(1)
    .single();

  if (selectError) {
    alert('Erreur de récupération de la dernière ligne : ' + selectError.message);
    return;
  }

  const { error: updateError } = await supabase
    .from('rappels')
    .update({ fichier: fileLink })
    .eq('id', lastRow.id);

  if (updateError) {
    alert('Erreur enregistrement du lien : ' + updateError.message);
    return;
  }

  // Affichage dans l'interface
  const list = document.querySelector('.filelist');
  const a = document.createElement('a');
  a.href = fileLink;
  a.textContent = sanitizedName;
  a.target = '_blank';
  list.appendChild(a);
  list.appendChild(document.createElement('br'));

  alert('Fichier ajouté avec succès !');
});
