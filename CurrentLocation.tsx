import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Dimensions,
  Image,
} from 'react-native';
import MapView, {PROVIDER_GOOGLE, Marker} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';

const App = () => {
  const {width, height} = Dimensions.get('window');
  const [startLocation, setStartLocation] = useState<any>();
  const [markerList, setMarkerList] = useState<any>([]);

  const getLocationRunTime = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setMarkerList([...markerList,{latitude: latitude, longitude: longitude, icon: 'current', title:''}])
      },
      error => {
        console.log('error log', error.message);
      },
    );
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;

        setStartLocation({latitude: latitude, longitude: longitude, icon: 'gps'})
        setMarkerList([...markerList,{latitude: latitude, longitude: longitude, icon: 'gps', title:''}])
      },
      error => {
        console.log('error log', error.message);
      },
      {enableHighAccuracy: true, timeout: 2000},
    );
    setInterval(getLocationRunTime, 20000);
  };

  useEffect(() => {
    getCurrentLocation()
  }, []);

  const MyCustomCalloutView = (item: any) => {
    switch (item?.item) {
      case 'gps':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/gps.png')}
          />
        );
      case 'current':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/current.png')}
          />
        );

      case 'stop':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/stop.png')}
          />
        );
      case 'camera':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/camera.png')}
          />
        );
      case 'flag':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/flag.png')}
          />
        );
      case 'pen':
        return (
          <Image
            style={{width: 25, height: 30}}
            source={require('./src/assets/pen.png')}
          />
        );

      default:
        break;
    }
  };

  return (
    <View style={styles.container}>
      {startLocation? 
      <MapView
        style={{flex: 1, width: width * 1, height: height * 8.6}}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: startLocation?.latitude,
          longitude: startLocation?.longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
        zoomEnabled={true}
        zoomControlEnabled={true}>
        {
            <Marker
                onPress={() => console.log('Abc')}
                draggable
                coordinate={{
                  latitude: startLocation?.latitude,
                  longitude: startLocation?.longitude,
                }}
                title="Tôi đang ở đây">
                  <MyCustomCalloutView item='gps'/>
                </Marker>
              }

        {markerList.map((marker: any, index: any) => {
            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: marker?.latitude,
                  longitude: marker?.longitude,
                }}
                title={marker?.title}>
                <MyCustomCalloutView item={marker?.icon} />
              </Marker>
            );
          })}
      </MapView>
    : 
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Bạn phải cấp quyền địa chỉ</Text>
    </View>
    }
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  title: {
    fontWeight: '500',
  },
});

export default App;
