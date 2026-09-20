import { InfoWindow } from "@react-google-maps/api";
import type {SellerWithDistance} from "../../../domain/seller.types.ts";

interface SellerInfoProps {
    readonly seller: SellerWithDistance;
    readonly unitLabel: string;
    readonly onClose: () => void;
}

export function SellerInfo({
   seller,
   unitLabel,
   onClose,
}: SellerInfoProps) {
    return (
        <InfoWindow
            position={{ lat: seller.lat, lng: seller.lng }}
            onCloseClick={onClose}
        >
            <div className="sellerInfoWindow">
                <h4>{seller.name}</h4>

                <p>{seller.category}</p>

                <p>{seller.description}</p>

                {typeof seller.rating === "number" && (
                    <p>⭐ {seller.rating.toFixed(1)}</p>
                )}

                {typeof seller.distance === "number" && (
                    <p>
                        {seller.distance.toFixed(1)} {unitLabel} away
                    </p>
                )}

                {seller.website && (
                    <p>
                        <a
                            href={seller.website}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Visit website
                        </a>
                    </p>
                )}
            </div>
        </InfoWindow>
    );
}