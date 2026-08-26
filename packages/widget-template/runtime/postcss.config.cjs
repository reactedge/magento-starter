const prefixSelector = require('postcss-prefix-selector');

module.exports = {
    plugins: [
        prefixSelector({
            prefix: '.reactedge-__WIDGET_NAME__',
            transform(prefix, selector, prefixedSelector) {
                if (selector.startsWith('html') || selector.startsWith('body')) {
                    return selector;
                }
                return prefixedSelector;
            },
        }),
    ],
};
