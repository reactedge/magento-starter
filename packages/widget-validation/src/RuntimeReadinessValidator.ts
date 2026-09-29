import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface RuntimeReadinessConfig {
    googleMapsApiKey?: string;
    googlePlaceId?: string;
    cloudflareTurnstileSiteKey?: string;
}

export interface RuntimeRequirementCheck {
    requirement: string;
    passed: boolean;
}

export interface RuntimeReadinessResult {
    store: string;
    instance: string;
    widget?: string;
    check: 'runtime';
    passed: boolean;
    requirements: RuntimeRequirementCheck[];
    error?: string;
}

type DeploymentManifest = {
    widget?: unknown;
};

export class RuntimeReadinessValidator {
    constructor(
        private readonly repositoryRoot: string,
    ) {}

    validate(
        store: string,
        instance: string,
        config: RuntimeReadinessConfig,
    ): RuntimeReadinessResult {
        const manifestPath = resolve(
            this.repositoryRoot,
            'workspace',
            store,
            'manifests',
            `${instance}.json`,
        );

        if (!existsSync(manifestPath)) {
            return {
                store,
                instance,
                check: 'runtime',
                passed: false,
                requirements: [],
                error:
                    `Widget instance "${instance}" is not active in store "${store}".`,
            };
        }

        const manifest = JSON.parse(
            readFileSync(manifestPath, 'utf8'),
        ) as DeploymentManifest;

        const widget = typeof manifest.widget === 'string'
            ? manifest.widget
            : instance;

        const requirements = this.getRequirements(widget, config);
        const failed = requirements.filter(requirement => !requirement.passed);

        return {
            store,
            instance,
            widget,
            check: 'runtime',
            passed: failed.length === 0,
            requirements,
            ...(failed.length > 0 && {
                error:
                    `Widget "${widget}" cannot run in store "${store}" because required runtime configuration is missing: ${failed.map(requirement => requirement.requirement).join(', ')}.`,
            }),
        };
    }

    private getRequirements(
        widget: string,
        config: RuntimeReadinessConfig,
    ): RuntimeRequirementCheck[] {
        if (['storefinder', 'sellerfinder', 'regionmap'].includes(widget)) {
            return [{
                requirement: 'GOOGLE_MAPS_API_KEY',
                passed: Boolean(config.googleMapsApiKey),
            }];
        }

        if (widget === 'googlereviews') {
            return [
                {
                    requirement: 'GOOGLE_MAPS_API_KEY',
                    passed: Boolean(config.googleMapsApiKey),
                },
                {
                    requirement: 'GOOGLE_PLACE_ID',
                    passed: Boolean(config.googlePlaceId),
                },
            ];
        }

        if (widget === 'contactus') {
            return [{
                requirement: 'CLOUDFLARE_TURNSTILE_SITE_KEY',
                passed: Boolean(config.cloudflareTurnstileSiteKey),
            }];
        }

        return [];
    }
}
