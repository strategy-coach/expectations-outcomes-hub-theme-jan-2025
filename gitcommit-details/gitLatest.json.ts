import * as fs from "node:fs";
import { exec } from "node:child_process";

function getAllFilesInFolder(repositoryPath: string, folderPath: string): Promise<string[]> {
  return new Promise<string[]>((resolve, reject) => {
    exec(`git -C ${repositoryPath} ls-files "${folderPath}" --full-name --recurse-submodules`, (error, stdout) => {
      if (error) {
        reject(error);
        return;
      }

      const files: string[] = stdout.split("\n").filter(Boolean);
      resolve(files);
    });
  });
}

function getCommitDetailsForFile(repositoryPath: string, file: string): Promise<any[]> {
  return new Promise<any[]>((resolve, reject) => {
    const options = {
      cwd: repositoryPath,
      format: {
        subject: "%s",
        authorName: "%aN",
        authorDate: "%ad",
      },
      nameStatus: true,
    };
//console.log(file,'--------');
    exec(
      `git log --pretty=format:'%s||%aN||%ad' --name-status -- "${file}"`,
      options,
      (error, stdout) => {
        if (error) {
          console.error(`Error retrieving commit data for ${file}:`, error);
          reject(error);
        } else {
          const lines = stdout.trim().split("\n");
          const commits = [];
          let currentCommit: { subject?: string; authorName?: string; authorDate?: string; fileStatus?: string } = {};

          lines.forEach((line) => {
            if (line.includes("||")) {
              if (Object.keys(currentCommit).length !== 0) {
                commits.push(currentCommit);
                currentCommit = {};
              }

              const parts = line.split("||");
              if (parts.length >= 3) {
                const commitInfo = parts.slice(0, 3).join("||");
                const fileStatus = parts.slice(3).join("||");

                const [subject, authorName, authorDate] = commitInfo.split("||");

                if (subject && authorName && authorDate) {
                  currentCommit = {
                    subject,
                    authorName,
                    authorDate,
                    fileStatus,
                  };
                }
              }
            } else if (line.trim().length > 0) {
              const trimmedLine = line.trim();
              if (trimmedLine !== 'null') {
                currentCommit.fileStatus = trimmedLine;
              }
            }
          });

          if (Object.keys(currentCommit).length !== 0) {
            commits.push(currentCommit);
          }

          resolve(commits);
        }
      }
    );
  });
}




// Your existing code for getting files and processing commits remains unchanged...



const repositoryPath = process.cwd();
const folderPath = "src/content";
console.log(repositoryPath,'--repositoryPath')
getAllFilesInFolder(repositoryPath, folderPath)
  .then((files: string[]) => {
    const promises = files.map((file) => {
      return getCommitDetailsForFile(repositoryPath, file);
    });

    Promise.all(promises)
      .then((allCommits: any[][]) => {
        const mergedCommits = allCommits.flat();
        const jsonResult = JSON.stringify(mergedCommits, null, 2);
        const lastWord = folderPath.split("/").filter(Boolean).pop() || 'content';
        const fileName = lastWord === 'content' ? 'githubLatestCommit.json' : `githubCommit_${lastWord}.json`;
        const filePath = `./gitcommit-details/${fileName}`;

        fs.writeFile(filePath, jsonResult, (err) => {
          if (err) {
            console.error("Error writing JSON file:", err);
            return;
          }
          console.log(`JSON file saved successfully for ${lastWord} collection!`);
        });
      })
      .catch((error) => {
        console.error("Error fetching commit data:", error);
      });
  })
  .catch((error) => {
    console.error("Error getting files from folder:", error);
  });
