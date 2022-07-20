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
const assert = require("assert");
const mocha_1 = require("mocha");
const vscode_languageclient_1 = require("vscode-languageclient");
const auto = require("./automation");
const extension = require("../../extension");
const UNFORMATTED = `class Foo; def bar; puts 'baz'; end; end`;
const FORMATTED = `class Foo
  def bar
    puts "baz"
  end
end
`;
suite('Syntax Tree', () => {
    (0, mocha_1.beforeEach)(auto.reset);
    suite('lifecycle commands', () => {
        test('start', () => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            yield auto.start();
            assert.notEqual(extension.languageClient, null);
            assert.equal((_a = extension.languageClient) === null || _a === void 0 ? void 0 : _a.state, vscode_languageclient_1.State.Running);
        }));
        test('stop', () => __awaiter(void 0, void 0, void 0, function* () {
            yield auto.start();
            yield auto.stop();
            assert.equal(extension.languageClient, null);
        }));
        test('restart', () => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            yield auto.restart();
            assert.notEqual(extension.languageClient, null);
            assert.equal((_b = extension.languageClient) === null || _b === void 0 ? void 0 : _b.state, vscode_languageclient_1.State.Running);
        }));
    });
    suite('functional commands', () => {
        (0, mocha_1.before)(auto.start);
        test('format', () => __awaiter(void 0, void 0, void 0, function* () {
            const editor = yield auto.createEditor(UNFORMATTED);
            yield auto.formatDocument();
            assert.equal(editor.document.getText(), FORMATTED);
        }));
        test('visualize', () => __awaiter(void 0, void 0, void 0, function* () {
            yield auto.createEditor(UNFORMATTED);
            yield auto.visualize();
            const editor = auto.findNewestEditor();
            assert.match(editor.document.getText(), /^\(program/);
        }));
    });
});
//# sourceMappingURL=index.test.js.map