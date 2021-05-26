/* eslint-disable @typescript-eslint/naming-convention */
import * as path from 'path';
import * as YAML from 'yaml';
import * as vscode from 'vscode';
import { getJsonFromYaml,getJsonFromJson } from './helpers';
import {
    quicktype,
    languageNamed,
    SerializedRenderResult,
    defaultTargetLanguages,
    JSONSchemaInput,
    InputData,
    TargetLanguage,
    jsonInputForTargetLanguage,
    RendererOptions,
    Options,
    inferenceFlagNames,
	GoTargetLanguage,
} from "quicktype-core";
import { YAMLError } from 'yaml/util';

type ConvertedFile = {
	oldFileUri: vscode.Uri;
	oldFileContent: Uint8Array;
	// newFileUri: vscode.Uri;
};

const GenFileSuffix = ".go";

export enum ConvertFromType {
	Yaml = 'YAML',
	Json = 'JSON'
};

type TargetLanguagePick = {
    cancelled: boolean;
    lang: TargetLanguage;
};


export enum ConversionType {
    JsonToYaml = 1,
    YamlToJson = 2,
    YamlOrJsonToCode = 3,
}


enum ConversionTypeSuffix {
    JsonToYaml = ".yaml",
    YamlToJson = ".json"
}

async function getTargetLanguage(): Promise<TargetLanguagePick> {
    return {cancelled: false, lang: languageNamed("go")!};
}

export class PreprocessingFile {
	private convertFromType: ConvertFromType;
	constructor(convertFromType: ConvertFromType) {
		this.convertFromType = convertFromType;
	}

    public async FileTypeConversion(uri: vscode.Uri, option: ConversionType) {
        const oldFileContent = await vscode.workspace.fs.readFile(uri);
        const oldFileExtension = path.extname(uri.fsPath);
        if (oldFileExtension !== ".json" && oldFileExtension !== ".yaml") {
			vscode.window.showWarningMessage("Please select JSON, YAML files!");
			return;
		}
        const workerSpace = path.dirname(uri.fsPath);
		let splitPath = workerSpace.split(path.sep);
		let currentPath = splitPath[splitPath.length-1];
		let fileName: string;
		const fn = await GenerateFileName();
		if (fn.cancelled) {
            vscode.window.showWarningMessage("Cancelled generation!");
			return;
		}		
		fileName = fn.name.replace(" ","");
        if (fileName === "" || fileName === undefined || fileName === null) {
            vscode.window.showWarningMessage("Please enter the correct file name!");
			return;
        }
        let fileData: string;
        let extra: string = "";
        fileData = this.readFile(oldFileContent.toString());
        let newFilePath = workerSpace;
        
        switch (option) {
            case ConversionType.JsonToYaml:
                let t = JSON.parse(fileData);
                const doc = new YAML.Document();
                doc.contents = t;
                fileData = doc.toString();
                newFilePath += path.format({root: path.sep,name: fileName,ext: ConversionTypeSuffix.JsonToYaml});
                break;
            case ConversionType.YamlToJson:
                newFilePath += path.format({root: path.sep,name: fileName,ext: ConversionTypeSuffix.YamlToJson});
                break;
            case ConversionType.YamlOrJsonToCode:
                newFilePath += path.format({root: path.sep,name: fileName,ext: GenFileSuffix});
                const language = await getTargetLanguage();
                let result: SerializedRenderResult;
                let indentation: string;
                indentation = "\t";
                try {
                    result = await runQuicktype(fileData, "json", language.lang, fileName.toUpperCase(), false, indentation, []);
                }catch (e) {
                    vscode.window.showErrorMessage(e.toString());
                    return;
                }
                fileData = result.lines.join("\n");
                extra = "package "+ currentPath + "\n\n";
                break;
            default:
                vscode.window.showErrorMessage("The selected mode is wrong!");
                return;
        }
        var setting: vscode.Uri = vscode.Uri.parse("untitled:" + newFilePath);
        this.CreateNewFile(setting,fileData,extra);
    }

	private readFile(file: string): string {
		let fileData: any;
		let tempData: string;
		switch (this.convertFromType) {
			case 'YAML':
				tempData = getJsonFromYaml(file);
				// console.log(tempData);
				fileData = tempData;
				break;
			case 'JSON':
				tempData = getJsonFromJson(file);
				fileData = JSON.parse(tempData);
			default:
				break;
		}
		return fileData.toString();
	}

    private CreateNewFile(uri: vscode.Uri,context: string,extension: string) {
        vscode.workspace.openTextDocument(uri).then((a: vscode.TextDocument) => {
			vscode.window.showTextDocument(a, 1, false).then(e => {
				e.edit(edit => {
					edit.insert(new vscode.Position(0, 0), extension + context);
				});
			});
		}, (error: any) => {
			console.error(error);
			// debugger;
			vscode.window.showErrorMessage(error.toString());
			return;
		});
    }

}

type InputKind = "json" | "schema" | "typescript";

const configurationSection = "quicktype";

async function runQuicktype(
    content: string,
    kind: InputKind,
    lang: TargetLanguage,
    topLevelName: string,
    forceJustTypes: boolean,
    indentation: string | undefined,
    additionalLeadingComments: string[]
): Promise<SerializedRenderResult> {
    // 获取一个工作区配置对象。
    const configuration = vscode.workspace.getConfiguration(configurationSection);
    const justTypes = forceJustTypes || configuration.justTypes;

    const rendererOptions: RendererOptions = {};
    if (justTypes) {
        // FIXME: The target language should have a property to return these options.
        if (lang.name === "csharp") {
            rendererOptions["features"] = "just-types";
        } else if (lang.name === "kotlin") {
            rendererOptions["framework"] = "just-types";
        } else {
            rendererOptions["just-types"] = "true";
        }
    }

    const inputData = new InputData();
    switch (kind) {
        case "json":
            await inputData.addSource("json", { name: topLevelName, samples: [content] }, () =>
                jsonInputForTargetLanguage(lang)
            );
            break;
        case "schema":
            await inputData.addSource(
                "schema",
                { name: topLevelName, schema: content },
                () => new JSONSchemaInput(undefined)
            );
            break;
        case "typescript":
            // await inputData.addSource(
            //     "schema",
            //     schemaForTypeScriptSources({
            //         [`${topLevelName}.ts`]: content
            //     }),
            //     () => new JSONSchemaInput(undefined)
            // );
            break;
        default:
            throw new Error(`Unrecognized input format: ${kind}`);
    }

    const options: Partial<Options> = {
        lang: lang,
        inputData,
        leadingComments: ["Generated by https://quicktype.io"].concat(additionalLeadingComments),
        rendererOptions,
        indentation,
        inferMaps: configuration.inferMaps,
        inferEnums: configuration.inferEnums,
        inferDateTimes: configuration.inferDateTimes,
        inferIntegerStrings: configuration.inferIntegerStrings
    };
    for (const flag of inferenceFlagNames) {
        if (typeof configuration[flag] === "boolean") {
            options[flag] = configuration[flag];
        }
    }

    return await quicktype(options);
}

// 弹出输入框输入主名字
async function GenerateFileName(): Promise<{ cancelled: boolean; name: string }> {
    let topLevelName = await vscode.window.showInputBox({
        prompt: "What filename do you want to create?"
    });

    return {
        cancelled: topLevelName === undefined,
        name: topLevelName || "TopLevel"
    };
}

export class BeautifyJson {
    /**
     * Read the text being edited
     */
    public async CaptureContent(editor: vscode.TextEditor) {
        // Get the document
        let doc = editor.document;
        // let text = doc.getText();
        // The optional scope
        let text = doc.getText(editor.selection) || doc.getText();
        // Removes the leading and trailing white space and line terminator characters from a string.
        let trimmedText = text.trim().replace(/(?:^[\n\t\r]|[\n\t\r]$)/g, "");
        // Determine if the text is valid
        if (trimmedText === "") {
            vscode.window.showWarningMessage("Please enter valid JSON!");
            return;
        }
        // Beautify JSON
        let beautifiedJson = this.beautify(
            trimmedText,
            // tabs vs spaces
            editor.options.insertSpaces ? editor.options.tabSize : "\t"
        );

        if (beautifiedJson !== trimmedText) {
            // tabs vs spaces
            let tabStyle = editor.options.insertSpaces ? " " : "\t";
            if (!editor.selection.isEmpty) {
                let start = editor.selection.start;
                beautifiedJson = beautifiedJson.replace(
                    /(\n)/g,
                    "$1" + tabStyle.repeat(start.character)
                );
            }
            this.setText(editor, beautifiedJson);
        }
    }

    // Turn the content into JSON
    public beautify(text: string, tabSize?: number | string): string {
        let parseJson = JSON.parse(text);
        if (typeof parseJson !== "object") {
            vscode.window.showWarningMessage("Please enter valid JSON!");
            throw new Error("Please enter valid JSON!");
        }
        return JSON.stringify(parseJson, null, tabSize);
    }
    
    // Overwrite the content in the editor
    private async setText(editor: vscode.TextEditor, newText: string) {
        let doc = editor.document;
        editor.edit(builder => {
            let start, end;

            // Format whole file or selected text
            if (editor.selection.isEmpty) {
                const lastLine = doc.lineAt(doc.lineCount - 1);
                start = new vscode.Position(0, 0);
                end = new vscode.Position(doc.lineCount - 1, lastLine.text.length);
            } else {
                start = editor.selection.start;
                end = editor.selection.end;
            }
    
            // replace text
            builder.replace(new vscode.Range(start, end), newText);
    
            // Select the whole json
            editor.selection = new vscode.Selection(start, end);
        });
        vscode.window.showInformationMessage("Beautify JSON completed");
    };
}