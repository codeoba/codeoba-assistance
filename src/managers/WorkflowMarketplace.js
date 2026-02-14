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
exports.WorkflowMarketplace = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class WorkflowMarketplace {
    constructor(context) {
        this.context = context;
        // Mock Registry Data
        this.registry = [
            {
                name: "React Component Generator",
                id: "react-gen",
                description: "Agent that generates a React component with tests and stories",
                author: "Codeoba Community",
                content: `---
description: Create React Component
---
# Generate React Component
1. Create file \`src/components/MyComponent.tsx\`
2. Add comprehensive unit tests
// turbo-all
`
            },
            {
                name: "Deploy to Vercel",
                id: "vercel-deploy",
                description: "Automated Vercel deployment pipeline",
                author: "Vercel Fan",
                content: `---
description: Deploy to Vercel
---
# Deploy
1. Run \`vercel --prod\`
2. Check status
// turbo-all
`
            },
            {
                name: "Python Data Analysis Setup",
                id: "python-data",
                description: "Sets up Pandas, NumPy and Jupyter environment",
                author: "DataWizard",
                content: `---
description: Setup Python Data Environment
---
# Setup
1. Create virtualenv
2. Install pandas numpy jupyter
// turbo-all
`
            }
        ];
    }

    async showMarketplace() {
        const items = this.registry.map(item => ({
            label: `$(cloud-download) ${item.name}`,
            description: item.author,
            detail: item.description,
            item: item
        }));

        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Browse Workflow Marketplace'
        });

        if (selected) {
            await this.installWorkflow(selected.item);
        }
    }

    async installWorkflow(workflow) {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace open to install workflow.');
            return;
        }

        const rootPath = workspaceFolders[0].uri.fsPath;
        const workflowDir = path.join(rootPath, '.agent', 'workflows');
        const filePath = path.join(workflowDir, `${workflow.id}.md`);

        if (!fs.existsSync(workflowDir)) {
            fs.mkdirSync(workflowDir, { recursive: true });
        }

        fs.writeFileSync(filePath, workflow.content, 'utf8');
        vscode.window.showInformationMessage(`Successfully installed "${workflow.name}" workflow!`);

        // Open it
        const doc = await vscode.workspace.openTextDocument(filePath);
        await vscode.window.showTextDocument(doc);
    }
}
exports.WorkflowMarketplace = WorkflowMarketplace;
