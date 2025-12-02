import { PropsWithChildren, useCallback } from "react";
import { LayoutChangeEvent, View, ViewProps } from "react-native";
import { useComposerHeight } from "./composerHeightProvider";

function ChatComposer(props: PropsWithChildren<ViewProps>) {
  const {onLayout} = props;
  const { setComposerHeight } = useComposerHeight();
  
  const onLayoutHandler = useCallback((e: LayoutChangeEvent) => {
    setComposerHeight(e.nativeEvent.layout.height);

    if(onLayout) {
      onLayout(e);
    }
  }, [setComposerHeight, onLayout]);

  return (
    <View {...props} onLayout={onLayoutHandler}>
      {props.children}
    </View>
  );
}

export default ChatComposer;