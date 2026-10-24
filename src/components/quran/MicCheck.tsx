import { useCallback, useEffect, useRef, useState } from "react";
import { GameButton } from "@/components/game/GameButton";

/**
 * Parent-only microphone check, opened from the Quran memorize screen when the address has ?micCheck.
 * Shows whether sound reaches the page and how loud it is, so a quiet microphone can be told apart from a
 * speech-engine problem. Nothing is recorded, saved or sent, and the microphone is released when it closes.
 */

type Status = "idle" | "live" | "denied" | "unsupported" | "error";

const LOUD = 0.25; // roughly -45 dB: clearly speaking
const FAINT = 0.04; // roughly -58 dB: just above silence
const NO_SIGNAL_MS = 3000;

export function MicCheck({ speechAvailable, onClose }: { speechAvailable: boolean; onClose: () => void }) {
  const [status, setStatus] = useState<Status>("idle");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");
  const [level, setLevel] = useState(0);
  const [message, setMessage] = useState("Press Start, then speak at your normal quiet voice.");

  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef(0);
  const runRef = useRef(0); // bumped on every start/stop so stale async steps do nothing
  const startedAt = useRef(0);
  const lastLoud = useRef(0);
  const lastMessage = useRef("");
  const unmounted = useRef(false);

  /** Stop the animation, release every microphone track and close the audio context. */
  const release = useCallback(() => {
    runRef.current++;
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    const ctx = ctxRef.current;
    ctxRef.current = null;
    ctx?.close().catch(() => {});
  }, []);

  const say = (text: string) => {
    if (lastMessage.current === text) return;
    lastMessage.current = text;
    setMessage(text);
  };

  const start = useCallback(async (id?: string) => {
    release();
    const run = runRef.current;
    if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === "undefined") {
      setStatus("unsupported");
      say("This browser cannot read the microphone here.");
      return;
    }
    setStatus("idle");
    say("Starting the microphone…");

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: id ? { exact: id } : undefined,
          // Leave the signal as the device gives it: these processors can push quiet speech away.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });
    } catch (err) {
      if (run !== runRef.current) return;
      const name = (err as DOMException | undefined)?.name;
      const denied = name === "NotAllowedError" || name === "SecurityError";
      setStatus(denied ? "denied" : "error");
      say(denied
        ? "Microphone permission was refused. Allow it in the browser's site settings, then press Start."
        : "No microphone could be opened. Check that one is connected.");
      return;
    }
    if (run !== runRef.current || unmounted.current) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    streamRef.current = stream;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 2048;
    ctx.createMediaStreamSource(stream).connect(analyser); // analysis only: nothing is played back or stored
    const buf = new Float32Array(analyser.fftSize);
    startedAt.current = performance.now();
    lastLoud.current = 0;
    setStatus("live");

    const tick = () => {
      if (run !== runRef.current) return;
      analyser.getFloatTimeDomainData(buf);
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += buf[i]! * buf[i]!;
      const rms = Math.sqrt(sum / buf.length);
      const db = 20 * Math.log10(rms || 1e-7);
      const lvl = Math.max(0, Math.min(1, (db + 60) / 60));
      const now = performance.now();
      if (lvl >= LOUD) lastLoud.current = now;
      setLevel(lvl);

      if (now - startedAt.current < 1500) say("Listening…");
      else if (now - lastLoud.current < 1500) say("Sound is coming through clearly.");
      else if (lvl > FAINT) say("Sound is arriving but faint. Try speaking a little closer, or choose another microphone.");
      else if (now - startedAt.current > NO_SIGNAL_MS) say("No sound is reaching the page. Check the microphone, its mute switch, or choose another one.");

      rafRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Device names are only readable after permission, so list them now.
    try {
      const inputs = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput");
      if (run !== runRef.current) return;
      setDevices(inputs);
      setDeviceId(stream.getAudioTracks()[0]?.getSettings().deviceId ?? id ?? "");
    } catch {
      /* device list is optional */
    }
  }, [release]);

  useEffect(() => {
    unmounted.current = false;
    return () => {
      unmounted.current = true;
      release();
    };
  }, [release]);

  const close = () => {
    release();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4" role="dialog" aria-modal="true" aria-label="Parent microphone check">
      <div className="grid w-full max-w-md gap-4 rounded-3xl bg-card p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black">Microphone check</h2>
          <button type="button" onClick={close} className="min-h-11 rounded-full px-3 text-sm font-black text-muted-foreground underline">Close</button>
        </div>

        <p className="text-sm font-bold">{message}</p>

        <div
          role="meter"
          aria-label="Microphone input level"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(level * 100)}
          className="h-4 overflow-hidden rounded-full bg-muted"
        >
          <div className="h-full rounded-full bg-success transition-[width] duration-75" style={{ width: `${Math.round(level * 100)}%` }} />
        </div>

        {devices.length > 1 && (
          <label className="grid gap-1 text-sm font-bold">
            Microphone
            <select
              value={deviceId}
              onChange={(e) => { setDeviceId(e.target.value); void start(e.target.value); }}
              className="min-h-11 rounded-xl border-2 border-border bg-background px-3"
            >
              {devices.map((d, i) => (
                <option key={d.deviceId || i} value={d.deviceId}>{d.label || `Microphone ${i + 1}`}</option>
              ))}
            </select>
          </label>
        )}

        <p className="text-xs font-bold text-muted-foreground">
          {speechAvailable
            ? "Speech recognition is available here. If sound shows above but words are not picked up, the problem is in the browser's speech engine: try Chrome and a quieter room."
            : "This browser has no speech recognition, so children will tap the light for each word instead."}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <GameButton tone="neutral" className="min-h-12" onClick={close}>Done</GameButton>
          <GameButton tone="mint" className="min-h-12" onClick={() => void start(deviceId || undefined)} disabled={status === "unsupported"}>
            {status === "live" ? "Restart" : "Start"}
          </GameButton>
        </div>
      </div>
    </div>
  );
}
