export default function WelcomeScreen({ onStart }) {
  return (
    <div className="screen">
      <div className="center-column">
        <p className="eyebrow">CREDENCIAMENTO</p>
        <h1 className="headline">
          Seu avatar
          <br />
          gerado por IA
        </h1>
        <p className="subtext">
          Toque em começar, escolha um estilo e receba sua versão em
          segundos — impressa na hora.
        </p>
        <button className="btn-primary" onClick={onStart} style={{ marginTop: 24 }}>
          Toque para começar
        </button>
      </div>
    </div>
  );
}
