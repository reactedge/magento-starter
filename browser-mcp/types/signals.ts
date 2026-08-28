export interface ObservedSignal {
    type: string;
    code?: string;
    value?: string;
}

export interface PdpSignalProbeResult {
    surface: 'pdp';
    signals: ObservedSignal[];
}