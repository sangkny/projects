/** AutoNoGaDa VS Code — Phase 2 W10 */

import * as vscode from 'vscode';

const DIAG = vscode.languages.createDiagnosticCollection('autonogada-ontology');

function workspaceCfg(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration('autonogada');
}

function authHeaders(): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = workspaceCfg().get<string>('apiToken', '');
  const tok = typeof t === 'string' ? t.trim() : '';
  if (tok.length) {
    h.Authorization = `Bearer ${tok}`;
  }
  return h;
}

function baseUrl(): string {
  return (
    workspaceCfg().get<string>('baseUrl') || 'http://127.0.0.1:8002'
  ).replace(/\/$/, '');
}

async function postJson(url: string, body: unknown): Promise<Record<string, unknown>> {
  const r = await fetch(url, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text) as Record<string, unknown>;
}

function detectLang(uri: vscode.Uri): string {
  const ext = uri.path.split('.').pop()?.toLowerCase() || '';
  if (ext === 'py') return 'python';
  if (ext === 'ts' || ext === 'tsx') return 'typescript';
  if (ext === 'rs') return 'rust';
  return 'python';
}

function chan(): vscode.OutputChannel {
  return vscode.window.createOutputChannel('AutoNoGaDa');
}

function reveal(title: string, body: string) {
  const c = chan();
  c.appendLine('');
  c.appendLine(`===== ${title} =====`);
  c.appendLine(body);
  c.show(true);
}

function parseOntologyDiagnostics(
  summary: string,
  syntaxErrors: string[],
): vscode.Diagnostic[] {
  const diags: vscode.Diagnostic[] = [];
  syntaxErrors.forEach((s, row) => {
    diags.push(
      new vscode.Diagnostic(
        new vscode.Range(row, 0, row, Math.min(240, Math.max(s.length, 1))),
        `문법/샌드박스: ${s}`,
        vscode.DiagnosticSeverity.Error,
      ),
    );
  });
  summary.split(/\r?\n/).forEach((ln) => {
    const t = ln.trim();
    if (!t) return;
    const colEnd = Math.max(t.length, 1);
    const sev =
      /\bFAIL\b|❌|오류\b|\[(ERROR)/i.test(t)
        ? vscode.DiagnosticSeverity.Error
        : /WARN|⚠/i.test(t)
          ? vscode.DiagnosticSeverity.Warning
          : vscode.DiagnosticSeverity.Information;
    diags.push(new vscode.Diagnostic(new vscode.Range(0, 0, 0, colEnd), `Ontology: ${t}`, sev));
  });
  return diags;
}

async function cmdOntology() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) {
    vscode.window.showWarningMessage('열린 편집기가 없습니다.');
    return;
  }
  const uri = ed.document.uri;
  const lang = detectLang(uri);
  const code = ed.document.getText();

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'Ontology(polyglot)…' },
    async () => {
      DIAG.delete(uri);
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/validate`, {
          code,
          language: lang,
          ontology: true,
        });
        const summary = typeof j.ontology_summary === 'string' ? j.ontology_summary : '';
        const syn = Array.isArray(j.syntax_errors) ? (j.syntax_errors as string[]) : [];
        DIAG.set(uri, parseOntologyDiagnostics(summary, syn));
        if (syn.length === 0 && j.ontology_passed !== false && j.valid === true) {
          vscode.window.showInformationMessage('Ontology(polyglot): OK');
          return;
        }
        vscode.window.showWarningMessage('Problems 패널에서 ontology 결과를 확인하세요.');
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        DIAG.set(uri, [
          new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, Math.min(msg.length, 200)),
            msg,
            vscode.DiagnosticSeverity.Error,
          ),
        ]);
        vscode.window.showErrorMessage(msg);
      }
    },
  );
}

async function cmdGenerate() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return;
  const lang = detectLang(ed.document.uri);
  let initial = '';
  if (!ed.selection.isEmpty) {
    initial = ed.document.getText(ed.selection);
  } else {
    const line = ed.document.lineAt(ed.selection.active.line).text.replace(/^\s*#\s*/, '');
    initial = line;
  }
  const task = await vscode.window.showInputBox({
    title: '코드 생성 — 작업 설명',
    prompt: '주석 선택 또는 입력',
    value: initial.slice(0, 4000),
  });
  if (!task?.trim()) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: '코드 생성…' },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/generate`, {
          task,
          language: lang,
          framework: lang === 'python' ? 'fastapi' : null,
        });
        let out = '';
        if (typeof j.output_code === 'string' && j.output_code) out = j.output_code;
        else if (typeof j.summary === 'string' && j.summary) out = j.summary;
        else out = JSON.stringify(j, null, 2);
        reveal(`generate (${lang})`, out);
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    },
  );
}

async function cmdReview() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return;
  const lang = detectLang(ed.document.uri);
  const code = ed.document.getText();

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: '리뷰…' },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/review`, {
          code,
          language: lang,
          context: 'vscode autonogada.review',
        });
        let out = '';
        if (typeof j.feedback === 'string' && j.feedback) out = j.feedback;
        else if (typeof j.llm_review === 'string' && j.llm_review) out = j.llm_review;
        else if (typeof j.ontology_summary === 'string')
          out = j.ontology_summary;
        else out = JSON.stringify(j, null, 2);
        reveal(`review (${lang})`, out);
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    },
  );
}

async function cmdSvg() {
  const description = await vscode.window.showInputBox({
    prompt: '다이어그램 생성 설명',
  });
  if (!description?.trim()) return;

  const types = [
    'flowchart',
    'architecture',
    'sequence',
    'er_diagram',
    'medical_report',
    'business_process',
  ];
  const svgType =
    await vscode.window.showQuickPick(types, { placeHolder: 'svg_type 선택' });
  if (!svgType) return;

  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: 'SVG…' },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/svg/generate`, {
          description,
          svg_type: svgType,
          cache: true,
        });
        const svg =
          typeof j.svg_content === 'string' ? j.svg_content : String(j.svg_content ?? '');
        const d = await vscode.workspace.openTextDocument({
          language: 'xml',
          content: svg,
        });
        await vscode.window.showTextDocument(d, { preview: true });
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    },
  );
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(DIAG);
  context.subscriptions.push(
    vscode.commands.registerCommand('autonogada.ontology', cmdOntology),
    vscode.commands.registerCommand('autonogada.generate', cmdGenerate),
    vscode.commands.registerCommand('autonogada.review', cmdReview),
    vscode.commands.registerCommand('autonogada.svg', cmdSvg),
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => DIAG.delete(doc.uri)),
  );
}

export function deactivate(): void {
  DIAG.dispose();
}
