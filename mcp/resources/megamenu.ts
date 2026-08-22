import type { McpServer } from '@modelcontextprotocol/server';

export function registerMegaMenuResource(server: McpServer) {
    server.registerResource(
        'megamenu',
        'reactedge://widgets/megamenu',
        {
            title: 'ReactEdge Mega Menu',
            description: 'Documentation for the ReactEdge Mega Menu capability',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify(
                        {
                            id: 'megamenu',
                            widget: 'megamenu',

                            description:
                                'Displays hierarchical Magento category navigation with configurable presentation and category layouts.',

                            exampleContract: {
                                runtime: {
                                    platform: 'magento',
                                },

                                data: {
                                    items: [
                                        {
                                            id: '3',
                                            label: 'Gear',
                                            url: '/gear.html',
                                            image: null,
                                            children: [
                                                {
                                                    id: '4',
                                                    label: 'Bags',
                                                    url: '/gear/bags.html',
                                                    image: '/media/catalog/category/bag.jpg',
                                                    children: [],
                                                },
                                            ],
                                        },
                                    ],
                                },

                                settings: {
                                    theme: {
                                        dataLocale: 'en-GB',
                                        fontColor: '#333',
                                        primaryColor: '#1979c3',
                                        secondaryColor: '#ff5501',
                                        urlSuffix: '.html',
                                        dropdownLayouts: {
                                            '/gear': 'tiles',
                                        },
                                    },
                                },

                                integration: {
                                    requires: [],
                                },
                            },

                            contractFile: 'default.json',

                            signals: {
                                consumes: [],
                                emits: [],
                            },

                            runtime: {
                                rendering: ['client', 'ssr'],
                            },
                        },
                        null,
                        2,
                    ),
                },
            ],
        }),
    );
}