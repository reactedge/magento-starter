import {useActivityContext} from "../../activity/Context/useActivityContext.ts";
type ErrorStateProps = {
    error: unknown;
};

export const ErrorState = ({ error }: ErrorStateProps) => {
    const message =
        error instanceof Error ? error.message : "Something went wrong";

    const activity = useActivityContext()
    activity.log('intentdiscovery', 'Intent Discovery Failure', message, 'error');

    return <>{message}</>;
}