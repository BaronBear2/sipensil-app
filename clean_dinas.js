const fs = require('fs');
const path = require('path');

const dinasPath = path.join(process.cwd(), 'actions', 'dinas.ts');
let content = fs.readFileSync(dinasPath, 'utf8');

const functionsToRemove = [
    'uploadTrainingPdfAction',
    'verifyImJapanAction',
    'verifyLpkReportAction',
    'verifyMagangPermitAction',
    'deleteImJapanHistoryAction',
    'createImJapanRequirementAction',
    'updateImJapanRequirementAction',
    'deleteImJapanRequirementAction',
    'deleteLpkReportAction',
    'createLpkAction',
    'updateLpkAction',
    'deleteLpkAction',
    'deleteMagangPermitAction',
    'deletePencatatanBatchAction',
    'verifyPencatatanBatchAction',
    'createPerusahaanAction',
    'updatePerusahaanAction',
    'deletePerusahaanAction'
];

for (const fnName of functionsToRemove) {
    // Matches `export async function name(args) { ... }` supporting nested braces
    // This regex is a bit complex, but simpler is finding the start index, and then counting braces to find the end.
    const regexStr = `export async function ${fnName}\\s*\\([\\s\\S]*?\\)\\s*\\{`;
    const regex = new RegExp(regexStr);
    
    let match = content.match(regex);
    while (match) {
        let startIndex = match.index;
        let braceCount = 0;
        let endIndex = -1;
        let started = false;
        
        for (let i = startIndex; i < content.length; i++) {
            if (content[i] === '{') {
                braceCount++;
                started = true;
            } else if (content[i] === '}') {
                braceCount--;
            }
            
            if (started && braceCount === 0) {
                endIndex = i;
                break;
            }
        }
        
        if (endIndex !== -1) {
            content = content.substring(0, startIndex) + content.substring(endIndex + 1);
        } else {
            break;
        }
        match = content.match(regex);
    }
}

// Clean up references in other functions if necessary, e.g., adminCreateUserAction
// I'll just let typescript complain and I'll fix the remaining type errors.

fs.writeFileSync(dinasPath, content, 'utf8');
console.log('Removed dead functions from actions/dinas.ts');
