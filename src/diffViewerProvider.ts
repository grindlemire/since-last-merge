import * as vscode from 'vscode';
import { getRemoteSrc } from './git';

export class DiffViewerProvider implements vscode.TextDocumentContentProvider {
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
        // todo: handle errors better (when it is local but not remote)
        // todo: refactor all the code
        // todo: make everything auto fetch and auto update
        console.log(`URI: ${uri.path}`);
        console.log(`${getRemoteSrc(uri.path, this.workspacePath)}`);
        return getRemoteSrc(uri.path, this.workspacePath);
    }

    provideOriginalResource(uri: vscode.Uri, cancellationToken: vscode.CancellationToken): vscode.Uri {
        const myuri = vscode.Uri.parse('diff-viewer-quick:' + uri.path.replace(this.workspacePath + '/', ''));
        console.log(`ORIGINAL RESOURCE IS ${myuri}`);
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
