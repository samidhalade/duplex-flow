import json
from pathlib import Path as FilePath
from fastapi import APIRouter, HTTPException
from app.services.livekit_service import generate_room_token
from app.core.runtime_paths import AGENT_TOOL_CALLS_LOG, AGENT_TRANSCRIPTS_LOG

router = APIRouter()

BASE_DIR = FilePath(__file__).resolve().parent.parent.parent
PASS_REPORT = BASE_DIR / "app/ai/fdb_v3_data_released/gemini2_5_pass_rate_report.json"
EVAL_REPORT = BASE_DIR / "app/ai/fdb_v3_data_released/gemini2_5_evaluation_report.json"
TOOL_LOG = AGENT_TOOL_CALLS_LOG
TRANSCRIPT_LOG = AGENT_TRANSCRIPTS_LOG

@router.get("/api/token")
async def get_token():
    return generate_room_token()

@router.get("/api/benchmark")
async def get_benchmark():
    try:
        pr = json.loads(PASS_REPORT.read_text(encoding="utf-8")) if PASS_REPORT.exists() else {}
        ev = json.loads(EVAL_REPORT.read_text(encoding="utf-8")) if EVAL_REPORT.exists() else {}
        return {"pass_rate": pr, "eval_report": ev}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/api/live-logs")
async def get_live_logs(room: str = ""):
    calls, transcripts = [], []
    if TOOL_LOG.exists():
        for line in TOOL_LOG.read_text(encoding="utf-8", errors="ignore").splitlines():
            try:
                obj = json.loads(line)
                if not room or obj.get("room") == room: calls.append(obj.get("call"))
            except: pass
    if TRANSCRIPT_LOG.exists():
        for line in TRANSCRIPT_LOG.read_text(encoding="utf-8", errors="ignore").splitlines():
            try:
                obj = json.loads(line)
                if not room or obj.get("room") == room: transcripts.append(obj.get("text"))
            except: pass
    return {"calls": calls[-15:], "transcripts": transcripts[-10:]}

@router.post("/api/clear-logs")
async def clear_logs():
    for p in [TOOL_LOG, TRANSCRIPT_LOG]:
        if p.exists(): p.write_text("", encoding="utf-8")
    return {"ok": True}
