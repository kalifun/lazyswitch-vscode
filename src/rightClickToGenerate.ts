import * as vscode from 'vscode';
import { FileToGo } from './conversion';
import {ConvertFromType} from './conversion';

const jsonFileToGo = new FileToGo(ConvertFromType.Json);
const yamlFileToGo = new FileToGo(ConvertFromType.Yaml);

export async function rightClickYamlToGenerate(uri: vscode.Uri) {
    if (!uri) {
        uri = getActiveTextUri()
    }

    await yamlFileToGo.readFile([uri])

}


export async function rightClickJsonToGenerate(uri: vscode.Uri) {
    if (!uri) {
        uri = getActiveTextUri()
    }

    await jsonFileToGo.readFile([uri])

}

function getActiveTextUri() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error("Failed to get active text editor");
    }
    return editor.document.uri;
}