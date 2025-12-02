import { useGenericKeyboardHandler } from "react-native-keyboard-controller";
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  minHeight?: number;
}

export default function AnimatedBottomInset(props: Props) {
  const { minHeight = 10 } = props;
  const height = useSharedValue(0);
  const progress = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const bottomInset = insets.bottom;

  useGenericKeyboardHandler({
    onMove: (e) => {
      'worklet';
      progress.value = e.progress;
    },
    onEnd: (e) => {
      'worklet';
      progress.value = e.progress;
    }
  }, []);

  const heightStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(progress.value, [0, 1], [Math.max(bottomInset, minHeight), minHeight]),
    };
  }, [height, progress]);

  return (
    <Animated.View style={heightStyle} />
  );
}