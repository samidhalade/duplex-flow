from pathlib import Path
from tempfile import gettempdir

RUNTIME_DIR = Path(gettempdir()) / "duplex-flow"
RUNTIME_DIR.mkdir(parents=True, exist_ok=True)

AGENT_HEARTBEAT_LOG = RUNTIME_DIR / "agent_heartbeat.log"
AGENT_TOOL_CALLS_LOG = RUNTIME_DIR / "agent_tool_calls.log"
AGENT_TRANSCRIPTS_LOG = RUNTIME_DIR / "agent_transcripts.log"