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
exports.SelfHealer = void 0;
const vscode = __importStar(require("vscode"));
const cp = __importStar(require("child_process"));

class SelfHealer {
    constructor(context) {
        this.context = context;
        // In a real extension, we would hook into the terminal stream.
        // For this demo, we expose a "Heal" command.
    }

    async healProject() {
        const errors = await this.detectErrors();
        if (errors.length === 0) {
            vscode.window.showInformationMessage('🕸️ Self-Healer: No obvious issues detected.');
            return;
        }

        const choice = await vscode.window.showWarningMessage(
            `🕸️ Detected ${errors.length} issues (e.g., ${errors[0].type}). Fix automatically?`,
            'Auto-Fix', 'Ignore'
        );

        if (choice === 'Auto-Fix') {
            await this.applyFixes(errors);
        }
    }

    async detectErrors() {
        const workspacePath = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) return [];

        const issues = [];

        // 1. Check for missing node_modules
        if (await this.needsNpmInstall(workspacePath)) {
            issues.push({ type: 'missing_deps', cmd: 'npm install' });
        }

        // 2. Mock: Check if port 3000 is blocked (Simulation)
        // In real app: use 'netstat' or 'lsof'

        return issues;
    }

    async needsNpmInstall(root) {
        // Simple check: package.json exists but node_modules does not
        const hasPackage = await this.fileExists(vscode.Uri.file(root + '/package.json'));
        const hasModules = await this.directoryExists(vscode.Uri.file(root + '/node_modules'));
        return hasPackage && !hasModules;
    }

    async applyFixes(errors) {
        const terminal = vscode.window.createTerminal('Codeoba Healer');
        terminal.show();

        for (const error of errors) {
            terminal.sendText(error.cmd);
            await new Promise(r => setTimeout(r, 1000)); // Wait a bit
        }

        vscode.window.showInformationMessage('🕸️ Applied fixes!');
    }

    // Helpers
    async fileExists(uri) {
        try { await vscode.workspace.fs.stat(uri); return true; } catch { return false; }
    }

    async directoryExists(uri) {
        try {
            const stat = await vscode.workspace.fs.stat(uri);
            return stat.type === vscode.FileType.Directory;
        } catch { return false; }
    }
}
exports.SelfHealer = SelfHealer;
