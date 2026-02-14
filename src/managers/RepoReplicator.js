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
exports.RepoReplicator = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const cp = __importStar(require("child_process"));

class RepoReplicator {
    constructor(context) {
        this.context = context;
    }

    async startReplication() {
        const url = await vscode.window.showInputBox({
            prompt: '🧬 Autonomous Cloner: Paste GitHub URL to Replicate',
            placeHolder: 'https://github.com/username/repo',
            ignoreFocusOut: true
        });

        if (!url) return;

        const parentDir = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Select Clone Location'
        });

        if (!parentDir || parentDir.length === 0) return;

        const targetDir = parentDir[0].fsPath;

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Notification,
            title: "🧬 Replicating Repository...",
            cancellable: false
        }, async (progress) => {
            try {
                // 1. Clone
                progress.report({ message: "Cloning repository..." });
                const repoName = url.split('/').pop()?.replace('.git', '') || 'cloned-repo';
                const repoPath = path.join(targetDir, repoName);

                await this.exec(`git clone ${url} "${repoPath}"`);

                // 2. Setup Env
                progress.report({ message: "Configuring environment..." });
                const envExample = path.join(repoPath, '.env.example');
                const envTarget = path.join(repoPath, '.env');
                if (fs.existsSync(envExample) && !fs.existsSync(envTarget)) {
                    fs.copyFileSync(envExample, envTarget);
                }

                // 3. Install Dependencies
                progress.report({ message: "Installing dependencies (this may take time)..." });
                let installCmd = '';
                if (fs.existsSync(path.join(repoPath, 'package.json'))) {
                    installCmd = 'npm install';
                } else if (fs.existsSync(path.join(repoPath, 'requirements.txt'))) {
                    installCmd = 'pip install -r requirements.txt';
                }

                if (installCmd) {
                    await this.exec(installCmd, { cwd: repoPath });
                }

                // 4. Open
                progress.report({ message: "Opening in VS Code..." });
                const uri = vscode.Uri.file(repoPath);
                await vscode.commands.executeCommand('vscode.openFolder', uri, true);

                // 5. Try to Start (in new window)
                // We can't easily run this in the new window from here, but we can creating a startup task
                // For now, we'll just show a message
                vscode.window.showInformationMessage(`🧬 ${repoName} replicated successfully!`);

            } catch (error) {
                vscode.window.showErrorMessage(`Replication failed: ${error.message}`);
            }
        });
    }

    exec(command, options = {}) {
        return new Promise((resolve, reject) => {
            cp.exec(command, options, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }
}
exports.RepoReplicator = RepoReplicator;
