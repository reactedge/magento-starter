import type { McpServer } from '@modelcontextprotocol/server';

export function registerProductGalleryResource(server: McpServer) {
    server.registerResource(
        'productgallery',
        'reactedge://widgets/productgallery',
        {
            title: 'ReactEdge Product Gallery',
            description: 'Documentation for the ReactEdge Product Gallery capability',
            mimeType: 'application/json',
        },
        async (uri) => ({
            contents: [
                {
                    uri: uri.href,
                    mimeType: 'application/json',
                    text: JSON.stringify({
                        id: 'productgallery',
                        widget: 'productgallery',

                        description:
                            'Displays Magento product media using configurable gallery presentation modes.',

                        exampleContract: {
                            "data": {
                                "images": [],
                                "settings": {
                                    "mode": "tile",
                                    "maxColumns": 2
                                }
                            },
                            "integration": {
                                "requires": [
                                    "magentoGraphql"
                                ]
                            }
                        },
                        contractFile: "default.json",
                        signals: {
                            consumes: ['product_attribute_changed'],
                            emits: [],
                        },

                        runtime: {
                            rendering: ['client', 'ssr'],
                        },
                    }, null, 2),
                },
            ],
        })
    )
}