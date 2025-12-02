// biome-ignore lint/correctness/noUnusedImports: Leaving this out makes it crash in some environments
import * as React from "react";
import { type ForwardedRef, forwardRef, useCallback, useRef } from "react";
import { type Insets, type ScrollViewProps } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import type Animated from "react-native-reanimated";
import {
    SharedValue,
    useAnimatedProps,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue
} from "react-native-reanimated";
import type { ReanimatedScrollEvent } from "react-native-reanimated/lib/typescript/hook/commonTypes";

import { useCombinedRef } from "@/hooks/useCombinedRef";
import type { LegendListRef, TypedForwardRef } from "@legendapp/list";
import { AnimatedLegendList, type AnimatedLegendListProps } from "@legendapp/list/reanimated";
import { scheduleOnRN } from "react-native-worklets";

type KeyboardControllerLegendListProps<ItemT> = Omit<AnimatedLegendListProps<ItemT>, "onScroll" | "contentInset"> & {
    onScroll?: (event: ReanimatedScrollEvent) => void;
    scrollPos?: SharedValue<number>;
    contentInset?: Insets;
    safeAreaInsetBottom?: number;
};

export const KeyboardAvoidingLegendList = (forwardRef as TypedForwardRef)(function KeyboardAvoidingLegendList<ItemT>(
    props: KeyboardControllerLegendListProps<ItemT>,
    forwardedRef: ForwardedRef<LegendListRef>,
) {
    const {
        contentInset: contentInsetProp,
        horizontal,
        onScroll: onScrollProp,
        safeAreaInsetBottom = 0,
        keyboardDismissMode = "interactive",
        scrollPos,
        ...rest
    } = props;

    const refLegendList = useRef<LegendListRef | null>(null);
    const combinedRef = useCombinedRef(forwardedRef, refLegendList);

    const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffsetY = useSharedValue(0);
    const animatedOffsetY = useSharedValue<number | null>(null);
    const scrollOffsetAtKeyboardStart = useSharedValue(0);
    const keyboardInset = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);
    const isOpening = useSharedValue(false);
    const didInteractive = useSharedValue(false);

    useDerivedValue(() => {
        if(!scrollPos) return;
        
        scrollPos.value = scrollOffsetY.value;
    }, [scrollPos, scrollOffsetY]);

    const scrollHandler = useAnimatedScrollHandler(
        (event) => {
            scrollOffsetY.value = event.contentOffset[horizontal ? "x" : "y"];

            if (onScrollProp) {
                scheduleOnRN(onScrollProp, event);
            }
        },
        [onScrollProp, horizontal],
    );

    const setScrollProcessingEnabled = useCallback(
        (enabled: boolean) => {
            refLegendList.current?.setScrollProcessingEnabled(enabled);
        },
        [refLegendList],
    );

    useKeyboardHandler(
        // biome-ignore assist/source/useSortedKeys: prefer start/move/end
        {
            onStart: (event) => {
                "worklet";

                if (!didInteractive.get()) {
                    if (event.height > 0) {
                        keyboardHeight.set(event.height - safeAreaInsetBottom);
                    }

                    isOpening.set(event.progress > 0);

                    scrollOffsetAtKeyboardStart.value = scrollOffsetY.value;
                    animatedOffsetY.set(scrollOffsetY.value);
                    scheduleOnRN(setScrollProcessingEnabled, false);
                }
            },
            onInteractive: () => {
                "worklet";

                if (!didInteractive.get()) {
                    didInteractive.set(true);
                }
            },
            onMove: (event) => {
                "worklet";

                if (!didInteractive.get()) {
                    const vIsOpening = isOpening.get();
                    const vKeyboardHeight = keyboardHeight.get();
                    const vProgress = vIsOpening ? event.progress : 1 - event.progress;

                    const targetOffset =
                        scrollOffsetAtKeyboardStart.value +
                        (vIsOpening ? vKeyboardHeight : -vKeyboardHeight) * vProgress;
                    scrollOffsetY.value = targetOffset;
                    animatedOffsetY.set(targetOffset);

                    if (!horizontal) {
                        keyboardInset.value = Math.max(0, event.height - safeAreaInsetBottom);
                    }
                }
            },
            onEnd: (event) => {
                "worklet";

                const wasInteractive = didInteractive.get();

                if (wasInteractive && event.progress === 0 && event.target > 0) {
                    // After an interactive drag it can fire twice. The first one has progress 0 and target of a positive number.
                    // The second one has progress 0 and target -1, which is the real end. So we skip the first one.
                    return;
                }

                if (!wasInteractive) {
                    const vIsOpening = isOpening.get();
                    const vKeyboardHeight = keyboardHeight.get();

                    const targetOffset =
                        scrollOffsetAtKeyboardStart.value +
                        (vIsOpening ? vKeyboardHeight : -vKeyboardHeight) *
                            (vIsOpening ? event.progress : 1 - event.progress);

                    scrollOffsetY.value = targetOffset;
                    animatedOffsetY.set(targetOffset);

                    scheduleOnRN(setScrollProcessingEnabled, true);
                }

                didInteractive.set(false);

                if (!horizontal) {
                    keyboardInset.value = Math.max(0, event.height - safeAreaInsetBottom);
                }
            },
        },
        [scrollViewRef, safeAreaInsetBottom],
    );

    const animatedProps = useAnimatedProps<ScrollViewProps>(() => {
        "worklet";

        // Setting contentOffset animates the scroll with the keyboard
        const baseProps: ScrollViewProps = {
            contentOffset:
                animatedOffsetY.value === null
                    ? undefined
                    : {
                          x: 0,
                          y: animatedOffsetY.value,
                      },
        };

        return baseProps;
    });

    // contentInset is not supported on Android so we have to use marginBottom instead
    const style = useAnimatedStyle(() => ({
        marginBottom: keyboardInset.value,
    }));

    return (
      <AnimatedLegendList
        {...rest}
        animatedProps={animatedProps}
        keyboardDismissMode={keyboardDismissMode}
        onScroll={scrollHandler as unknown as AnimatedLegendListProps<ItemT>["onScroll"]}
        ref={combinedRef}
        refScrollView={scrollViewRef}
        scrollIndicatorInsets={{ bottom: 0, top: 0 }}
        style={style}
      />
    );
});

export { KeyboardAvoidingLegendList as LegendList };
