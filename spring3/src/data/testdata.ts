export type TestUser = {
  initials: string
  name: string
  role: 'steward' | 'member'
  you?: boolean
}

export const TEST_USERS: TestUser[] = [
  { initials: 'UN', name: 'Users Name', role: 'steward', you: true },
  { initials: 'JD', name: 'Jane Doe', role: 'steward' },
  { initials: 'WM', name: 'Wren Maple', role: 'steward' },
  { initials: 'RO', name: 'Remy Oak', role: 'member' },
  { initials: 'PN', name: 'Pia North', role: 'steward' },
  { initials: 'KL', name: 'Kit Linden', role: 'member' },
  { initials: 'RQ', name: 'Robin Quill', role: 'steward' },
  { initials: 'NV', name: 'Niko Vale', role: 'member' },
  { initials: 'MF', name: 'Mira Finch', role: 'steward' },
  { initials: 'JR', name: 'Jules Reed', role: 'steward' },
  { initials: 'CD', name: 'Casey Drift', role: 'steward' },
  { initials: 'BJ', name: 'Blair Juniper', role: 'member' },
  { initials: 'MM', name: 'Morgan Moss', role: 'steward' },
  { initials: 'SH', name: 'Sage Hollow', role: 'member' },
  { initials: 'IW', name: 'Ivy Wisp', role: 'member' },
  { initials: 'RK', name: 'Riley Knot', role: 'member' },
  { initials: 'AL', name: 'Avery Loch', role: 'member' },
  { initials: 'NP', name: 'Noel Pike', role: 'member' },
  { initials: 'FS', name: 'Finley Spar', role: 'member' },
  { initials: 'GW', name: 'Gray Wren', role: 'member' },
  { initials: 'QH', name: 'Quinn Heath', role: 'member' },
  { initials: 'DF', name: 'Dana Frost', role: 'member' },
  { initials: 'EP', name: 'Ellis Pond', role: 'member' },
  { initials: 'HC', name: 'Harper Clay', role: 'member' },
]

export type CircleId = 'organization' | 'ux' | 'dev' | 'branding' | 'marketing' | 'logistics'

export const WORKSPACE_MEMBERS: Record<CircleId, string[]> = {
  organization: TEST_USERS.map((row) => row.name),
  dev: ['Users Name', 'Jane Doe', 'Wren Maple', 'Remy Oak', 'Kit Linden', 'Finley Spar', 'Riley Knot', 'Ellis Pond'],
  ux: ['Users Name', 'Jane Doe', 'Pia North', 'Robin Quill', 'Mira Finch', 'Sage Hollow', 'Avery Loch', 'Gray Wren'],
  branding: ['Users Name', 'Jules Reed', 'Ivy Wisp', 'Avery Loch', 'Gray Wren', 'Harper Clay'],
  marketing: ['Users Name', 'Casey Drift', 'Blair Juniper', 'Noel Pike', 'Dana Frost', 'Quinn Heath'],
  logistics: ['Users Name', 'Morgan Moss', 'Niko Vale', 'Quinn Heath', 'Ellis Pond', 'Harper Clay', 'Blair Juniper'],
}

export function peopleFor(id: CircleId): TestUser[] {
  const lookup = new Map(TEST_USERS.map((row) => [row.name, row]))
  return WORKSPACE_MEMBERS[id].flatMap((name) => {
    const row = lookup.get(name)
    return row ? [{ ...row }] : []
  })
}

export const TEST_MEETING_PARTICIPANTS = [
  { name: 'Jane Doe', role: 'Facilitator', attended: 'yes' as const, expected: 'yes' as const, note: '', timeProposal: '' },
  { name: 'Wren Maple', role: 'Notetaker', attended: 'yes' as const, expected: 'yes' as const, note: '', timeProposal: '' },
  {
    name: 'Remy Oak',
    role: 'Member',
    attended: 'none' as const,
    expected: 'no' as const,
    note: 'Meeting conflict',
    timeProposal: '10/10/2026 7:30PM EST',
  },
  { name: 'Pia North', role: 'Steward', attended: 'none' as const, expected: 'none' as const, note: '', timeProposal: '' },
  { name: 'Kit Linden', role: 'Steward', attended: 'none' as const, expected: 'none' as const, note: '', timeProposal: '' },
  { name: 'Robin Quill', role: 'Timekeeper', attended: 'yes' as const, expected: 'yes' as const, note: '', timeProposal: '' },
]

export const TEST_ATTENDANCE_PEOPLE = [
  { name: 'Wren Maple', marks: { kickoff: 'present', 'dept-1': 'present', 'dept-2': 'present' } },
  { name: 'Niko Vale', marks: { kickoff: 'present', 'dept-1': 'absent', 'dept-2': 'present' } },
  { name: 'Jane Doe', marks: { kickoff: 'present', 'dept-1': 'present', 'dept-2': 'no-response' } },
  { name: 'Pia North', marks: { kickoff: 'present', 'dept-1': 'not-invited', 'dept-2': 'present' } },
  { name: 'Kit Linden', marks: { kickoff: 'absent', 'dept-1': 'present', 'dept-2': 'present' } },
  { name: 'Robin Quill', marks: { kickoff: 'present', 'dept-1': 'present', 'dept-2': 'present' } },
  { name: 'Mira Finch', marks: { kickoff: 'no-response', 'dept-1': 'present', 'dept-2': 'absent' } },
  { name: 'Jules Reed', marks: { kickoff: 'not-invited', 'dept-1': 'present', 'dept-2': 'present' } },
] as const
