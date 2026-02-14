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
exports.Oracle = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class Oracle {
    constructor(context) {
        this.context = context;
        this.trends = {
            "todo": { pivot: "AI Task Manager", growth: "+200%" },
            "blog": { pivot: "Headless CMS for Metaverse", growth: "+150%" },
            "chat": { pivot: "Autonomous Agent Swarm", growth: "+500%" }
        };
    }

    async consultTheOracle() {
        const root = vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!root) return;

        const packageJsonPath = path.join(root, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
            const keywords = [pkg.name, ...(pkg.keywords || [])].join(' ').toLowerCase();

            for (const [key, trend] of Object.entries(this.trends)) {
                if (keywords.includes(key)) {
                    vscode.window.showInformationMessage(
                        `🔮 The Oracle: stop building a generic "${key}" app.`,
                        `Pivot to ${trend.pivot} (${trend.growth})`
                    ).then(selection => {
                        if (selection) {
                            this.generatePivotPlan(trend.pivot);
                        }
                    });
                    return;
                }
            }
            vscode.window.showInformationMessage("🔮 The Oracle: Your project path seems unique. Proceed.");
        }
    }

    async generatePivotPlan(pivot) {
        vscode.window.showInformationMessage(`🔮 Generating Pivot Strategy for ${pivot}...`);
        // Logic to create a pivot_strategy.md would go here
    }
}
exports.Oracle = Oracle;
