import { execSync, spawnSync } from 'child_process';
import * as vscode from 'vscode';

export enum Change {
    unkown,
    add,
    modify,
    delete,
    untracked,
}

export const toChange = (str: string): Change => {
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
};

export const changeToString = (e: Change | undefined): string => {
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
};

export interface Diff {
    name: string;
    path: string;
    change: Change;
}

export const getRemoteSrc = (path: string, workspace: string): string => {
    var spawn = spawnSync('git', ['show', `origin/master:${path}`], { cwd: workspace, encoding: 'utf-8' });
    var errorText = spawn.stderr.toString().trim();

    if (errorText) {
        if (errorText.indexOf('exists on disk, but not in')) {
            return '';
        }
        throw new Error(errorText);
    } else {
        return spawn.stdout.toString().trim();
    }
};

export const getDiffs = (workspace: string): Diff[] => {
    const diffs = execSync(`git diff --name-status master`, { cwd: workspace, encoding: 'utf-8' })
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => {
            const [modifyStr, filename] = line.split(/\s+/);
            return {
                name: filename.trim().substring(filename.lastIndexOf('/') + 1, filename.length),
                path: filename.trim(),
                change: toChange(modifyStr),
            };
        });

    const untracked = execSync(`git ls-files --others --exclude-standard`, { cwd: workspace, encoding: 'utf-8' })
        .split('\n')
        .map((line) => {
            return {
                name: line.trim().substring(line.lastIndexOf('/') + 1, line.length),
                path: line,
                change: Change.untracked,
            };
        });

    return diffs.concat(untracked);
};

export const getDiff = (workspace: string, filepath: string): Diff => {
    const filtered = getDiffs(workspace).filter((diff) => diff.path == filepath);
    return filtered[0];
};

export const getColor = (diff: Diff | undefined): vscode.ThemeColor | undefined => {
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
};
