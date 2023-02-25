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
        // todo: get gutter colors working
        // todo: refactor all the code
        return getRemoteSrc(uri.path, this.workspacePath);
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
