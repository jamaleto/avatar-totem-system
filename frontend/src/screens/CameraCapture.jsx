import { useEffect, useRef, useState } from "react";

export default function CameraCapture({ onCapture }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [countdown, setCountdown] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let stream;
    navigator.mediaDevices
      .getUserMedia({ video: { width: 1280, height: 1280, facingMode: "user" } })
      .then((s) => {
        stream = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      })
      .catch(() => setError("Não foi possível acessar a câmera do totem."));

    return () => stream?.getTracks().forEach((t) => t.stop());
  }, []);

  function startCountdown() {
    let n = 3;
    setCountdown(n);
    const interval = setInterval(() => {
      n -= 1;
      if (n === 0) {
        clearInterval(interval);
        setCountdown(null);
        capturePhoto();
      } else {
        setCountdown(n);
      }
    }, 800);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob((blob) => onCapture(blob), "image/jpeg", 0.92);
  }

  return (
    <div className="screen">
      <p className="eyebrow">PASSO 3</p>
      <h1 className="headline">Sorria para a câmera</h1>

      <div className="camera-frame">
        {error ? (
          <p className="subtext">{error}</p>
        ) : (
          <video ref={videoRef} autoPlay playsInline muted />
        )}
        {countdown && <div className="countdown-badge">{countdown}</div>}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <button
        className="btn-primary"
        onClick={startCountdown}
        disabled={!!error || countdown !== null}
      >
        Tirar foto
      </button>
    </div>
  );
}
