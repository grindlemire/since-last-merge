import * as vscode from 'vscode';
import { GitFilesChangedProvider } from './gitFilesChangedProvider';
import { FileDecoratorProvider } from './fileDecoratorProvider';
import { DiffViewerProvider, EmptyViewerProvider } from './diffViewerProvider';
import { Change, Git } from './git';

// todo: handle errors better (when it is local but not remote)
// todo: refactor all the code
// todo: make everything auto fetch and auto update
export function activate(context: vscode.ExtensionContext) {
    const git = new Git(context);

    const diffViewerProvider = new DiffViewerProvider(context, git);
    vscode.workspace.registerTextDocumentContentProvider('diff-viewer', diffViewerProvider);
    vscode.workspace.registerTextDocumentContentProvider('diff-viewer-quick', diffViewerProvider);

    const emptyViewerProvider = new EmptyViewerProvider(context);
    vscode.workspace.registerTextDocumentContentProvider('empty-viewer', emptyViewerProvider);

    const gitFilesChangedProvider = new GitFilesChangedProvider(context, git);
    vscode.window.registerTreeDataProvider('git-files-changed', gitFilesChangedProvider);

    const fileDecoratorProvider = new FileDecoratorProvider(context, git);
    vscode.window.registerFileDecorationProvider(fileDecoratorProvider);

    vscode.commands.registerCommand('since-last-merge.open', (path) => {
        if (vscode.workspace.workspaceFolders !== undefined) {
            const workspace = vscode.workspace.workspaceFolders[0].uri;
            let fileURI = vscode.Uri.file(workspace.path + '/' + path);
            if (git.getDiff(path).change === Change.delete) {
                fileURI = vscode.Uri.parse(`empty-viewer:empty`);
            }
            const diffURI = vscode.Uri.parse(`diff-viewer:${path}`);
            vscode.commands.executeCommand('vscode.diff', diffURI, fileURI, 'remote ⇔ local');
        }
    });

    const myscm = vscode.scm.createSourceControl('since-last-merge', 'since-merge');
    myscm.quickDiffProvider = diffViewerProvider;
    myscm.inputBox.visible = false;
    myscm.inputBox.enabled = false;
}

// This method is called when your extension is deactivated
export function deactivate() {}
