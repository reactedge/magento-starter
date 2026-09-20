import type {SellerWithDistance} from "../../domain/seller.types.ts";

interface SellerResultsTableProps {
    readonly sellers: readonly SellerWithDistance[];
}

export function SellerResultsTable({ sellers }: SellerResultsTableProps) {
    if (sellers.length === 0) {
        return (
            <p className="sellerTable__empty">
                No sellers found within the selected distance.
            </p>
        );
    }

    return (
        <div className="sellerTable">
            <h3 className="sellerTable__title">
                Sellers Found ({sellers.length})
            </h3>

            <table className="sellerTable__table">
                <thead>
                <tr className="sellerTable__headRow">
                    <th className="sellerTable__th">Name</th>
                    <th className="sellerTable__th">Opening Hours</th>
                    <th className="sellerTable__th">Distance</th>
                </tr>
                </thead>

                <tbody>
                {sellers.map(seller => (
                    <tr
                        key={`${seller.lat},${seller.lng}`}
                        className="sellerTable__row"
                    >
                        <td className="sellerTable__td">{seller.name}</td>
                        <td className="sellerTable__td">{seller.hours}</td>
                        <td className="sellerTable__td">
                            {seller.distance?.toFixed(1)} km
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
