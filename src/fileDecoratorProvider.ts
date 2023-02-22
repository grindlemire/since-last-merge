import * as vscode from 'vscode';
import { getDiff, getColor, changeToString } from './git';

export class FileDecoratorProvider implements vscode.FileDecorationProvider {
    onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined;

    private workspacePath: string = '';

    constructor(private context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }
    }

    provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> {
        if (uri.toString().endsWith('/.git-file-list')) {
            const diff = getDiff(this.workspacePath, uri.path.substring(1, uri.path.indexOf('/.git-file-list')));
            return new vscode.FileDecoration(changeToString(diff?.change), undefined, getColor(diff));
        }
        return null;
    }
}
