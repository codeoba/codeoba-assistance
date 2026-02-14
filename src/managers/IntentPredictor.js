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
exports.IntentPredictor = void 0;
const vscode = __importStar(require("vscode"));

class IntentPredictor {
    constructor(context) {
        this.context = context;
        // Poll clipboard every 2 seconds (VS Code doesn't have a clipboard event)
        this.lastClipboard = '';
        this.interval = setInterval(() => this.checkClipboard(), 2000);

        this.statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1000);
    }

    async checkClipboard() {
        if (!vscode.window.state.focused) return;

        try {
            const text = await vscode.env.clipboard.readText();
            if (text && text !== this.lastClipboard) {
                this.lastClipboard = text;
                this.analyzeIntent(text);
            }
        } catch (e) {
            // Ignore clipboard read errors
        }
    }

    analyzeIntent(text) {
        const trimmed = text.trim();

        // 1. JSON Detection
        if ((trimmed.startsWith('{') || trimmed.startsWith('[')) && trimmed.length > 20) {
            try {
                JSON.parse(trimmed);
                this.suggestAction('🔮 Create Table/Interface from JSON', 'codeoba.createBlueprint'); // Reusing a command for demo
                return;
            } catch (e) { }
        }

        // 2. SQL Detection
        if (/^(SELECT|INSERT|UPDATE|DELETE)\s+/i.test(trimmed)) {
            this.suggestAction('🔮 Execute SQL Query', 'codeoba.createWorkflow');
            return;
        }

        // 3. Color Detection
        if (/^#[0-9A-F]{6}$/i.test(trimmed)) {
            this.suggestAction('🔮 Insert Color Swatch', 'codeoba.manageTemplates');
            return;
        }

        this.statusBar.hide();
    }

    suggestAction(label, command) {
        this.statusBar.text = label;
        this.statusBar.command = command;
        this.statusBar.tooltip = "Codeoba Telepathic UI detected your intent";
        this.statusBar.show();

        // Auto-hide after 10 seconds
        setTimeout(() => this.statusBar.hide(), 10000);
    }

    dispose() {
        clearInterval(this.interval);
        this.statusBar.dispose();
    }
}
exports.IntentPredictor = IntentPredictor;
