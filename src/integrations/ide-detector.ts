/**
 * MeshManager - IDE Auto-Discovery & Zero-Config Connector
 * Detects installed IDEs, enables 1-click injection, supports force-connecting
 * even if not yet opened, and generates ready-to-use configuration snippets.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface IDEScanResult {
  id: string;
  name: string;
  detected: boolean;
  configPath: string;
  isRoutedToProxy: boolean;
  configSnippet: string;
}

export class IDEDetector {
  private homeDir = os.homedir();
  private appData = process.env.APPDATA || path.join(this.homeDir, 'AppData', 'Roaming');

  public scanAll(): IDEScanResult[] {
    return [
      this.scanAntigravity(),
      this.scanCursor(),
      this.scanVSCode(),
      this.scanWindsurf()
    ];
  }

  private scanAntigravity(): IDEScanResult {
    const configPath = path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json');
    const detected = fs.existsSync(path.dirname(configPath)) || fs.existsSync(path.join(this.homeDir, '.gemini'));
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
      detected: true, // Always allow connection
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ modelProvider: 'gemini', apiEndpoint: 'http://localhost:20128/v1' }, null, 2)
    };
  }

  private scanCursor(): IDEScanResult {
    const configPath = path.join(this.appData, 'Cursor', 'User', 'settings.json');
    const detected = fs.existsSync(path.dirname(configPath)) || fs.existsSync(path.join(this.appData, 'Cursor'));
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
      detected: true, // Always allow connection
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ 'cursor.openaiBaseUrl': 'http://localhost:20128/v1' }, null, 2)
    };
  }

  private scanVSCode(): IDEScanResult {
    const configPath = path.join(this.appData, 'Code', 'User', 'settings.json');
    // Check multiple possible paths
    const detected =
      fs.existsSync(path.dirname(configPath)) ||
      fs.existsSync(path.join(this.appData, 'Code')) ||
      fs.existsSync(path.join(this.homeDir, '.vscode'));
    let isRouted = false;

    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (
          (content['continue.apiBase'] && content['continue.apiBase'].includes('20128')) ||
          (content['meshmanager.enabled'] === true)
        ) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'vscode',
      name: 'VS Code (Continue / Cline / Roo)',
      detected: true, // Always allow connection (will auto-create directories on toggle)
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify(
        {
          'continue.apiBase': 'http://localhost:20128/v1',
          'meshmanager.enabled': true
        },
        null,
        2
      )
    };
  }

  private scanWindsurf(): IDEScanResult {
    const configPath = path.join(this.appData, 'Windsurf', 'User', 'settings.json');
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
      detected: true,
      configPath,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ 'codeium.customProxyUrl': 'http://localhost:20128/v1' }, null, 2)
    };
  }

  /**
   * 1-Click Toggle: Creates required directories automatically if they do not exist
   */
  public toggleIDE(ideId: string, enable: boolean): { success: boolean; message: string } {
    let targetPath = '';
    let updateFn: (current: any) => void;

    switch (ideId) {
      case 'antigravity':
        targetPath = path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json');
        updateFn = current => {
          if (enable) {
            current.modelProvider = 'gemini';
            current.apiEndpoint = 'http://localhost:20128/v1';
          } else {
            delete current.apiEndpoint;
          }
        };
        break;

      case 'cursor':
        targetPath = path.join(this.appData, 'Cursor', 'User', 'settings.json');
        updateFn = current => {
          if (enable) {
            current['cursor.openaiBaseUrl'] = 'http://localhost:20128/v1';
          } else {
            delete current['cursor.openaiBaseUrl'];
          }
        };
        break;

      case 'vscode':
        targetPath = path.join(this.appData, 'Code', 'User', 'settings.json');
        updateFn = current => {
          if (enable) {
            current['continue.apiBase'] = 'http://localhost:20128/v1';
            current['meshmanager.enabled'] = true;
          } else {
            delete current['continue.apiBase'];
            delete current['meshmanager.enabled'];
          }
        };
        break;

      case 'windsurf':
        targetPath = path.join(this.appData, 'Windsurf', 'User', 'settings.json');
        updateFn = current => {
          if (enable) {
            current['codeium.customProxyUrl'] = 'http://localhost:20128/v1';
          } else {
            delete current['codeium.customProxyUrl'];
          }
        };
        break;

      default:
        return { success: false, message: `Unknown IDE identifier: ${ideId}` };
    }

    try {
      const dir = path.dirname(targetPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let current: any = {};
      if (fs.existsSync(targetPath)) {
        try {
          current = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
        } catch (e) {
          current = {};
        }
      }

      updateFn(current);
      fs.writeFileSync(targetPath, JSON.stringify(current, null, 2), 'utf-8');

      return {
        success: true,
        message: enable
          ? `Successfully connected ${ideId.toUpperCase()} to MeshManager! Configured at: ${targetPath}`
          : `Reverted ${ideId.toUpperCase()} to default settings.`
      };
    } catch (err: any) {
      return { success: false, message: `Failed configuring ${ideId}: ${err.message}` };
    }
  }
}
