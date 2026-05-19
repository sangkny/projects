"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var vscode = __toESM(require("vscode"));
var DIAG = vscode.languages.createDiagnosticCollection("autonogada-ontology");
function workspaceCfg() {
  return vscode.workspace.getConfiguration("autonogada");
}
function authHeaders() {
  const h = { "Content-Type": "application/json" };
  const t = workspaceCfg().get("apiToken", "");
  const tok = typeof t === "string" ? t.trim() : "";
  if (tok.length) {
    h.Authorization = `Bearer ${tok}`;
  }
  return h;
}
function baseUrl() {
  return (workspaceCfg().get("baseUrl") || "http://127.0.0.1:8002").replace(/\/$/, "");
}
async function postJson(url, body) {
  const r = await fetch(url, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  const text = await r.text();
  if (!r.ok) {
    throw new Error(`HTTP ${r.status}: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text);
}
function detectLang(uri) {
  const ext = uri.path.split(".").pop()?.toLowerCase() || "";
  if (ext === "py") return "python";
  if (ext === "ts" || ext === "tsx") return "typescript";
  if (ext === "rs") return "rust";
  return "python";
}
function chan() {
  return vscode.window.createOutputChannel("AutoNoGaDa");
}
function reveal(title, body) {
  const c = chan();
  c.appendLine("");
  c.appendLine(`===== ${title} =====`);
  c.appendLine(body);
  c.show(true);
}
function parseOntologyDiagnostics(summary, syntaxErrors) {
  const diags = [];
  syntaxErrors.forEach((s, row) => {
    diags.push(
      new vscode.Diagnostic(
        new vscode.Range(row, 0, row, Math.min(240, Math.max(s.length, 1))),
        `\uBB38\uBC95/\uC0CC\uB4DC\uBC15\uC2A4: ${s}`,
        vscode.DiagnosticSeverity.Error
      )
    );
  });
  summary.split(/\r?\n/).forEach((ln) => {
    const t = ln.trim();
    if (!t) return;
    const colEnd = Math.max(t.length, 1);
    const sev = /\bFAIL\b|❌|오류\b|\[(ERROR)/i.test(t) ? vscode.DiagnosticSeverity.Error : /WARN|⚠/i.test(t) ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Information;
    diags.push(new vscode.Diagnostic(new vscode.Range(0, 0, 0, colEnd), `Ontology: ${t}`, sev));
  });
  return diags;
}
async function cmdOntology() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) {
    vscode.window.showWarningMessage("\uC5F4\uB9B0 \uD3B8\uC9D1\uAE30\uAC00 \uC5C6\uC2B5\uB2C8\uB2E4.");
    return;
  }
  const uri = ed.document.uri;
  const lang = detectLang(uri);
  const code = ed.document.getText();
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "Ontology(polyglot)\u2026" },
    async () => {
      DIAG.delete(uri);
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/validate`, {
          code,
          language: lang,
          ontology: true
        });
        const summary = typeof j.ontology_summary === "string" ? j.ontology_summary : "";
        const syn = Array.isArray(j.syntax_errors) ? j.syntax_errors : [];
        DIAG.set(uri, parseOntologyDiagnostics(summary, syn));
        if (syn.length === 0 && j.ontology_passed !== false && j.valid === true) {
          vscode.window.showInformationMessage("Ontology(polyglot): OK");
          return;
        }
        vscode.window.showWarningMessage("Problems \uD328\uB110\uC5D0\uC11C ontology \uACB0\uACFC\uB97C \uD655\uC778\uD558\uC138\uC694.");
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        DIAG.set(uri, [
          new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, Math.min(msg.length, 200)),
            msg,
            vscode.DiagnosticSeverity.Error
          )
        ]);
        vscode.window.showErrorMessage(msg);
      }
    }
  );
}
async function cmdGenerate() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return;
  const lang = detectLang(ed.document.uri);
  let initial = "";
  if (!ed.selection.isEmpty) {
    initial = ed.document.getText(ed.selection);
  } else {
    const line = ed.document.lineAt(ed.selection.active.line).text.replace(/^\s*#\s*/, "");
    initial = line;
  }
  const task = await vscode.window.showInputBox({
    title: "\uCF54\uB4DC \uC0DD\uC131 \u2014 \uC791\uC5C5 \uC124\uBA85",
    prompt: "\uC8FC\uC11D \uC120\uD0DD \uB610\uB294 \uC785\uB825",
    value: initial.slice(0, 4e3)
  });
  if (!task?.trim()) return;
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "\uCF54\uB4DC \uC0DD\uC131\u2026" },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/generate`, {
          task,
          language: lang,
          framework: lang === "python" ? "fastapi" : null
        });
        let out = "";
        if (typeof j.output_code === "string" && j.output_code) out = j.output_code;
        else if (typeof j.summary === "string" && j.summary) out = j.summary;
        else out = JSON.stringify(j, null, 2);
        reveal(`generate (${lang})`, out);
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    }
  );
}
async function cmdReview() {
  const ed = vscode.window.activeTextEditor;
  if (!ed) return;
  const lang = detectLang(ed.document.uri);
  const code = ed.document.getText();
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "\uB9AC\uBDF0\u2026" },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/pipeline/review`, {
          code,
          language: lang,
          context: "vscode autonogada.review"
        });
        let out = "";
        if (typeof j.feedback === "string" && j.feedback) out = j.feedback;
        else if (typeof j.llm_review === "string" && j.llm_review) out = j.llm_review;
        else if (typeof j.ontology_summary === "string")
          out = j.ontology_summary;
        else out = JSON.stringify(j, null, 2);
        reveal(`review (${lang})`, out);
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    }
  );
}
async function cmdSvg() {
  const description = await vscode.window.showInputBox({
    prompt: "\uB2E4\uC774\uC5B4\uADF8\uB7A8 \uC0DD\uC131 \uC124\uBA85"
  });
  if (!description?.trim()) return;
  const types = [
    "flowchart",
    "architecture",
    "sequence",
    "er_diagram",
    "medical_report",
    "business_process"
  ];
  const svgType = await vscode.window.showQuickPick(types, { placeHolder: "svg_type \uC120\uD0DD" });
  if (!svgType) return;
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title: "SVG\u2026" },
    async () => {
      try {
        const j = await postJson(`${baseUrl()}/api/v1/svg/generate`, {
          description,
          svg_type: svgType,
          cache: true
        });
        const svg = typeof j.svg_content === "string" ? j.svg_content : String(j.svg_content ?? "");
        const d = await vscode.workspace.openTextDocument({
          language: "xml",
          content: svg
        });
        await vscode.window.showTextDocument(d, { preview: true });
      } catch (e) {
        vscode.window.showErrorMessage(`${e}`);
      }
    }
  );
}
function activate(context) {
  context.subscriptions.push(DIAG);
  context.subscriptions.push(
    vscode.commands.registerCommand("autonogada.ontology", cmdOntology),
    vscode.commands.registerCommand("autonogada.generate", cmdGenerate),
    vscode.commands.registerCommand("autonogada.review", cmdReview),
    vscode.commands.registerCommand("autonogada.svg", cmdSvg)
  );
  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => DIAG.delete(doc.uri))
  );
}
function deactivate() {
  DIAG.dispose();
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
