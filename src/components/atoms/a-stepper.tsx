export function Stepper({ step = 1, size }: { step?: string | number; size?: string | number }) {
  return (
    <p className="lpv-stepper__step">
      {`Étape ${step}`}
      {size ? ` sur ${size}` : ''}
    </p>
  )
}
