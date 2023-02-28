import * as vscode from 'vscode';
import { Git } from './git';

export class GitFilesChangedProvider implements vscode.TreeDataProvider<string> {
    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = new vscode.EventEmitter<
        string | undefined
    >();
    readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event;

    private workspacePath: string = '';
    private git: Git;

    constructor(private context: vscode.ExtensionContext, git: Git) {
        this.git = git;
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
            let f = vscode.workspace.workspaceFolders[0].uri.fsPath;

            const message = `since-last-merge: folder: ${this.workspacePath}`;

            vscode.window.showInformationMessage(message);
        } else {
            const message = 'since-last-merge: Working folder not found, open a folder an try again';

            vscode.window.showInformationMessage(message);
        }

        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const diff = this.git.getDiff(element);
        var treeItem: vscode.TreeItem = new vscode.TreeItem(diff.name);
        treeItem.resourceUri = vscode.Uri.file(diff.path + '/.since-last-merge');
        treeItem.tooltip = diff.path;
        treeItem.id = diff.path;
        treeItem.command = {
            title: 'open file',
            command: 'vscode.open',
            arguments: [vscode.Uri.file(this.workspacePath + '/' + diff.path)],
        };
        return treeItem;
    }

    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        return this.git.getDiffs().map((diff) => diff.path);
    }

    getParent?(element: string): vscode.ProviderResult<string> {
        return null;
    }
    resolveTreeItem?(
        item: vscode.TreeItem,
        element: string,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TreeItem> {
        throw new Error('Method not implemented.');
    }
}
