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
exports.AgentOrchestrator = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class AgentOrchestrator {
    constructor(context, database) {
        this.context = context;
        this.database = database;
    }

    async createWorkflowWizard() {
        // Step 1: Workflow Name
        const name = await vscode.window.showInputBox({
            prompt: 'Enter a name for your workflow (e.g., deploy-app)',
            placeHolder: 'deploy-app',
            validateInput: (value) => {
                return /^[a-zA-Z0-9-_]+$/.test(value) ? null : 'Alphanumeric, dashes, and underscores only.';
            }
        });

        if (!name) return;

        // Step 2: Description/Goal
        const description = await vscode.window.showInputBox({
            prompt: 'Describe what this workflow does',
            placeHolder: 'Deploys the application to the staging server'
        });

        if (!description) return;

        // Step 3: Create File
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace open to save the workflow.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const workflowDir = path.join(rootPath, '.agent', 'workflows');
        const filePath = path.join(workflowDir, `${name}.md`);

        if (!fs.existsSync(workflowDir)) {
            fs.mkdirSync(workflowDir, { recursive: true });
        }

        const content = `---
description: ${description}
---

# ${name}

1. [Step 1: Description of first step]
2. [Step 2: Description of second step]

// turbo-all
`;

        fs.writeFileSync(filePath, content, 'utf8');

        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);
        vscode.window.showInformationMessage(`Workflow created: ${name}`);
    }
}
exports.AgentOrchestrator = AgentOrchestrator;