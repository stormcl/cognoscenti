export type TestUser = {
  initials: string
  name: string
  role: 'steward' | 'member'
  you?: boolean
}

export const TEST_USERS: TestUser[] = []

export type CircleId = string

export const WORKSPACE_MEMBERS: Record<string, string[]> = {}

export function peopleFor(id: CircleId): TestUser[] {
  const names = WORKSPACE_MEMBERS[id] ?? []
  const lookup = new Map(TEST_USERS.map((row) => [row.name, row]))
  return names.flatMap((name) => {
    const row = lookup.get(name)
    return row ? [{ ...row }] : []
  })
}

export const TEST_MEETING_PARTICIPANTS: {
  name: string
  role: string
  attended: 'yes' | 'no' | 'none'
  expected: 'yes' | 'no' | 'none'
  note: string
  timeProposal: string
}[] = []

export const TEST_ATTENDANCE_PEOPLE: {
  name: string
  marks: Record<string, string>
}[] = []
