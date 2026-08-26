Traditional

┌───────────────────────────────────────────────┐
│                 Host application              │
│                                               │
│  Navigation   Gallery   USP   Other UI        │
│      │           │       │       │            │
│      └──────── shared concerns ───┘            │
│                                               │
│  CSS / State / SSR / Build / Deployment       │
└───────────────────────────────────────────────┘

            one application lifecycle


ReactEdge

┌───────────────────────┐
│   Host application    │
│   remains intact      │
└──────────┬────────────┘
│ explicit boundaries
│
┌─────┴────────────────────────────┐
│          ReactEdge               │
│ shared infrastructure            │
│ SSR / Build / Contracts / Host   │
└─────┬─────────┬─────────┬────────┘
│         │         │
┌───┴──┐  ┌───┴──┐  ┌───┴──┐
│ USP  │  │Gallery│  │ ...  │
└──────┘  └───────┘  └──────┘

          independent capability lifecycles