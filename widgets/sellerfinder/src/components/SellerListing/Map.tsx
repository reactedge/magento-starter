import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useState } from "react";
import type {LatLng, ResolvedSellerFinderConfig, Seller, SellerWithDistance} from "../../domain/seller.types.ts";
import {useTranslationState} from "../../state/Translation/useTranslationState.ts";
import {SellerInfo} from "./Map/SellerInfo.tsx";
import {getUnitLabel} from "../../domain/sellerSearch.service.ts";

interface SellerMapProps {
    readonly sellers: readonly Seller[];
    readonly currentCenter: LatLng;
    readonly config: ResolvedSellerFinderConfig
}

export function SellerMap({ sellers, currentCenter, config }: SellerMapProps) {
    const [selected, setSelected] = useState<SellerWithDistance | null>(null);
    const apiKey = config.integrations.googleMaps?.apiKey
    const {t} = useTranslationState()

    if (apiKey === undefined) return null;

    return (
        <LoadScript googleMapsApiKey={apiKey}>
            <div className="sellerMap">
                <div className="sellerMap__title">
                    {sellers.length <= 1
                        ? t('%1 seller found', sellers.length)
                        : t('%1 sellers found', sellers.length)}
                </div>

                <GoogleMap
                    key={sellers.length}
                    mapContainerStyle={{ width: "100%", height: "400px" }}
                    center={currentCenter}
                    zoom={config.data.zoom}
                >
                    {sellers.map(seller => (
                        <Marker
                            key={`${seller.lat},${seller.lng}`}
                            position={{ lat: seller.lat, lng: seller.lng }}
                            onClick={() => setSelected(seller as SellerWithDistance)}
                        />
                    ))}

                    {selected && (
                        <SellerInfo
                            seller={selected}
                            unitLabel={getUnitLabel(config.data.country)}
                            onClose={() => setSelected(null)}
                        />
                    )}
                </GoogleMap>
            </div>
        </LoadScript>
    );
}
