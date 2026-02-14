"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShadowMode = void 0;
const vscode = __importStar(require("vscode"));

class ShadowMode {
    constructor(context) {
        this.context = context;
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'codeoba.shadowModeStatus';
        this.statusBarItem.text = '$(eye) Shadow Mode: On';
        this.statusBarItem.tooltip = 'Codeoba is analyzing your code in the background';
        this.statusBarItem.show();

        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('codeoba-shadow');
        this.startWatching();
    }

    startWatching() {
        let timeout;
        vscode.workspace.onDidChangeTextDocument(event => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                this.analyzeDocument(event.document);
            }, 1000); // Debounce 1s
        });
    }

    async analyzeDocument(document) {
        if (document.languageId !== 'javascript' && document.languageId !== 'typescript') return;

        const text = document.getText();
        const diagnostics = [];

        // Mock AI Analysis (Regex based checks for demo)
        // In production, this would call a local LLM or lightweight API

        // 1. Detect confusing variable names
        if (/\b(tmp|temp|data|val|obj)\b/.test(text)) {
            const range = this.findRange(text, /\b(tmp|temp|data|val|obj)\b/);
            diagnostics.push(new vscode.Diagnostic(
                range,
                'Shadow Mode: Vague variable name detected. Consider renaming to something more descriptive.',
                vscode.DiagnosticSeverity.Information
            ));
        }

        // 2. Detect missing error handling in async/await
        if (/await/.test(text) && !/try/.test(text) && !/\.catch/.test(text)) {
            const range = this.findRange(text, /await/);
            diagnostics.push(new vscode.Diagnostic(
                range,
                'Shadow Mode: Async operation without error handling. Wrap in try/catch.',
                vscode.DiagnosticSeverity.Warning
            ));
        }

        // 3. Detect large loops
        if (/for\s*\(/.test(text) && text.length > 500) {
            const range = this.findRange(text, /for\s*\(/);
            diagnostics.push(new vscode.Diagnostic(
                range,
                'Shadow Mode: Performance - Ensure this loop is necessary inside this large file.',
                vscode.DiagnosticSeverity.Hint
            ));
        }

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    findRange(text, regex) {
        const match = regex.exec(text);
        if (!match) return new vscode.Range(0, 0, 0, 0);

        const lines = text.substring(0, match.index).split('\n');
        const line = lines.length - 1;
        const char = lines[line].length;

        return new vscode.Range(line, char, line, char + match[0].length);
    }

    dispose() {
        this.statusBarItem.dispose();
        this.diagnosticCollection.dispose();
    }
}
exports.ShadowMode = ShadowMode;
