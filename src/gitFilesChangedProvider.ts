import { execSync } from 'child_process';
import * as vscode from 'vscode';

// interface ScmCommandOptions {
//     repository?: boolean;
//     diff?: boolean;
// }
// interface ScmCommand {
// 	commandId: string;
// 	key: string;
// 	method: Function;
// 	options: ScmCommandOptions;
// }
// const Commands: ScmCommand[] = [];

// function command(commandId: string, options: ScmCommandOptions = {}): Function {
//     return (_target: any, key: string, descriptor: any) => {
//         if (!(typeof descriptor.value === 'function')) {
//             throw new Error('not supported');
//         }

//         Commands.push({ commandId, key, method: descriptor.value, options });
//     };
// }

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
        var treeItem: vscode.TreeItem = new vscode.TreeItem(element);
        treeItem.resourceUri = vscode.Uri.file(element + '/foobar');
        return treeItem;
    }
    getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
        const child = execSync(`git diff --name-only master`, { cwd: this.workspacePath });
        return child.toString().split('\n');
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
