import React from "react";
import { useGymStore } from "../../store/gymStore";
import { DurationPickerModal } from "./DurationPickerModal";

interface RestSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function RestSettingsModal({ visible, onClose }: RestSettingsModalProps) {
  const restDefaultSeconds = useGymStore((s) => s.restDefaultSeconds);
  const restEndsAt = useGymStore((s) => s.restEndsAt);
  const setRestDefault = useGymStore((s) => s.setRestDefault);
  const startRest = useGymStore((s) => s.startRest);

  const handleSave = (next: number) => {
    setRestDefault(next);
    if (restEndsAt) startRest(next);
  };

  return (
    <DurationPickerModal
      visible={visible}
      onClose={onClose}
      initialSeconds={restDefaultSeconds}
      onSave={handleSave}
      title="Descanso por defecto"
      saveLabel={restEndsAt ? "Guardar y reiniciar" : "Guardar"}
    />
  );
}
