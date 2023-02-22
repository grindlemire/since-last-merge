import * as vscode from 'vscode';
import { getDiffs, getDiff } from './git';

export class GitFilesChangedProvider implements vscode.TreeDataProvider<string> {
    private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = new vscode.EventEmitter<
        string | undefined
    >();
    readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event;

    private workspacePath: string = '';

    constructor(private context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
            let f = vscode.workspace.workspaceFolders[0].uri.fsPath;

            const message = `git-file-list: folder: ${this.workspacePath}`;

            vscode.window.showInformationMessage(message);
        } else {
            const message = 'git-file-list: Working folder not found, open a folder an try again';

            vscode.window.showInformationMessage(message);
        }

        vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
            this._onDidChangeTreeData.fire(undefined);
        });
    }

    getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
        const diff = getDiff(this.workspacePath, element);
        var treeItem: vscode.TreeItem = new vscode.TreeItem(diff.name);
        treeItem.resourceUri = vscode.Uri.file(diff.path + '/.git-file-list');
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
        return getDiffs(this.workspacePath).map((diff) => diff.path);
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
