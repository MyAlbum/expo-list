import { PropsWithChildren, useCallback } from "react";
import { LayoutChangeEvent, StyleSheet, View, ViewProps } from "react-native";
import { KeyboardStickyView } from "react-native-keyboard-controller";
import AnimatedBottomInset from "./animatedBottomInset";
import { useComposerHeight } from "./composerHeightProvider";

type Props = ViewProps & {
  withBottomInset?: number;
}

function ChatComposer(props: PropsWithChildren<Props>) {
  const {onLayout, withBottomInset} = props;
  const { setComposerHeight } = useComposerHeight();
  
  const onLayoutHandler = useCallback((e: LayoutChangeEvent) => {
    setComposerHeight(e.nativeEvent.layout.height);

    if(onLayout) {
      onLayout(e);
    }
  }, [setComposerHeight, onLayout]);
  

  return (
    <KeyboardStickyView style={styles.chatInputContainer}>
      <View {...props} onLayout={onLayoutHandler}>
        {props.children}

        {withBottomInset!==undefined && <AnimatedBottomInset minHeight={withBottomInset} />}
      </View>
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