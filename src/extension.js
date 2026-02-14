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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const AccountManager_1 = require("./managers/AccountManager");
const QuotaMonitor_1 = require("./managers/QuotaMonitor");
const ProfileManager_1 = require("./managers/ProfileManager");
const AutoClickHandler_1 = require("./managers/AutoClickHandler");
const TemplateEngine_1 = require("./managers/TemplateEngine");
const AgentOrchestrator_1 = require("./managers/AgentOrchestrator");
const AutoRefresh_1 = require("./managers/AutoRefresh");
const AutoImport_1 = require("./managers/AutoImport");
const StatusBar_1 = require("./ui/StatusBar");
const Database_1 = require("./storage/Database");
const Logger_1 = require("./utils/Logger");
let accountManager;
let quotaMonitor;
let profileManager;
let autoClickHandler;
let templateEngine;
let agentOrchestrator;
let autoRefresh;
let autoImport;
let statusBarManager;
let database;
let logger;
async function activate(context) {
    logger = new Logger_1.Logger(context);
    logger.info('Codeoba Assistance is now active!');
    // Initialize database
    database = new Database_1.DatabaseManager(context);
    await database.initialize();
    // Initialize managers
    accountManager = new AccountManager_1.AccountManager(context, database);
    quotaMonitor = new QuotaMonitor_1.QuotaMonitor(context, database);
    profileManager = new ProfileManager_1.ProfileManager(context, database);
    autoClickHandler = new AutoClickHandler_1.AutoClickHandler(context, database);
    templateEngine = new TemplateEngine_1.TemplateEngine(context, database);
    agentOrchestrator = new AgentOrchestrator_1.AgentOrchestrator(context, database);
    autoRefresh = new AutoRefresh_1.AutoRefresh(context);
    autoImport = new AutoImport_1.AutoImport(context);
    statusBarManager = new StatusBar_1.StatusBarManager(context);
    // Start background services
    await startBackgroundServices();
    // Register commands
    registerCommands(context);
    // Initialize UI
    await statusBarManager.initialize(accountManager, quotaMonitor);
    // Show welcome message
    const hasSeenWelcome = context.globalState.get('hasSeenWelcome', false);
    if (!hasSeenWelcome) {
        showWelcomeMessage(context);
    }
    logger.info('Codeoba Assistance activated successfully');
}
function deactivate() {
    if (logger) {
        logger.info('Codeoba Assistance is deactivating...');
    }
    // Clean up resources
    if (autoRefresh) {
        autoRefresh.stop();
    }
    if (database) {
        database.close();
    }
    if (logger) {
        logger.info('Codeoba Assistance deactivated');
    }
}
async function startBackgroundServices() {
    // Start auto-refresh service
    const config = vscode.workspace.getConfiguration('codeoba');
    if (config.get('autoRefresh.enabled', true)) {
        const interval = config.get('autoRefresh.intervalMs', 10000);
        if (interval) {
            autoRefresh.start(interval);
        }
    }
    // Start quota monitoring
    quotaMonitor.startMonitoring();
    // Initialize auto-click handler
    if (config.get('autoClick.enabled', true)) {
        autoClickHandler.start();
    }
}
function registerCommands(context) {
    // Account commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.switchAccount', async () => {
        await accountManager.showAccountPicker();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.addAccount', async () => {
        await accountManager.addAccountWizard();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.removeAccount', async () => {
        await accountManager.removeAccountWizard();
    }));
    // Quota commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.showQuota', async () => {
        await quotaMonitor.showQuotaDashboard();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.refreshQuota', async () => {
        await quotaMonitor.refreshQuotaData();
    }));
    // Profile commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.switchProfile', async () => {
        await profileManager.showProfilePicker();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.exportProfile', async () => {
        await profileManager.exportProfile();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.importProfile', async () => {
        await profileManager.importProfile();
    }));
    // Auto-click commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.configureAutoClick', async () => {
        await autoClickHandler.showConfigurationPanel();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.viewAutoClickHistory', async () => {
        await autoClickHandler.showHistoryPanel();
    }));
    // Template commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.manageTemplates', async () => {
        await templateEngine.showTemplateLibrary();
    }));
    // Workflow commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.createWorkflow', async () => {
        await agentOrchestrator.createWorkflowWizard();
    }));
    // Settings command
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.showSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'codeoba');
    }));
}
function showWelcomeMessage(context) {
    const message = 'Welcome to Codeoba Assistance! 🚀 Would you like a quick tour?';
    vscode.window.showInformationMessage(message, 'Take Tour', 'Maybe Later', "Don't Show Again")
        .then(selection => {
        if (selection === 'Take Tour') {
            // Show walkthrough
            vscode.commands.executeCommand('workbench.action.openWalkthrough', 'MohamedMgaza.codeoba-assistance#codeoba.welcome');
        }
        else if (selection === "Don't Show Again") {
            context.globalState.update('hasSeenWelcome', true);
        }
    });
}
//# sourceMappingURL=extension.js.map