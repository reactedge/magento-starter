import type {GalleryTile, WidgetConfig} from "./Types.ts";
import {ProductTiledGallery} from "./ProductTiledGallery.tsx";
import {ProductGallery} from "./ProductGallery.tsx";
import {useGalleryData} from "../hooks/domain/useGalleryData.tsx";
import {ProductImage} from "./ProductImage.tsx"
import {SpinnerOverlay} from "./global/SpinnerOverlay.tsx";
import {useEffect} from "react";

type Props = {
    config: WidgetConfig;
    bootstrap: GalleryTile[];
    onReady?: () => void;
};

export const ProductGalleryWidget = ({ config, bootstrap, onReady }: Props) => {
    const { galleryData, galleryError, galleryLoading, ready } =
        useGalleryData(config.runtime.sku, bootstrap);

    useEffect(() => {
        if (ready) {
            onReady?.();
        }
    }, [ready, onReady]);

    if (galleryLoading) return <SpinnerOverlay />;
    if (galleryError) return null; // if the connection to Magento fails, we fail silently
    if (!galleryData) return null;

    if (galleryData.length === 1) {
        return (
            <ProductImage image={galleryData[0] as GalleryTile} />
        );
    }

    return (
        <div>
            {config.settings.mode === "tile" ? <ProductTiledGallery
                    tiles={galleryData}
                    maxColumns={config.settings.maxColumns}
                />
                : <ProductGallery tiles={galleryData} />}
        </div>
    );
};

