import type {OnScrollMode, ResolvedWidget, WidgetLoadMode, WidgetModule} from "./types.ts";
import type { RuntimeWidgetRegistry } from "@reactedge/framework/contracts/runtime/RuntimeWidgetRegistry.ts";
import {buildRuntimeConfig, stripMeta} from "./util.ts";
import {WidgetActivity} from "@reactedge/framework/activity";
import {registerInstance, startObservability} from "./observability";
import type { WidgetGlobalKey} from "./types.ts"

let registryCache: RuntimeWidgetRegistry | null = null;
const activity = new WidgetActivity("runtime");

function getRegistry(): RuntimeWidgetRegistry {
    if (registryCache) {
        return registryCache;
    }

    const el = document.getElementById("reactedge-registry");
    if (!el) {
        throw new Error("Missing registry");
    }

    registryCache = JSON.parse(el.textContent ?? "{}") as RuntimeWidgetRegistry;

    return registryCache;
}

const loaded = new Map<string, WidgetModule>();

async function loadScript(
    name: string
): Promise<WidgetModule> {
    const existing = loaded.get(name);
    if (existing) return existing;

    const widgetRegistry = getRegistry();
    const entry = widgetRegistry[name]

    await new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = entry.src;
        s.type = 'module'
        s.async = true;

        if (entry.integrity) {
            s.integrity = 'sha256-' + entry.integrity;
            s.crossOrigin = 'anonymous';
        }

        s.onload = resolve;
        s.onerror = reject;

        document.head.appendChild(s);
    });

    const mod = await resolveGlobal(name)
    loaded.set(name, mod);

    return mod;
}

function getInstanceKey(el: HTMLElement) {
    const tag = el.tagName.toLowerCase().replace('-widget', '');
    return el.dataset.instance || tag; // fallback on the widget
}

function getResolvedEntry(el: HTMLElement): ResolvedWidget {
    const registry = getRegistry();
    const instanceKey = getInstanceKey(el);

    const tagType = el.tagName.toLowerCase().replace('-widget', '');

    const entry = registry[instanceKey];

    if (!entry) {
        throw new Error(`No config for instance "${instanceKey}"`);
    }

    return {
        type: tagType,
        entry
    };
}

async function resolveGlobal(name: string, retries = 10): Promise<WidgetModule> {
    const key: WidgetGlobalKey = `ReactEdge_${name}`;

    for (let i = 0; i < retries; i++) {
        const mod = window[key];
        if (mod) return mod;
        await new Promise(r => setTimeout(r, 10));
    }

    throw new Error(`Global ${key} not found after load`);
}

function shouldMountWidgets(): boolean {
    const params =
        new URLSearchParams(window.location.search);

    if (params.get('reactedge_mount') === '0') {
        return false;
    }

    return true;
}

type DebugMode =
    | "runtime"
    | "eager"
    | null;

function getDebugMode(): DebugMode {
    const value = new URLSearchParams(window.location.search)
        .get("reactedge_debug");

    switch (value) {
        case "runtime":
        case "eager":
            return value;
        default:
            return null;
    }
}

export async function mountWidget(el: HTMLElement) {
    const { type, entry } = getResolvedEntry(el);

    const mod = await loadScript(type);

    if (mod?.mount) {
        const runtimeConfig = buildRuntimeConfig()

        const debugMode = getDebugMode();

        if (debugMode === 'runtime') {
            activity.group(`Runtime ${type}`, {
                element: el,
                registry: entry,
                contract: entry.contract,
                runtime: runtimeConfig,
                runtimeNode: document.getElementById("reactedge-runtime")
            });
        }

        if (!shouldMountWidgets()) {
            activity.log(entry.widget,
                '[ReactEdge] CSR mount skipped', {
                widget: entry.widget,
                instance: entry.id
            });

            return;
        }

        if (entry.contract !== null) {
            const contract = entry.contract ? stripMeta(entry.contract) : null;
            mod.mount(el, contract, runtimeConfig);
        } else {
            mod.mount(el, null, runtimeConfig);
        }
    }
}

function getWidgetType(el: HTMLElement): string | null {
    const tag = el.tagName.toLowerCase();

    if (!tag.endsWith("-widget")) {
        return null;
    }

    return tag.slice(0, -"-widget".length);
}

export function scheduleWidgets() {
    const widgets = document.querySelectorAll<HTMLElement>('[data-load]');

    const debugMode = getDebugMode();

    widgets.forEach(el => {
        const name = getWidgetType(el)
        if (name === null) {
            return;
        }

        const instance = el.dataset.instance;
        registerInstance(el, {
            widget: name,
            instance: instance ?? name
        });

        const mode = (el.dataset.load as WidgetLoadMode | undefined) ?? "lazy";

        if (debugMode === 'eager' && mode !== 'ssr') {
            mountWidget(el);
            return;
        }

        if (mode === 'ssr') {
            return;
        }

        if (mode === 'critical') {
            try {
                mountWidget(el);
            } catch (e: unknown) {
                if (e instanceof Error) {
                    activity.log('Mount on critical mode', e.message);
                }
            }
            return;
        }

        if (mode === 'eager') {
            onReady(() => {
                try {
                    mountWidget(el);
                } catch (e: unknown) {
                    if (e instanceof Error) {
                        activity.log('Mount onReady event', e.message);
                    }
                }
            });
            return;
        }

        if (isOnScrollMode(mode)) {
            scheduleOnScroll(el, mode);
            return;
        }

        // default: lazy (intersection)
        scheduleOnVisible(el);
    });
}

function scheduleOnVisible(el: HTMLElement) {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                mountWidget(el);
                observer.unobserve(el);
            }
        });
    }, {
        rootMargin: '200px'
    });

    observer.observe(el);
}

function onReady(cb: () => void) {
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
        queueMicrotask(cb);
    } else {
        document.addEventListener('DOMContentLoaded', cb);
    }
}

function scheduleOnScroll(
    el: HTMLElement,
    mode: OnScrollMode
) {
    const match = mode.match(/^on-scroll:(\d+)$/);
    if (!match) return;

    const threshold = Number(match[1]);

    const onScroll = () => {
        if (window.scrollY >= threshold) {
            mountWidget(el);
            window.removeEventListener('scroll', onScroll);
        }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
}

function isOnScrollMode(
    mode: WidgetLoadMode
): mode is OnScrollMode {
    return mode.startsWith("on-scroll:");
}

export function boot() {
    const runtimeConfig = buildRuntimeConfig();

    if (runtimeConfig?.observability) {
        startObservability(runtimeConfig.observability);
    }
    scheduleWidgets();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    queueMicrotask(boot);
}