import { useState, useEffect } from "react";
import WelcomeScreen from "./screens/WelcomeScreen.jsx";
import CodeEntryScreen from "./screens/CodeEntryScreen.jsx";
import StyleSelect from "./screens/StyleSelect.jsx";
import CameraCapture from "./screens/CameraCapture.jsx";
import Generating from "./screens/Generating.jsx";
import ResultScreen from "./screens/ResultScreen.jsx";

const STEPS = {
  WELCOME: "welcome",
  CODE: "code",
  STYLE: "style",
  CAMERA: "camera",
  GENERATING: "generating",
  RESULT: "result",
};

// Tempo de inatividade na tela de resultado antes de voltar ao início
// automaticamente, para liberar o totem para o próximo visitante.
const IDLE_RESET_MS = 25000;

export default function App() {
  const [step, setStep] = useState(STEPS.WELCOME);
  const [visitante, setVisitante] = useState(null);
  const [styleId, setStyleId] = useState(null);
  const [photoBlob, setPhotoBlob] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  function reset() {
    setStep(STEPS.WELCOME);
    setVisitante(null);
    setStyleId(null);
    setPhotoBlob(null);
    setResultado(null);
    setError(null);
  }

  useEffect(() => {
    if (step !== STEPS.RESULT) return;
    const t = setTimeout(reset, IDLE_RESET_MS);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <>
      {step === STEPS.WELCOME && (
        <WelcomeScreen onStart={() => setStep(STEPS.CODE)} />
      )}

      {step === STEPS.CODE && (
        <CodeEntryScreen
          onFound={(v) => {
            setVisitante(v);
            setStep(STEPS.STYLE);
          }}
          onSkip={() => setStep(STEPS.STYLE)}
        />
      )}

      {step === STEPS.STYLE && (
        <StyleSelect
          onSelect={(id) => {
            setStyleId(id);
            setStep(STEPS.CAMERA);
          }}
        />
      )}

      {step === STEPS.CAMERA && (
        <CameraCapture
          onCapture={(blob) => {
            setPhotoBlob(blob);
            setStep(STEPS.GENERATING);
          }}
        />
      )}

      {step === STEPS.GENERATING && (
        <Generating
          photoBlob={photoBlob}
          styleId={styleId}
          visitante={visitante}
          onDone={(res) => {
            setResultado(res);
            setStep(STEPS.RESULT);
          }}
          onError={(err) => {
            setError(err.message);
            setStep(STEPS.STYLE);
          }}
        />
      )}

      {step === STEPS.RESULT && (
        <ResultScreen resultado={resultado} onRestart={reset} />
      )}

      {error && step === STEPS.STYLE && (
        <div style={{ position: "fixed", bottom: 24, left: 40, right: 40 }}>
          <div className="error-box">{error}</div>
        </div>
      )}
    </>
  );
}
