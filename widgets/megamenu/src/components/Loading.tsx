
import {loadingStyle, spinnerStyle} from "./Megamenu/Loading.ts";

export function Loading() {
    return (
        <div style={loadingStyle}>
            <div style={spinnerStyle} />
        </div>
    );
}
