# Test user data

This is the **test user data** for the Spring 3 Weaver mockup.

Names, emails, workspace titles, and membership are fictional demo records. They are not real people. **Jane Doe** is kept as the familiar placeholder. **Users Name** is the logged-in steward in the header and sidebar.

Use this file as the roster for meetings, attendance, workspace people, and the workspace switcher. The running demo reads the same lists from `src/data/testdata.ts`.

## Logged-in user

| Initials | Name | Role |
| --- | --- | --- |
| UN | Users Name | Steward (you) |

## People

| Initials | Name | Typical role |
| --- | --- | --- |
| UN | Users Name | Steward (you) |
| JD | Jane Doe | Steward |
| WM | Wren Maple | Steward |
| RO | Remy Oak | Member |
| PN | Pia North | Steward |
| KL | Kit Linden | Member |
| RQ | Robin Quill | Steward |
| NV | Niko Vale | Member |
| MF | Mira Finch | Steward |
| JR | Jules Reed | Steward |
| CD | Casey Drift | Steward |
| BJ | Blair Juniper | Member |
| MM | Morgan Moss | Steward |
| SH | Sage Hollow | Member |
| IW | Ivy Wisp | Member |
| RK | Riley Knot | Member |
| AL | Avery Loch | Member |
| NP | Noel Pike | Member |
| FS | Finley Spar | Member |
| GW | Gray Wren | Member |
| QH | Quinn Heath | Member |
| DF | Dana Frost | Member |
| EP | Ellis Pond | Member |
| HC | Harper Clay | Member |

## Workspaces

Parent circle:

- **Integrated Digital Agency Class Workspace** (`IDA`) at `/organization` — parent of every team workspace below

Child circles:

- **Dev Team** (`DT`) at `/dev`
- **UX Team** (`UX`) at `/` and `/ux` (default home)
- **Branding Team** (`BT`) at `/branding`
- **Marketing Team** (`MT`) at `/marketing`
- **Logistics Team** (`LT`) at `/logistics`

```
Integrated Digital Agency Class Workspace
├── Dev Team
├── UX Team
├── Branding Team
├── Marketing Team
└── Logistics Team
```

## Membership

- **Integrated Digital Agency Class Workspace:** everyone on the people list
- **Dev Team:** Users Name, Jane Doe, Wren Maple, Remy Oak, Kit Linden, Finley Spar, Riley Knot, Ellis Pond
- **UX Team:** Users Name, Jane Doe, Pia North, Robin Quill, Mira Finch, Sage Hollow, Avery Loch, Gray Wren
- **Branding Team:** Users Name, Jules Reed, Ivy Wisp, Avery Loch, Gray Wren, Harper Clay
- **Marketing Team:** Users Name, Casey Drift, Blair Juniper, Noel Pike, Dana Frost, Quinn Heath
- **Logistics Team:** Users Name, Morgan Moss, Niko Vale, Quinn Heath, Ellis Pond, Harper Clay, Blair Juniper

## Default meeting participants

Used on seeded meetings (roles as shown):

- Jane Doe — Facilitator
- Wren Maple — Notetaker
- Remy Oak — Member (meeting conflict + time proposal)
- Pia North — Steward
- Kit Linden — Steward
- Robin Quill — Timekeeper
