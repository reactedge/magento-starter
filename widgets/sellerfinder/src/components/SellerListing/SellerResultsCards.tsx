import type {ResolvedSellerFinderConfig, SellerWithDistance} from "../../domain/seller.types.ts";
import {getUnitLabel} from "../../domain/sellerSearch.service.ts";

interface SellerResultsCardsProps {
    readonly sellers: readonly SellerWithDistance[];
    readonly config: ResolvedSellerFinderConfig
}

export function SellerResultsCards({ sellers, config }: SellerResultsCardsProps) {
    if (sellers.length === 0) {
        return (
            <p className="sellerResults__empty">
                No sellers found within the selected distance.
            </p>
        );
    }

    return (
        <div className="sellerResults">
            {sellers.map((seller) => (
                <div
                    key={seller.id}
                    className="sellerCard"
                    data-seller-card
                >
                    <div className="sellerCard__header">
                        <h4 className="sellerCard__title">{seller.name}</h4>
                        <p className="sellerCard__category">{seller.category}</p>
                    </div>

                    <div className="sellerCard__body">
                        <p className="sellerCard__description">
                            {seller.description}
                        </p>

                        {typeof seller.rating === "number" && (
                            <p className="sellerCard__rating">
                                Rating: {seller.rating.toFixed(1)} ★
                            </p>
                        )}

                        {seller.website && (
                            <p className="sellerCard__website">
                                <a
                                    href={seller.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Visit website
                                </a>
                            </p>
                        )}

                        {typeof seller.distance === "number" && Number.isFinite(seller.distance) && (
                            <p className="sellerCard__distance">
                                Distance: {seller.distance.toFixed(1)} {getUnitLabel(config.data.country)}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}
