/* eslint-disable no-console */

import { ReactEdgeRoot } from "@reactedge/filesystem/reactedgeRoot";
import { WidgetStructureValidator } from "./WidgetStructureValidator.ts";

const widget = process.argv[2];

if (!widget) {
    console.error("Widget name is required");
    process.exit(1);
}

const validator = new WidgetStructureValidator(
    ReactEdgeRoot.get(),
);

const result = validator.validate(widget);

console.log(JSON.stringify(result, null, 2));

process.exit(result.valid ? 0 : 1);