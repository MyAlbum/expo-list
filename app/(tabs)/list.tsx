import { LegendList, LegendListRef } from "@legendapp/list";
import { useCallback, useRef } from "react";
import { Button, StyleSheet, Text, View, ViewStyle, ViewToken } from "react-native";

interface Item {
  id: string;
  height: number;
  type: 'divider' | 'item';
}

const data = generateData(200);

export default function ListScreen() {
  const listRef = useRef<LegendListRef>(null);

  const onTouchStart = useCallback((index: number) => {
    const state = listRef.current?.getState();
    if(!state) return;

    console.log('size', state.sizeAtIndex(index));
  }, []);

  const renderItem = useCallback(({ item, index }: { item: Item, index: number }) => {
    const myStyle: ViewStyle = {
      backgroundColor: item.type === 'divider' ? 'transparent' : 'blue',
      height: item.height,
    };

    return (
      <View style={[styles.item, myStyle]} onTouchStart={() => onTouchStart(index)}>
        <Text style={{ color: 'white' }}>{item.id} - {item.height}</Text>
      </View>
    );
  }, [onTouchStart]);

  const debug = useCallback(() => {
    const state = listRef.current?.getState();

    // check if state.sizes is same as height defined in data
    //const sameSizes = Object.entries(state?.sizes ?? {}).every(([key, size]) => size === data.find(item => item.id === key)?.height);
    console.log('state', state);
  }, []);

  const keyExtractor = useCallback((item: Item) => item.id, []);
  const getItemType = useCallback((item: Item) => item.type, []);

  const getEstimatedItemSize = useCallback((index: number) => {
    return 200;
  }, []);

  const getFixedItemSize = useCallback((index: number) => {
    const item = data[index];
    if(item.type === 'divider') {
      return 1;
    }

    return undefined;
  }, []);

  const onViewableItemsChanged = useCallback((info: {
    viewableItems: ViewToken<Item>[];
    changed: ViewToken<Item>[];
  }) => {
    console.log('onViewableItemsChanged', info.viewableItems.map(item => item.item.id));
  }, []);

  return (
    <View style={{flex: 1}}>
      <LegendList
        ref={listRef}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        initialScrollIndex={51}
        recycleItems={true}
        getItemType={getItemType}
        estimatedItemSize={5}
        getFixedItemSize={getFixedItemSize}
        getEstimatedItemSize={getEstimatedItemSize}
        drawDistance={250}
        initialContainerPoolRatio={10}
        maintainVisibleContentPosition={true}
        onViewableItemsChanged={onViewableItemsChanged}
      />

      <Button onPress={debug} title="Test" />
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
});

function generateData(length: number): Item[] {
  return Array.from({ length }, (_, i) => {
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
}