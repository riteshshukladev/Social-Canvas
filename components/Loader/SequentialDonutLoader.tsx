import React, { useEffect, useMemo, useRef } from "react";
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";

/**
 * SequentialDonutLoader (React Native)
 *
 * A faithful RN port of the web "Sequential Donut → Circle" loader.
 * Animates 4 balls (Top→Right→Bottom→Left) in a strict sequence.
 *
 * Notes:
 * - Uses React Native's Animated API with native driver.
 * - The "donut" effect is rendered by an inner circle (hole) scaling from
 *   `holeMax` → 0 during the active quarter.
 * - Exact timing mirrors the original: hold 0–8%, peak at 16%, settle by 25%.
 */
export interface SequentialDonutLoaderProps {
  /** Loader diameter (px) */
  size?: number; // default 60
  /** Ball diameter (px) */
  ball?: number; // default 13
  /** Inset of balls from base edge (px) */
  gap?: number; // default 10
  /** Ball color */
  color?: string; // default '#fff'
  /** Loader base / donut-hole color */
  base?: string; // default '#000'
  /** Full loop duration in ms (Top→Right→Bottom→Left) */
  duration?: number; // default 4000
  /** Active ball growth factor */
  activeScale?: number; // default 1.1
  /** 0..1 initial donut hole size during "hold" */
  holeMax?: number; // default 0.62
  /** Easing bezier tuple (x1,y1,x2,y2) */
  ease?: [number, number, number, number]; // default [0.4, 0, 0.2, 1]
  /** Render a fullscreen overlay (centered) */
  overlay?: boolean; // default true
  /** Tint behind the loader when overlay is true */
  overlayTint?: string; // default 'rgba(0,0,0,0.15)'
  /** zIndex for the overlay */
  zIndex?: number; // default 9999
  /** Additional style for the inline wrapper or overlay container */
  style?: ViewStyle;
  /** Accessibility label */
  accessibilityLabel?: string; // default 'Loading'
  /** Optional text to display below the loader */
  text?: string;
  /** Style for the text */
  textStyle?: TextStyle;
}

const indices = [0, 1, 2, 3] as const;

const pct = {
  holdEnd: 0.08, // 8%
  peak: 0.16, // 16%
  settle: 0.25, // 25%
};

export default function SequentialDonutLoader({
  size = 60,
  ball = 13,
  gap = 10,
  color = "#fff",
  base = "#000",
  duration = 4000,
  activeScale = 1.1,
  holeMax = 0.62,
  ease = [0.4, 0, 0.2, 1],
  overlay = true,
  overlayTint = "rgba(0,0,0,0.15)",
  zIndex = 9999,
  style,
  accessibilityLabel = "Loading",
  text,
  textStyle,
}: SequentialDonutLoaderProps) {
  const quarter = duration / 4;
  const center = (size - ball) / 2;
  const easing = useMemo(() => Easing.bezier(...ease), [ease]);

  // One phase value per ball, looping with per-ball offsets
  const phases = indices.map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    const anims = phases.map((phase, idx) => {
      // Initial paint: only the top ball shows a donut; others are filled
      phase.setValue(idx === 0 ? 0 : pct.settle);

      return Animated.loop(
        Animated.sequence([
          Animated.delay(Math.round(idx * quarter)),
          // snap to 0 to start this ball's turn
          Animated.timing(phase, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
          // run full [0..1] phase over the entire duration (like CSS keyframes)
          Animated.timing(phase, {
            toValue: 1,
            duration,
            easing,
            useNativeDriver: true,
          }),
        ])
      );
    });

    anims.forEach((a) => a.start());
    return () => {
      anims.forEach((a) => a.stop());
    };
  }, [duration, quarter, phases, easing]);

  const slotCommon: ViewStyle = {
    position: "absolute",
    width: ball,
    height: ball,
  };

  // Precompute slot positions
  const slots = [
    {
      // top
      style: { ...slotCommon, top: gap, left: center } as ViewStyle,
    },
    {
      // right
      style: { ...slotCommon, top: center, right: gap } as ViewStyle,
    },
    {
      // bottom
      style: { ...slotCommon, bottom: gap, left: center } as ViewStyle,
    },
    {
      // left
      style: { ...slotCommon, top: center, left: gap } as ViewStyle,
    },
  ];

  const renderBall = (idx: number) => {
    const phase = phases[idx];

    const scale = phase.interpolate({
      inputRange: [0, pct.holdEnd, pct.peak, pct.settle, 1],
      outputRange: [1, 1, activeScale, 1, 1],
      extrapolate: "clamp",
    });

    const holeScale = phase.interpolate({
      inputRange: [0, pct.holdEnd, pct.settle, 1],
      outputRange: [holeMax, holeMax, 0, 0],
      extrapolate: "clamp",
    });

    return (
      <Animated.View
        key={idx}
        style={[
          styles.ball,
          {
            width: ball,
            height: ball,
            borderRadius: ball / 2,
            backgroundColor: color,
            transform: [{ scale }],
          },
        ]}
      >
        <Animated.View
          style={[
            styles.hole,
            {
              borderRadius: ball / 2,
              backgroundColor: base,
              transform: [{ scale: holeScale }],
            },
          ]}
        />
      </Animated.View>
    );
  };

  const loaderContent = (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      pointerEvents="none"
      style={[styles.loader, { width: size, height: size }]}
    >
      <View
        style={[styles.base, { backgroundColor: base, borderRadius: size / 2 }]}
      />

      {indices.map((i) => (
        <View key={`slot-${i}`} style={slots[i].style}>
          {renderBall(i)}
        </View>
      ))}
    </View>
  );

  const content = (
    <View style={styles.contentContainer}>
      {loaderContent}
      {text && (
        <Text
          style={[styles.defaultText, textStyle]}
          className="font-sftmedium"
        >
          {text}
        </Text>
      )}
    </View>
  );

  if (overlay) {
    return (
      <View
        style={[
          styles.overlay,
          { zIndex, backgroundColor: overlayTint },
          style,
        ]}
        pointerEvents="box-none"
      >
        {content}
      </View>
    );
  }

  return <View style={style}>{content}</View>;
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loader: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  base: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  ball: {
    position: "absolute",
    inset: 0 as any, // RN doesn't support 'inset', but we keep absolute fill for inner hole
    alignItems: "center",
    justifyContent: "center",
  },
  hole: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  defaultText: {
    marginTop: 16,
    fontSize: 16,
    color: "#202020",
    textAlign: "center",
  },
});

/*
USAGE
------
import SequentialDonutLoader from "./SequentialDonutLoader.native";

// Fullscreen overlay (default)
<SequentialDonutLoader />

// With text
<SequentialDonutLoader text="Loading..." />

// Inline (no overlay) with custom text styling
<SequentialDonutLoader 
  overlay={false} 
  text="Please wait" 
  textStyle={{ fontSize: 18, color: '#007AFF' }} 
/>

// Customized
<SequentialDonutLoader size={72} color="#ffffff" base="#0b1020" duration={4500} text="Loading data..." />
*/
