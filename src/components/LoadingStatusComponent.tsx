import { useState } from "preact/hooks";

const steps = ["⠟", "⠯", "⠷", "⠾", "⠽", "⠻"];

export default function LoadingStatusComponent() {
  const [step, setStep] = useState(0);

  setTimeout(() => {
    setStep((step + 1) % steps.length);
  }, 100);

  return <>{steps[step]}</>;
}
