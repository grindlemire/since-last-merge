import * as vscode from 'vscode';
import { Git } from './git';

export class FileDecoratorProvider implements vscode.FileDecorationProvider {
    onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined;

    private workspacePath: string = '';
    private git: Git;

    constructor(private context: vscode.ExtensionContext, git: Git) {
        this.git = git;
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }
    }

    provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> {

        // if (uri.scheme === "since-last-merge") {
            
        //     const diff = this.git.getDiff(uri.path);
        //     console.log(`DECORATING: ${uri.path} | ${diff.change}`);
        //     return new vscode.FileDecoration(this.git.changeToString(diff?.change), undefined, this.git.getColor(diff));
        // }
        if (uri.toString().endsWith('/.since-last-merge')) {
            const diff = this.git.getDiff(uri.path.substring(1, uri.path.indexOf('/.since-last-merge')));
            return new vscode.FileDecoration(this.git.changeToString(diff?.change), undefined, this.git.getColor(diff));
        }
        return null;
    }
}
