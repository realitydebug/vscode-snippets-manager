import * as vscode from "vscode";
import {
  getProfilesFolderUri,
  getStorageJsonUri,
  getUserFolderUri,
} from "../share";
import logger from "../utils/logger";

interface IUserDataProfile {
  location: string;
  name: string;
}

interface IsnippetsFileInfo {
  fileName: string;
  uri: vscode.Uri;
}

async function getProfileUserSnippetsFilesInfo() {
  try {
    const storageJsonUri = getStorageJsonUri();
    const snippetsTextDoc =
      await vscode.workspace.openTextDocument(storageJsonUri);
    const storageJsonContent = snippetsTextDoc.getText();
    const storageJson = JSON.parse(storageJsonContent);
    const userDataProfiles: IUserDataProfile[] =
      storageJson?.userDataProfiles || [];
    const userSnippetsFolders = userDataProfiles
      .filter((profile) => profile.location)
      .map((profile) => {
        return {
          name: profile.name,
          uri: vscode.Uri.joinPath(
            getProfilesFolderUri(),
            profile.location,
            "snippets",
          ),
        };
      });

    return userSnippetsFolders;
  } catch (error: any) {
    logger.error(error?.message);
    return [];
  }
}

async function getUserSnippetsFilesInfoByFolderUri(uri: vscode.Uri) {
  const userSnippetsFileUris = [];

  let userSnippetFiles: [string, vscode.FileType][] = [];
  try {
    userSnippetFiles = await vscode.workspace.fs.readDirectory(uri);
  } catch (error) {
    // havn no folder, do noting
  }

  for (const [fileName, fileType] of userSnippetFiles) {
    if (
      // file or symbolic link file
      fileType & vscode.FileType.File &&
      (fileName.endsWith(".code-snippets") || fileName.endsWith(".json"))
    ) {
      const snippetUri = vscode.Uri.joinPath(uri, fileName);

      userSnippetsFileUris.push({ fileName, uri: snippetUri });
    }
  }

  return userSnippetsFileUris;
}

export default async () => {
  const userFolderUri = getUserFolderUri();
  const profileUserSnippetsFolders = await getProfileUserSnippetsFilesInfo();

  if (!profileUserSnippetsFolders?.length) {
    const userSnippetsFileInfos =
      await getUserSnippetsFilesInfoByFolderUri(userFolderUri);

    return userSnippetsFileInfos;
  }

  const userSnippetsFolders = [
    {
      name: "default",
      uri: userFolderUri,
    },
    ...profileUserSnippetsFolders,
  ];

  const userSnippetsFileInfos: IsnippetsFileInfo[] = [];
  for (const { uri, name } of userSnippetsFolders) {
    const rawFileInfos = await getUserSnippetsFilesInfoByFolderUri(uri);

    const fileInfos = rawFileInfos.map(({ fileName, uri }) => ({
      fileName: `${fileName} (${name})`,
      uri,
    }));

    userSnippetsFileInfos.push(...fileInfos);
  }

  return userSnippetsFileInfos;
};
