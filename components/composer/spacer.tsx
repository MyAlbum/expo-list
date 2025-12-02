import { View } from "react-native";
import { useComposerHeight } from "./composerHeightProvider";

function ComposerSpacer() {
  const { composerHeight } = useComposerHeight();
  
  return (
    <View style={{ height: composerHeight }} collapsable={false} />
  );
}

export default ComposerSpacer;