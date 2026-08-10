const DEFAULT_TTL = 60 * 60 * 1000;

export class GraphqlCache {
    private readonly ttl: number;

    constructor(ttl: number = DEFAULT_TTL) {
        this.ttl = ttl;
    }

    get<T>(
        key: string,
        ttl: number = this.ttl
    ): T | null {
        if (typeof sessionStorage === "undefined") {
            return null;
        }

        const raw = sessionStorage.getItem(key);

        if (raw === null) {
            return null;
        }

        const cached: CacheEntry<T> = JSON.parse(raw);

        if (Date.now() - cached.timestamp > ttl) {
            return null;
        }

        return cached.data;
    }

    set<T>(
        key: string,
        data: T
    ): void {
        if (typeof sessionStorage === "undefined") {
            return;
        }

        const cached: CacheEntry<T> = {
            data,
            timestamp: Date.now()
        };

        sessionStorage.setItem(
            key,
            JSON.stringify(cached)
        );
    }

    getKey(
        query: string,
        variables: unknown,
        storeCode: string
    ): string {
        return `reactedge:gql:${storeCode}:${btoa(query)}:${JSON.stringify(variables)}`;
    }
}

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}