export type FilterValue =
    | { eq: string | number }
    | { in: (string | number)[] };

export type MagentoProductFilter = Record<string, FilterValue>;