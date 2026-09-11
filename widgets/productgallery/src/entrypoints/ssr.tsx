import { renderToString } from 'react-dom/server';
import { WIDGET_ID } from "../Config.ts";
import type {GalleryTile, ReactEdgeRuntimeConfig} from "../components/Types.ts";
import { WidgetView } from "../WidgetView.tsx";

export interface BootstrapData {
    galleryData: GalleryTile[]
}

export const renderHtml = (config: unknown, runtime: ReactEdgeRuntimeConfig): string => {
    return renderToString(
        <div data-reactedge-ssr className={`reactedge-${WIDGET_ID}`}>
            <WidgetView contract={config} runtime={runtime} />
        </div>
    );
};

export { loadRuntime } from '../ssr/bootstrap';