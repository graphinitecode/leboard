import type { Metadata } from 'next'

import { Table } from '@/components/molecules/m-table'
import type { TableHeadCell, TableRowCell } from '@/components/molecules/m-table'

import { EsquisseA, EsquisseB, EsquisseC } from './EsquisseClient'

export const metadata: Metadata = {
  title: 'Esquisse — sidebar menu | LPV Board',
  robots: { index: false, follow: false },
}

const COMPARAISON_HEAD: TableHeadCell[] = [
  { text: 'Critère' },
  { text: 'A — statu quo' },
  { text: 'B — sidebar + dépliant mobile' },
  { text: 'C — sidebar unique' },
]

const COMPARAISON_ROWS: TableRowCell[][] = [
  [
    { text: 'Orientation permanente (où suis-je ?)' },
    { text: 'Non — il faut ouvrir le menu à chaque navigation' },
    { text: 'Oui sur desktop, non en mobile' },
    { text: 'Oui sur desktop, drawer sinon (replié par défaut en mobile)' },
  ],
  [
    { text: 'Systèmes de nav à maintenir' },
    { text: '1 (dépliant)' },
    { text: '2 (dépliant + sidebar)' },
    { text: '1 (le même markup aux deux tailles)' },
  ],
  [
    { text: 'Sous-items (Bibliothèque › Livres / Prêts)' },
    { text: 'Impossible — catalogue à plat' },
    { text: 'Oui, mais desktop uniquement' },
    { text: 'Oui, partout' },
  ],
  [
    { text: 'Bande hero colorée en tête de page' },
    { text: 'Conservée' },
    { text: 'À arbitrer (entête slim sur la maquette)' },
    { text: 'À arbitrer (entête slim sur la maquette)' },
  ],
  [
    { text: 'Coût d\'implémentation' },
    { text: 'Zéro' },
    { text: 'Modéré (desktop uniquement)' },
    { text: 'Modéré + (overlay, Escape, focus, anim)' },
  ],
  [
    { text: 'Dette à terme' },
    { text: 'Nav saturée quand les modules arrivent' },
    { text: 'Deux chemins de nav qui divergent' },
    { text: 'La plus faible des trois' },
  ],
]

// Page provisoire : comparaison de trois variantes de navigation portails
// sous forme de maquettes interactives (markup jetable, données factices).
// Aucune page réelle n'est modifiée — à supprimer après arbitrage.
export default function EsquisseSidebarPage() {
  return (
    <div className="lpv-container">
      <h1 className="lpv-h1">Esquisse — sidebar menu</h1>
      <p className="lpv-muted">
        Maquettes <strong>provisoires</strong> pour comparer trois variantes de navigation des
        portails (<code>/profs</code>…). Les cadres simulent un viewport via des
        <em> container queries</em> : bascule locale à 41rem (le vrai site bascule son entête à
        48rem). Markup simplifié, données factices ; seuls l&apos;avatar et la bascule de thème
        sont les composants réels. À supprimer après arbitrage.
      </p>

      <p className="lpv-esq-toc">
        Aller à : <a href="#a">A — statu quo</a> · <a href="#b">B — sidebar desktop + dépliant</a> ·{' '}
        <a href="#c">C — sidebar unique</a> · <a href="#comparaison">tableau</a> ·{' '}
        <a href="#arbitrages">arbitrages restants</a>
      </p>

      <section className="lpv-esq-section" id="a">
        <h2 className="lpv-h2">A — Statu quo (menu dépliant actuel)</h2>
        <p className="lpv-muted">
          Ce que vous avez aujourd&apos;hui, pour référence : bande portail + hero, menu dépliant
          en panneau pleine largeur (accordéon en mobile). Cliquer sur Menu dans chaque cadre pour
          le voir en action.
        </p>
        <ul className="lpv-esq-notes">
          <li>Zéro effort — c&apos;est le système existant.</li>
          <li>
            Chaque navigation passe par ouvrir le menu : l&apos;orientation se perd dès qu&apos;on
            va sur une fiche.
          </li>
          <li>Pas de place pour des sous-items (Biblio › Livres / Prêts) sans noyer le catalogue.</li>
        </ul>
        <p className="lpv-esq-frame-label">Grand écran (cadre ≥ 41rem)</p>
        <EsquisseA size="desktop" />
        <p className="lpv-esq-frame-label">Mobile simulé (cadre ≤ 41rem)</p>
        <EsquisseA size="phone" />
      </section>

      <section className="lpv-esq-section" id="b">
        <h2 className="lpv-h2">B — Sidebar persistante desktop + menu dépliant mobile</h2>
        <p className="lpv-muted">
          La sidebar apparaît à partir de 41rem et oriente en permanence ; en dessous, le système
          actuel est conservé tel quel (le cadre « grand écran » bascule tout seul si la fenêtre
          est étroite — vous verrez le menu dépliant reprendre la main).
        </p>
        <ul className="lpv-esq-notes">
          <li>
            Desktop : orientation permanente, place pour les groupes (Bibliothèque repliable) et
            les futurs modules.
          </li>
          <li>Mobile : aucune régression, on reste sur le dépliant actuel existant.</li>
          <li>
            Contrepartie : deux systèmes de nav à maintenir, et leurs items divergeront
            inévitablement (le dépliant est à plat, la sidebar accepte des groupes).
          </li>
        </ul>
        <p className="lpv-esq-frame-label">Grand écran (cadre ≥ 41rem) — sidebar persistante</p>
        <EsquisseB size="desktop" />
        <p className="lpv-esq-frame-label">Mobile simulé (cadre ≤ 41rem) — identique à A</p>
        <EsquisseB size="phone" />
      </section>

      <section className="lpv-esq-section" id="c">
        <h2 className="lpv-h2">C — Sidebar unique (drawer mobile)</h2>
        <p className="lpv-muted">
          Un seul markup : la sidebar est persistante à partir de 41rem et devient un drawer
          off-canvas en dessous (overlay cliquable pour fermer — testez sur le cadre mobile).
        </p>
        <ul className="lpv-esq-notes">
          <li>Un seul système : mêmes items, mêmes groupes, aux deux tailles — dette zéro.</li>
          <li>Le drawer exige le soin a11y habituel : Escape, fermeture clic extérieur, focus.</li>
          <li>
            Entête sans hero (slim) — la bande colorée rétrécit, le contenu gagne de la place.
          </li>
          <li>Coût le plus élevé des trois, mais il s&apos;amortit sur l&apos;ensemble des portails.</li>
        </ul>
        <p className="lpv-esq-frame-label">Grand écran (cadre ≥ 41rem) — sidebar persistante</p>
        <EsquisseC size="desktop" />
        <p className="lpv-esq-frame-label">Mobile simulé (cadre ≤ 41rem) — drawer</p>
        <EsquisseC size="phone" />
      </section>

      <section id="comparaison">
        <h2 className="lpv-h2">Comparatif</h2>
        <Table
          caption="Comparaison des trois variantes de navigation"
          captionSize="l"
          firstColumnHeader
          head={COMPARAISON_HEAD}
          rows={COMPARAISON_ROWS}
        />
      </section>

      <section id="arbitrages">
        <h2 className="lpv-h2">Arbitrages restants (à trancher avant tout code)</h2>
        <dl className="lpv-esq-arbitrages">
          <dt>Choix de variante</dt>
          <dd>
            Mon inclination : C (un seul système), accepté si on accepte de soigner le drawer.
            B convient si vous voulez zéro changement mobile immédiat.
          </dd>
          <dt>Hero de l&apos;entête</dt>
          <dd>
            La maquette B/C part sur un entête « slim » sans hero. Option à explorer : garder le
            hero uniquement sur l&apos;accueil de chaque portail.
          </dd>
          <dt>Breakpoint de bascule</dt>
          <dd>
            41rem dans les cadres (largeur simulée) vs 48rem dans l&apos;entête réelle —
            harmoniser si retenu.
          </dd>
          <dt>Périmètre des portails</dt>
          <dd>
            Pilote conseillé : le portail profs le plus pageux. Parents n&apos;a que 2-3 pages
            — la sidebar y est probablement du sur-shabillage.
          </dd>
          <dt>Source de vérité de la nav</dt>
          <dd>
            Une seule définition d&apos;items par portail (aujourd&apos;hui une liste passée en
            props au layout) ; la sidebar et tout éventuel dépliant mobile consommeraient les
            mêmes données.
          </dd>
          <dt>Ce qui ne change pas</dt>
          <dd>
            Back links des fiches, profil (menu de l&apos;avatar), liens légaux (panel / pied de
            page), pages login.
          </dd>
          <dt>Futurs modules</dt>
          <dd>
            Alertes (badge « à venir » dans la maquette) et Plannings viendront s&apos;ajouter
            comme items — c&apos;est l&apos;argument principal pour la sidebar.
          </dd>
        </dl>
      </section>
    </div>
  )
}