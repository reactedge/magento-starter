import type {GalleryTile} from "../Types.ts";

interface TileGridProps {
    tiles: GalleryTile[]
    onSelect: (index: number) => void;
}

export const TileGrid = ({ tiles, onSelect }: TileGridProps) => {
    return (
        <div className="product-gallery__tile-grid" data-gallery-tiled>
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
        </div>
    );
};