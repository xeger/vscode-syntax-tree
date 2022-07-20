"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WORKSPACE_DIR = exports.USER_DATA_DIR = exports.TIMEOUT_MS = void 0;
const fs = require("fs");
const os = require("os");
const path = require("path");
// Share scratch dir between runner and Code process via clever env trick
const inheritedScratchDir = process.env.RUBY_SYNTAX_TREE_TEST_SCRATCH_DIR;
const SCRATCH_DIR = inheritedScratchDir || fs.mkdtempSync(`${os.tmpdir()}${path.sep}vscode-syntax-tree-`);
process.env.RUBY_SYNTAX_TREE_TEST_SCRATCH_DIR = SCRATCH_DIR;
/// How long to wait for each test case before marking it as a failure.
/// Outside of CI, give the dev 5 minutes to play with debuggers, etc!
exports.TIMEOUT_MS = process.env.CI ? 30000 : 300000;
/// Holds profile, settings, etc - to give us a clean slate every time
/// & avoid polluting developer's real profile
exports.USER_DATA_DIR = path.join(SCRATCH_DIR, 'user-data');
/// Holds text documents that we author during tests.
exports.WORKSPACE_DIR = path.join(SCRATCH_DIR, 'workspace');
if (!inheritedScratchDir) { // We're the parent; adulting is hard!
    fs.mkdirSync(exports.USER_DATA_DIR);
    fs.mkdirSync(exports.WORKSPACE_DIR);
    console.log('Scratch folder:', SCRATCH_DIR);
}
//# sourceMappingURL=setup.js.map