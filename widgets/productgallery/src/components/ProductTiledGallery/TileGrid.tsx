import type {GalleryTile} from "../Types.ts";
import {StandardSpinner} from "../global/StandardSpinner.tsx";
import {useSelectionState} from "../../state/Selection/useSelectionState.tsx";

interface TileGridProps {
    tiles: GalleryTile[];
    maxColumns: number;
    onSelect: (index: number) => void;
}

export const TileGrid = ({ tiles, maxColumns, onSelect }: TileGridProps) => {
    const {selectionLoading} = useSelectionState()

    return (
        <div
            className="product-gallery__tile-grid"
            style={{
                "--gallery-max-columns": maxColumns
            } as React.CSSProperties}
            data-gallery-tiled
        >
            {tiles.map((tile, index) => (
                <button
                    key={index}
                    type="button"
                    className="product-gallery__tile"
                    onClick={() => onSelect(index)}
                >
                    <img
                        src={tile.src}
                        alt={tile.alt}
                        className="product-gallery__tile-image"
                        data-gallery-tile
                    />
                </button>
            ))}
            {selectionLoading && (
                <div className="product-gallery__loader">
                    <StandardSpinner />
                </div>
            )}
        </div>
    );
};