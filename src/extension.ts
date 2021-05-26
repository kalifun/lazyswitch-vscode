// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { rightClickJsonToGenerate, rightClickYamlToGenerate, rightClickJsonToYaml, rightClickYamlToJson, rightClickBeautifyJson } from './rightClickToGenerate';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "lazyswitch-vscode" is now active!');
	context.subscriptions.push(
		vscode.commands.registerCommand('lazyswitch-vscode.yamlgengo',rightClickYamlToGenerate),
		vscode.commands.registerCommand('lazyswitch-vscode.jsongengo',rightClickJsonToGenerate),
		vscode.commands.registerCommand('lazyswitch-vscode.jsontoyaml',rightClickJsonToYaml),
		vscode.commands.registerCommand('lazyswitch-vscode.yamltojson',rightClickYamlToJson),
		vscode.commands.registerTextEditorCommand('lazyswitch-vscode.beautifyjson', editor =>
		rightClickBeautifyJson(editor)
        ),
	);
}