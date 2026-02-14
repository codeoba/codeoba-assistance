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
exports.ProfileManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));

class ProfileManager {
    constructor(context, database) {
        this.context = context;
        this.database = database;
    }

    async showProfilePicker() {
        // Mock profiles for now - in a real app these would be in DB
        const profiles = [
            { label: 'Default', description: 'Standard settings', detail: 'Balanced configuration' },
            { label: 'Work', description: 'Strict quotas', detail: 'High performance mode' },
            { label: 'Creative', description: 'Loose quotas', detail: 'Experimental features enabled' }
        ];

        const selected = await vscode.window.showQuickPick(profiles, {
            placeHolder: 'Select a profile to switch to'
        });

        if (selected) {
            await this.applyProfile(selected.label);
        }
    }

    async applyProfile(profileName) {
        const config = vscode.workspace.getConfiguration('codeoba');

        // Example profile logic
        if (profileName === 'Work') {
            await config.update('quota.alertThreshold', 90, vscode.ConfigurationTarget.Global);
            await config.update('autoClick.enabled', true, vscode.ConfigurationTarget.Global);
        } else if (profileName === 'Creative') {
            await config.update('quota.alertThreshold', 100, vscode.ConfigurationTarget.Global);
            await config.update('autoClick.enabled', true, vscode.ConfigurationTarget.Global);
        } else {
            await config.update('quota.alertThreshold', 80, vscode.ConfigurationTarget.Global);
        }

        vscode.window.showInformationMessage(`Switched to profile: ${profileName}`);
    }

    async exportProfile() {
        const config = vscode.workspace.getConfiguration('codeoba');
        const settings = {};
        // Naive export of all codeoba settings
        // In reality, we'd inspect the actual configuration object more deeply
        settings['quota.alertThreshold'] = config.get('quota.alertThreshold');
        settings['autoClick.enabled'] = config.get('autoClick.enabled');

        const uri = await vscode.window.showSaveDialog({
            filters: { 'JSON': ['json'] },
            saveLabel: 'Export Profile'
        });

        if (uri) {
            fs.writeFileSync(uri.fsPath, JSON.stringify(settings, null, 2));
            vscode.window.showInformationMessage(`Profile exported to ${uri.fsPath}`);
        }
    }

    async importProfile() {
        const uris = await vscode.window.showOpenDialog({
            canSelectFiles: true,
            filters: { 'JSON': ['json'] },
            openLabel: 'Import Profile'
        });

        if (uris && uris.length > 0) {
            try {
                const content = fs.readFileSync(uris[0].fsPath, 'utf8');
                const settings = JSON.parse(content);
                const config = vscode.workspace.getConfiguration('codeoba');

                for (const key in settings) {
                    await config.update(key, settings[key], vscode.ConfigurationTarget.Global);
                }
                vscode.window.showInformationMessage('Profile imported successfully.');
            } catch (err) {
                vscode.window.showErrorMessage('Failed to import profile: ' + err.message);
            }
        }
    }
}
exports.ProfileManager = ProfileManager;