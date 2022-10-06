import { update, ref } from "firebase/database";
import React, { useState } from "react";
import { db } from './firebase-config';
import {
  StyleSheet,
  View,
  Text,
  Button,
  TextInput
} from 'react-native';

const Bonsai = ({bonsai: {name, description, thirsty, period}, id}) => {
  const [isThirsty, setIsThirsty] = useState(thirsty);
  const [waterTime, setWaterTime] = useState(3000);

  return (
    <View style={styles.bonsaiItem}>
      <Text style={[styles.bonsaiItem, {opacity: isThirsty ? 0.2 : 1}]}>
        I am {name}, and I am {isThirsty ? "thirsty" : "swamped"}!
      </Text>
      <Button
        onPress={() => {
          setIsThirsty(false);
          update(ref(db, '/bonsais'), {
            [id]: {
              name,
              description,
              thirsty: isThirsty,
              period
            }
          });
          setTimeout(
            () => {
              setIsThirsty(true)
            }, waterTime
          );
        }}
        disabled={!isThirsty}
        title={isThirsty ? "Pour me some water, please!" : "Thank you!"}
      />
      <TextInput
        style = {{height: 40}}
        placeholder = 'set a water time'
        onChangeText = { inputValue => setWaterTime(inputValue) }
        defaultValue = { period }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bonsaiItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center',
  },
  bonsaiText: {
    paddingHorizontal: 5,
    fontSize: 16
  }
})

export default Bonsai; 