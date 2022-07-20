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
exports.deactivate = exports.activate = exports.languageClient = void 0;
const vscode_1 = require("vscode");
const node_1 = require("vscode-languageclient/node");
const util_1 = require("util");
const child_process_1 = require("child_process");
const Visualize_1 = require("./Visualize");
const promiseExec = (0, util_1.promisify)(child_process_1.exec);
// This object will get initialized once the language client is ready. It will
// get set back to null when the extension is deactivated. It is exported for
// easier testing.
exports.languageClient = null;
// This is the expected top-level export that is called by VSCode when the
// extension is activated.
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        // This output channel is going to contain all of our informational messages.
        // It's not really meant for the end-user, it's more for debugging.
        const outputChannel = vscode_1.window.createOutputChannel("Syntax Tree");
        // This object will get initialized once the language client is ready.
        let visualizer = null;
        // This is the list of objects that implement the Disposable interface. They
        // will all get cleaned up with this extension is deactivated. It's important
        // to add them to this list so we don't leak memory.
        context.subscriptions.push(
        // The output channel itself is a disposable. When the extension is
        // deactivated it will be removed from the list.
        outputChannel, 
        // Each of the commands that interacts with this extension is a disposable.
        // It's important to register them here as opposed to whenever the client
        // starts up because we don't want to register them again whenever the
        // client restarts.
        vscode_1.commands.registerCommand("syntaxTree.start", startLanguageServer), vscode_1.commands.registerCommand("syntaxTree.stop", stopLanguageServer), vscode_1.commands.registerCommand("syntaxTree.restart", restartLanguageServer), vscode_1.commands.registerCommand("syntaxTree.visualize", () => visualizer === null || visualizer === void 0 ? void 0 : visualizer.visualize()), vscode_1.commands.registerCommand("syntaxTree.showOutputChannel", () => outputChannel.show()), vscode_1.workspace.onDidChangeConfiguration(event => {
            if (event.affectsConfiguration("syntaxTree")) {
                restartLanguageServer();
            }
        }));
        // If there's an open folder, use it as cwd when spawning commands
        // to promote correct package & language versioning.
        const getCWD = () => { var _a, _b, _c; return ((_c = (_b = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.uri) === null || _c === void 0 ? void 0 : _c.fsPath) || process.cwd(); };
        // This function is called when the extension is activated or when the
        // language server is restarted.
        function startLanguageServer() {
            return __awaiter(this, void 0, void 0, function* () {
                if (exports.languageClient) {
                    return; // preserve idempotency
                }
                // The top-level configuration group is syntaxTree. All of the configuration
                // for the extension is under that group.
                const config = vscode_1.workspace.getConfiguration("syntaxTree");
                // The args are going to be passed to the stree executable. It's important
                // that it lines up with what the CLI expects.
                const args = ["lsp"];
                const plugins = new Set();
                if (config.get("singleQuotes")) {
                    plugins.add("plugin/single_quotes");
                }
                if (config.get("trailingComma")) {
                    plugins.add("plugin/trailing_comma");
                }
                const additionalPlugins = config.get("additionalPlugins");
                if (additionalPlugins) {
                    additionalPlugins.forEach(plugin => plugins.add(plugin));
                }
                // If there are any plugins, then we'll pass the --plugins command line
                // option to the stree lsp command.
                if (plugins.size > 0) {
                    args.push(`--plugins=${Array.from(plugins).join(",")}`);
                }
                // Configure print width.
                args.push(`--print-width=${config.get("printWidth")}`);
                // There's a bit of complexity here. Basically, if there's an open folder,
                // then we're going to check if the syntax_tree gem is inside the bundle. If
                // it is, then we'll run bundle exec stree. This is good, because it'll
                // ensure that we get the correct version of the gem. If it's not in the
                // bundle or there is no bundle, then we'll just run the global stree. This
                // might be correct in the end if the right environment variables are set,
                // but it's a bit of a prayer.
                const cwd = getCWD();
                let run = { command: "stree", args };
                let where = 'global';
                try {
                    yield promiseExec("bundle show syntax_tree", { cwd });
                    run = { command: "bundle", args: ["exec", "stree"].concat(args), options: { cwd } };
                    where = 'bundled';
                }
                catch (_a) {
                    // No-op (just keep using the global stree)
                }
                outputChannel.appendLine(`Starting language server with ${where} stree and ${plugins.size} plugin(s)...`);
                // Here, we instantiate the language client. This is the object that is
                // responsible for the communication and management of the Ruby subprocess.
                exports.languageClient = new node_1.LanguageClient("Syntax Tree", { run, debug: run }, {
                    documentSelector: [
                        { scheme: "file", language: "ruby" },
                    ],
                    outputChannel
                });
                try {
                    // Here we're going to wait for the language server to start.
                    yield exports.languageClient.start();
                    // Finally, now that the language server has been properly started, we can
                    // add the various features to the extension. Each of them in turn
                    // implements Disposable so that they clean up their own resources.
                    visualizer = new Visualize_1.default(exports.languageClient, outputChannel);
                    context.subscriptions.push(visualizer);
                }
                catch (e) {
                    exports.languageClient = null;
                    const items = ['Restart'];
                    let msg = 'Something went wrong.';
                    if (typeof e === 'string') {
                        if (/ENOENT/.test(e)) {
                            msg = 'Command not found. Is the syntax_tree RubyGem installed?';
                            items.unshift('Install Gem');
                        }
                    }
                    const action = yield vscode_1.window.showErrorMessage(msg, ...items);
                    switch (action) {
                        case 'Install Gem':
                            installGem();
                            break;
                        case 'Restart':
                            startLanguageServer();
                            break;
                    }
                }
            });
        }
        // This function is called as part of the shutdown or restart process. It's
        // always user-initiated either through manually executing an action or
        // changing some configuration.
        function stopLanguageServer() {
            return __awaiter(this, void 0, void 0, function* () {
                if (exports.languageClient) {
                    outputChannel.appendLine("Stopping language server...");
                    yield exports.languageClient.stop();
                    exports.languageClient = null;
                }
            });
        }
        // This function is called as part of the restart process. Like
        // stopLanguageServer, it's always user-initiated either through manually
        // executing an action or changing some configuration.
        function restartLanguageServer() {
            return __awaiter(this, void 0, void 0, function* () {
                outputChannel.appendLine("Restarting language server...");
                yield stopLanguageServer();
                yield startLanguageServer();
            });
        }
        // This function is called when the user wants to recover from ENOENT
        // on start. It starts the language server afterward.
        function installGem() {
            return __awaiter(this, void 0, void 0, function* () {
                const cwd = getCWD();
                try {
                    yield promiseExec("gem install syntax_tree", { cwd });
                    startLanguageServer();
                }
                catch (e) {
                    outputChannel.appendLine("Error installing gem: " + e);
                }
            });
        }
        // We're returning a Promise from this function that will start the Ruby
        // subprocess.
        yield startLanguageServer();
    });
}
exports.activate = activate;
// This is the expected top-level export that is called by VSCode when the
// extension is deactivated.
function deactivate() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (exports.languageClient === null || exports.languageClient === void 0 ? void 0 : exports.languageClient.stop());
        exports.languageClient = null;
    });
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map