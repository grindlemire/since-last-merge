import * as vscode from 'vscode';
import { Git } from './git';

export class DiffViewerProvider implements vscode.TextDocumentContentProvider, vscode.QuickDiffProvider {
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private workspacePath: string = '';
    private git: Git;

    constructor(private context: vscode.ExtensionContext, git: Git) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }
        this.git = git;
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return this.git.getRemoteSrc(uri.path);
    }

    provideOriginalResource(uri: vscode.Uri, cancellationToken: vscode.CancellationToken): vscode.Uri {
        const myuri = vscode.Uri.parse('diff-viewer-quick:' + uri.path.replace(this.workspacePath + '/', ''));
        return myuri;
    }
}

export class EmptyViewerProvider implements vscode.TextDocumentContentProvider {
    // emitter and its event
    onDidChangeEmitter = new vscode.EventEmitter<vscode.Uri>();
    onDidChange = this.onDidChangeEmitter.event;

    private workspacePath: string = '';

    constructor(private context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }
    }

    provideTextDocumentContent(uri: vscode.Uri): string {
        return '';
    }
}
