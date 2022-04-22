// eslint-disable-next-line strict
const fs = require('fs-extra');
const path = require('path');

fs.removeSync(path.resolve('./packages/lexical/dist'));
fs.removeSync(path.resolve('./packages/lexical-react/dist'));
fs.removeSync(path.resolve('./packages/lexical-list/dist'));
fs.removeSync(path.resolve('./packages/lexical-table/dist'));
fs.removeSync(path.resolve('./packages/lexical-file/dist'));
fs.removeSync(path.resolve('./packages/lexical-clipboard/dist'));
fs.removeSync(path.resolve('./packages/lexical-hashtag/dist'));
fs.removeSync(path.resolve('./packages/lexical-history/dist'));
fs.removeSync(path.resolve('./packages/lexical-selection/dist'));
fs.removeSync(path.resolve('./packages/lexical-text/dist'));
fs.removeSync(path.resolve('./packages/lexical-offset/dist'));
fs.removeSync(path.resolve('./packages/lexical-utils/dist'));
fs.removeSync(path.resolve('./packages/lexical-code/dist'));
fs.removeSync(path.resolve('./packages/lexical-dragon/dist'));
fs.removeSync(path.resolve('./packages/lexical-plain-text/dist'));
fs.removeSync(path.resolve('./packages/lexical-rich-text/dist'));
fs.removeSync(path.resolve('./packages/lexical-overflow/dist'));
fs.removeSync(path.resolve('./packages/lexical-link/dist'));
fs.removeSync(path.resolve('./packages/lexical-yjs/dist'));
fs.removeSync(path.resolve('./packages/lexical-markdown/dist'));
