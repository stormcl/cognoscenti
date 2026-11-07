import { useState } from 'react'
import type { FormEvent } from 'react'
import FieldHelp from './FieldHelp'
import {
  PROFILE_THEMES,
  PROFILE_TIMEZONES,
  ownDraft,
  saveOwnProfile,
  type Profile,
  type ProfileDraft,
} from '../../data/profiles'

const HELP = {
  name: 'The full name is what other people will see you as when you do things in Weaver. You should include both first and last name, because in Weaver you will be working with many people, some who know you, and some who don\'t. It is better to include a complete name if possible.',
  email:
    'You can associate as many email addresses as you want. Email is only sent to the first email in the list, known as the preferred email address. The other addresses are used only to identify artifacts you created when logged in as that email address. If you need to change the email address that you log in as, add the new address here, but leave the old one in the list. If you used to work in Weaver with an old email address, the history items will be tagged with that old address, so you need to leave that old address in this list so they are associated with you.',
  timeZone:
    'The time zone setting is used when sending email so that you see the right date and time appropriate to your normal location. All dates and times displayed in the browser will be in the timezone of that browser computer. For email, however, we don\'t know what the timezone of the place where the email will be delivered, so you need to set it here.',
  description: 'Describe yourself for others to get to know you.',
  theme: 'Theme is the preference saved on your profile. Default is the only choice for now.',
}

type ProfileEditProps = {
  profile: Profile
  onDone: () => void
  onCancel: () => void
}

function ProfileEdit({ profile, onDone, onCancel }: ProfileEditProps) {
  const [draft, setDraft] = useState<ProfileDraft>(() => ownDraft(profile))

  function setField<K extends keyof ProfileDraft>(key: K, value: ProfileDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveOwnProfile({
      ...draft,
      name: draft.name.trim() || profile.name,
      email: draft.email.trim() || profile.email,
      description: draft.description.trim(),
    })
    onDone()
  }

  return (
    <form className="panel profile-edit" onSubmit={onSubmit}>
      <div className="profile-identity">
        <span className="person-avatar profile-avatar" aria-hidden="true">
          {profile.initials}
        </span>
        <div>
          <h2>Edit profile</h2>
          <p>Changes stay on this screen. They are not sent to a server.</p>
        </div>
      </div>

      <label className="discussion-field">
        <span className="field-label">
          Full name
          <FieldHelp label="full name" text={HELP.name} />
        </span>
        <input value={draft.name} onChange={(event) => setField('name', event.target.value)} required />
      </label>

      <label className="discussion-field">
        <span className="field-label">
          Email
          <FieldHelp label="email" text={HELP.email} />
        </span>
        <input
          type="email"
          value={draft.email}
          onChange={(event) => setField('email', event.target.value)}
          required
        />
      </label>

      <label className="discussion-field">
        <span className="field-label">
          Time zone
          <FieldHelp label="time zone" text={HELP.timeZone} />
        </span>
        <select value={draft.timeZone} onChange={(event) => setField('timeZone', event.target.value)}>
          {PROFILE_TIMEZONES.map((zone) => (
            <option key={zone} value={zone}>
              {zone}
            </option>
          ))}
        </select>
      </label>

      <label className="discussion-field">
        <span className="field-label">
          About
          <FieldHelp label="about" text={HELP.description} />
        </span>
        <textarea
          rows={4}
          value={draft.description}
          onChange={(event) => setField('description', event.target.value)}
        />
      </label>

      <label className="discussion-field">
        <span className="field-label">
          Theme
          <FieldHelp label="theme" text={HELP.theme} />
        </span>
        <select
          value={draft.theme}
          onChange={(event) => setField('theme', event.target.value as ProfileDraft['theme'])}
        >
          {PROFILE_THEMES.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.label}
            </option>
          ))}
        </select>
      </label>

      <div className="profile-actions">
        <button className="button-light" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="button-solid" type="submit">
          Save
        </button>
      </div>
    </form>
  )
}

export default ProfileEdit
