/* Écriture CSV pour les exports : séparateur « ; » (Excel en français),
   champs entre guillemets quand il le faut, BOM UTF-8 pour que les accents
   s'affichent correctement à l'ouverture dans Excel. */
export const SEPARATEUR_CSV = ';'
const BOM = '﻿'

function cellule(valeur: unknown): string {
  const texte = valeur === null || valeur === undefined ? '' : String(valeur)
  return /[";\r\n]/.test(texte) ? `"${texte.replace(/"/g, '""')}"` : texte
}

// Lignes (en-tête comprise) → texte CSV, fins de ligne Windows pour Excel
export function versCsv(lignes: unknown[][]): string {
  return BOM + lignes.map((ligne) => ligne.map(cellule).join(SEPARATEUR_CSV)).join('\r\n') + '\r\n'
}

// Nom de fichier daté : « catalogue-2026-10-06.csv »
export function nomFichierCsv(base: string, date = new Date()): string {
  const jour = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return `${base}-${jour}.csv`
}

// Navigateur : propose le téléchargement du fichier
export function telechargerCsv(nomFichier: string, contenu: string): void {
  const url = URL.createObjectURL(new Blob([contenu], { type: 'text/csv;charset=utf-8' }))
  const lien = document.createElement('a')
  lien.href = url
  lien.download = nomFichier
  document.body.append(lien)
  lien.click()
  lien.remove()
  URL.revokeObjectURL(url)
}
