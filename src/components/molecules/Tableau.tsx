import type { ReactNode } from 'react'

export interface TableauHeadCell {
  texte: string
  format?: 'numerique'
  colspan?: number
}

export interface TableauRowCell {
  texte?: string
  html?: string
  contenu?: React.ReactNode
  format?: 'numerique'
  colspan?: number
  rowspan?: number
}

// Molécule : tableau accessible. Inspiré de GOV.UK Table.
// - Caption (légende) avec tailles s/m/l/xl
// - En-têtes de colonne avec scope="col"
// - premiereCelluleEntete = th scope="row" pour la première cellule de chaque ligne
// - Cellules numériques alignées à droite
export function Tableau({
  caption,
  captionTaille = 'm',
  head,
  rows,
  premiereCelluleEntete = false,
}: {
  caption: string
  captionTaille?: 's' | 'm' | 'l' | 'xl'
  head?: TableauHeadCell[]
  rows: TableauRowCell[][]
  premiereCelluleEntete?: boolean
}) {
  return (
    <table className="lpv-tableau">
      <caption className={`lpv-tableau__legende lpv-tableau__legende--${captionTaille}`}>
        {caption}
      </caption>
      {head && head.length > 0 && (
        <thead className="lpv-tableau__tete">
          <tr className="lpv-tableau__ligne">
            {head.map((cell, index) => (
              <th
                className={`lpv-tableau__entete${cell.format === 'numerique' ? ' lpv-tableau__entete--numerique' : ''}`}
                colSpan={cell.colspan}
                key={index}
                scope="col"
              >
                {cell.texte}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="lpv-tableau__corps">
        {rows.map((row, rowIndex) => (
          <tr className="lpv-tableau__ligne" key={rowIndex}>
            {row.map((cell, cellIndex) => {
              const isHeader = premiereCelluleEntete && cellIndex === 0
              const cellClass = `lpv-tableau__cellule${cell.format === 'numerique' ? ' lpv-tableau__cellule--numerique' : ''}`

              if (isHeader) {
                return (
                  <th
                    className={cellClass}
                    colSpan={cell.colspan}
                    dangerouslySetInnerHTML={cell.html ? { __html: cell.html } : undefined}
                    key={cellIndex}
                    rowSpan={cell.rowspan}
                    scope="row"
                  >
                    {cell.html ? null : cell.texte}
                  </th>
                )
              }

              return (
                <td
                  className={cellClass}
                  colSpan={cell.colspan}
                  dangerouslySetInnerHTML={cell.html ? { __html: cell.html } : undefined}
                  key={cellIndex}
                  rowSpan={cell.rowspan}
                >
                  {cell.contenu ?? (cell.html ? null : cell.texte)}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}