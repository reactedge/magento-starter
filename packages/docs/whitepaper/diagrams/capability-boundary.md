flowchart TB

    subgraph Capability["CAPABILITY"]
        direction TB

        Entry["index.ts / mount()"]
        Contract["Contract + Schema"]
        Components["React components"]
        State["State / behaviour"]
        CSS["CSS"]
        Tests["Tests"]
    end

    Capability -->|"delegates"| Framework

    subgraph Framework["@reactedge/*"]
        direction TB

        Host["Host abstraction"]
        API["Public API"]
        Bootstrap["Bootstrap mechanics"]
        SSR["SSR"]
        Observability["Observability"]
        Build["Build / deployment primitives"]
    end