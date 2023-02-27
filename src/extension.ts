// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GitFilesChangedProvider } from './gitFilesChangedProvider';
import { FileDecoratorProvider } from './fileDecoratorProvider';
import { DiffViewerProvider, EmptyViewerProvider } from './diffViewerProvider';
import { Change, getDiff } from './git';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const diffViewerProvider = new DiffViewerProvider(context);
    vscode.workspace.registerTextDocumentContentProvider('diff-viewer', diffViewerProvider);
    vscode.workspace.registerTextDocumentContentProvider('diff-viewer-quick', diffViewerProvider);

    const emptyViewerProvider = new EmptyViewerProvider(context);
    vscode.workspace.registerTextDocumentContentProvider('empty-viewer', emptyViewerProvider);

    const gitFilesChangedProvider = new GitFilesChangedProvider(context);
    vscode.window.registerTreeDataProvider('git-files-changed', gitFilesChangedProvider);

    const fileDecoratorProvider = new FileDecoratorProvider(context);
    vscode.window.registerFileDecorationProvider(fileDecoratorProvider);

    vscode.commands.registerCommand('git-file-list.open', (path) => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const workspace = vscode.workspace.workspaceFolders[0].uri;
            let fileURI = vscode.Uri.file(workspace.path + '/' + path);
            if (getDiff(workspace.path, path).change === Change.delete) {
                fileURI = vscode.Uri.parse(`empty-viewer:empty`);
            }
            const diffURI = vscode.Uri.parse(`diff-viewer:${path}`);
            vscode.commands.executeCommand('vscode.diff', diffURI, fileURI, 'remote ⇔ local');
        }
    });

    const myscm = vscode.scm.createSourceControl('my-scm-control', 'joelgit');
    myscm.quickDiffProvider = diffViewerProvider;
}

// This method is called when your extension is deactivated
export function deactivate() {}
