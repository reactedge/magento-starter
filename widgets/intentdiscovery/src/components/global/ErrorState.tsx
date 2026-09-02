import {useActivityContext} from "../../activity/Context/useActivityContext.ts";
import { useEffect } from 'react';

export function ErrorState({ error }: { error?: unknown }) {
    const activity = useActivityContext();

    useEffect(() => {
        activity.log(
            'intentdiscovery',
            'Intent Discovery Failure',
            error,
            'error'
        );
    }, [activity, error]);

    return <>error</>;
}