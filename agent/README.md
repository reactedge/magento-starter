# ReactEdge hello-world agent

A small MCP client with one fixed goal: verify the build and E2E tests of every active widget
in the selected environment. It runs unattended after you start it. This first
version uses a programmed workflow, with no model, API key, or reasoning loop.

## Files

- `index.ts`: stable runner for the MCP connection, tool calls, cleanup, and JSON report.
- `workflow.ts`: the goal-specific discovery and sequential build and test verification.
- `package.json`: standalone dependencies and commands.

The existing MCP server and widget verifier remain responsible for platform work.
The agent is a separate client; MCP Inspector is not needed to run it.

## Prerequisites

Use a working ReactEdge platform checkout with its dependencies installed, Node.js
22 (as configured in `mise.toml`), and `mise` on your PATH. The existing
`mise run widget-build -- <widget>` command must work in that checkout.

Reuse the environment you use with MCP Inspector. The MCP server loads
`mcp/.env.<environment>`; the argument is the environment filename suffix, and
`STORE_CODE` inside that file selects the workspace store. Keep that file local.
The server configuration reads `STORE_CODE`, `SITEURL`, and `ALLOWED_HOSTS`.

Widget discovery reads `workspace/<STORE_CODE>/manifests/*.json`. Verification
also needs `workspace/registry.json`, the widget sources, and their dependencies.
A fresh clone alone does not contain a configured deployment workspace.

## Install and run

From the platform repository root, install the agent's separate dependencies:

```bash
npm install --prefix agent
```

Run using your existing MCP environment name:

```bash
npm --prefix agent start -- default
```

Replace `default` with the suffix of your configured `mcp/.env.<environment>`.
Omitting the argument also selects `default`. The runner starts its own MCP
server subprocess in the repository root and closes it when finished. You do
not need to start Inspector or another server first.

For a JSON file without npm's script banner:

```bash
npm --silent --prefix agent start -- default > build-report.json
```

Tool-call progress and server stderr remain visible in the terminal. The final
JSON report is written to stdout. The subprocess inherits your shell environment.

## Execution flow

1. Connect to `mcp/server.ts` using the MCP stdio transport and selected environment.
2. Call `list_active_widgets` with `{}`.
3. Validate the returned store, count, and widget IDs.
4. For each returned ID, call `verify_active_widget` with
   `{ "instance": "<id>", "check": "build" }`, then with `check: "test"`.
   Both checks run sequentially, including the test check after a failed build.
5. Record the result. Continue to the next check after a failure or tool error.
6. Close the MCP connection and print the report and totals.

A discovery or connection failure prevents the widget loop and produces a report
with a top-level `error`. No widgets is explicitly reported as `NO_ACTIVE_WIDGETS`;
it is not evidence that any build passed.

## Changing the workflow

Edit `workflow.ts` to add or change the MCP actions. `runWorkflow` receives the
`call` function, the mutable `report`, and the existing validation/error helpers.
It records per-instance results in `report.results` and can set `report.store`.
The runner invokes it once after connecting, then handles cleanup and reporting.

The extracted workflow preserves the original action order and error handling.
Its report entries use the existing `Row` contract (`instance`, `status`,
`detail`, and optional `result`). Additional workflows must fit this report
contract to keep the runner unchanged. No workflow registry or framework is
introduced for this first goal.

## What a build check does

The existing `ActiveWidgetVerifier` resolves the active instance through the
workspace registry and runs `mise run widget-build -- <widget>`. It then checks
that `workspace/release/source/<widget>/widget-<widget>.manifest.json` was
regenerated and that its version matches the widget's `package.json`.

This executes real builds and updates generated artifacts. The subsequent test check runs `mise run widget-test -- <widget>` and preserves
the verifier's test counts and available failure output. These commands update
artifacts and can stop widget development servers through the existing test task.
The workflow does not deploy, repair source code, or establish complete storefront health.
Instances that resolve to the same widget are each checked, so that widget can
be built more than once.

The verifier currently limits each build or test command to 15 seconds. The client allows
60 seconds per tool call. A slow build or test can therefore fail at the verifier's
limit before the client's timeout. The runner does not retry failed calls.

## Report and exit status

There are two entries per widget, one for each check. `result.check` identifies
`build` or `test`, including tool errors; `detail` also begins with the check name.
Each entry in `results` contains `instance`, `status`, `detail`, and, when a valid
verification response was received, the full `result` including available logs
and manifest checks.

| Status | Meaning |
| --- | --- |
| `PASS` | The verifier returned `passed: true`. |
| `FAIL` | The verifier returned `passed: false`, including a build or test timeout. |
| `ERROR` | The tool call failed or its response could not be validated. |

`summary` counts check attempts, passes, failures, and check errors. For three
widgets, `summary.checked` is six.
Top-level connection, discovery, and cleanup errors appear separately in `error`.
The overall `outcome` is `PASS`, `FAIL`, `ERROR`, or `NO_ACTIVE_WIDGETS`.

Exit code `0` means every returned widget passed, or discovery returned no widgets.
Exit code `1` means a widget failed/errored or a top-level error occurred. Consumers
requiring at least one build must also inspect `outcome`.

## Validation and troubleshooting

```bash
npm --prefix agent run typecheck
```

The initial runner was typechecked and exercised against a simulated stdio MCP
server for all-pass, failure-followed-by-success, and empty-discovery scenarios.
Real builds must be validated in your configured ReactEdge environment.

- **Unable to load MCP environment:** check the suffix and local environment file.
- **Cannot find `tsx` when starting the server:** install the platform's root
  dependencies; the server starts from the repository root.
- **No active widgets:** check `STORE_CODE` and that the selected workspace has
  deployment manifests. Discovery also returns an empty list if that directory
  does not exist.
- **Missing registry or widget package:** check your local workspace configuration.
- **`mise` not found or build timeout:** resolve the build prerequisite or inspect
  the verifier's timeout; increasing the client timeout alone will not fix it.
