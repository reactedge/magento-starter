# Orchestrator refactoring notes

This document records responsibilities and boundaries that should remain visible while `services/orchestrator` is refactored. It is intentionally descriptive rather than a proposed class structure.

## Build

The build has one purpose:

1. build widget artifacts;
2. aggregate the resulting artifact metadata into manifests.

Build should not decide whether a widget is deployed to an environment, nor should it validate the final deployed workspace.

## Deployment

Deployment establishes the environment-specific state of the workspace.

A deployed/active widget instance is represented by a dedicated manifest for that store/environment. The manifest must remain related to the shared registry entry for the instance and to the artifacts produced by the build.

The resulting relationship is:

```text
registry instance
      │
      ↓
store manifest
      │
      ↓
built/deployed artifacts
```

Manifest presence represents deployment state. Registry presence alone does not mean that an instance is deployed.

## Validation

Workspace validation observes the deployed state; it must not rebuild or repair it.

For each deployed instance it should eventually be possible to establish that:

- the store manifest exists;
- the instance resolves through the shared registry;
- the manifest refers to the correct widget/artifact metadata;
- the artifacts declared by the manifest exist in the deployed workspace;
- environment-specific requirements are satisfied.

## Environment semantics

Development and production do not have identical deployment requirements.

One known distinction is artifact integrity metadata:

- development does not require integrity metadata;
- production does require integrity metadata and therefore requires integrity validation.

This distinction should remain explicit during refactoring rather than being hidden inside generic artifact or manifest handling.

## Current refactoring concern

`services/orchestrator` currently contains build, target/widget selection, registry rebuilding, deployment entry points, testing, reporting and SSR worker concerns. Some of these participate in the same workflow but do not necessarily belong to the same responsibility.

The refactoring exercise should first make these responsibilities explicit, then decide which pieces should be grouped or separated. Avoid moving code solely because it currently lives under the same `build` or orchestrator path.

## Working rule

Before moving a piece of orchestrator code, identify which of these questions it answers:

- **Build:** what artifacts can this widget produce?
- **Deployment:** what is deployed to this environment?
- **Validation:** is the deployed state internally consistent?
- **Environment policy:** which requirements apply in this environment?
- **Runtime/SSR:** how is an already-deployed widget executed or rendered?

Code that answers different questions may participate in the same workflow, but should not automatically share the same responsibility.
