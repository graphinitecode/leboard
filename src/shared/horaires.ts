/* Plage horaire des cours de l'association : source unique pour la grille du
   calendrier, la création de séance et les disponibilités des profs. */
export const HEURE_DEBUT_COURS = 8
export const HEURE_FIN_COURS = 18

// Bornes au format « HH:mm » des champs de saisie d'heure
export const HEURE_DEBUT_COURS_HHMM = `${String(HEURE_DEBUT_COURS).padStart(2, '0')}:00`
export const HEURE_FIN_COURS_HHMM = `${String(HEURE_FIN_COURS).padStart(2, '0')}:00`

export const MESSAGE_FIN_COURS = `Les cours se terminent au plus tard à ${HEURE_FIN_COURS}h.`
