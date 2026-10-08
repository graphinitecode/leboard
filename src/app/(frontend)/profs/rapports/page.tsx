import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

import { Button } from '@/components/atoms'
import { EmptyState, Input, Table } from '@/components/molecules'
import { RailPage } from '@/components/templates'
import { requireProf } from '@/utilities/profAuth'
import { trimestreCourant } from '@/utilities/rapports'

export const dynamic = 'force-dynamic'

export const metadata = { title: 'Rapports — LPV Board' }

// AAAA-MM-JJ en heure locale (valeur d'un input date)
function versInputDate(date: Date): string {
  const mois = String(date.getMonth() + 1).padStart(2, '0')
  const jour = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${mois}-${jour}`
}

function dateValide(valeur?: string): valeur is string {
  return Boolean(valeur && /^\d{4}-\d{2}-\d{2}$/.test(valeur))
}

// Rapports : choix de la période puis de l'élève. Admin : tous les élèves ;
// prof : ses élèves référents et ceux de ses séances (même périmètre que le
// rapport lui-même).
export default async function RapportsPage({
  searchParams,
}: {
  searchParams: Promise<{ debut?: string; fin?: string }>
}) {
  const user = await requireProf()

  if (user.role !== 'admin' && user.role !== 'prof') {
    return (
      <>
        <h1 className="lpv-h1">Rapports</h1>
        <p>Accès réservé aux administrateurs et aux profs de l’association.</p>
        <p>
          <Link className="lpv-link-inline" href="/profs">
            Retour au tableau de bord
          </Link>
        </p>
      </>
    )
  }

  const { debut: debutParam, fin: finParam } = await searchParams
  const trimestre = trimestreCourant()
  const debut = dateValide(debutParam) ? debutParam : versInputDate(trimestre.debut)
  const fin = dateValide(finParam) ? finParam : versInputDate(trimestre.fin)

  const payload = await getPayload({ config: configPromise })

  let where = {}
  if (user.role === 'prof') {
    const seances = await payload.find({
      collection: 'seances',
      depth: 0,
      limit: 0,
      pagination: false,
      where: { prof: { equals: user.id } },
    })
    const idsSeances = [
      ...new Set(
        seances.docs.flatMap((seance) =>
          ((seance.groupe ?? []) as unknown[]).map((g) =>
            typeof g === 'object' && g !== null ? (g as { id: number }).id : (g as number),
          ),
        ),
      ),
    ]
    where = {
      or: [
        { profReferent: { equals: user.id } },
        ...(idsSeances.length > 0 ? [{ id: { in: idsSeances } }] : []),
      ],
    }
  }

  const eleves = await payload.find({
    collection: 'eleves',
    depth: 0,
    limit: 0,
    overrideAccess: true,
    pagination: false,
    sort: 'nom',
    where,
  })

  const periode = new URLSearchParams({ debut, fin }).toString()

  const rail = (
    <div className="lpv-t-dashboard-page__aside-card">
      <h2 className="lpv-t-dashboard-page__aside-card__title">Contenu d’un rapport</h2>
      <ul className="list-disc pl-5 grid gap-2">
        <li>Taux de présence et absences justifiées</li>
        <li>Progressions par compétence</li>
        <li>Retours de séance</li>
        <li>Prêts de livres</li>
      </ul>
      <p>Le rapport s’imprime ou s’enregistre en PDF depuis sa page.</p>
    </div>
  )

  return (
    <RailPage rail={rail}>
      <h1 className="lpv-h1">Rapports élèves</h1>
      <p className="lpv-muted">
        Choisissez une période, puis l’élève dont vous voulez le rapport.
        {user.role === 'admin'
          ? ' En tant qu’administrateur, vous voyez tous les élèves.'
          : ' Vous voyez vos élèves référents et les élèves de vos séances.'}
      </p>

      <form className="lpv-o-rapports__periode" method="get">
        <Input defaultValue={debut} id="rapport-debut" label="Du" name="debut" type="date" />
        <Input defaultValue={fin} id="rapport-fin" label="Au" name="fin" type="date" />
        <Button type="submit" variant="secondary">
          Appliquer
        </Button>
      </form>

      {eleves.docs.length === 0 ? (
        <EmptyState
          description="Aucun élève ne vous est rattaché pour le moment."
          icon="rivet-icons:user-group"
          title="Aucun élève"
          variant="neutral"
        />
      ) : (
        <Table
          caption=""
          head={[{ text: 'Élève' }, { text: 'Niveau' }, { text: 'Rapport' }]}
          rows={eleves.docs.map((eleve) => [
            { text: `${eleve.prenom} ${eleve.nom}` },
            { text: eleve.niveau ?? '—' },
            {
              content: (
                <Link className="lpv-link-inline" href={`/profs/rapports/${eleve.id}?${periode}`}>
                  Voir le rapport
                  <span className="lpv-visually-hidden">
                    {' '}
                    de {eleve.prenom} {eleve.nom}
                  </span>
                </Link>
              ),
            },
          ])}
        />
      )}
    </RailPage>
  )
}
