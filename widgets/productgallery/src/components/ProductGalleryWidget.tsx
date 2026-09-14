import type {GalleryTile, WidgetConfig} from "./Types.ts";
import {ProductTiledGallery} from "./ProductTiledGallery.tsx";
import {ProductGallery} from "./ProductGallery.tsx";
import {useGalleryData} from "../hooks/domain/useGalleryData.tsx";
import {ProductImage} from "./ProductImage.tsx"
import {mergeGalleryData} from "../lib/merge-array.ts";
import { useMemo } from "react";

type Props = {
    config: WidgetConfig;
    bootstrap: GalleryTile[];
};

export const ProductGalleryWidget = ({ config, bootstrap }: Props) => {
    const { galleryData, galleryError } =
        useGalleryData(config.runtime.sku);

    const finalGalleryData = useMemo(
        () => {
            if (galleryData === undefined) {
                return bootstrap;
            }

            return mergeGalleryData(
                bootstrap,
                galleryData
            );
        },
        [bootstrap, galleryData]
    );

    if (galleryError) return null; // if the connection to Magento fails, we fail silently

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

