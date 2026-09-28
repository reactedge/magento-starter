/**
 * Loads, validates, and exposes the widget registry.
 */

import type {BuildWidgetRegistry} from "@reactedge/framework/contracts/buiild/BuildWidgetRegistry.ts";
import {RegistryReader} from "./RegistryReader.ts";
import {RegistryResolver} from "./RegistryResolver.ts";

const registryReader = new RegistryReader();
const registryResolver = new RegistryResolver();

export function loadRegistry(): BuildWidgetRegistry {
    return registryReader.read();
}

export function resolveWidgets(
    selected: string[],
    registry: BuildWidgetRegistry
): string[] {
    return registryResolver.resolveWidgets(
        selected,
        registry
    );
}

export function resolveWidgetEntry(
    name: string,
    registry: BuildWidgetRegistry
) {
    return registryResolver.resolveWidgetEntry(
        name,
        registry
    );
}
