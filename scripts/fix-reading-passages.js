#!/usr/bin/env node

// Backward-compatible entry point. The previous OCR-based implementation
// reintroduced scan artifacts into pp-im-en-106 and did not modify pp-cs-en-108.
// Use the deterministic, page-verified repair instead.
require('./repair-im-en-106.js')
