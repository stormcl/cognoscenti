import { useId } from 'react'

type FieldHelpProps = {
  label: string
  text: string
}

function FieldHelp({ label, text }: FieldHelpProps) {
  const tipId = useId()

  return (
    <span className="field-help">
      <button
        type="button"
        className="field-help-button"
        aria-label={`About ${label}`}
        aria-describedby={tipId}
      >
        <span aria-hidden="true">?</span>
      </button>
      <span id={tipId} className="field-help-tip" role="tooltip">
        {text}
      </span>
    </span>
  )
}

export default FieldHelp
