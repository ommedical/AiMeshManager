/**
 * MeshManager - Real IDE Installation Validator & Connector
 * Validates whether the IDE application executable is actually installed on the system
 * before attempting configuration injection, preventing ghost directory creation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

export interface IDEScanResult {
  id: string;
  name: string;
  isInstalled: boolean;
  installedPath?: string;
  configPath: string;
  isRoutedToProxy: boolean;
  configSnippet: string;
  downloadUrl: string;
}

export class IDEDetector {
  private homeDir = os.homedir();
  private appData = process.env.APPDATA || path.join(this.homeDir, 'AppData', 'Roaming');
  private localAppData = process.env.LOCALAPPDATA || path.join(this.homeDir, 'AppData', 'Local');
  private programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  private programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';

  public scanAll(): IDEScanResult[] {
    return [
      this.scanAntigravity(),
      this.scanCursor(),
      this.scanVSCode(),
      this.scanWindsurf()
    ];
  }

  private checkExecutable(possiblePaths: string[], commandName?: string): { installed: boolean; foundPath?: string } {
    // 1. Check known filesystem paths
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        return { installed: true, foundPath: p };
      }
    }

    // 2. Check system PATH via 'where' (Windows) or 'which' (macOS/Linux)
    if (commandName) {
      try {
        const cmd = process.platform === 'win32' ? `where.exe ${commandName}` : `which ${commandName}`;
        const out = execSync(cmd, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf-8' });
        const firstLine = out.trim().split('\n')[0].trim();
        if (firstLine && fs.existsSync(firstLine)) {
          return { installed: true, foundPath: firstLine };
        }
      } catch (e) {}
    }

    return { installed: false };
  }

  private scanAntigravity(): IDEScanResult {
    const configPath = path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json');
    const possibleExes = [
      path.join(this.localAppData, 'Programs', 'Antigravity', 'Antigravity.exe'),
      path.join(this.localAppData, 'antigravity-ide', 'Antigravity.exe'),
      path.join(this.programFiles, 'Antigravity', 'Antigravity.exe'),
      path.join(this.homeDir, '.gemini', 'antigravity-ide', 'antigravity.exe')
    ];

    const exeCheck = this.checkExecutable(possibleExes, 'agy');
    const hasGeminiDir = fs.existsSync(path.join(this.homeDir, '.gemini'));
    const isInstalled = exeCheck.installed || hasGeminiDir;

    let isRouted = false;
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (content.apiEndpoint && content.apiEndpoint.includes('20128')) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'antigravity',
      name: 'Google Antigravity 2.0 & IDE',
      isInstalled,
      installedPath: exeCheck.foundPath || (hasGeminiDir ? path.join(this.homeDir, '.gemini') : undefined),
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ modelProvider: 'gemini', apiEndpoint: 'http://localhost:20128/v1' }, null, 2),
      downloadUrl: 'https://antigravity.google'
    };
  }

  private scanCursor(): IDEScanResult {
    const configPath = path.join(this.appData, 'Cursor', 'User', 'settings.json');
    const possibleExes = [
      path.join(this.localAppData, 'Programs', 'cursor', 'Cursor.exe'),
      path.join(this.localAppData, 'cursor', 'Cursor.exe'),
      path.join(this.programFiles, 'Cursor', 'Cursor.exe'),
      path.join(this.appData, 'Cursor', 'Cursor.exe')
    ];

    const exeCheck = this.checkExecutable(possibleExes, 'cursor');
    const isInstalled = exeCheck.installed || fs.existsSync(path.join(this.appData, 'Cursor'));

    let isRouted = false;
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (content['cursor.openaiBaseUrl'] && content['cursor.openaiBaseUrl'].includes('20128')) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'cursor',
      name: 'Cursor AI Editor',
      isInstalled,
      installedPath: exeCheck.foundPath,
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ 'cursor.openaiBaseUrl': 'http://localhost:20128/v1' }, null, 2),
      downloadUrl: 'https://cursor.com'
    };
  }

  private scanVSCode(): IDEScanResult {
    const configPath = path.join(this.appData, 'Code', 'User', 'settings.json');
    const possibleExes = [
      path.join(this.localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'),
      path.join(this.programFiles, 'Microsoft VS Code', 'Code.exe'),
      path.join(this.programFilesX86, 'Microsoft VS Code', 'Code.exe'),
      path.join(this.localAppData, 'Programs', 'Microsoft VS Code Insiders', 'Code - Insiders.exe')
    ];

    const exeCheck = this.checkExecutable(possibleExes, 'code');
    const isInstalled = exeCheck.installed || fs.existsSync(path.join(this.appData, 'Code'));

    let isRouted = false;
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (
          (content['continue.apiBase'] && content['continue.apiBase'].includes('20128')) ||
          content['meshmanager.enabled'] === true
        ) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'vscode',
      name: 'VS Code (Continue / Cline / Roo)',
      isInstalled,
      installedPath: exeCheck.foundPath,
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify(
        {
          'continue.apiBase': 'http://localhost:20128/v1',
          'meshmanager.enabled': true
        },
        null,
        2
      ),
      downloadUrl: 'https://code.visualstudio.com'
    };
  }

  private scanWindsurf(): IDEScanResult {
    const configPath = path.join(this.appData, 'Windsurf', 'User', 'settings.json');
    const possibleExes = [
      path.join(this.localAppData, 'Programs', 'Windsurf', 'Windsurf.exe'),
      path.join(this.programFiles, 'Windsurf', 'Windsurf.exe')
    ];

    const exeCheck = this.checkExecutable(possibleExes, 'windsurf');
    const isInstalled = exeCheck.installed || fs.existsSync(path.join(this.appData, 'Windsurf'));

    let isRouted = false;
    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (content['codeium.customProxyUrl'] && content['codeium.customProxyUrl'].includes('20128')) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'windsurf',
      name: 'Windsurf (Codeium)',
      isInstalled,
      installedPath: exeCheck.foundPath,
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ 'codeium.customProxyUrl': 'http://localhost:20128/v1' }, null, 2),
      downloadUrl: 'https://codeium.com/windsurf'
    };
  }

  public toggleIDE(ideId: string, enable: boolean): { success: boolean; message: string; notInstalled?: boolean } {
    const scan = this.scanAll().find(s => s.id === ideId);
    if (!scan) return { success: false, message: `Unknown IDE: ${ideId}` };

    if (!scan.isInstalled && enable) {
      return {
        success: false,
        notInstalled: true,
        message: `${scan.name} executable was not found on this system. Please install ${scan.name} first from ${scan.downloadUrl}, or copy the manual config snippet.`
      };
    }

    try {
      const dir = path.dirname(scan.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let current: any = {};
      if (fs.existsSync(scan.configPath)) {
        try {
          current = JSON.parse(fs.readFileSync(scan.configPath, 'utf-8'));
        } catch (e) {
          current = {};
        }
      }

      if (ideId === 'antigravity') {
        if (enable) {
          current.modelProvider = 'gemini';
          current.apiEndpoint = 'http://localhost:20128/v1';
        } else {
          delete current.apiEndpoint;
        }
      } else if (ideId === 'cursor') {
        if (enable) {
          current['cursor.openaiBaseUrl'] = 'http://localhost:20128/v1';
        } else {
          delete current['cursor.openaiBaseUrl'];
        }
      } else if (ideId === 'vscode') {
        if (enable) {
          current['continue.apiBase'] = 'http://localhost:20128/v1';
          current['meshmanager.enabled'] = true;
        } else {
          delete current['continue.apiBase'];
          delete current['meshmanager.enabled'];
        }
      } else if (ideId === 'windsurf') {
        if (enable) {
          current['codeium.customProxyUrl'] = 'http://localhost:20128/v1';
        } else {
          delete current['codeium.customProxyUrl'];
        }
      }

      fs.writeFileSync(scan.configPath, JSON.stringify(current, null, 2), 'utf-8');

      return {
        success: true,
        message: enable
          ? `Successfully connected ${scan.name} to MeshManager!`
          : `Reverted ${scan.name} to default settings.`
      };
    } catch (err: any) {
      return { success: false, message: `Error configuring ${scan.name}: ${err.message}` };
    }
  }
}
