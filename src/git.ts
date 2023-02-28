import { execSync, spawnSync } from 'child_process';
import * as vscode from 'vscode';

export enum Change {
    unkown,
    add,
    modify,
    delete,
    untracked,
}

export interface Diff {
    name: string;
    path: string;
    change: Change;
}

export class Git {
    private workspacePath: string = '';
    private remoteBranch: string = 'main';
    private remoteName: string = 'origin';

    constructor(private context: vscode.ExtensionContext) {
        if (vscode.workspace.workspaceFolders !== undefined) {
            this.workspacePath = vscode.workspace.workspaceFolders[0].uri.path;
        }

        const remoteBranch: string = vscode.workspace.getConfiguration('SinceLastMerge').get('remoteBranch') || 'main';
        const remoteName: string = vscode.workspace.getConfiguration('SinceLastMerge').get('remoteName') || 'origin';
        this.remoteName = remoteName;
        this.remoteBranch = remoteBranch;
        vscode.workspace.onDidChangeConfiguration((e: any) => {
            const remoteBranch: string =
                vscode.workspace.getConfiguration('SinceLastMerge').get('remoteBranch') || 'main';
            const remoteName: string =
                vscode.workspace.getConfiguration('SinceLastMerge').get('remoteName') || 'origin';

            if (!this.checkRemote(remoteName, remoteBranch)) {
                vscode.window.showErrorMessage(
                    `Invalid remote branch for since last merge extension: ${remoteName + '/' + remoteBranch}
                    (Does it exist in your configured remote repo?)`
                );
                return;
            }
            this.remoteName = remoteName;
            this.remoteBranch = remoteBranch;
        });
    }

    toChange(str: string): Change {
        switch (str.trim().toUpperCase()) {
            case 'M':
                return Change.modify;
            case 'D':
                return Change.delete;
            case 'A':
                return Change.add;
            default:
                return Change.unkown;
        }
    }

    changeToString(e: Change | undefined): string {
        if (e === undefined) {
            return '';
        }

        switch (e) {
            case Change.modify:
                return 'M';
            case Change.delete:
                return 'D';
            case Change.add:
                return 'A';
            case Change.untracked:
                return 'U';
            default:
                return '';
        }
    }

    getRemoteSrc(path: string): string {
        var spawn = spawnSync('git', ['show', `${this.remoteName}/${this.remoteBranch}:${path}`], {
            cwd: this.workspacePath,
            encoding: 'utf-8',
        });
        var errorText = spawn.stderr.toString().trim();

        if (errorText) {
            if (errorText.indexOf('exists on disk, but not in')) {
                console.log('does not exist in remote');
                return '';
            }
            console.error(`ERROR: ${errorText}`);
            throw new Error(errorText);
        } else {
            return spawn.stdout.toString().trim();
        }
    }

    checkRemote(name: string, branch: string) {
        var spawn = spawnSync('git', ['branch', '-a'], {
            cwd: this.workspacePath,
            encoding: 'utf-8',
        });
        const output = spawn.stdout.toString().trim();
        return output.indexOf(`${name}/${branch}`) > 0;
    }

    getDiffs(): Diff[] {
        const diffs = execSync(`git diff --name-status ${this.remoteName}/${this.remoteBranch}`, {
            cwd: this.workspacePath,
            encoding: 'utf-8',
        })
            .split('\n')
            .filter((line) => line.trim() !== '')
            .map((line) => {
                const [modifyStr, filename] = line.split(/\s+/);
                return {
                    name: filename.trim().substring(filename.lastIndexOf('/') + 1, filename.length),
                    path: filename.trim(),
                    change: this.toChange(modifyStr),
                };
            });

        const untracked = execSync(`git ls-files --others --exclude-standard`, {
            cwd: this.workspacePath,
            encoding: 'utf-8',
        })
            .split('\n')
            .map((line) => {
                return {
                    name: line.trim().substring(line.lastIndexOf('/') + 1, line.length),
                    path: line,
                    change: Change.untracked,
                };
            });

        return diffs.concat(untracked);
    }

    getDiff(filepath: string): Diff {
        const filtered = this.getDiffs().filter((diff) => diff.path == filepath);
        return filtered[0];
    }

    getColor(diff: Diff | undefined): vscode.ThemeColor | undefined {
        if (diff === undefined) {
            return undefined;
        }

        switch (diff.change) {
            case Change.add:
                return new vscode.ThemeColor('gitDecoration.addedResourceForeground');
            case Change.modify:
                return new vscode.ThemeColor('gitDecoration.modifiedResourceForeground');
            case Change.delete:
                return new vscode.ThemeColor('gitDecoration.stageDeletedResourceForeground');
            case Change.untracked:
                return new vscode.ThemeColor('gitDecoration.untrackedResourceForeground');
            default:
                return undefined;
        }
    }
}
