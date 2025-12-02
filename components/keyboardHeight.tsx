import { ComponentProps } from 'react';
import { View } from 'react-native';
import { useGenericKeyboardHandler } from 'react-native-keyboard-controller';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export default function KeyboardHeight(props: ComponentProps<typeof View>) {
  const { style, ...rest } = props;
  const height = useSharedValue(0);
  const progress = useSharedValue(0);

  useGenericKeyboardHandler(
    {
      onMove: (e) => {
        'worklet';

        height.value = e.height;
        progress.value = e.progress;
      },
      onEnd: (e) => {
        'worklet';

        height.value = e.height;
        progress.value = e.progress;
      },
    },
    [],
  );

  const heightStyle = useAnimatedStyle(() => {
    return {
      height: height.value * progress.value,
    };
  }, [height, progress]);

  return (
    <Animated.View
      {...rest}
      style={[style, heightStyle]}
    />
  );
}
