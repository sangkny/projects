"""Phase 2 W4 — 폴리glot 구문 검증 샌드박스(Python AST / TypeScript tsc / Rust rustc)."""
from __future__ import annotations

import ast
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

app = FastAPI(title="Polyglot Code Sandbox", version="0.1.0")


class ValidateBody(BaseModel):
    code: str = Field(min_length=1, max_length=200_000)
    language: str = Field(description="python | typescript | rust")


def _tsc_validate(code: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    with tempfile.TemporaryDirectory() as td:
        root = Path(td)
        (root / "tsconfig.json").write_text(
            json.dumps(
                {
                    "compilerOptions": {
                        "strict": True,
                        "noEmit": True,
                        "target": "ES2020",
                        "module": "CommonJS",
                        "lib": ["ES2020"],
                        "skipLibCheck": True,
                    },
                    "files": ["snippet.ts"],
                },
                indent=2,
            ),
            encoding="utf-8",
        )
        (root / "snippet.ts").write_text(code, encoding="utf-8")
        tsc = shutil.which("tsc") or "tsc"
        r = subprocess.run(
            [tsc, "--project", str(root)],
            capture_output=True,
            text=True,
            timeout=60,
        )
        if r.returncode != 0:
            err = (r.stdout or "").strip() + "\n" + (r.stderr or "").strip()
            errors.append(err.strip() or "tsc 실패")
    return errors, warnings


def _rust_validate(code: str) -> tuple[list[str], list[str]]:
    errors: list[str] = []
    warnings: list[str] = []
    rustc = shutil.which("rustc") or "rustc"
    with tempfile.TemporaryDirectory() as td:
        crate = Path(td) / "lib.rs"
        # 라이브러리 크레이트 근처 — 단일 모듈로 컴파일
        merged = "#![allow(dead_code, warnings)]\n" + code
        crate.write_text(merged, encoding="utf-8")
        outp = Path(td) / "lib_poly.rlib"
        r = subprocess.run(
            [rustc, "--crate-type", "lib", str(crate), "-o", str(outp)],
            capture_output=True,
            text=True,
            timeout=90,
        )
        if r.returncode != 0:
            err = (r.stderr or "").strip() + "\n" + (r.stdout or "").strip()
            errors.append(err.strip() or "rustc 실패")
    return errors, warnings


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "code-sandbox"}


@app.post("/validate")
async def validate_syntax(body: ValidateBody) -> dict:
    lang = body.language.strip().lower()
    syntax_errors: list[str] = []
    style_warnings: list[str] = []

    if lang == "python":
        try:
            ast.parse(body.code)
        except SyntaxError as e:
            syntax_errors.append(f"{e.msg} (line {e.lineno})")
    elif lang == "typescript":
        se, sw = _tsc_validate(body.code)
        syntax_errors.extend(se)
        style_warnings.extend(sw)
    elif lang == "rust":
        se, sw = _rust_validate(body.code)
        syntax_errors.extend(se)
        style_warnings.extend(sw)
    else:
        syntax_errors.append(f"지원하지 않는 language: {body.language}")

    return {
        "valid": len(syntax_errors) == 0,
        "syntax_errors": syntax_errors,
        "style_warnings": style_warnings,
    }
