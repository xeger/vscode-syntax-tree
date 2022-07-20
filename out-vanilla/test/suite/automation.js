"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.visualize = exports.stop = exports.start = exports.restart = exports.formatDocument = exports.findNewestEditor = exports.createEditor = exports.reset = void 0;
const assert = require("assert");
const path = require("path");
const util_1 = require("util");
const vscode_1 = require("vscode");
const setup_1 = require("./setup");
function reset() {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_1.commands.executeCommand('workbench.action.closeAllEditors');
    });
}
exports.reset = reset;
function createEditor(content) {
    return __awaiter(this, void 0, void 0, function* () {
        const filename = `${Math.random().toString().slice(2)}.rb`;
        const uri = vscode_1.Uri.file(`${setup_1.WORKSPACE_DIR}${path.sep}${filename}`);
        yield vscode_1.workspace.fs.writeFile(uri, new util_1.TextEncoder().encode(content));
        yield vscode_1.window.showTextDocument(uri);
        assert.ok(vscode_1.window.activeTextEditor);
        assert.equal(vscode_1.window.activeTextEditor.document.getText(), content);
        return vscode_1.window.activeTextEditor;
    });
}
exports.createEditor = createEditor;
function findNewestEditor() {
    return vscode_1.window.visibleTextEditors[vscode_1.window.visibleTextEditors.length - 1];
}
exports.findNewestEditor = findNewestEditor;
function formatDocument() {
    return vscode_1.commands.executeCommand('editor.action.formatDocument', 'ruby-syntax-tree.vscode-syntax-tree');
}
exports.formatDocument = formatDocument;
function restart() {
    return vscode_1.commands.executeCommand('syntaxTree.restart');
}
exports.restart = restart;
function start() {
    return vscode_1.commands.executeCommand('syntaxTree.start');
}
exports.start = start;
function stop() {
    return vscode_1.commands.executeCommand('syntaxTree.stop');
}
exports.stop = stop;
function visualize() {
    return vscode_1.commands.executeCommand('syntaxTree.visualize');
}
exports.visualize = visualize;
//# sourceMappingURL=automation.js.map