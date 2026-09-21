import type { Disponibilite } from '../disponibilite.entity'

export interface IPlanningRepository {
  listMesDisponibilites(): Promise<Disponibilite[]>
  ajouterDisponibilite(command: Disponibilite): Promise<void>
  supprimerDisponibilite(command: Disponibilite): Promise<void>
  modifierDisponibilite(origine: Disponibilite, nouveau: Disponibilite): Promise<void>
}