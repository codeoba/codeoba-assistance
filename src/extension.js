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
// New V2 Managers
const ContextDoctor_1 = require("./managers/ContextDoctor");
const ShadowMode_1 = require("./managers/ShadowMode");
const WorkflowMarketplace_1 = require("./managers/WorkflowMarketplace");
const TerminalManager_1 = require("./managers/TerminalManager");
const VoiceCommander_1 = require("./managers/VoiceCommander");

// New V3 "God Mode" Managers
const RepoReplicator_1 = require("./managers/RepoReplicator");
const IntentPredictor_1 = require("./managers/IntentPredictor");
const SelfHealer_1 = require("./managers/SelfHealer");

// New V4 "Transcendence" Managers
const SwarmOrchestrator_1 = require("./managers/SwarmOrchestrator");
const CodeDNA_1 = require("./managers/CodeDNA");
const ChronosDebugger_1 = require("./managers/ChronosDebugger");
const Oracle_1 = require("./managers/Oracle");

const StatusBar_1 = require("./ui/StatusBar");
const Logger_1 = require("./utils/Logger");
// Mock Database for quick setup
const database = {
    getAllAccounts: () => [],
    getAccount: () => null,
    saveAccount: () => { },
    saveQuotaHistory: () => { },
    logEvent: () => { }
};

let accountManager;
let quotaMonitor;
let profileManager;
let autoClickHandler;
let templateEngine;
let agentOrchestrator;
let autoRefresh;
let autoImport;
let contextDoctor;
let shadowMode;
let workflowMarketplace;
let terminalManager;
let voiceCommander;
let repoReplicator;
let intentPredictor;
let selfHealer;
let swarmOrchestrator;
let codeDNA;
let chronosDebugger;
let oracle;
let statusBarManager;
let logger;

async function activate(context) {
    logger = new Logger_1.Logger(context);
    logger.info('Codeoba Assistance: TRANSCENDENCE ACHIEVED (v4.0)');

    // Initialize managers
    accountManager = new AccountManager_1.AccountManager(context, database);
    quotaMonitor = new QuotaMonitor_1.QuotaMonitor(context, database);
    profileManager = new ProfileManager_1.ProfileManager(context, database);
    autoClickHandler = new AutoClickHandler_1.AutoClickHandler(context, database);
    templateEngine = new TemplateEngine_1.TemplateEngine(context, database);
    agentOrchestrator = new AgentOrchestrator_1.AgentOrchestrator(context, database);
    autoRefresh = new AutoRefresh_1.AutoRefresh(context);
    autoImport = new AutoImport_1.AutoImport(context);

    // V2 Initialization
    contextDoctor = new ContextDoctor_1.ContextDoctor(context, database);
    shadowMode = new ShadowMode_1.ShadowMode(context);
    workflowMarketplace = new WorkflowMarketplace_1.WorkflowMarketplace(context);
    terminalManager = new TerminalManager_1.TerminalManager(context);
    voiceCommander = new VoiceCommander_1.VoiceCommander(context);

    // V3 Initialization
    repoReplicator = new RepoReplicator_1.RepoReplicator(context);
    intentPredictor = new IntentPredictor_1.IntentPredictor(context);
    selfHealer = new SelfHealer_1.SelfHealer(context);

    // V4 Initialization
    swarmOrchestrator = new SwarmOrchestrator_1.SwarmOrchestrator(context);
    codeDNA = new CodeDNA_1.CodeDNA(context);
    chronosDebugger = new ChronosDebugger_1.ChronosDebugger(context);
    oracle = new Oracle_1.Oracle(context);

    statusBarManager = new StatusBar_1.StatusBarManager(context);

    // Start background services
    await startBackgroundServices();
    autoClickHandler.start();

    // Register commands
    registerCommands(context);

    // Initialize UI
    // await statusBarManager.initialize(accountManager, quotaMonitor);

    logger.info('Codeoba Assistance activated successfully');
}

function deactivate() {
    if (logger) {
        logger.info('Codeoba Assistance is deactivating...');
    }
    // Clean up resources
    if (autoRefresh) autoRefresh.stop();
    if (shadowMode) shadowMode.dispose();
    if (intentPredictor) intentPredictor.dispose();
}

async function startBackgroundServices() {
    const config = vscode.workspace.getConfiguration('codeoba');

    quotaMonitor.startMonitoring();
    if (config.get('autoRefresh.enabled', true)) {
        autoRefresh.start(60000);
    }
}

function registerCommands(context) {
    // V1 Commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.switchAccount', () => accountManager.showAccountPicker()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.showQuota', () => quotaMonitor.showQuotaDashboard()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.switchProfile', () => profileManager.showProfilePicker()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.manageTemplates', () => templateEngine.showTemplateLibrary()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.createWorkflow', () => agentOrchestrator.createWorkflowWizard()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.refreshQuota', () => quotaMonitor.refreshQuotaData()));

    // V2 Commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.openContextDoctor', () => contextDoctor.analyzeWorkspace()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.installWorkflow', () => workflowMarketplace.showMarketplace()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.fixLastError', () => terminalManager.fixLastError()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.voiceCommand', () => voiceCommander.listen()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.createBlueprint', () => agentOrchestrator.createWorkflowWizard())); // Reuse for now

    // V3 Commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.replicateRepo', () => repoReplicator.startReplication()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.selfHeal', () => selfHealer.healProject()));

    // V4 Commands
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.hiveMind', () => swarmOrchestrator.initiateHiveMind()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.extractDNA', () => codeDNA.extractDNA()));
    context.subscriptions.push(vscode.commands.registerCommand('codeoba.consultOracle', () => oracle.consultTheOracle()));
}