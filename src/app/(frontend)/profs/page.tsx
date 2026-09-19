import { requireProf } from '@/utilities/profAuth'
import { chargerElevesDuProf } from '@/utilities/chargerElevesDuProf'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { ResumeJournee, ListeSeances } from '@/components/organisms/ListesSeances'
import { ListeEleves } from '@/components/organisms/ListeEleves'

export const dynamic = 'force-dynamic'

export default async function ProfsDashboard() {
  const user = await requireProf()
  const payload = await getPayload({ config: configPromise })

  const maintenant = new Date()
  const debutSemaine = new Date(maintenant)
  debutSemaine.setDate(debutSemaine.getDate() - 7)

  const seances = await payload.find({
    collection: 'seances',
    depth: 1,
    limit: 30,
    sort: '-date',
    where: {
      and: [
        { prof: { equals: user.id } },
        { date: { greater_than_equal: debutSemaine.toISOString() } },
      ],
    },
    overrideAccess: false,
    user,
  })

  const eleves = await chargerElevesDuProf(payload, user)

  const aVenir = seances.docs
    .filter((s) => new Date(String(s.date)) >= maintenant)
    .sort((a, b) => new Date(String(a.date)).getTime() - new Date(String(b.date)).getTime())
  const passees = seances.docs.filter((s) => new Date(String(s.date)) < maintenant)

  const aujourdhui = aVenir.filter(
    (s) => new Date(String(s.date)).toDateString() === maintenant.toDateString(),
  )
  const resteSemaine = aVenir.filter(
    (s) => new Date(String(s.date)).toDateString() !== maintenant.toDateString(),
  )

  const versSeance = (s: { id: number | string; date: string; matiere: string; retour?: unknown }) => ({
    id: s.id,
    date: new Date(s.date),
    matiere: s.matiere,
    retourPresent: Boolean(s.retour),
  })

  const retards = [...aujourdhui, ...resteSemaine, ...passees].filter((s) => !s.retour).length

  const aujourdhuiCount = aujourdhui.length
  const semaineCount = aujourdhuiCount + resteSemaine.length

  return (
    <>
      <div className="lpv-cards-grid lpv-cards-grid--4">
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__valeur">{aujourdhuiCount}</span>
          <div className="lpv-stat__libelle">Séance(s) aujourd&rsquo;hui</div>
          {retards > 0 && (
            <div className="lpv-stat__detail" style={{ color: 'var(--lpv-orange)' }}>
              {retards} retour(s) en attente
            </div>
          )}
        </div>
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__valeur">{semaineCount}</span>
          <div className="lpv-stat__libelle">Cette semaine</div>
          {aujourdhuiCount > 0 && (
            <div className="lpv-stat__detail">dont {aujourdhuiCount} aujourd&rsquo;hui</div>
          )}
        </div>
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__valeur">
            {seances.docs.filter((s) => new Date(String(s.date)) < maintenant).length}
          </span>
          <div className="lpv-stat__libelle">Passées récentes</div>
        </div>
        <div className="lpv-card lpv-stat">
          <span className="lpv-stat__valeur">{eleves.length}</span>
          <div className="lpv-stat__libelle">Mes élèves</div>
        </div>
      </div>

      <ResumeJournee seances={aujourdhui.map(versSeance)} />
      <ListeSeances seances={resteSemaine.map(versSeance)} titre="Cette semaine" />
      <ListeSeances seances={passees.map(versSeance)} titre="Passées récentes" />
      <ListeEleves eleves={eleves.map((eleve) => ({
        id: eleve.id,
        prenom: eleve.prenom,
        nom: eleve.nom,
        niveau: eleve.niveau,
        groupe: eleve.groupe,
      }))} />
    </>
  )
}