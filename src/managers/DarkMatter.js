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
exports.DarkMatter = void 0;
const vscode = __importStar(require("vscode"));

class DarkMatter {
    constructor(context) {
        this.context = context;
    }

    async summonDarkMatter() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const line = editor.document.lineAt(editor.selection.active.line).text;

        if (line.includes("// Codeoba:")) {
            const intent = line.split("// Codeoba:")[1].trim();

            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "🌌 Summoning Dark Matter...",
                cancellable: false
            }, async (progress) => {

                await new Promise(r => setTimeout(r, 1500)); // Calculating...

                // Determine what to inject based on intent
                let injection = '';
                if (intent.toLowerCase().includes('uber')) {
                    injection = `import { createRide, getDriver } from 'codeoba:dark-matter/rideshare';\n`;
                } else if (intent.toLowerCase().includes('auth')) {
                    injection = `import { login, logout, user } from 'codeoba:dark-matter/auth';\n`;
                } else {
                    injection = `import { genericMagic } from 'codeoba:dark-matter/utils';\n`;
                }

                editor.edit(editBuilder => {
                    editBuilder.insert(new vscode.Position(0, 0), injection);
                });

                vscode.window.showInformationMessage(`🌌 Dark Matter for "${intent}" exists. Invisible files loaded.`);
            });
        } else {
            vscode.window.showWarningMessage("Start a line with '// Codeoba: <Intent>' to summon Dark Matter.");
        }
    }
}
exports.DarkMatter = DarkMatter;
