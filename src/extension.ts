// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitFilesChangedProvider } from './gitFilesChangedProvider';
import { FileDecoratorProvider } from './fileDecoratorProvider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    vscode.commands.registerCommand('git-file-list.open', (path) => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const workspace = vscode.workspace.workspaceFolders[0].uri;
            const fileURI = vscode.Uri.file(workspace.path + '/' + path);
            // TODO: figure out how to do git diffs here
            vscode.commands.executeCommand('vscode.diff', fileURI, fileURI);
        }
    });

    const gitFilesChangedProvider = new GitFilesChangedProvider(context);
    vscode.window.registerTreeDataProvider('git-files-changed', gitFilesChangedProvider);

    const fileDecoratorProvider = new FileDecoratorProvider(context);
    vscode.window.registerFileDecorationProvider(fileDecoratorProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
