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
exports.TerminalManager = void 0;
const vscode = __importStar(require("vscode"));

class TerminalManager {
    constructor(context) {
        this.context = context;
        this.hasShownHint = false;

        // Listen for terminal data (Experimental - usually restricted, so we use a command approach mostly)
        // vscode.window.onDidWriteTerminalData is not stable API yet for all extensions
    }

    async fixLastError() {
        // Since we can't reliably read terminal output without OCR or restricted APIs in all versions,
        // we'll ask the user to select the error text or just prompt based on context.

        const editor = vscode.window.activeTextEditor;
        let contextText = "";

        if (editor) {
            contextText = `I am working on ${editor.document.fileName}. `;
        }

        const errorDescription = await vscode.window.showInputBox({
            prompt: 'Codeoba Auto-Fix: Paste the error message here or describe what went wrong',
            placeHolder: 'TypeError: undefined is not a function...'
        });

        if (errorDescription) {
            // Send to Agent
            vscode.window.showInformationMessage('Codeoba is analyzing the error...');

            // In a real agent integration, we would create a task here.
            // For now, we simulate the agent prompt generation
            const prompt = `FIX ERROR:\nContext: ${contextText}\nError: ${errorDescription}\n\nPlease analyze and fix this.`;

            // Open a new untitled file with the prompt for the user to copy/paste to the agent
            const doc = await vscode.workspace.openTextDocument({ content: prompt, language: 'markdown' });
            vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('Prompt generated! Copy this to your AI agent.');
        }
    }
}
exports.TerminalManager = TerminalManager;
