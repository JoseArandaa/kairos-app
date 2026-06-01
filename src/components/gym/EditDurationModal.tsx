import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { ModalShell } from "../common/ModalShell";
import { colors } from "../../theme/colors";

interface EditDurationModalProps {
  visible: boolean;
  initialSeconds: number;
  onClose: () => void;
  onSave: (_seconds: number) => void;
  title?: string;
  hint?: string;
  saveLabel?: string;
}

const ITEM_HEIGHT = 48;
const VISIBLE_COUNT = 5;
const CENTER_OFFSET = ITEM_HEIGHT * Math.floor(VISIBLE_COUNT / 2);

interface WheelProps {
  value: number;
  max: number;
  onChange: (_v: number) => void;
  label: string;
}

function Wheel({ value, max, onChange, label }: WheelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const [editing, setEditing] = useState(false);
  const [draftText, setDraftText] = useState(String(value));
  const [centerIdx, setCenterIdx] = useState(value);
  const items = Array.from({ length: max + 1 }, (_, i) => i);
  const isProgrammaticScroll = useRef(false);

  useEffect(() => {
    if (editing) {
      setDraftText(String(value));
      return;
    }
    isProgrammaticScroll.current = true;
    scrollRef.current?.scrollTo({ y: value * ITEM_HEIGHT, animated: false });
    setCenterIdx(value);
    requestAnimationFrame(() => {
      isProgrammaticScroll.current = false;
    });
  }, [value, editing]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isProgrammaticScroll.current) return;
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(max, idx));
    if (clamped !== centerIdx) setCenterIdx(clamped);
  };

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(max, idx));
    if (clamped !== value) onChange(clamped);
  };

  const handleDraftChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 2);
    setDraftText(cleaned);
    if (cleaned === "") return;
    const v = parseInt(cleaned, 10);
    if (Number.isFinite(v)) {
      onChange(Math.max(0, Math.min(max, v)));
    }
  };

  const closeEdit = () => {
    setEditing(false);
  };

  const openEdit = () => {
    setDraftText(String(value));
    setEditing(true);
  };

  return (
    <View style={styles.wheelCol}>
      <View
        style={[styles.wheelContainer, { height: ITEM_HEIGHT * VISIBLE_COUNT }]}
        accessibilityLabel={`${label}: ${value}`}
      >
        <ScrollView
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{
            paddingTop: CENTER_OFFSET,
            paddingBottom: CENTER_OFFSET,
          }}
          onScroll={handleScroll}
          onMomentumScrollEnd={handleScrollEnd}
          scrollEventThrottle={16}
          scrollEnabled={!editing}
          overScrollMode="never"
          bounces={false}
        >
          {items.map((n) => {
            const dist = Math.abs(n - centerIdx);
            const isCenter = dist === 0;
            return (
              <TouchableOpacity
                key={n}
                style={styles.wheelItem}
                onPress={isCenter ? openEdit : undefined}
                activeOpacity={isCenter ? 0.6 : 1}
                disabled={editing}
              >
                <Text
                  style={[
                    styles.wheelText,
                    isCenter
                      ? styles.wheelTextActive
                      : dist === 1
                        ? styles.wheelTextNear
                        : styles.wheelTextFar,
                  ]}
                >
                  {String(n).padStart(2, "0")}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {editing && (
          <View style={[styles.editOverlay, { top: CENTER_OFFSET, height: ITEM_HEIGHT }]}>
            <TextInput
              style={styles.editInput}
              value={draftText}
              onChangeText={handleDraftChange}
              onBlur={closeEdit}
              onSubmitEditing={closeEdit}
              keyboardType="number-pad"
              maxLength={2}
              autoFocus
              selectTextOnFocus
              returnKeyType="done"
            />
          </View>
        )}

        <View pointerEvents="none" style={[styles.centerBar, { top: CENTER_OFFSET }]} />
      </View>
      <Text style={styles.wheelLabel}>{label}</Text>
    </View>
  );
}

export function EditDurationModal({
  visible,
  initialSeconds,
  onClose,
  onSave,
  title = "Editar duración",
  hint,
  saveLabel = "Guardar",
}: EditDurationModalProps) {
  const initialH = Math.floor(Math.max(0, initialSeconds) / 3600);
  const initialM = Math.floor((Math.max(0, initialSeconds) % 3600) / 60);

  const [h, setH] = useState(initialH);
  const [m, setM] = useState(initialM);

  useEffect(() => {
    if (visible) {
      setH(initialH);
      setM(initialM);
    }
  }, [visible, initialH, initialM]);

  const handleSave = () => {
    const total = h * 3600 + m * 60;
    if (total <= 0) {
      onClose();
      return;
    }
    onSave(total);
    onClose();
  };

  return (
    <ModalShell
      visible={visible}
      onClose={onClose}
      title={title}
      hint={hint}
      onSave={handleSave}
      saveLabel={saveLabel}
    >
      <View style={styles.wheels}>
        <Wheel value={h} max={23} onChange={setH} label="horas" />
        <Text style={styles.colon}>:</Text>
        <Wheel value={m} max={59} onChange={setM} label="minutos" />
      </View>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  wheels: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
    gap: 8,
  },
  colon: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.textPrimary,
    marginTop: -24,
  },
  wheelCol: { alignItems: "center" },
  wheelContainer: {
    width: 100,
    position: "relative",
    overflow: "hidden",
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  wheelText: {
    fontSize: 24,
    fontWeight: "600",
    color: colors.textMuted,
    fontVariant: ["tabular-nums"],
  },
  wheelTextActive: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.navy,
  },
  wheelTextNear: { opacity: 0.6 },
  wheelTextFar: { opacity: 0.25 },

  centerBar: {
    position: "absolute",
    left: 6,
    right: 6,
    height: ITEM_HEIGHT,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: 8,
  },

  editOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cardBg,
  },
  editInput: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.navy,
    fontVariant: ["tabular-nums"],
    textAlign: "center",
    minWidth: 80,
    paddingVertical: 0,
  },

  wheelLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});
