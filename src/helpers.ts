import * as vscode from 'vscode';
import * as YAML from 'yaml';


export function getJsonFromYaml(yaml: string): string {
	try {
		const json = YAML.parse(yaml, {});
        console.log(json);
		return JSON.stringify(json, undefined, 2);
	} catch (error) {
		console.error(error);
		throw new Error('Failed to parse JSON. Please make sure it has a valid format and try again.');
	}
}