import { Tag } from '@/components/atoms'

export interface TaskStatus {
  text: string
  color?: 'green' | 'yellow' | 'orange' | 'red' | 'blue'
}

export interface Task {
  title: string
  href?: string
  hint?: string
  status: TaskStatus | string
}

// Molécule : liste de tâches avec statut. Inspiré de GOV.UK Task list.
// Chaque tâche affiche un titre (lien si href), un hint optionnel, et un statut
// (texte ou Tag). Le statut est lié au titre via aria-describedby pour l'accessibilité.
export function TaskList({
  tasks,
  idPrefix = 'task',
}: {
  tasks: Task[]
  idPrefix?: string
}) {
  return (
    <ul className="lpv-m-task-list">
      {tasks.map((task, index) => {
        const statusId = `${idPrefix}-${index + 1}-status`
        const hintId = task.hint ? `${idPrefix}-${index + 1}-hint` : undefined
        const describedBy = [hintId, statusId].filter(Boolean).join(' ')

        return (
          <li
            className={`lpv-m-task-list__item${task.href ? ' lpv-m-task-list__item--with-link' : ''}`}
            key={`${task.title}-${index}`}
          >
            <div className="lpv-m-task-list__name-and-hint">
              {task.href ? (
                <a
                  aria-describedby={describedBy || undefined}
                  className="lpv-link lpv-m-task-list__link"
                  href={task.href}
                >
                  {task.title}
                </a>
              ) : (
                <span aria-describedby={describedBy || undefined}>{task.title}</span>
              )}
              {task.hint ? (
                <div className="lpv-m-task-list__hint" id={hintId}>
                  {task.hint}
                </div>
              ) : null}
            </div>
            <div className="lpv-m-task-list__status" id={statusId}>
              {typeof task.status === 'string' ? (
                task.status
              ) : (
                <Tag color={task.status.color}>{task.status.text}</Tag>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}