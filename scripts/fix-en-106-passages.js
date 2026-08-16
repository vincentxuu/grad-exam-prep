#!/usr/bin/env node

// Backward-compatible entry point. The old implementation concatenated
// fragments and duplicated paragraphs; use the page-verified repair instead.
require('./repair-im-en-106.js')
