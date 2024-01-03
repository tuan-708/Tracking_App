import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { GeoCoordinates } from "react-native-geolocation-service";
import RNMapView, {
  Callout,
  Circle,
  MapTypes,
  Marker,
} from "react-native-maps";

interface MapViewProps {
  coords: GeoCoordinates | null;
  listPosition: any;
  mapT: any
}

const MapView = ({ coords, listPosition, mapT = "standard" }: MapViewProps) => {
  const mapRef = useRef<RNMapView>(null);
  const [modalTracking, setModalTracking] = useState(false);
  const [imageTracking, setImageTracking] = useState("");

  console.log(listPosition);

  const MyCustomCalloutView = (item: any) => {
    switch (item?.item) {
      case "gps":
        return (
          <Image
            style={{ width: 20, height: 25 }}
            source={require("./src/assets/gps.png")}
          />
        );
      case "current":
        return (
          <View style={styles.dotContainer}>
            <View style={styles.dotCurrent} />
          </View>
        );

      case "stop":
        return (
          <View style={styles.dotContainer}>
            <View style={styles.dotStop} />
          </View>
        );
      case "camera":
        return (
          <Image
            style={{ width: 25, height: 30 }}
            source={require("./src/assets/camera.png")}
          />
        );
      case "flag":
        return (
          <Image
            style={{ width: 25, height: 30 }}
            source={require("./src/assets/flag.png")}
          />
        );
      case "pen":
        return (
          <Image
            style={{ width: 25, height: 30 }}
            source={require("./src/assets/pen.png")}
          />
        );
      default:
        break;
    }
  };

  useEffect(() => {
    if (!!coords && mapRef.current) {
      mapRef.current.animateCamera({
        center: {
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        pitch: 0,
        heading: 0,
        altitude: 1000,
        zoom: 18,
      });
    }
  }, [coords]);

  const renderModal = () => {
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalTracking}
          onRequestClose={() => {
            setModalTracking(!modalTracking);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setModalTracking(!modalTracking)}
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("./src/assets/close.png")}
                  />
                </TouchableOpacity>

                <View
                style={{ marginTop: 10}}
                >
                    <Image
                            source={{
                              uri: imageTracking,
                            }}
                            style={{
                              width: 280,
                              height: 300,
                              resizeMode: "cover",
                            }}
                          />
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  const clickViewImage = (uri:any)  => {
    if(uri != ""){
      setModalTracking(!modalTracking)   
      setImageTracking(uri) 
    }
  }

  return (
    <View style={styles.container}>
      <RNMapView
        ref={mapRef}
        initialCamera={{
          altitude: 15000,
          center: {
            latitude: 14.058324,
            longitude: 108.277199,
          },
          heading: 0,
          pitch: 0,
          zoom: 11,
        }}
        loadingEnabled
        loadingBackgroundColor="white"
        style={StyleSheet.absoluteFillObject}
        mapType={mapT}
        zoomEnabled={true}
        zoomControlEnabled={true}
        rotateEnabled={true}
      >
        {!!coords && (
          <>
            <Marker
              anchor={{ x: 0.5, y: 0.6 }}
              coordinate={{
                latitude: coords.latitude,
                longitude: coords.longitude,
              }}
              flat
              style={{
                ...(coords.heading !== -1 && {
                  transform: [
                    {
                      rotate: `${coords.heading}deg`,
                    },
                  ],
                }),
              }}
            >
              <View style={styles.dotContainer}>
                <View style={[styles.arrow]} />
                <View style={styles.dot} />
              </View>
            </Marker>

            {listPosition.map((marker: any, index: any) => {
              return (
                <Marker
                  key={index}
                  tracksViewChanges={false}
                  coordinate={{
                    latitude: marker?.latitude,
                    longitude: marker?.longitude,
                  }}
                  title={marker?.title}
                  onPress={() => clickViewImage(marker?.uri)}
                >
                  <MyCustomCalloutView item={marker?.icon} />
                  {/* {marker?.uri != "" ? (
                    <Callout
                      style={{
                        width: 80,
                        height: 80,
                        backgroundColor: "white",
                      }}
                    >
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            height: 80,
                            width: 80,
                            position: "relative",
                            bottom: 10,
                            left: 5,
                          }}
                        >
                          <Image
                            source={{
                              uri: marker?.uri,
                            }}
                            style={{
                              width: 70,
                              height: 70,
                              resizeMode: "cover",
                            }}
                          />
                        </Text>
                      </View>
                    </Callout>
                  ) : null} */}
                </Marker>
              );
            })}
          </>
        )}
      </RNMapView>
      {renderModal()}
    </View>
  );
};

export default MapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dotContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  dot: {
    backgroundColor: "rgb(0, 120, 255)",
    width: 24,
    height: 24,
    borderWidth: 3,
    borderColor: "white",
    borderRadius: 12,
    shadowColor: "black",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 4,
  },
  dotCurrent: {
    backgroundColor: "#cccccc",
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 4,
  },
  dotStop: {
    backgroundColor: "red",
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: "black",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 4,
  },
  arrow: {
    width: 0,
    height: 0,
    backgroundColor: "transparent",
    borderStyle: "solid",
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: "rgb(0, 120, 255)",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
    minWidth: 300,
    minHeight: 350,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    textAlign: "center",
    fontWeight: "800",
    color: "#000000",
  },
});
