import { KeyboardAvoidingLegendList } from "@/components/keyboardList";
import { LegendListRef } from "@legendapp/list";
import { useCallback, useRef, useState } from "react";
import { Button, StyleSheet, Text, TextInput, TextInputSubmitEditingEvent, View, ViewStyle } from "react-native";
import { KeyboardProvider, KeyboardStickyView } from "react-native-keyboard-controller";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

let ids = 0;

interface Item {
  id: string;
  height: number;
  type: 'divider' | 'item' | 'text';
  text?: string;
}

const defaultData = generateData(400);

export default function ListScreen() {
  const [data, setData] = useState<Item[]>(defaultData);
  const listRef = useRef<LegendListRef>(null);
  const [text, setText] = useState('');
  const scrollPos = useSharedValue(0);

  const onTouchStart = useCallback((index: number) => {
    const state = listRef.current?.getState();
    if(!state) return;
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Item, index: number }) => {
    const myStyle: ViewStyle = {
      backgroundColor: item.type === 'divider' ? 'transparent' : 'blue',
      height: item.type === 'text' ? undefined : item.height,
    };

    return (
      <View style={[styles.item, myStyle]} onTouchStart={() => onTouchStart(index)}>
        <Text style={{ color: 'white' }}>{item.text ?? item.id}</Text>
      </View>
    );
  }, [onTouchStart]);

  const debug = useCallback(() => {
    //const state = listRef.current?.getState();

    // check if state.sizes is same as height defined in data
    //const sameSizes = Object.entries(state?.sizes ?? {}).every(([key, size]) => size === data.find(item => item.id === key)?.height);
    //console.log('state', state);

    listRef.current?.scrollToIndex({ index: 50, animated: true });
  }, []);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: false })
    // Do another one just in case because the list may not have fully laid out yet
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: false })

      // and another one again in case
      setTimeout(() => {
        listRef.current?.scrollToEnd({ animated: false })

        // and yet another!
        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({ animated: false })
        })
      }, 16)
    })
  }, []);

  const keyExtractor = useCallback((item: Item) => item.id, []);
  const getItemType = useCallback((item: Item) => item.type, []);
  const getFixedItemSize = useCallback((index: number, item: Item) => {
    if(item.type === 'divider') {
      return 1;
    }

    return undefined;
  }, []);

  const scrollToLastMessage = useCallback(() => {
    const startPos = scrollPos.value;
    const intervalId = setInterval(() => {
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });

        requestAnimationFrame(() => {
          listRef.current?.scrollToEnd({ animated: true });

          // Check if we have scrolled past the start position
          const currentPos = scrollPos.value;
          if(currentPos>startPos && Math.abs(currentPos-startPos) > 1) {
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


  const addItem = useCallback((text: string = 'Lege tekst') => {
    ids++;

    const newDivider:Item = {
      id: `new-divider-${ids.toString()}`,
      height: 1,
      type: 'divider',
    }

    const newItem:Item = {
      id: `new-item-${ids.toString()}`,
      height: Math.round(Math.random() * 500 + 100),
      type: 'text',
      text,
    }
    
    setData(prev => [...prev, newDivider, newItem]);
    scrollToLastMessage();
  }, [scrollToLastMessage]);

  
  const getEstimatedItemSize = useCallback((index: number, item: Item, type: string | undefined) => {
    switch(type) {
      case 'divider':
        return 1;
      case 'text':
        return 1;
      default: // let op, voor unknown heights moet je een heeeeel laag getal pakken (max 5) anders bugt legendlist
        return 50;
    }
  }, []);

  const onSubmitEditing = useCallback((e: TextInputSubmitEditingEvent) => {
    addItem(e.nativeEvent.text);
    setText('');
  }, [addItem]);

  return (
    <KeyboardProvider>
      <View style={{flex: 1}}>
        <KeyboardAvoidingLegendList
          ref={listRef}
          data={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          initialScrollIndex={51}
          recycleItems={true}
          scrollPos={scrollPos}
          
          //estimatedItemSize={10}
          getEstimatedItemSize={getEstimatedItemSize}

          getItemType={getItemType}
          getFixedItemSize={getFixedItemSize}
          drawDistance={250}
          initialContainerPoolRatio={10}
          maintainVisibleContentPosition={true}
          //onViewableItemsChanged={onViewableItemsChanged}
          //maintainScrollAtEnd={true}
          //maintainScrollAtEndThreshold={1000000}

          keyboardDismissMode={"none"}
          keyboardShouldPersistTaps="always"
        />

        <KeyboardStickyView style={styles.chatInputContainer} >
          <TextInput style={styles.chatInput} placeholder="Type your message..." onSubmitEditing={onSubmitEditing} submitBehavior="submit" value={text} onChangeText={setText} />
        </KeyboardStickyView>

        <View style={styles.buttonContainer}>
          <SafeAreaView style={{flex: 1, flexDirection: 'row', gap: 10}}>
            <Button onPress={debug} title="Test" />
            <Button onPress={scrollToEnd} title="Scroll to end" />
            <Button onPress={() => addItem()} title="Add item" />
          </SafeAreaView>
        </View>
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
  chatInputContainer: {
    padding: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  chatInput: {
    borderWidth: 1,
    borderColor: 'gray',
    padding: 10,
    borderRadius: 10,
  },
});

function generateData(length: number): Item[] {
  const d: Item[] =  Array.from({ length }, (_, i) => {
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