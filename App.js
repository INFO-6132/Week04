// references:
// https://dev.to/adii9/uploading-images-to-firebase-storage-in-react-native-with-expo-workflow-24kj
// https://www.kindacode.com/article/image-picker-in-react-native/
// https://firebase.google.com/docs/firestore/manage-data/add-data
import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { 
  Text, 
  View, 
  StyleSheet,  
  ScrollView
 } from "react-native";
import { 
  Button,
  Stack,
  TextInput,
  Surface
} from "@react-native-material/core";
import { db } from "./firebase-config";
import { doc, setDoc } from 'firebase/firestore';
import { onValue, push, remove, ref } from "firebase/database";
import Bonsai from './Bonsai';


const dbRef = ref(db, '/bonsais');

const App = () => {
  const [bonsais, setBonsais] = useState({});
  const [currentBonsai, setCurrentBonsai] = useState(
    { 
      name:'',
      description:'',
      period: 3000,
      thirsty: true
    });
  const bonsaisKeys = Object.keys(bonsais);
  
  useEffect(
    () => {
      return onValue(dbRef, querySnapshot => {
        let data = querySnapshot.val() || {};
        let bonsais = {...data};
        console.log('bonsais', bonsais);
        setBonsais(bonsais);
      });
    }, []);

  const addNewBonsai = () => {
    console.log('currentBonsai', currentBonsai);
    push(dbRef, {
      thirsty: currentBonsai.thirsty,
      period: currentBonsai.period,
      name: currentBonsai.name,
      description: currentBonsai.description
    });
    setCurrentBonsai({
      name: '',
      description: '',
      period: 3000,
      thirsty: true
    });
  }

  const clearBonsais = () => {
    remove(dbRef);
  }

  return(
    <ScrollView
      styles={styles.container}
      contentContainerStyle={styles.contentContainerStyle}>
      <Stack m={4} spacing={2} divider={true}>
        <View>
          {bonsaisKeys.length > 0 
          ? (bonsaisKeys.map(key => (
              <Bonsai
                key={key}
                id={key}
                bonsai={bonsais[key]}
              />
            ))) 
          : (<Text>No bonsai</Text>)}
        </View>
      </Stack>

      <Stack space>
        <Surface 
        elevation={4} 
        category="medium"
        style={{
        justifyContent: "center",
        alignItems: "center",
        width: 330,
        height: 300,
      }}>
          <TextInput
            label="New Bonsai Name"
            value={currentBonsai.name}
            style={{width:250}}
            onChangeText={
              text=>{
                setCurrentBonsai({...currentBonsai, name:text});
              }
            }
            onSubmitEditing={addNewBonsai}/>

          <TextInput
            label="New Bonsai Description"
            value={currentBonsai.description}
            style={{width:250}}
            onChangeText={
              text=>{
                setCurrentBonsai({...currentBonsai, description:text});
              }
            }
            onSubmitEditing={addNewBonsai}/>

          <View>
            <View style={{marginTop:5}}>
              <Button
                title="Add new bonsai"
                onPress={addNewBonsai}
                color="green"
                disabled={
                  currentBonsai.name=='' ||
                  currentBonsai.description ==''
                }/>
            </View>
            <View style={{marginTop:5}}>
              <Button
                title="Clear bonsais list"
                onPress={clearBonsais}
                color="red"/>
            </View>
          </View>
        </Surface>
      </Stack>

    </ScrollView>
    )
}

// React Native Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12
  },
  contentContainerStyle: {
    padding: 24
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#afafaf',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginVertical: 20,
    fontSize: 20,
  },
  bonsaiItem: {
    flexDirection: 'row',
    marginVertical: 10,
    alignItems: 'center'
  },
  bonsaiText: {
    paddingHorizontal: 5,
    fontSize: 16
  },
  upload: {
    marginBottom: 5
  }
});

export default App;