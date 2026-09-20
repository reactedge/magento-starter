import {SellerMap} from "./SellerListing/Map.tsx";
import {SellerSearchForm} from "./SellerListing/SellerSearch.tsx";
import React, {useMemo, useState} from "react";
import {MapSearch} from "../Model/MapSearch.ts";
import {SellerResultsCards} from "./SellerListing/SellerResultsCards.tsx";
import {SellerSearchService} from "../domain/sellerSearch.service.ts";
import type {ResolvedSellerFinderConfig, SellerWithDistance} from "../domain/seller.types.ts";
import {useTranslationState} from "../state/Translation/useTranslationState.ts";

type Props = {
    config: ResolvedSellerFinderConfig
}

export function WidgetSellerFinder({config}: Props) {
    const mapSearch = React.useMemo(() => new MapSearch(), []);
    const [listedSellers, setListedSellers] = useState(config.data.sellers);
    const [currentCenter, setCurrentCenter] = useState(config.data.defaultCenter);
    const [error, setError] = useState<string | null>(null);
    const sellerSearchService = useMemo(
        () => new SellerSearchService(config.data, mapSearch),
        [mapSearch, config.data]
    );
    const {t} = useTranslationState()

    const handleSearch = async (postcode: string, radius: number) => {
        const result = await sellerSearchService.search(postcode, radius, config.data.country);

        if (!result) {
            setError(t("Postcode not found"));
            return;
        }

        setListedSellers(result.sellers);
        setCurrentCenter(result.center);
    }

    if (error) return <>{error}</>

    return (
        <>
            <SellerSearchForm onSearch={handleSearch} config={config} />
            <SellerMap sellers={listedSellers} currentCenter={currentCenter} config={config} />
            <SellerResultsCards sellers={listedSellers as SellerWithDistance[]} config={config} />
        </>
    );
};
