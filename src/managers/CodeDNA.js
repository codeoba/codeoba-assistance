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
exports.CodeDNA = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class CodeDNA {
    constructor(context) {
        this.context = context;
    }

    async extractDNA() {
        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🧬 Extracting Code DNA...",
            cancellable: false
        }, async (progress) => {
            const files = await vscode.workspace.findFiles('src/**/*.{js,ts,jsx,tsx,py}', '**/node_modules/**');
            let indentation = { tabs: 0, spaces: 0 };
            let quotes = { single: 0, double: 0 };
            let semicolons = { yes: 0, no: 0 };

            for (const file of files.slice(0, 20)) { // Analyze sample
                const content = fs.readFileSync(file.fsPath, 'utf8');

                // Indentation
                if (content.includes('\t')) indentation.tabs++;
                if (content.includes('  ')) indentation.spaces++;

                // Quotes
                if (content.includes("'")) quotes.single++;
                if (content.includes('"')) quotes.double++;

                // Semicolons
                if (content.includes(';')) semicolons.yes++;
                else semicolons.no++;

                progress.report({ message: `Analyzing ${path.basename(file.fsPath)}...` });
            }

            const profile = {
                indentation: indentation.tabs > indentation.spaces ? 'tabs' : 'spaces',
                quotes: quotes.single > quotes.double ? 'single' : 'double',
                semicolons: semicolons.yes > semicolons.no ? 'always' : 'never',
                generatedAt: new Date().toISOString()
            };

            const root = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
            if (root) {
                const dnaPath = path.join(root, '.agent', 'dna.profile.json');
                fs.writeFileSync(dnaPath, JSON.stringify(profile, null, 2));

                const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(dnaPath));
                vscode.window.showTextDocument(doc);
                vscode.window.showInformationMessage('🧬 Code DNA Extracted! I will now code exactly like you.');
            }
        });
    }
}
exports.CodeDNA = CodeDNA;
