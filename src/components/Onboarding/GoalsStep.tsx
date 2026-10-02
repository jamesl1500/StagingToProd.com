'use client'

import { startTransition, useActionState, useState, type FormEvent } from 'react'

import { saveGoals, type StepState } from '@/app/(frontend)/onboarding/actions'
import { Button } from '@/components/Button'
import { experienceOptions, goalOptions, limits, type Experience, type Goal } from '@/lib/profile/options'

import styles from './Onboarding.module.scss'

export function GoalsStep({
  next,
  backHref,
  submitLabel,
  defaults,
}: {
  next: string
  backHref: string
  submitLabel: string
  defaults: { experience: Experience | null; goals: Goal[]; goalNote: string }
}) {
  const [state, action, pending] = useActionState<StepState, FormData>(saveGoals, { status: 'idle' })
  const [note, setNote] = useState(defaults.goalNote)
  const [experience, setExperience] = useState<string>(defaults.experience ?? '')
  const [goals, setGoals] = useState<string[]>(defaults.goals)
  const errors = state.fieldErrors ?? {}

  // Submit by hand instead of <form action>: React resets the form after an action,
  // which would wipe the learner's answers when the server sends back a validation error.
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    startTransition(() => action(data))
  }

  return (
    <form onSubmit={submit} className={styles.form} noValidate>
      <input type="hidden" name="next" value={next} />

      <fieldset className={styles.fieldset} aria-describedby={errors.experience ? 'experience-error' : undefined}>
        <legend className={styles.label}>Where are you now?</legend>
        <div className={styles.options}>
          {experienceOptions.map((option, i) => (
            <label key={option.value} className={styles.option}>
              <input
                type="radio"
                name="experience"
                value={option.value}
                checked={experience === option.value}
                onChange={() => setExperience(option.value)}
                className={styles.control}
              />
              <span className={styles.optionIndex}>[{String(i + 1).padStart(2, '0')}]</span>
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionHint}>{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.experience && (
          <p id="experience-error" className={styles.fieldError}>
            {errors.experience}
          </p>
        )}
      </fieldset>

      <fieldset className={styles.fieldset} aria-describedby={errors.goals ? 'goals-error' : undefined}>
        <legend className={styles.label}>What do you want to get out of this? Pick any.</legend>
        <div className={`${styles.options} ${styles.optionsGrid}`}>
          {goalOptions.map((option) => (
            <label key={option.value} className={styles.option}>
              <input
                type="checkbox"
                name="goals"
                value={option.value}
                checked={goals.includes(option.value)}
                onChange={(e) =>
                  setGoals((g) => (e.target.checked ? [...g, option.value] : g.filter((v) => v !== option.value)))
                }
                className={styles.control}
              />
              <span className={styles.check} aria-hidden="true" />
              <span className={styles.optionText}>
                <span className={styles.optionLabel}>{option.label}</span>
                <span className={styles.optionHint}>{option.hint}</span>
              </span>
            </label>
          ))}
        </div>
        {errors.goals && (
          <p id="goals-error" className={styles.fieldError}>
            {errors.goals}
          </p>
        )}
      </fieldset>

      <div className={styles.field}>
        <div className={styles.labelRow}>
          <label htmlFor="goal_note" className={styles.label}>
            In your own words <span className={styles.optional}>optional</span>
          </label>
          <span className={styles.counter} aria-live="polite">
            {note.length}/{limits.goalNote}
          </span>
        </div>
        <textarea
          id="goal_note"
          name="goal_note"
          className={styles.textarea}
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={limits.goalNote}
          placeholder="Get a frontend job by next summer and stop freezing in interviews."
        />
        {errors.goal_note && <p className={styles.fieldError}>{errors.goal_note}</p>}
      </div>

      {state.message && (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      )}

      <div className={styles.actions}>
        <Button href={backHref} variant="ghost">
          &lt;- Back
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  )
}
