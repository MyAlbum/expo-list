import { StyleSheet, ViewProps } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";

function KeyboardStickyView(props: ViewProps) {
  const keyboardHeight = useSharedValue(0);

  useKeyboardHandler(
    {
      onMove: (event) => {
        'worklet';
        keyboardHeight.value = event.height;
      },
      onInteractive: (event) => {
        'worklet';
        keyboardHeight.value = event.height;
      },
      onEnd: (event) => {
        'worklet';
        if (event.progress === 0 && event.target > 0) {
          // After an interactive drag it can fire twice. The first one has progress 0 and target of a positive number.
          // The second one has progress 0 and target -1, which is the real end. So we skip the first one.
          return;
        }

        keyboardHeight.value = event.height;
      },
    },
    [],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: -keyboardHeight.value }],
    };
  }, [keyboardHeight]);

  return (
    <Animated.View {...props} style={[styles.container, animatedStyle]} />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default KeyboardStickyView;