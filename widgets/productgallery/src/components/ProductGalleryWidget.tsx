import type {GalleryTile, WidgetConfig} from "./Types.ts";
import {ProductTiledGallery} from "./ProductTiledGallery.tsx";
import {ProductGallery} from "./ProductGallery.tsx";
import {useMagentoSelectionGallery} from "../hooks/domain/useGalleryData.tsx";
import {ProductImage} from "./ProductImage.tsx"
import { useMemo } from "react";
import {useSelectionState} from "../state/Selection/useSelectionState.tsx";

type Props = {
    config: WidgetConfig;
    bootstrap: GalleryTile[];
};

export const ProductGalleryWidget = ({ config, bootstrap }: Props) => {
    useMagentoSelectionGallery(config.runtime.sku);
    const {selectionImage} = useSelectionState()

    const finalGalleryData = useMemo(
        () => [
            ...bootstrap,
            ...(selectionImage ? [selectionImage] : [])
        ],
        [bootstrap, selectionImage]
    );

    if (finalGalleryData.length === 1) {
        return (
            <ProductImage image={finalGalleryData[0] as GalleryTile} />
        );
    }

    return (
        <div>
            {config.settings.mode === "tile" ? <ProductTiledGallery
                    tiles={finalGalleryData}
                    maxColumns={config.settings.maxColumns}
                />
                : <ProductGallery tiles={finalGalleryData} />}
        </div>
    );
};

