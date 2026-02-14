"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoRefresh = void 0;
const vscode = require("vscode");

class AutoRefresh {
    constructor(context) {
        this.context = context;
        this.intervalId = null;
    }

    start(interval) {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        console.log(`AutoRefresh started with interval ${interval}ms`);
        this.intervalId = setInterval(() => {
            // Check if we are on battery (mock check)
            // In a real implementation we might check power state

            // Execute refresh command
            vscode.commands.executeCommand('codeoba.refreshQuota');

        }, interval);
    }

    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('AutoRefresh stopped');
        }
    }
}
exports.AutoRefresh = AutoRefresh;