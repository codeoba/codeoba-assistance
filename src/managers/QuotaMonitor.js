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
exports.QuotaMonitor = void 0;
const vscode = __importStar(require("vscode"));
class QuotaMonitor {
    constructor(context, database) {
        this.monitoringInterval = null;
        this.currentQuota = null;
        this.context = context;
        this.database = database;
    }
    startMonitoring() {
        const config = vscode.workspace.getConfiguration('codeoba');
        const intervalMs = config.get('quota.refreshInterval', 300000); // 5 minutes default
        this.monitoringInterval = setInterval(async () => {
            await this.refreshQuotaData();
        }, intervalMs);
        // Initial fetch
        this.refreshQuotaData();
    }
    stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
    }
    async refreshQuotaData() {
        try {
            // TODO: Implement actual API call to Google Antigravity
            // For now, using mock data
            const accountManager = this.context.workspaceState.get('accountManager');
            const activeAccount = accountManager?.getActiveAccount();
            // Mock quota data (replace with real API call)
            const mockQuotaInfo = {
                accountId: activeAccount?.id || 'mock-id',
                dailyLimit: 2000,
                dailyUsed: Math.floor(Math.random() * 1200),
                hourlyLimit: 100,
                hourlyUsed: Math.floor(Math.random() * 60),
                tokenLimit: 1000000,
                tokenUsed: Math.floor(Math.random() * 750000),
                estimatedCost: Math.random() * 20,
                resetTime: Date.now() + (24 * 60 * 60 * 1000),
                modelQuotas: [
                    {
                        modelName: 'Gemini 3 Pro',
                        requestsUsed: Math.floor(Math.random() * 50),
                        requestsLimit: 100,
                        cycleResetTime: Date.now() + (60 * 60 * 1000)
                    }
                ],
                lastUpdated: Date.now()
            };
            this.currentQuota = mockQuotaInfo;
            if (activeAccount) {
                // Save to database only if we have a real account
                this.database.saveQuotaHistory(mockQuotaInfo);
                // Log event
                this.database.logEvent('quota_refreshed', {
                    accountId: activeAccount.id,
                    dailyUsage: (mockQuotaInfo.dailyUsed / mockQuotaInfo.dailyLimit) * 100
                });
            }
            // Check thresholds
            await this.checkThresholds(mockQuotaInfo);
        }
        catch (error) {
            console.error('Error refreshing quota data:', error);
            // Don't show error message every interval if it fails
        }
    }
    async checkThresholds(quotaInfo) {
        const config = vscode.workspace.getConfiguration('codeoba');
        const threshold = config.get('quota.alertThreshold', 80);
        const showAlerts = config.get('notifications.showQuotaAlerts', true);
        if (!showAlerts) {
            return;
        }
        const dailyUsagePercent = (quotaInfo.dailyUsed / quotaInfo.dailyLimit) * 100;
        if (dailyUsagePercent >= 95) {
            vscode.window.showErrorMessage(`⚠️ Critical: Daily quota at ${dailyUsagePercent.toFixed(0)}%! You may be rate limited soon.`, 'View Details').then(selection => {
                if (selection === 'View Details') {
                    this.showQuotaDashboard();
                }
            });
        }
        else if (dailyUsagePercent >= threshold) {
            vscode.window.showWarningMessage(`⚠️ Warning: Daily quota at ${dailyUsagePercent.toFixed(0)}%`, 'View Details').then(selection => {
                if (selection === 'View Details') {
                    this.showQuotaDashboard();
                }
            });
        }
    }
    async showQuotaDashboard() {
        const panel = vscode.window.createWebviewPanel('codeobaQuota', 'Quota Dashboard', vscode.ViewColumn.One, {
            enableScripts: true
        });
        panel.webview.html = this.getQuotaDashboardHtml();
        // Handle messages from the webview
        panel.webview.onDidReceiveMessage(message => {
            switch (message.command) {
                case 'refreshQuota':
                    this.refreshQuotaData();
                    // In a real app we'd post a message back to update the UI
                    // For now, reload the html
                    panel.webview.html = this.getQuotaDashboardHtml();
                    return;
            }
        }, undefined, this.context.subscriptions);
    }
    getQuotaDashboardHtml() {
        const quota = this.currentQuota;
        if (!quota) {
            return '<html><body><h1>No quota data available. Please try refreshing.</h1></body></html>';
        }
        const dailyPercent = ((quota.dailyUsed / quota.dailyLimit) * 100).toFixed(1);
        const hourlyPercent = ((quota.hourlyUsed / quota.hourlyLimit) * 100).toFixed(1);
        const tokenPercent = ((quota.tokenUsed / quota.tokenLimit) * 100).toFixed(1);
        return `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
          }
          .meter {
            width: 100%;
            height: 30px;
            background-color: var(--vscode-input-background);
            border-radius: 5px;
            overflow: hidden;
            margin: 10px 0;
          }
          .meter-fill {
            height: 100%;
            transition: width 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }
          .meter-green { background-color: #4CAF50; }
          .meter-yellow { background-color: #FFC107; }
          .meter-orange { background-color: #FF9800; }
          .meter-red { background-color: #F44336; }
          .section {
            margin: 30px 0;
            padding: 20px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 8px;
          }
          h1 { color: var(--vscode-editor-foreground); }
          h2 { color: var(--vscode-editor-foreground); margin-top: 0; }
          .stat {
            display: flex;
            justify-content: space-between;
            margin: 10px 0;
          }
          .refresh-btn {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
          }
          .refresh-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
          }
        </style>
      </head>
      <body>
        <h1>📊 Quota Dashboard</h1>
        
        <button class="refresh-btn" onclick="refreshQuota()">🔄 Refresh Data</button>

        <div class="section">
          <h2>Daily Usage</h2>
          <div class="stat">
            <span>Used:</span>
            <strong>${quota.dailyUsed} / ${quota.dailyLimit} requests</strong>
          </div>
          <div class="meter">
            <div class="meter-fill ${this.getMeterColor(parseFloat(dailyPercent))}" 
                 style="width: ${dailyPercent}%">
              ${dailyPercent}%
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Hourly Usage</h2>
          <div class="stat">
            <span>Used:</span>
            <strong>${quota.hourlyUsed} / ${quota.hourlyLimit} requests</strong>
          </div>
          <div class="meter">
            <div class="meter-fill ${this.getMeterColor(parseFloat(hourlyPercent))}" 
                 style="width: ${hourlyPercent}%">
              ${hourlyPercent}%
            </div>
          </div>
        </div>

        <div class="section">
          <h2>Token Usage</h2>
          <div class="stat">
            <span>Used:</span>
            <strong>${quota.tokenUsed.toLocaleString()} / ${quota.tokenLimit.toLocaleString()} tokens</strong>
          </div>
          <div class="meter">
            <div class="meter-fill ${this.getMeterColor(parseFloat(tokenPercent))}" 
                 style="width: ${tokenPercent}%">
              ${tokenPercent}%
            </div>
          </div>
        </div>

        <div class="section">
          <h2>💰 Estimated Cost</h2>
          <div class="stat">
            <span>Today:</span>
            <strong>$${quota.estimatedCost.toFixed(2)} USD</strong>
          </div>
        </div>

        <div class="section">
          <h2>Model-Specific Quotas</h2>
          ${quota.modelQuotas.map(model => `
            <div style="margin: 15px 0;">
              <strong>${model.modelName}</strong>
              <div class="stat">
                <span>Used:</span>
                <strong>${model.requestsUsed} / ${model.requestsLimit} requests</strong>
              </div>
              <div class="meter">
                <div class="meter-fill ${this.getMeterColor((model.requestsUsed / model.requestsLimit) * 100)}" 
                     style="width: ${(model.requestsUsed / model.requestsLimit) * 100}%">
                  ${((model.requestsUsed / model.requestsLimit) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
          `).join('')}
        </div>

        <script>
          const vscode = acquireVsCodeApi();
          function refreshQuota() {
            vscode.postMessage({ command: 'refreshQuota' });
          }
        </script>
      </body>
      </html>
    `;
    }
    getMeterColor(percent) {
        if (percent < 60) {
            return 'meter-green';
        }
        if (percent < 80) {
            return 'meter-yellow';
        }
        if (percent < 95) {
            return 'meter-orange';
        }
        return 'meter-red';
    }
    getCurrentQuota() {
        return this.currentQuota;
    }
}
exports.QuotaMonitor = QuotaMonitor;
//# sourceMappingURL=QuotaMonitor.js.map