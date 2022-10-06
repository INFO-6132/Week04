// references:
// https://dev.to/adii9/uploading-images-to-firebase-storage-in-react-native-with-expo-workflow-24kj
import React, { useEffect, useState } from "react";
import { StatusBar } from 'expo-status-bar';
import { 
  Button, 
  Text, 
  View, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  ActivityIndicator,
  Image
 } from "react-native";
import { db } from "./firebase-config";
import { onValue, push, remove, ref } from "firebase/database";
import * as ImagePicker from "expo-image-picker"
import Bonsai from './Bonsai';
import { firebase } from './firebase-config';

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
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All, //specify if we want images or videos
      allowsEditing: true,
      aspect: [4,3],
      quality: 1 // 0: compress - small size / 1: compress - max quality
    });
    console.log('result from image picker', result);
    if(!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage = async () => {
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image, true);
      xhr.send(null);
    });
    const ref = firebase.storage().ref().child(`Pictures/Image1`)
    const snapshot = ref.put(blob);
    snapshot.on(firebase.storage.TaskEvent.STATE_CHANGED,
      ()=>{
        setUploading(true)
      },
      (error) => {
        setUploading(false);
        console.log(error);
        blob.close();
        return;
      },
      () => {
        snapshot.snapshot.ref.getDownloadURL().then((url)=>{
          setUploading(false)
          console.log("Download URL:", url)
          setImage(url)
          blob.close()
          return url
        })
      }
      )
  }


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
      <View>
        {bonsaisKeys.length > 0 ? (
          bonsaisKeys.map(key => (
            <Bonsai
              key={key}
              id={key}
              bonsai={bonsais[key]}
            />
          ))
        ) : (
          <Text>No bonsai</Text>
        )}
      </View>

      <TextInput
        placeholder="New Bonsai Name"
        value={currentBonsai.name}
        style={styles.textInput}
        onChangeText={
          text=>{
            setCurrentBonsai({...currentBonsai, name:text});
          }
        }
        onSubmitEditing={addNewBonsai}/>

      <TextInput
        placeholder="New Bonsai Description"
        value={currentBonsai.description}
        style={styles.textInput}
        onChangeText={
          text=>{
            setCurrentBonsai({...currentBonsai, description:text});
          }
        }
        onSubmitEditing={addNewBonsai}/>

      <View>
        <View style={{marginTop:20}}>
          <Button
            title="Add new bonsai"
            onPress={addNewBonsai}
            color="green"
            disabled={
              currentBonsai.name=='' ||
              currentBonsai.description ==''
            }/>
        </View>
        <View style={{marginTop:20}}>
          <Button
            title="Clear bonsais list"
            onPress={clearBonsais}
            color="red"
            style={{marginTop:20}}/>
        </View>
      </View>

      <View style={styles.container}>
        {image && <Image source={{uri: image}} style={{width: 170 , height: 200}}/>}
        <Button title='Select Image' onPress={pickImage} />
        {!uploading ? <Button title='Upload Image' onPress={uploadImage} />: <ActivityIndicator size={'small'} color='black' />}
      </View>

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
});

export default App;