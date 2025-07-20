import * as vscode from "vscode";

export enum SnippetType {
  WORKSPACE = "WORKSPACE",
  USER = "USER",
  EXTENSION = "EXTENSION",
}

export const snippetTypeNameMap = new Map([
  [SnippetType.WORKSPACE, vscode.l10n.t("workspace")],
  [SnippetType.USER, vscode.l10n.t("user")],
  [SnippetType.EXTENSION, vscode.l10n.t("extension")],
]);

export let context: vscode.ExtensionContext;

export const setContext = (c: vscode.ExtensionContext) => (context = c);

export const getUserFolderUri = () =>
  vscode.Uri.joinPath(context?.globalStorageUri, "../../snippets");

export const getStorageJsonUri = () =>
  vscode.Uri.joinPath(
    context?.globalStorageUri,
    "../../globalStorage/storage.json",
  );

export const getProfilesFolderUri = () =>
  vscode.Uri.joinPath(context?.globalStorageUri, "../../profiles");

export const isBrowser = vscode.env.appHost !== "desktop";
