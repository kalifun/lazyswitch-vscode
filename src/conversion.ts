import * as vscode from 'vscode';
import * as path from 'path';
import { getJsonFromYaml } from './helpers';

type ConvertedFile = {
	oldFileUri: vscode.Uri;
	oldFileContent: Uint8Array;
	// newFileUri: vscode.Uri;
};

export enum ConvertFromType {
	Yaml = 'YAML',
	Json = 'JSON'
}

export class FileToGo {
    private convertFromType: ConvertFromType;
	constructor(convertFromType: ConvertFromType) {
		this.convertFromType = convertFromType;
	}


    public async readFile(files: vscode.Uri[]): Promise<void> {
		const convertFilePromises = files.map(this.transformAndConvertFile);
		const convertedFiles = await Promise.all(convertFilePromises);
    }


    private transformAndConvertFile = async (oldFileUri: vscode.Uri): Promise<ConvertedFile> => {
		const oldFileContent = await vscode.workspace.fs.readFile(oldFileUri);
		const oldFileExtension = path.extname(oldFileUri.fsPath);

        console.log(oldFileContent);
        console.log(oldFileContent.toString());
		// const newFileExtension = FileToGo.getNewFileExtension(this.convertFromType);
		// const newFilePath = oldFileUri.fsPath.replace(oldFileExtension, newFileExtension);
		// const newFileUri = vscode.Uri.file(newFilePath);
		const newFileContent = FileToGo.getFileConverter(this.convertFromType)(oldFileContent.toString());
        console.log(newFileContent);

		// await this.readFile(oldFileUri, newFileUri, newFileContent);

		return { oldFileUri, oldFileContent };
	};


    private static getFileConverter(convertFromType: ConvertFromType) {
		return {
			[ConvertFromType.Json]: getJsonFromYaml,
			[ConvertFromType.Yaml]: getJsonFromYaml
		}[convertFromType];
	}
}