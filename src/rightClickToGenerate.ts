import * as vscode from 'vscode';
import { PreprocessingFile } from './conversion';
import {ConvertFromType} from './conversion';

const jsonFileToGo = new PreprocessingFile(ConvertFromType.Json);
const yamlFileToGo = new PreprocessingFile(ConvertFromType.Yaml);

export async function rightClickYamlToGenerate(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri();
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }

    await yamlFileToGo.GetDataInfo(uri);

}


export async function rightClickJsonToGenerate(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri()
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }else{
        await jsonFileToGo.GetDataInfo(uri);
    }
}

function getActiveTextUri() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error("Failed to get active text editor");
    }
    return editor.document.uri;
}