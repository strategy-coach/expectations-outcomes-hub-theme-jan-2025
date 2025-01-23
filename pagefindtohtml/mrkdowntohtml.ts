import { marked } from "marked";
import * as fs from 'fs';
import * as path from 'path';

const folderPaths = "src/content/"; // Use an array of folder paths if needed

function getAllSubfolders(folderPath:string) {
  const subfolders: string[] = [];

  fs.readdirSync(folderPath).forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      subfolders.push(filePath);
      subfolders.push(...getAllSubfolders(filePath));
    }
  });
  return subfolders;
}

const allSubfolders = getAllSubfolders(folderPaths);

//let outputDirectory = "./htmloutput"; 
let outputDirectory = "";

function getFilesInFolder(folderPath: string): string[] {
  try {

    const files = fs.readdirSync(folderPath);
    const filesOnly = files.filter((file) => {
      const filePath = `${folderPath}/${file}`;
      return fs.statSync(filePath).isFile()&& (file.endsWith('.md') || file.endsWith('.mdx'));;
    });

    return filesOnly;
  } catch (error) {
    console.error(`Error reading folder: ${folderPath}`, error);
    return [];
  }
}

for (let i = 0; i < allSubfolders.length; i++) {
  const folderPath = allSubfolders[i];
  const files = getFilesInFolder(folderPath);
  outputDirectory = "./htmloutput"
  const newPath = folderPath.replace("src/content/", "");
  outputDirectory= outputDirectory+'/'+newPath
  if (!fs.existsSync(outputDirectory)) {
        fs.mkdirSync(outputDirectory, { recursive: true });
      }
 
  for (let j = 0; j < files.length; j++) {
    const file = files[j];
    //if (file =="acceptable-use-policy.mdx")
   // {
       const markdownContent = fs.readFileSync(`${folderPath}/${file}`, 'utf8');
       const titleMatch = markdownContent.match(/title:\s*"([^"]+)"/);
       let title=""
       if (titleMatch && titleMatch[1]) {
        title = titleMatch[1];
      }    
      else {
        console.log("Title not found in the content.");
      }
      const htmlContent = marked.parse(markdownContent);
      const completeHtmlContent = `<html><body><title>${title}</title>${htmlContent}</body></html>`;
      const outputFileName = path.join(outputDirectory, `${path.basename(file, path.extname(file))}.html`);
      // Create the folder structure if it doesn't exist
      const outputFolder = path.dirname(outputFileName);
      
      // if (!fs.existsSync(outputFolder)) {
      //   fs.mkdirSync(outputFolder, { recursive: true });
      // }
      fs.writeFileSync(outputFileName, completeHtmlContent, 'utf8');
      console.log(`Markdown converted to HTML and saved as "${outputFileName}".`);
      //outputDirectory ="";
   // }
  }
  outputDirectory ="";
}
