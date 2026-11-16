import { THEMES, useThemeChoice } from '../lib/theme'

export function ThemePicker() {
  const [choice, setChoice] = useThemeChoice()
  return (
    <div className="theme-picker" role="group" aria-label="Theme">
      {THEMES.map((t) => (
        <button key={t.id} type="button" aria-label={t.label} title={t.label} aria-pressed={choice === t.id} onClick={() => setChoice(t.id)}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path d={t.icon} />
          </svg>
        </button>
      ))}
    </div>
  )
}
