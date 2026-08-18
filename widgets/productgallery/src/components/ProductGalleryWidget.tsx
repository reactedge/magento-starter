import type {GalleryTile, WidgetConfig} from "./Types.ts";
import {ProductTiledGallery} from "./ProductTiledGallery.tsx";
import {ProductGallery} from "./ProductGallery.tsx";
import {SpinnerOverlay} from "./global/SpinnerOverlay.tsx";
import {useGalleryData} from "../hooks/domain/useGalleryData.tsx";
import type {BootstrapData} from "../entrypoints/ssr.tsx";
import {ProductImage} from "./ProductImage.tsx"

type Props = {
    config: WidgetConfig
    bootstrap?: BootstrapData
};

export const ProductGalleryWidget = ({ config, bootstrap }: Props) => {
    const { galleryData, galleryError, galleryLoading } =
        useGalleryData(config.runtime.sku, bootstrap);

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
            {config.settings.mode === "tile" ? <ProductTiledGallery tiles={galleryData} maxColumns={config.settings.maxColumns} /> : <ProductGallery tiles={galleryData} />}
        </div>
    );
};

