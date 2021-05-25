import * as YAML from 'yaml';
import * as vscode from 'vscode';

export function getJsonFromYaml(yaml: string): string {
	try {
		const json = YAML.parse(yaml, {});
		return JSON.stringify(json, undefined, 2);
	} catch (error) {
		console.error(error);
		vscode.window.showErrorMessage('Failed to parse JSON. Please make sure it has a valid format and try again.');
		throw new Error('Failed to parse JSON. Please make sure it has a valid format and try again.');
	}
}


export function getJsonFromJson(json:string): string {
	try {
		return JSON.stringify(json, undefined, 2);
	} catch (error) {
		console.error(error);
		vscode.window.showErrorMessage('Failed to parse JSON. Please make sure it has a valid format and try again.');
		throw new Error('Failed to parse JSON. Please make sure it has a valid format and try again.');
	}
}