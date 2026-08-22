import type { McpServer } from '@modelcontextprotocol/server';

export function registerUspResource(server: McpServer) {
    server.registerResource(
        'usp',
        'reactedge://widgets/usp',
        {
            title: 'ReactEdge USP Widget',
            description: 'Documentation for the ReactEdge USP capability',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        id: 'usp',
                        widget: 'usp',

                        description:
                            'Displays a collection of unique selling propositions as a static layout or slider.',

                        exampleContract: {
                            data: {
                                slides: [
                                    {
                                        heading: 'Free Delivery',
                                        text: 'On orders over £50',
                                    },
                                    {
                                        heading: 'Secure Payment',
                                        text: '100% secure checkout',
                                    },
                                    {
                                        text: '30-day returns',
                                    },
                                ],
                            },
                            settings: {
                                mode: {
                                    desktop: 'static',
                                    tablet: 'static',
                                    mobile: 'slider',
                                },
                                theme: 'light',
                            },
                        },

                        signals: {
                            consumes: [],
                            emits: [],
                        },

                        runtime: {
                            rendering: ['client', 'ssr'],
                        },
                    }, null, 2),
                },
            ],
        }),
    );
}