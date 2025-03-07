import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Define issue interface
interface SecurityIssue {
  name: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  line: number;
  match: string;
}

// Define pattern interface
interface SecurityPattern {
  name: string;
  pattern: RegExp;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  excludeFiles?: string[];
}

// Security patterns to check for
const securityPatterns: SecurityPattern[] = [
  {
    name: 'Hardcoded Secrets',
    pattern: /(password|secret|key|token|credential|auth)[\s]*[=:][\s]*['"`][^\s]{8,}['"`]/gi,
    severity: 'high',
    description: 'Potential hardcoded secret found',
    excludeFiles: ['.env.example', 'validate-env.ts', 'security-check.ts']
  },
  {
    name: 'Insecure Eval',
    pattern: /eval\s*\(/g,
    severity: 'critical',
    description: 'Use of eval() is insecure and can lead to code injection'
  },
  {
    name: 'Insecure innerHTML',
    pattern: /\.innerHTML\s*=/g,
    severity: 'high',
    description: 'Use of innerHTML can lead to XSS vulnerabilities'
  },
  {
    name: 'Insecure dangerouslySetInnerHTML',
    pattern: /dangerouslySetInnerHTML/g,
    severity: 'high',
    description: 'Use of dangerouslySetInnerHTML can lead to XSS vulnerabilities'
  },
  {
    name: 'Insecure document.write',
    pattern: /document\.write\s*\(/g,
    severity: 'high',
    description: 'Use of document.write can lead to XSS vulnerabilities'
  },
  {
    name: 'Insecure setTimeout with string',
    pattern: /setTimeout\s*\(\s*['"`]/g,
    severity: 'medium',
    description: 'Use of setTimeout with string argument can lead to code injection'
  },
  {
    name: 'Insecure setInterval with string',
    pattern: /setInterval\s*\(\s*['"`]/g,
    severity: 'medium',
    description: 'Use of setInterval with string argument can lead to code injection'
  },
  {
    name: 'SQL Injection',
    pattern: /execute\s*\(\s*['"`][^'"`]*\$\{/g,
    severity: 'critical',
    description: 'Potential SQL injection vulnerability'
  },
  {
    name: 'Insecure Redirect',
    pattern: /res\.redirect\s*\(\s*req\.query/g,
    severity: 'high',
    description: 'Potential open redirect vulnerability'
  },
  {
    name: 'Insecure Cookie',
    pattern: /cookie\s*[=:]\s*[^;]*(?!httpOnly|secure|sameSite)/gi,
    severity: 'medium',
    description: 'Cookie without security attributes'
  },
  {
    name: 'Weak Crypto',
    pattern: /createHash\s*\(\s*['"`]md5['"`]\)/g,
    severity: 'high',
    description: 'Use of weak cryptographic algorithm (MD5)'
  },
  {
    name: 'Weak Crypto',
    pattern: /createHash\s*\(\s*['"`]sha1['"`]\)/g,
    severity: 'medium',
    description: 'Use of weak cryptographic algorithm (SHA1)'
  },
  {
    name: 'Insecure Random',
    pattern: /Math\.random\s*\(\)/g,
    severity: 'medium',
    description: 'Use of Math.random() for security-sensitive operations'
  },
  {
    name: 'Potential Prototype Pollution',
    pattern: /Object\.assign\s*\(\s*{}\s*,/g,
    severity: 'medium',
    description: 'Potential prototype pollution vulnerability'
  },
  {
    name: 'Potential RegExp DoS',
    pattern: /\.\*\+/g,
    severity: 'low',
    description: 'Potential RegExp Denial of Service (ReDoS) vulnerability'
  }
];

// File extensions to check
const fileExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json', '.env'];

// Directories to exclude
const excludeDirs = ['node_modules', '.git', '.next', 'dist', 'build'];

// Function to check a file for security issues
function checkFile(filePath: string): { filePath: string; issues: SecurityIssue[] } {
  try {
    const content = readFileSync(filePath, 'utf8');
    const issues: SecurityIssue[] = [];
    const fileName = filePath.split('/').pop() || '';

    securityPatterns.forEach(pattern => {
      // Skip if file is in exclude list
      if (pattern.excludeFiles && pattern.excludeFiles.includes(fileName)) {
        return;
      }

      const matches = content.match(pattern.pattern);
      if (matches) {
        matches.forEach(match => {
          // Find line number
          const lines = content.split('\n');
          let lineNumber = 0;
          let charIndex = 0;

          for (let i = 0; i < lines.length; i++) {
            charIndex += lines[i].length + 1; // +1 for the newline
            if (charIndex > content.indexOf(match)) {
              lineNumber = i + 1;
              break;
            }
          }

          issues.push({
            name: pattern.name,
            severity: pattern.severity,
            description: pattern.description,
            line: lineNumber,
            match: match.substring(0, 50) + (match.length > 50 ? '...' : '')
          });
        });
      }
    });

    return { filePath, issues };
  } catch (error) {
    console.error(`Error checking file ${filePath}:`, error);
    return { filePath, issues: [] };
  }
}

// Function to walk directory recursively
function walkDir(dir: string): string[] {
  let results: string[] = [];
  const list = readdirSync(dir);

  list.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);

    if (stat.isDirectory()) {
      // Skip excluded directories
      if (excludeDirs.includes(file)) {
        return;
      }
      // Recursively walk directory
      results = results.concat(walkDir(filePath));
    } else {
      // Check if file has an extension we care about
      const ext = extname(filePath);
      if (fileExtensions.includes(ext)) {
        results.push(filePath);
      }
    }
  });

  return results;
}

// Main function
async function main() {
  console.log('🔍 Scanning codebase for security vulnerabilities...');
  
  // Get all files
  const files = walkDir('.');
  console.log(`Found ${files.length} files to scan`);
  
  // Check each file
  const results = files.map(file => checkFile(file));
  
  // Filter results with issues
  const issuesFound = results.filter(result => result.issues.length > 0);
  
  // Count issues by severity
  const issueCounts = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  };
  
  issuesFound.forEach(result => {
    result.issues.forEach((issue: SecurityIssue) => {
      issueCounts[issue.severity]++;
    });
  });
  
  // Print results
  console.log('\n🔒 Security Scan Results:');
  console.log('------------------------');
  console.log(`Total files scanned: ${files.length}`);
  console.log(`Files with issues: ${issuesFound.length}`);
  console.log(`Critical issues: ${issueCounts.critical}`);
  console.log(`High severity issues: ${issueCounts.high}`);
  console.log(`Medium severity issues: ${issueCounts.medium}`);
  console.log(`Low severity issues: ${issueCounts.low}`);
  console.log('------------------------\n');
  
  // Print detailed results
  if (issuesFound.length > 0) {
    console.log('📋 Detailed Results:');
    
    issuesFound.forEach(result => {
      console.log(`\n📁 ${result.filePath}`);
      
      result.issues.forEach((issue: SecurityIssue) => {
        console.log(`  • [${issue.severity.toUpperCase()}] ${issue.name} (Line ${issue.line})`);
        console.log(`    ${issue.description}`);
        console.log(`    Match: ${issue.match}`);
      });
    });
    
    // Exit with error if critical or high issues found
    if (issueCounts.critical > 0 || issueCounts.high > 0) {
      console.log('\n❌ Critical or high severity issues found. Please fix them before continuing.');
      process.exit(1);
    }
  } else {
    console.log('✅ No security issues found!');
  }
}

// Run the main function
main().catch(error => {
  console.error('Error running security check:', error);
  process.exit(1);
}); 