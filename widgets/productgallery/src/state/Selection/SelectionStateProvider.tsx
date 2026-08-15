import React, { type ReactNode, useEffect, useState } from "react";
import {
    initialState,
    SelectionStateContext
} from "./SelectionState.tsx";
import type { SelectionState } from "./type.ts";
import type {WidgetActivity} from "@reactedge/framework/activity";

interface SelectionStateProviderProps {
    children: ReactNode;
    activity?: WidgetActivity
}

const LocalStateProvider = SelectionStateContext.Provider;

export const SelectionStateProvider: React.FC<SelectionStateProviderProps> = ({
      children, activity
  }) => {
    const [selectionState, setSelectionState] =
        useState<SelectionState>(initialState);

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
        <LocalStateProvider value={selectionState}>
            {children}
        </LocalStateProvider>
    );
};