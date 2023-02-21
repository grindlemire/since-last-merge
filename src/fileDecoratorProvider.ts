import * as vscode from 'vscode';

export class FileDecoratorProvider implements vscode.FileDecorationProvider {
    onDidChangeFileDecorations?: vscode.Event<vscode.Uri | vscode.Uri[] | undefined> | undefined;

    constructor(private context: vscode.ExtensionContext) {}

    provideFileDecoration(
        uri: vscode.Uri,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.FileDecoration> {
        console.log('URI: ' + uri.toString());
        //  todo: pass state so we know how to color the files
        //  todo: create icons to click to open the file
        if (uri.toString().endsWith('foobar')) {
            return new vscode.FileDecoration(
                '->',
                undefined,
                new vscode.ThemeColor('gitDecoration.addedResourceForeground')
            );
        }
        return null;
    }
}
