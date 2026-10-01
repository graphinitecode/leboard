import type { ReactNode } from 'react'
import { Icon } from '@/components/atoms'

type Checking = "checked" | "unchecked" | "info" | "warning" | "error" | "success" | "validate"| "alert"
const GetIcon = (checker: Checking ) => {
  if (checker === "checked" || checker === "validate" || checker === "success") return 'rivet-icons:check-circle-solid'
  if (checker === "alert" || checker === "error") return 'rivet-icons:exclamation-mark-circle-solid'
  if (checker === "unchecked") return 'rivet-icons:close-circle-solid';
  if (checker === "info") return 'rivet-icons:info-circle-solid'
  if (checker === "warning") return 'rivet-icons:caution-solid'
  return 'rivet-icons:check'
}

export function ValidateText(
  {
    checker,
    icon,
    children
  } : {
    checker: Checking;
    icon?: string;
    children: ReactNode
  }) {
  return (
    <div className="lpv-m-validate">
      <Icon
        icon={icon ? icon : GetIcon(checker)}
        size={29}
        className={`lpv-m-validate__${checker}`}
      />
      <div className={`lpv-m-validate__${checker}--content`}>{children}</div>
    </div>
  )
}
