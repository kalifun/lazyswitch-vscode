import * as vscode from 'vscode';
import { PreprocessingFile } from './conversion';
import {ConvertFromType,ConversionType} from './conversion';

const jsonFileToGo = new PreprocessingFile(ConvertFromType.Json);
const yamlFileToGo = new PreprocessingFile(ConvertFromType.Yaml);
const jsonFileToYaml = new PreprocessingFile(ConvertFromType.Json);
const yamlFileToJson = new PreprocessingFile(ConvertFromType.Yaml);

export async function rightClickYamlToGenerate(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri();
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }

    await yamlFileToGo.FileTypeConversion(uri,ConversionType.YamlOrJsonToCode);

}


export async function rightClickJsonToGenerate(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri()
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }else{
        await jsonFileToGo.FileTypeConversion(uri,ConversionType.YamlOrJsonToCode);
    }
}

export async function rightClickJsonToYaml(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri()
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }else{
        console.log(uri);
        await jsonFileToYaml.FileTypeConversion(uri,ConversionType.JsonToYaml);
    }
}

export async function rightClickYamlToJson(uri: vscode.Uri) {
    if (!uri) {
        // uri = getActiveTextUri()
        vscode.window.showWarningMessage("Cannot get the user-provided path");
    }else{
        console.log(uri);
        await yamlFileToJson.FileTypeConversion(uri,ConversionType.YamlToJson);
    }
}

function getActiveTextUri() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        throw new Error("Failed to get active text editor");
    }
    return editor.document.uri;
}