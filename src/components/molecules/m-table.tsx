export interface TableHeadCell {
  text: string
  format?: 'numeric'
  colspan?: number
}

export interface TableRowCell {
  text?: string
  html?: string
  content?: React.ReactNode
  format?: 'numeric'
  colspan?: number
  rowspan?: number
}

// Molécule : tableau accessible. Inspiré de GOV.UK Table.
// - Caption avec tailles s/m/l/xl
// - En-têtes de colonne avec scope="col"
// - firstColumnHeader = th scope="row" pour la première cellule de chaque ligne
// - Cellules numériques alignées à droite
export function Table({
  caption,
  captionSize = 'm',
  head,
  rows,
  firstColumnHeader = false,
}: {
  caption: string
  captionSize?: 's' | 'm' | 'l' | 'xl'
  head?: TableHeadCell[]
  rows: TableRowCell[][]
  firstColumnHeader?: boolean
}) {
  return (
    <table className="lpv-m-table">
      <caption className={`lpv-m-table__caption lpv-m-table__caption--${captionSize}`}>
        {caption}
      </caption>
      {head && head.length > 0 && (
        <thead className="lpv-m-table__head">
          <tr className="lpv-m-table__row">
            {head.map((cell, index) => (
              <th
                className={`lpv-m-table__head-cell${cell.format === 'numeric' ? ' lpv-m-table__head-cell--numeric' : ''}`}
                colSpan={cell.colspan}
                key={index}
                scope="col"
              >
                {cell.text}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody className="lpv-m-table__body">
        {rows.map((row, rowIndex) => (
          <tr className="lpv-m-table__row" key={rowIndex}>
            {row.map((cell, cellIndex) => {
              const isHeader = firstColumnHeader && cellIndex === 0
              const cellClass = `lpv-m-table__cell${cell.format === 'numeric' ? ' lpv-m-table__cell--numeric' : ''}`

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
                    {cell.html ? null : cell.text}
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
                  {cell.content ?? (cell.html ? null : cell.text)}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    </table>
  )
}
