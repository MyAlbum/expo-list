import { LegendList, LegendListRef } from "@legendapp/list";
import { useCallback, useRef, useState } from "react";
import { Button, StyleSheet, Text, View, ViewStyle, ViewToken } from "react-native";

let ids = 0;

interface Item {
  id: string;
  height: number;
  type: 'divider' | 'item';
}

const defaultData = generateData(400);

export default function ListScreen() {
  const [data, setData] = useState<Item[]>(defaultData);
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
    //const state = listRef.current?.getState();

    // check if state.sizes is same as height defined in data
    //const sameSizes = Object.entries(state?.sizes ?? {}).every(([key, size]) => size === data.find(item => item.id === key)?.height);
    //console.log('state', state);

    listRef.current?.scrollToIndex({ index: data.length-10, animated: true });
  }, []);

  const scrollToEnd = useCallback(() => {
    listRef.current?.scrollToEnd({ animated: true });
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    listRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const keyExtractor = useCallback((item: Item) => item.id, []);
  const getItemType = useCallback((item: Item) => item.type, []);
  const getFixedItemSize = useCallback((index: number, item: Item) => {
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

  const addItem = useCallback(() => {
    ids++;

    const newDivider:Item = {
      id: `new-divider-${ids.toString()}`,
      height: 1,
      type: 'divider',
    }

    const newItem:Item = {
      id: `new-item-${ids.toString()}`,
      height: Math.round(Math.random() * 500 + 100),
      type: 'item',
    }
    setData(prev => [...prev, newDivider, newItem]);
  }, []);

  const getEstimatedItemSize = useCallback((index: number, item: Item, type: string | undefined) => {
    switch(type) {
      case 'divider':
        return 1;
      default: // let op, voor unknown heights moet je een heeeeel laag getal pakken (max 5) anders bugt legendlist
        return 5;
    }
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
      />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button onPress={debug} title="Test" />
        <Button onPress={scrollToEnd} title="Scroll to end" />
        <Button onPress={addItem} title="Add item" />
      </View>
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