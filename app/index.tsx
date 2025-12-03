import ChatComposer from "@/components/composer";
import { ComposerHeightProvider, useComposerHeight } from "@/components/composer/composerHeightProvider";
import ComposerSpacer from "@/components/composer/spacer";
import { KeyboardAvoidingLegendList } from "@/components/keyboardList";
import { LegendListRef, ViewToken } from "@legendapp/list";
import { randomUUID } from "expo-crypto";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TextInputSubmitEditingEvent, View, ViewStyle } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { configureReanimatedLogger, useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

configureReanimatedLogger({
  strict: false,
});

interface Item {
  id: string;
  height: number;
  type: 'divider' | 'item' | 'text' | 'composer-spacer';
  text?: string;
}

const defaultData = generateData(400);


export default function HomeScreen() {
  return (
    <ComposerHeightProvider>
      <HomeScreenContent />
    </ComposerHeightProvider>
  );
}

function HomeScreenContent() {
  const [data, setData] = useState<Item[]>(defaultData);
  const listRef = useRef<LegendListRef>(null);
  const [text, setText] = useState('');
  const scrollPos = useSharedValue(0);
  const { composerHeight } = useComposerHeight();
  const router = useRouter();

  const extendedData = useMemo(() => {
    const composerSpacer: Item = {
      id: 'composer-spacer',
      height: 0,
      type: 'composer-spacer',
    };

    return [...data, composerSpacer];
  }, [data]);

  const onTouchStart = useCallback((index: number) => {
    const state = listRef.current?.getState();
    if (!state) return;
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Item, index: number }) => {
    const myStyle: ViewStyle = {
      backgroundColor: item.type === 'divider' ? 'transparent' : 'blue',
      height: item.type === 'text' ? undefined : item.height,
    };

    if (item.type === 'composer-spacer') {
      return <ComposerSpacer />;
    }

    if (item.type === 'divider') {
      return <View style={[styles.item, myStyle]} />
    }

    return (
      <View style={[styles.item, myStyle]} onTouchStart={() => onTouchStart(index)}>
        <Text style={{ color: 'white' }}>{item.text ?? item.id}</Text>
      </View>
    );
  }, [onTouchStart]);

  const debug = useCallback(() => {
    listRef.current?.scrollToIndex({ index: 50, animated: true });
  }, []);

  const scrollToEnd = useCallback(() => {
    return new Promise<void>((resolve) => {

      const state = listRef.current?.getState();
      if (!state) return;

      const distanceFromEnd =
        state.contentLength - state.scroll - state.scrollLength;

      if (distanceFromEnd === 0) {
        return resolve();
      }

      listRef.current?.scrollToEnd({ animated: false })
      // Do another one just in case because the list may not have fully laid out yet
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: false })

        // and another one again in case
        setTimeout(() => {
          listRef.current?.scrollToEnd({ animated: false })


          resolve();
        }, 16)
      })
    });
  }, []);

  const keyExtractor = useCallback((item: Item) => item.id, []);
  const getItemType = useCallback((item: Item) => item.type, []);
  const getFixedItemSize = useCallback((index: number, item: Item) => {
    if (item.type === 'divider') {
      return 1;
    }

    return undefined;
  }, []);

  const scrollToLastMessage = useCallback(async () => {
    const startPos = scrollPos.value;

    let intervalId = setInterval(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: false });

        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({ animated: false });

          // Check if we have scrolled past the start position
          const currentPos = scrollPos.value;
          if (currentPos > startPos && Math.abs(currentPos - startPos) > 1) {
            clearInterval(intervalId);
          }
        });
      });
    }, 16);

    // Clear interval after 500ms
    setTimeout(() => {
      clearInterval(intervalId);
    }, 500);
  }, [scrollPos]);

  const autoScrollToLastMessage = useCallback(async () => {
    const state = listRef.current?.getState();
    if (!state) return;

    const distanceFromEnd =
      state.contentLength - state.scroll - state.scrollLength

    // If the distance from the end is less than 20, scroll to the end and then scroll to the last message
    if (distanceFromEnd <= 20) {
      await scrollToEnd();
      scrollToLastMessage();
    }
  }, [scrollToLastMessage, scrollToEnd]);


  const addItem = useCallback(async (text: string = 'Lege tekst') => {
    const id = randomUUID();

    const newDivider: Item = {
      id: `new-divider-${id.toString()}`,
      height: 1,
      type: 'divider',
    }

    const newItem: Item = {
      id: `new-item-${id.toString()}`,
      height: Math.round(Math.random() * 500 + 100),
      type: 'text',
      text,
    }

    setData(prev => [...prev, newDivider, newItem]);
    autoScrollToLastMessage();
  }, [autoScrollToLastMessage]);


  const getEstimatedItemSize = useCallback((index: number, item: Item, type: string | undefined) => {
    switch (type) {
      case 'divider':
        return 1;
      case 'text':
        return 10;
      default: // let op, voor unknown heights moet je een heeeeel laag getal pakken (max 5) anders bugt legendlist
        return 50;
    }
  }, []);

  const onSubmitEditing = useCallback((e: TextInputSubmitEditingEvent) => {
    addItem(e.nativeEvent.text);
    setText('');
  }, [addItem]);


  const onViewableItemsChanged = useCallback((e: { viewableItems: ViewToken<Item>[]; changed: ViewToken<Item>[]; }) => {
    console.log('info', e);
  }, []);


  return (
    <KeyboardProvider>
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingLegendList
          //key={listKey}
          ref={listRef}
          data={extendedData}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialScrollIndex={51}
          recycleItems={true}
          scrollPos={scrollPos}

          getEstimatedItemSize={getEstimatedItemSize}

          getItemType={getItemType}
          getFixedItemSize={getFixedItemSize}
          drawDistance={250}
          initialContainerPoolRatio={10}
          maintainVisibleContentPosition={true}

          keyboardDismissMode={"interactive"}
        //keyboardShouldPersistTaps="always"
        //onViewableItemsChanged={onViewableItemsChanged}
        />
      </View>


      <ChatComposer style={{ padding: 10, paddingBottom: 0 }} withBottomInset={10}>
        <TextInput style={styles.chatInput} nativeID="chat-input" placeholder="Type your message..." onSubmitEditing={onSubmitEditing} submitBehavior="submit" value={text} onChangeText={setText} />
      </ChatComposer>

      <View style={styles.buttonContainer}>
        <SafeAreaView style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
          <Button onPress={debug} title="Test" />
          <Button onPress={scrollToEnd} title="Scroll to end" />
          <Button onPress={() => addItem()} title="Add item" />
          <Button onPress={() => router.navigate('/_sitemap')} title="Chat Keyboard" />
        </SafeAreaView>
      </View>

    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 10,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  chatInput: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    padding: 10,
    borderRadius: 100,
    color: 'white',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderCurve: 'continuous',

  },
});

function generateData(length: number): Item[] {
  const d: Item[] = Array.from({ length }, (_, i) => {
    const id = i;
    const isEven = id % 2 === 0;

    if (isEven) {
      return {
        id: id.toString(),
        height: 1,
        type: 'divider' as const,
      };
    } else {
      return {
        id: id.toString(),
        height: Math.round(Math.random() * 500 + 100),
        type: 'item' as const,
      };
    }
  });

  return d;
}