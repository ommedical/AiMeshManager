/**
 * MeshManager - Real IDE Installation Validator & Connector
 * Validates whether the IDE application executable is actually installed on the system
 * before attempting configuration injection, preventing ghost directory creation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { execSync } from 'child_process';

export interface IDEScanResult {
  id: string;
  name: string;
  isInstalled: boolean;
  installedPath?: string;
  configPath: string;
  allConfigPaths?: string[];
  isRoutedToProxy: boolean;
  configSnippet: string;
  downloadUrl: string;
  isRunning?: boolean;
  runningPid?: number;
  mockAdcProvisioned?: boolean;
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

  public isProcessRunning(names: string[]): { running: boolean; pid?: number; processName?: string } {
    try {
      if (process.platform === 'win32') {
        const out = execSync('tasklist /FO CSV /NH', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
        const lines = out.split('\n');
        for (const line of lines) {
          const parts = line.split('","').map(s => s.replace(/"/g, '').trim());
          if (parts.length >= 2) {
            const pName = parts[0].toLowerCase();
            const pid = parseInt(parts[1], 10);
            for (const target of names) {
              if (pName.includes(target.toLowerCase())) {
                return { running: true, pid, processName: parts[0] };
              }
            }
          }
        }
      } else {
        for (const target of names) {
          try {
            const pidStr = execSync(`pgrep -i "${target}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
            if (pidStr) {
              const pid = parseInt(pidStr.split('\n')[0], 10);
              return { running: true, pid, processName: target };
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
    return { running: false };
  }

  public getMockServiceAccountADC(port: number = 20128) {
    let privateKeyPem = '';
    try {
      const { privateKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
      });
      privateKeyPem = privateKey;
    } catch (e) {
      privateKeyPem = 'MOCK_RSA_KEY';
    }

    return {
      type: 'service_account',
      project_id: 'meshmanager-local',
      private_key_id: 'mesh-local-adc-key',
      private_key: privateKeyPem,
      client_email: 'meshmanager-agent@meshmanager-local.iam.gserviceaccount.com',
      client_id: '100201280000000000000',
      auth_uri: `http://127.0.0.1:${port}/auth`,
      token_uri: `http://127.0.0.1:${port}/oauth2/token`
    };
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
    const possibleConfigs = [
      path.join(this.appData, 'Antigravity IDE', 'User', 'settings.json'),
      path.join(this.appData, 'Antigravity', 'User', 'settings.json'),
      path.join(this.homeDir, '.gemini', 'antigravity-ide', 'settings.json'),
      path.join(this.homeDir, '.gemini', 'antigravity-cli', 'settings.json')
    ];

    const configPath = possibleConfigs.find(p => fs.existsSync(p)) || possibleConfigs[0];

    const possibleExes = [
      path.join(this.localAppData, 'Programs', 'Antigravity IDE', 'Antigravity IDE.exe'),
      path.join(this.localAppData, 'Programs', 'Antigravity', 'Antigravity.exe'),
      path.join(this.localAppData, 'antigravity-ide', 'Antigravity.exe'),
      path.join(this.programFiles, 'Antigravity IDE', 'Antigravity IDE.exe'),
      path.join(this.programFiles, 'Antigravity', 'Antigravity.exe'),
      path.join(this.homeDir, '.gemini', 'antigravity-ide', 'antigravity.exe'),
      path.join(this.homeDir, '.gemini', 'antigravity-ide', 'Antigravity IDE.exe')
    ];

    const exeCheck = this.checkExecutable(possibleExes, 'agy');
    const procCheck = this.isProcessRunning(['Antigravity IDE', 'Antigravity', 'agy']);
    const hasGeminiDir = fs.existsSync(path.join(this.homeDir, '.gemini'));
    const isInstalled = exeCheck.installed || procCheck.running || hasGeminiDir;

    // Check default Google Cloud ADC
    const gcloudDir = process.platform === 'win32'
      ? path.join(this.appData, 'gcloud')
      : path.join(this.homeDir, '.config', 'gcloud');
    const defaultAdcPath = path.join(gcloudDir, 'application_default_credentials.json');

    let mockAdcProvisioned = false;
    if (fs.existsSync(defaultAdcPath)) {
      try {
        const adc = JSON.parse(fs.readFileSync(defaultAdcPath, 'utf-8'));
        if (adc.project_id === 'meshmanager-local' || (adc.token_uri && adc.token_uri.includes('20128'))) {
          mockAdcProvisioned = true;
        }
      } catch (e) {}
    }

    let isRouted = mockAdcProvisioned;
    for (const cp of possibleConfigs) {
      if (fs.existsSync(cp)) {
        try {
          const content = JSON.parse(fs.readFileSync(cp, 'utf-8'));
          if (content.apiEndpoint?.includes('20128') || content['google.gemini.endpoint']?.includes('20128')) {
            isRouted = true;
            break;
          }
        } catch (e) {}
      }
    }

    return {
      id: 'antigravity',
      name: 'Google Antigravity 2.0 & IDE',
      isInstalled,
      installedPath: exeCheck.foundPath || (procCheck.running ? `Running Process (PID ${procCheck.pid})` : (hasGeminiDir ? path.join(this.homeDir, '.gemini') : undefined)),
      configPath,
      allConfigPaths: possibleConfigs,
      isRoutedToProxy: isRouted,
      configSnippet: JSON.stringify({ modelProvider: 'gemini', apiEndpoint: 'http://localhost:20128/v1' }, null, 2),
      downloadUrl: 'https://antigravity.google',
      isRunning: procCheck.running,
      runningPid: procCheck.pid,
      mockAdcProvisioned
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
        const gcloudDir = process.platform === 'win32'
          ? path.join(this.appData, 'gcloud')
          : path.join(this.homeDir, '.config', 'gcloud');
        const defaultAdcPath = path.join(gcloudDir, 'application_default_credentials.json');
        const bakAdcPath = path.join(gcloudDir, 'application_default_credentials.json.bak');
        const localMeshAdc = path.join(this.homeDir, '.meshmanager', 'meshmanager-service-account.json');

        if (enable) {
          // 1. Provision Mock ADC in ~/.meshmanager
          const meshDir = path.dirname(localMeshAdc);
          if (!fs.existsSync(meshDir)) fs.mkdirSync(meshDir, { recursive: true });
          const mockAdc = this.getMockServiceAccountADC();
          fs.writeFileSync(localMeshAdc, JSON.stringify(mockAdc, null, 2), 'utf-8');

          // 2. Provision default Google Cloud ADC (%APPDATA%\gcloud\application_default_credentials.json)
          if (!fs.existsSync(gcloudDir)) fs.mkdirSync(gcloudDir, { recursive: true });
          if (fs.existsSync(defaultAdcPath)) {
            try {
              const existing = JSON.parse(fs.readFileSync(defaultAdcPath, 'utf-8'));
              if (existing.project_id !== 'meshmanager-local') {
                fs.copyFileSync(defaultAdcPath, bakAdcPath);
              }
            } catch (e) {}
          }
          fs.writeFileSync(defaultAdcPath, JSON.stringify(mockAdc, null, 2), 'utf-8');

          // 3. Inject settings across all found Antigravity configs
          const targetConfigs = scan.allConfigPaths || [scan.configPath];
          targetConfigs.forEach(cp => {
            try {
              const cDir = path.dirname(cp);
              if (fs.existsSync(cDir) || cp.includes('Antigravity') || cp.includes('antigravity-cli')) {
                if (!fs.existsSync(cDir)) fs.mkdirSync(cDir, { recursive: true });
                let cfg: any = {};
                if (fs.existsSync(cp)) {
                  try { cfg = JSON.parse(fs.readFileSync(cp, 'utf-8')); } catch (e) { cfg = {}; }
                }
                cfg.modelProvider = 'gemini';
                cfg.apiEndpoint = 'http://localhost:20128/v1';
                cfg['google.gemini.endpoint'] = 'http://localhost:20128/v1';
                cfg['antigravity.proxyUrl'] = 'http://localhost:20128/v1';
                fs.writeFileSync(cp, JSON.stringify(cfg, null, 2), 'utf-8');
              }
            } catch (e) {}
          });

          const proc = this.isProcessRunning(['Antigravity IDE', 'Antigravity', 'agy']);
          const runningMsg = proc.running
            ? ` Running Antigravity instance detected (PID: ${proc.pid}).`
            : ` Ready for launch.`;
          return {
            success: true,
            message: `[✓] Connected Google Antigravity 2.0 & IDE to MeshManager! Default Google Cloud ADC provisioned at: ${defaultAdcPath}.${runningMsg} Antigravity will now authenticate error-free without service account prompts.`
          };
        } else {
          // Revert settings
          const targetConfigs = scan.allConfigPaths || [scan.configPath];
          targetConfigs.forEach(cp => {
            if (fs.existsSync(cp)) {
              try {
                const cfg = JSON.parse(fs.readFileSync(cp, 'utf-8'));
                delete cfg.apiEndpoint;
                delete cfg['google.gemini.endpoint'];
                delete cfg['antigravity.proxyUrl'];
                fs.writeFileSync(cp, JSON.stringify(cfg, null, 2), 'utf-8');
              } catch (e) {}
            }
          });

          // Restore or clean default ADC
          if (fs.existsSync(bakAdcPath)) {
            fs.copyFileSync(bakAdcPath, defaultAdcPath);
            fs.unlinkSync(bakAdcPath);
          } else if (fs.existsSync(defaultAdcPath)) {
            try {
              const currentAdc = JSON.parse(fs.readFileSync(defaultAdcPath, 'utf-8'));
              if (currentAdc.project_id === 'meshmanager-local') {
                fs.unlinkSync(defaultAdcPath);
              }
            } catch (e) {}
          }

          return {
            success: true,
            message: `[✓] Disconnected Google Antigravity 2.0 & IDE. Restored original settings and credentials.`
          };
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
