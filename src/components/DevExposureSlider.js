import React from 'react';
import { PanResponder, Text, View } from 'react-native';

// [DEV] Plain-RN drag slider (no external Slider dependency) for sweeping
// scout exposure across its full 0-100 range on the recruiting screen.
export function DevExposureSlider({ value, actual, overridden, onChange, onClear, styles }) {
  const [width, setWidth] = React.useState(0);
  const widthRef = React.useRef(0);
  const onChangeRef = React.useRef(onChange);
  widthRef.current = width;
  onChangeRef.current = onChange;

  const setFromX = (x) => {
    const w = widthRef.current;
    if (w <= 0) return;
    const pct = Math.max(0, Math.min(1, x / w));
    onChangeRef.current(Math.round(pct * 100));
  };

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => setFromX(evt.nativeEvent.locationX),
      onPanResponderMove: (evt) => setFromX(evt.nativeEvent.locationX),
    })
  ).current;

  const pct = Math.max(0, Math.min(100, value)) / 100;

  return (
    <View style={styles.devSliderWrap}>
      <View style={styles.devSliderLabelRow}>
        <Text style={styles.devSliderLabel}>[DEV] RECRUITING SCORE OVERRIDE</Text>
        <Text style={styles.devSliderValue}>{value}</Text>
      </View>
      <View
        style={styles.devSliderTrack}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...panResponder.panHandlers}
      >
        <View style={[styles.devSliderFill, { width: `${pct * 100}%` }]} />
        <View style={[styles.devSliderThumb, { left: `${pct * 100}%` }]} />
      </View>
      <View style={styles.devSliderFootRow}>
        <Text style={styles.devSliderHint}>Actual season exposure: {actual}</Text>
        {overridden ? (
          <Text style={styles.devSliderReset} onPress={onClear}>Reset to actual</Text>
        ) : null}
      </View>
    </View>
  );
}
