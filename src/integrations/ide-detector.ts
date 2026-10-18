/**
 * 1-Click IDE Auto-Discovery & Zero-Config Injector
 * Detects installed IDEs (Antigravity 2.0/IDE, Cursor, VS Code)
 * and provides single-click injection/reversion of the local gateway settings.
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
}

export class IDEDetector {
  private homeDir = os.homedir();
  private appData = process.env.APPDATA || path.join(this.homeDir, 'AppData', 'Roaming');

  public scanAll(): IDEScanResult[] {
    return [
      this.scanAntigravity(),
      this.scanCursor(),
      this.scanVSCode()
    ];
  }

  private scanAntigravity(): IDEScanResult {
    const configPath = path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json');
    const detected = fs.existsSync(path.dirname(configPath));
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
      detected,
      configPath,
      isRoutedToProxy: isRouted
    };
  }

  private scanCursor(): IDEScanResult {
    const configPath = path.join(this.appData, 'Cursor', 'User', 'settings.json');
    const detected = fs.existsSync(path.dirname(configPath));
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
      detected,
      configPath,
      isRoutedToProxy: isRouted
    };
  }

  private scanVSCode(): IDEScanResult {
    const configPath = path.join(this.appData, 'Code', 'User', 'settings.json');
    const detected = fs.existsSync(path.dirname(configPath));
    let isRouted = false;

    if (fs.existsSync(configPath)) {
      try {
        const content = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        if (content['continue.apiBase'] && content['continue.apiBase'].includes('20128')) {
          isRouted = true;
        }
      } catch (e) {}
    }

    return {
      id: 'vscode',
      name: 'VS Code (Continue / Cline)',
      detected,
      configPath,
      isRoutedToProxy: isRouted
    };
  }

  /**
   * 1-Click Toggle: switches an IDE between Direct Google / Default vs OmniGate
   */
  public toggleIDE(ideId: string, enable: boolean): { success: boolean; message: string } {
    if (ideId === 'antigravity') {
      const configPath = path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json');
      try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        let current: any = {};
        if (fs.existsSync(configPath)) {
          current = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }

        if (enable) {
          current.modelProvider = 'gemini';
          current.apiEndpoint = 'http://localhost:20128/v1';
        } else {
          delete current.apiEndpoint;
        }

        fs.writeFileSync(configPath, JSON.stringify(current, null, 2), 'utf-8');
        return {
          success: true,
          message: enable ? 'Antigravity successfully connected to OmniGate' : 'Antigravity restored to direct Google auth'
        };
      } catch (err: any) {
        return { success: false, message: `Failed to configure Antigravity: ${err.message}` };
      }
    }

    if (ideId === 'cursor') {
      const configPath = path.join(this.appData, 'Cursor', 'User', 'settings.json');
      try {
        const dir = path.dirname(configPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        let current: any = {};
        if (fs.existsSync(configPath)) {
          current = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }

        if (enable) {
          current['cursor.openaiBaseUrl'] = 'http://localhost:20128/v1';
        } else {
          delete current['cursor.openaiBaseUrl'];
        }

        fs.writeFileSync(configPath, JSON.stringify(current, null, 2), 'utf-8');
        return {
          success: true,
          message: enable ? 'Cursor successfully connected to OmniGate' : 'Cursor restored to default settings'
        };
      } catch (err: any) {
        return { success: false, message: `Failed to configure Cursor: ${err.message}` };
      }
    }

    return { success: false, message: `Unknown IDE: ${ideId}` };
  }
}
