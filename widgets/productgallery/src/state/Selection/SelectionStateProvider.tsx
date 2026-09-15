import React, { type ReactNode, useEffect, useState } from "react";
import {
    initialState, LocalDocumentStateContext
} from "./SelectionState.tsx";
import type { SelectionState } from "./type.ts";
import type {WidgetActivity} from "@reactedge/framework/activity";
import type {GalleryTile} from "../../components/Types.ts";

interface SelectionStateProviderProps {
    children: ReactNode;
    activity?: WidgetActivity
}

const LocalStateProvider = LocalDocumentStateContext.Provider;

export const SelectionStateProvider: React.FC<SelectionStateProviderProps> = ({
      children, activity
  }) => {
    const [selectionState, setSelectionState] =
        useState<SelectionState>(initialState);

    const [selectionLoading, setSelectionLoading] =
        useState(false);

    const [selectionImage, setSelectionImage] =
        useState<GalleryTile>();

    useEffect(() => {
        const handler = (event: Event) => {
            const customEvent = event as CustomEvent<SelectionState>;
            const selection = customEvent.detail;

            activity?.log(
                "product-selection",
                "Product Attribute Changed",
                selection
            );

            setSelectionState(selection);
        };

        window.addEventListener(
            "reactedge:signal",
            handler
        );

        return () => {
            window.removeEventListener(
                "reactedge:signal",
                handler
            );
        };
    }, [activity]);

    return (
        <LocalStateProvider
            value={{
                selection: selectionState,
                selectionLoading,
                setSelectionLoading,
                selectionImage,
                setSelectionImage
            }}
        >
            {children}
        </LocalStateProvider>
    );
};