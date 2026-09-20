import {
    BASE_RADIUS_KM, BASE_RADIUS_MI,
    type DistanceOption,
    type LatLng,
    type Seller,
    type SellerFinderDataConfig,
    type SellerWithDistance
} from "./seller.types";
import type { MapSearch } from "../Model/MapSearch";

const KM_TO_MI = 0.621371;
const MI_TO_KM = 1 / KM_TO_MI; // avoids rounding mismatch

export interface SellerSearchResult {
    readonly sellers: readonly SellerWithDistance[];
    readonly center: LatLng;
}

export class SellerSearchService {
    private readonly dataset: SellerFinderDataConfig;
    private readonly mapSearch: MapSearch;

    constructor(dataset: SellerFinderDataConfig, mapSearch: MapSearch) {
        this.dataset = dataset;
        this.mapSearch = mapSearch;
    }

    async search(
        postcode: string,
        radius: number,
        countryCode: string
    ): Promise<SellerSearchResult | null> {

        const userLocation = await this.mapSearch.geocodePostcode(postcode, countryCode);
        if (!userLocation) return null;

        const unit = countryCode.toLowerCase() === 'gb' ? 'mi' : 'km';

        const maxDistanceKm =
            unit === 'mi'
                ? radius * MI_TO_KM
                : radius;

        const sellers: SellerWithDistance[] = this.dataset.sellers
            .map((seller: Seller) => ({
                ...seller,
                distance: this.mapSearch.calculateDistanceKm(
                    userLocation.lat,
                    userLocation.lng,
                    seller.lat,
                    seller.lng
                )
            }))
            .filter(seller => seller.distance <= maxDistanceKm)
            .sort((a, b) => a.distance - b.distance);

        return {
            sellers,
            center: userLocation
        };
    }
}

export function getDistanceOptions(countryCode: string): DistanceOption[] {
    const isGb = countryCode.toLowerCase() === 'gb';
    const unit = isGb ? 'mi' : 'km';
    const options = isGb ? BASE_RADIUS_MI : BASE_RADIUS_KM;

    return options.map((distance) => ({
        value: distance,
        label: `${distance} ${unit}`
    }));
}

export function getUnitLabel(countryCode: string) {
    const isGb = countryCode.toLowerCase() === 'gb';
    return isGb ? 'miles' : 'km';
}