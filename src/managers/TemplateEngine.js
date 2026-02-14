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
exports.TemplateEngine = void 0;
const vscode = __importStar(require("vscode"));

class TemplateEngine {
    constructor(context, database) {
        this.context = context;
        this.database = database;
        this.templates = [
            {
                label: 'React Functional Component',
                content: `import React from 'react';

export const NewComponent = () => {
    return (
        <div>
            NewComponent
        </div>
    );
};`
            },
            {
                label: 'HTML5 Boilerplate',
                content: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>
<body>
    
</body>
</html>`
            },
            {
                label: 'Python Script Header',
                content: `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on ${new Date().toLocaleDateString()}
@author: User
"""

import os
import sys

def main():
    pass

if __name__ == "__main__":
    main()`
            },
            {
                label: 'Express.js Server',
                content: `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(\`Example app listening at http://localhost:\${port}\`);
});`
            }
        ];
    }

    async showTemplateLibrary() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('Please open a file to insert a template.');
            return;
        }

        const selected = await vscode.window.showQuickPick(this.templates, {
            placeHolder: 'Select a template to insert'
        });

        if (selected) {
            editor.edit(editBuilder => {
                editBuilder.insert(editor.selection.active, selected.content);
            });
            vscode.window.showInformationMessage(`Inserted template: ${selected.label}`);
        }
    }
}
exports.TemplateEngine = TemplateEngine;