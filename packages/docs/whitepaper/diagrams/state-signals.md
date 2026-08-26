HOST — authoritative state

User selects colour swatch
             │
             ▼
      Host state changes
             │
       reactedge:signal
             │
             ▼
┌─────────────────────────────┐
│      Product Gallery        │
│                             │
│ Existing UI stays visible   │
└─────────────┬───────────────┘
              │ runtime query
              ▼
         Host GraphQL
              │
              ▼
        Variant gallery
              │
              ▼
       React UI updates