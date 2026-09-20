import { useState } from "react";
import {BASE_RADIUS_KM, type ResolvedSellerFinderConfig} from "../../domain/seller.types";
import {getDistanceOptions} from "../../domain/sellerSearch.service.ts";
import {useTranslationState} from "../../state/Translation/useTranslationState.ts";

interface SearchFormProps {
    readonly onSearch: (postcode: string, distanceMiles: number) => void;
    readonly config: ResolvedSellerFinderConfig
}

export function SellerSearchForm({ onSearch, config }: SearchFormProps) {
    const [postcode, setPostcode] = useState("");
    const [distance, setDistance] = useState(BASE_RADIUS_KM[0] as number);
    const {t} = useTranslationState();

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!postcode.trim()) return;
        onSearch(postcode.trim(), distance);
    }

    return (
        <form className="sellerSearchForm" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder={t("Enter postcode")}
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                required
                className="sellerSearchForm__input"
            />

            <select
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                className="sellerSearchForm__select"
            >
                {getDistanceOptions(config.data.country).map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            <button type="submit" className="sellerSearchForm__button">
                {t("Search")}
            </button>
        </form>
    );
}
