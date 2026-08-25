import {useState, useEffect} from "react";
import type {GalleryTile} from "../components/Types.ts";

export function useGallery(images: GalleryTile[], selection: string | null) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [zoomed, setZoomed] = useState(false);

    useEffect(() => {
        if (selection === null) return;

        setActiveIndex(images.length - 1);
    }, [images, selection]);

    const previous = () => {
        setActiveIndex((index) =>
            index === 0 ? images.length - 1 : index - 1
        );
    };

    const next = () => {
        setActiveIndex((index) =>
            index === images.length - 1 ? 0 : index + 1
        );
    };

    const select = (index: number) => {
        setActiveIndex(index);
    };

    return {
        activeIndex,
        setActiveIndex,
        zoomed,
        setZoomed,
        previous,
        next,
        select,
        currentImage: images[activeIndex],
    };
}