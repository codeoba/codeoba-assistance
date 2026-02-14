"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceCommander = void 0;
const vscode = require("vscode");

class VoiceCommander {
    constructor(context) {
        this.context = context;
    }

    async listen() {
        // Simulate Voice Interface via Input Box (Text-to-Action)
        const command = await vscode.window.showInputBox({
            prompt: '🎙️ Codeoba Voice Command (Type usage instructions)',
            placeHolder: 'e.g., "Create a new React component called Header"',
            title: 'Listening...'
        });

        if (command) {
            this.processNaturalLanguage(command);
        }
    }

    async processNaturalLanguage(input) {
        const lower = input.toLowerCase();

        if (lower.includes('create') && lower.includes('component')) {
            vscode.commands.executeCommand('codeoba.manageTemplates');
        } else if (lower.includes('switch') && lower.includes('account')) {
            vscode.commands.executeCommand('codeoba.switchAccount');
        } else if (lower.includes('fix')) {
            vscode.commands.executeCommand('codeoba.fixLastError');
        } else {
            vscode.window.showInformationMessage(`System heard: "${input}". Sending to Agent...`);
            // Forward to agent logic
        }
    }
}
exports.VoiceCommander = VoiceCommander;
