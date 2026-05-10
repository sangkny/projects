# Provider 비교 (Week 7 Day 2)

> 값은 로컬 측정·공개 과금 페이지 기준 **추정**입니다. 실제 지연은 모델·리전·배치 크기에 따라 달라집니다.

| 항목 | Local (gemma-4-e4b) | OpenAI (gpt-4o-mini) | Anthropic (claude-haiku) | Google (gemini-flash) |
|------|---------------------|-----------------------|---------------------------|-----------------------|
| 속도 (대표) | ~60s 단위 (LM Studio 로컬) | ~5s | ~8s | ~3s |
| 비용 | 0원 (전기 포함 제외) | ~$0.15/1M in (근사) | ~$0.25/1M in (근사) | ~$0.075/1M in (근사) |
| 품질 | 보통 | 높음 | 높음 | 높음 |
| 임베딩 | ✅ | ✅ | ❌ (`LLM_EMBED_PROVIDER=local` 권장) | ✅ |

## 전환 방법

```bash
cd projects
chmod +x switch_provider.sh   # 최초 1회 (WSL/Linux)
./switch_provider.sh openai    # 또는 local | anthropic | google
```

Docker Compose는 `.env.current` 파일을 **`--env-file`** 로 불러오도록 스크립트가 구성되어 있습니다.
