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
const vscode_1 = require("vscode");
class Visualize {
    constructor(languageClient, outputChannel) {
        this.languageClient = languageClient;
        this.outputChannel = outputChannel;
        this.disposables = [
            vscode_1.workspace.registerTextDocumentContentProvider("syntaxTree.visualize", this)
        ];
    }
    dispose() {
        this.disposables.forEach((disposable) => disposable.dispose());
    }
    provideTextDocumentContent(uri) {
        this.outputChannel.appendLine("Requesting visualization");
        return this.languageClient.sendRequest("syntaxTree/visualizing", { textDocument: { uri: uri.path } });
    }
    visualize() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const document = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
            if (document && document.languageId === "ruby" && document.uri.scheme === "file") {
                const uri = vscode_1.Uri.parse(`syntaxTree.visualize:${document.uri.toString()}`);
                const doc = yield vscode_1.workspace.openTextDocument(uri);
                vscode_1.languages.setTextDocumentLanguage(doc, "plaintext");
                yield vscode_1.window.showTextDocument(doc, vscode_1.ViewColumn.Beside, true);
            }
        });
    }
}
exports.default = Visualize;
//# sourceMappingURL=Visualize.js.map