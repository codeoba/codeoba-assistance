"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
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
exports.AccountManager = void 0;
const vscode = __importStar(require("vscode"));
const uuid_1 = require("uuid");
class AccountManager {
    constructor(context, database) {
        this.activeAccount = null;
        this.context = context;
        this.database = database;
        this.loadActiveAccount();
    }
    async loadActiveAccount() {
        const config = vscode.workspace.getConfiguration('codeoba');
        const activeAccountId = config.get('activeAccount');
        if (activeAccountId) {
            this.activeAccount = this.database.getAccount(activeAccountId);
        }
    }
    async showAccountPicker() {
        const accounts = this.database.getAllAccounts();
        if (accounts.length === 0) {
            const action = await vscode.window.showInformationMessage('No accounts configured. Would you like to add one?', 'Add Account');
            if (action === 'Add Account') {
                await this.addAccountWizard();
            }
            return;
        }
        const items = accounts.map(account => ({
            label: `$(account) ${account.displayName}`,
            description: account.email,
            detail: account.isActive ? 'Currently active' : undefined,
            account: account
        }));
        items.push({
            label: '$(add) Add New Account',
            description: 'Configure a new Google account',
            account: null
        });
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an account to switch to',
            matchOnDescription: true
        });
        if (selected) {
            if (selected.label.includes('Add New Account')) {
                await this.addAccountWizard();
            }
            else {
                await this.switchAccount(selected.account.id);
            }
        }
    }
    async addAccountWizard() {
        // Step 1: Get email
        const email = await vscode.window.showInputBox({
            prompt: 'Enter your Google account email',
            placeHolder: 'user@gmail.com',
            validateInput: (value) => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(value) ? null : 'Please enter a valid email address';
            }
        });
        if (!email) {
            return;
        }
        // Step 2: Get display name
        const displayName = await vscode.window.showInputBox({
            prompt: 'Enter a display name for this account (e.g., "Work", "Personal")',
            placeHolder: 'Work',
            value: 'Work'
        });
        if (!displayName) {
            return;
        }
        // Step 3: Create account
        const account = {
            id: (0, uuid_1.v4)(),
            email: email,
            displayName: displayName,
            projects: [],
            customSettings: {},
            lastUsed: Date.now(),
            isActive: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        // Save to database
        this.database.saveAccount(account);
        // Show success message
        vscode.window.showInformationMessage(`Account "${displayName}" added successfully! Note: You'll need to authenticate with Google separately.`);
        // Ask if they want to switch to this account
        const switchNow = await vscode.window.showQuickPick(['Yes', 'No'], {
            placeHolder: 'Switch to this account now?'
        });
        if (switchNow === 'Yes') {
            await this.switchAccount(account.id);
        }
    }
    async removeAccountWizard() {
        const accounts = this.database.getAllAccounts();
        if (accounts.length === 0) {
            vscode.window.showInformationMessage('No accounts to remove.');
            return;
        }
        const items = accounts.map(account => ({
            label: `$(account) ${account.displayName}`,
            description: account.email,
            detail: account.isActive ? '⚠️ Currently active' : undefined,
            account: account
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: 'Select an account to remove'
        });
        if (!selected) {
            return;
        }
        // Confirm removal
        const confirmation = await vscode.window.showWarningMessage(`Are you sure you want to remove account "${selected.account.displayName}"? This cannot be undone.`, { modal: true }, 'Remove');
        if (confirmation === 'Remove') {
            this.database.deleteAccount(selected.account.id);
            // If this was the active account, clear it
            if (this.activeAccount?.id === selected.account.id) {
                this.activeAccount = null;
                await vscode.workspace.getConfiguration('codeoba').update('activeAccount', '', vscode.ConfigurationTarget.Global);
            }
            vscode.window.showInformationMessage(`Account "${selected.account.displayName}" removed.`);
        }
    }
    async switchAccount(accountId) {
        const account = this.database.getAccount(accountId);
        if (!account) {
            vscode.window.showErrorMessage('Account not found');
            return;
        }
        // Deactivate current account
        if (this.activeAccount) {
            this.activeAccount.isActive = false;
            this.database.saveAccount(this.activeAccount);
        }
        // Activate new account
        account.isActive = true;
        account.lastUsed = Date.now();
        account.updatedAt = Date.now();
        this.database.saveAccount(account);
        this.activeAccount = account;
        // Update configuration
        await vscode.workspace.getConfiguration('codeoba').update('activeAccount', accountId, vscode.ConfigurationTarget.Global);
        // Show notification
        vscode.window.showInformationMessage(`Switched to account: ${account.displayName}`);
        // Log event
        this.database.logEvent('account_switched', {
            accountId: accountId,
            displayName: account.displayName
        });
    }
    getActiveAccount() {
        return this.activeAccount;
    }
    getAllAccounts() {
        return this.database.getAllAccounts();
    }
    async autoSwitchByProject(projectPath) {
        const accounts = this.database.getAllAccounts();
        for (const account of accounts) {
            if (account.projects.includes(projectPath)) {
                await this.switchAccount(account.id);
                return;
            }
        }
    }
}
exports.AccountManager = AccountManager;
//# sourceMappingURL=AccountManager.js.map