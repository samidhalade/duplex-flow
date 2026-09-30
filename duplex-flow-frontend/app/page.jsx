"use client";
import { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  BarVisualizer,
  useRoomContext,
  useVoiceAssistant,
} from "@livekit/components-react";
import { Mic, MicOff, PhoneOff, Wrench, MessageSquare } from "lucide-react";
import { getToken, getLogs } from "@/lib/api";

const STATE_LABEL = {
  disconnected: "Not connected",
  connecting: "Connecting…",
  initializing: "Agent is starting…",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

const show = (item) => (typeof item === "string" ? item : JSON.stringify(item));

function Agent({ onStateChange, micEnabled }) {
  const { state, audioTrack } = useVoiceAssistant();
  useEffect(() => onStateChange(state), [onStateChange, state]);
  return (
    <div className="orb">
      <BarVisualizer
        state={state}
        barCount={7}
        trackRef={audioTrack}
        className="bars"
      />
      <p className="state">
        {!micEnabled && state === "listening"
          ? "Microphone paused"
          : STATE_LABEL[state] || state}
      </p>
    </div>
  );
}

function SessionControls({ micEnabled, onMicChange, onEnd }) {
  const room = useRoomContext();
  const [micError, setMicError] = useState("");

  async function toggleMic() {
    const nextEnabled = !micEnabled;
    try {
      await room.localParticipant.setMicrophoneEnabled(nextEnabled);
      onMicChange(nextEnabled);
      setMicError("");
    } catch (error) {
      setMicError(`Microphone update failed: ${error.message}`);
    }
  }

  return (
    <div className="session-control-group">
      <div className="session-actions">
        <button
          className="btn mic-toggle"
          onClick={toggleMic}
          aria-pressed={!micEnabled}
        >
          {micEnabled ? <MicOff size={18} /> : <Mic size={18} />}
          {micEnabled ? "Stop listening" : "Resume listening"}
        </button>
        <button className="btn end" onClick={onEnd}>
          <PhoneOff size={18} /> End session
        </button>
      </div>
      {micError && (
        <p className="error" role="alert">
          {micError}
        </p>
      )}
    </div>
  );
}

function Col({ icon, title, items, empty }) {
  return (
    <section className="panel">
      <h2>
        {icon} {title}
      </h2>
      {items?.length ? (
        <ul>
          {items
            .slice()
            .reverse()
            .map((it, i) => (
              <li key={i}>{show(it)}</li>
            ))}
        </ul>
      ) : (
        <p className="muted">{empty}</p>
      )}
    </section>
  );
}

function Logs({ active, room }) {
  const [logs, setLogs] = useState({ calls: [], transcripts: [] });
  useEffect(() => {
    if (!active) return;
    let current = true;
    setLogs({ calls: [], transcripts: [] });
    const tick = () =>
      getLogs(room)
        .then((next) => {
          if (current) setLogs(next);
        })
        .catch(() => {});
    tick();
    const id = setInterval(tick, 1000);
    return () => {
      current = false;
      clearInterval(id);
    };
  }, [active, room]);

  return (
    <div className="grid2">
      <Col
        icon={<Wrench size={16} />}
        title="Tool calls"
        items={logs.calls}
        empty="Tool calls appear here as the agent books, updates and modifies things."
      />
      <Col
        icon={<MessageSquare size={16} />}
        title="Transcript"
        items={logs.transcripts}
        empty="Start a session and speak. Try: “Book me a flight to Dubai on April 10.”"
      />
    </div>
  );
}

export default function Studio() {
  const [conn, setConn] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [agentState, setAgentState] = useState("connecting");
  const [micEnabled, setMicEnabled] = useState(true);

  useEffect(() => {
    if (!conn || !["connecting", "initializing"].includes(agentState)) return;
    const timeout = setTimeout(() => {
      setError(
        "The voice agent did not join. Check the backend worker and try again.",
      );
      setConn(null);
    }, 30000);
    return () => clearTimeout(timeout);
  }, [agentState, conn]);

  async function start() {
    setBusy(true);
    setError("");
    setAgentState("connecting");
    setMicEnabled(true);
    try {
      setConn(await getToken());
    } catch (e) {
      setError(`Could not start a session: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <h1>Just tell it what you need.</h1>
      <p className="lede">
        Flights, passport updates, bill payments. Press Start session and ask.
      </p>

      <div className="stage">
        {conn ? (
          <LiveKitRoom
            token={conn.token}
            serverUrl={conn.url}
            connect
            audio
            video={false}
            onConnected={() => setAgentState("initializing")}
            onError={(connectionError) => {
              setError(`LiveKit connection failed: ${connectionError.message}`);
              setConn(null);
            }}
            onDisconnected={() => setConn(null)}
            data-lk-theme="default"
          >
            <Agent onStateChange={setAgentState} micEnabled={micEnabled} />
            <RoomAudioRenderer />
            <SessionControls
              micEnabled={micEnabled}
              onMicChange={setMicEnabled}
              onEnd={() => setConn(null)}
            />
          </LiveKitRoom>
        ) : (
          <div className="orb idle">
            <button className="btn" onClick={start} disabled={busy}>
              <Mic size={18} /> {busy ? "Connecting…" : "Start session"}
            </button>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </div>

      <Logs active={!!conn} room={conn?.room} />
    </div>
  );
}
