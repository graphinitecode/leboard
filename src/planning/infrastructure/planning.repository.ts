import type { Disponibilite } from '@/planning/domain/disponibilite.entity'
import type { User } from '@/payload-types'
import { getAxiosErrorMessage } from '@/shared/infrastructure/axios-error'
import { httpClient } from '@/shared/infrastructure/http.client'

// Réponse réelle de GET /api/users/me : { user, collection, token, exp }.
// Sans ce wrapper, me.user.id est undefined et le PATCH part vers /users/undefined.
type MeResponse = { user: Pick<User, 'id' | 'disponibilites'> }

type DispoDto = NonNullable<User['disponibilites']>[number]

const mapDispo = (dispo: DispoDto): Disponibilite => ({
  jour: dispo.jour,
  heureDebut: dispo.heureDebut,
  heureFin: dispo.heureFin,
})

export const planningRepository = {
  async listMesDisponibilites(): Promise<Disponibilite[]> {
    try {
      const res = await httpClient.get<MeResponse>('/users/me')
      return (res.data.user?.disponibilites ?? []).map(mapDispo)
    } catch (err) {
      throw new Error(getAxiosErrorMessage(err, 'Impossible de charger vos disponibilités.'))
    }
  },

  async ajouterDisponibilite(command: Disponibilite): Promise<void> {
    await this.mutuerDisponibilites((dispos) => [...dispos, command])
  },

  async supprimerDisponibilite(command: Disponibilite): Promise<void> {
    const trouve = await this.mutuerDisponibilites((dispos) => {
      const index = dispos.findIndex(
        (d) => d.jour === command.jour && d.heureDebut === command.heureDebut && d.heureFin === command.heureFin,
      )
      if (index === -1) throw new Error('Disponibilité introuvable — elle a peut-être déjà été supprimée.')
      return dispos.filter((_, i) => i !== index)
    })
    void trouve
  },

  async modifierDisponibilite(origine: Disponibilite, nouveau: Disponibilite): Promise<void> {
    await this.mutuerDisponibilites((dispos) => {
      const index = dispos.findIndex(
        (d) =>
          d.jour === origine.jour &&
          d.heureDebut === origine.heureDebut &&
          d.heureFin === origine.heureFin,
      )
      if (index === -1) {
        throw new Error('Disponibilité introuvable — elle a peut-être été modifiée entre-temps.')
      }
      return dispos.map((d, i) => (i === index ? nouveau : d))
    })
  },

  async mutuerDisponibilites(
    transformer: (dispos: Disponibilite[]) => Disponibilite[],
  ): Promise<Disponibilite[]> {
    try {
      const me = await httpClient.get<MeResponse>('/users/me')
      if (!me.data.user) throw new Error('Non authentifié.')
      const dispos: Disponibilite[] = (me.data.user.disponibilites ?? []).map(mapDispo)
      const nouvelles = transformer(dispos)
      await httpClient.patch(`/users/${me.data.user.id}`, { disponibilites: nouvelles })
      return nouvelles
    } catch (err) {
      if (err instanceof Error && err.message.includes('introuvable')) throw err
      throw new Error(getAxiosErrorMessage(err, "Échec de l'enregistrement."))
    }
  },
}