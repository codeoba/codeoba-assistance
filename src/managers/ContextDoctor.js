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
exports.ContextDoctor = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class ContextDoctor {
    constructor(context, database) {
        this.context = context;
        this.database = database;
    }

    async analyzeWorkspace() {
        const folders = vscode.workspace.workspaceFolders;
        if (!folders) {
            vscode.window.showErrorMessage('No workspace open to analyze.');
            return;
        }

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "Codeoba: Analyzing Context usage...",
            cancellable: true
        }, async (progress, token) => {
            const rootPath = folders[0].uri.fsPath;
            const fileStats = await this.scanDirectory(rootPath);

            // Sort by size
            fileStats.sort((a, b) => b.size - a.size);

            this.showReport(fileStats.slice(0, 50)); // Show top 50 largest files
        });
    }

    async scanDirectory(dir) {
        let results = [];
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const relativePath = path.relative(vscode.workspace.workspaceFolders[0].uri.fsPath, fullPath);

            // Skip common large folders
            if (['node_modules', '.git', 'dist', 'build', '.next'].includes(item)) continue;

            try {
                const stats = fs.statSync(fullPath);
                if (stats.isDirectory()) {
                    results = results.concat(await this.scanDirectory(fullPath));
                } else {
                    // Estimate tokens (rough approx: 4 chars = 1 token)
                    const tokens = Math.ceil(stats.size / 4);
                    results.push({
                        path: relativePath,
                        size: stats.size,
                        tokens: tokens
                    });
                }
            } catch (e) {
                console.error(`Error scanning ${fullPath}:`, e);
            }
        }
        return results;
    }

    showReport(stats) {
        const panel = vscode.window.createWebviewPanel(
            'contextDoctor',
            'Context Doctor 🧠',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const totalTokens = stats.reduce((acc, curr) => acc + curr.tokens, 0);

        panel.webview.html = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); padding: 20px; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 10px; text-align: left; border-bottom: 1px solid var(--vscode-panel-border); }
                    .bar-container { background: var(--vscode-scrollbarSlider-background); height: 10px; width: 100px; border-radius: 5px; overflow: hidden; }
                    .bar { background: var(--vscode-progressBar-background); height: 100%; }
                    .warning { color: var(--vscode-errorForeground); font-weight: bold; }
                </style>
            </head>
            <body>
                <h1>🧠 Context Doctor Report</h1>
                <p>Total Estimated Active Tokens: <strong>${totalTokens.toLocaleString()}</strong></p>
                <p>These files are the heaviest in your workspace. Consider ignoring them if not needed for AI.</p>
                
                <table>
                    <tr>
                        <th>File Path</th>
                        <th>Size (KB)</th>
                        <th>Est. Tokens</th>
                        <th>Action</th>
                    </tr>
                    ${stats.map(file => `
                        <tr>
                            <td>${file.path}</td>
                            <td>${(file.size / 1024).toFixed(2)}</td>
                            <td class="${file.tokens > 10000 ? 'warning' : ''}">${file.tokens.toLocaleString()}</td>
                            <td>
                                <button onclick="exclude('${file.path.replace(/\\/g, '\\\\')}')">Exclude from Context</button>
                            </td>
                        </tr>
                    `).join('')}
                </table>

                <script>
                    const vscode = acquireVsCodeApi();
                    function exclude(path) {
                        vscode.postMessage({ command: 'exclude', path: path });
                    }
                </script>
            </body>
            </html>
        `;

        panel.webview.onDidReceiveMessage(message => {
            if (message.command === 'exclude') {
                this.addToGitIgnore(message.path);
                vscode.window.showInformationMessage(`Excluded ${message.path} from context.`);
            }
        });
    }

    addToGitIgnore(filePath) {
        // Simple implementation: add to .gitignore if exists
        const rootPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
        const gitIgnorePath = path.join(rootPath, '.gitignore');

        fs.appendFileSync(gitIgnorePath, `\n${filePath}`);
    }
}
exports.ContextDoctor = ContextDoctor;
