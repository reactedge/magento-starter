import {useContext} from "react";
import {LocalInstanceStateContext} from "./ActivityContext.tsx";
import type {WidgetActivity} from "@reactedge/framework/activity";

export function useActivityContext(): WidgetActivity {
    const context = useContext(LocalInstanceStateContext);
    if (!context) {
        throw new Error("useActivityContext must be used within ActivityContextProvider");
    }
    return context;
}