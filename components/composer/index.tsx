import { PropsWithChildren, useCallback } from "react";
import { LayoutChangeEvent, StyleSheet, ViewProps } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import KeyboardStickyView from "../keyboardSticky";
import { useComposerHeight } from "./composerHeightProvider";

type Props = ViewProps & {
  withBottomInset?: number;
}

function ChatComposer(props: PropsWithChildren<Props>) {
  const { onLayout, withBottomInset } = props;
  const { setComposerHeight } = useComposerHeight();
  const insets = useSafeAreaInsets();
  const inset = Math.max(withBottomInset ?? 0, insets.bottom);

  const onLayoutHandler = useCallback((e: LayoutChangeEvent) => {
    setComposerHeight(e.nativeEvent.layout.height + inset);

    if (onLayout) {
      onLayout(e);
    }
  }, [setComposerHeight, onLayout, inset]);

  const keyboardProgress = useSharedValue(0);
  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet';
        keyboardProgress.value = event.progress;
      },
      onInteractive: (event) => {
        'worklet';
        keyboardProgress.value = event.progress;
      },
      onEnd: (event) => {
        'worklet';
        if (event.progress === 0 && event.target > 0) {
          // After an interactive drag it can fire twice. The first one has progress 0 and target of a positive number.
          // The second one has progress 0 and target -1, which is the real end. So we skip the first one.
          return;
        }

        keyboardProgress.value = event.progress;
      },
    },
    [],
  );

  const animatedStyle = useAnimatedStyle(() => {
    const p = interpolate(keyboardProgress.value, [0, 1], [inset, inset / 2]);
    return {
      transform: [{ translateY: - p }],
    };
  }, []);

  return (
    <KeyboardStickyView style={styles.chatInputContainer}>
      <Animated.View {...props} onLayout={onLayoutHandler} style={animatedStyle}>
        {props.children}

      </Animated.View>
    </KeyboardStickyView>
  );
}

export default ChatComposer;

const styles = StyleSheet.create({
  chatInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});