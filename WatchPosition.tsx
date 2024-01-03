import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  Button,
  View,
  ScrollView,
} from "react-native";
import Geolocation, { GeoPosition } from "react-native-geolocation-service";
import VIForegroundService from "@voximplant/react-native-foreground-service";
import { actions, listPosition } from "./constant";
import MapView from "./MapView";
import appConfig from "./app.json";
import Storages, { KeyStorage } from "./utils/storages";
import { formatDate, formatDateHour } from "./utils/date";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import * as ImagePicker from "react-native-image-picker";

export default function App() {
  const [forceLocation, setForceLocation] = useState(true);
  const [locationDialog, setLocationDialog] = useState(true);
  const [significantChanges, setSignificantChanges] = useState(false);
  const [observing, setObserving] = useState(false);
  const [foregroundService, setForegroundService] = useState(false);
  const [useLocationManager, setUseLocationManager] = useState(false);
  const [location, setLocation] = useState<GeoPosition | null>(null);
  const watchId = useRef<number | null>(null);
  const [modalTracking, setModalTracking] = useState(false);
  const [dialogTracking, setDialogTracking] = useState(false);
  const [modalListTracking, setModalListTracking] = useState(false);
  const [fileName, setFileName] = useState("");
  const [isStartTracking, setIsStartTracking] = useState(false);
  const [listHistoryTracking, setListHistoryTracking] = useState<any>([]);
  const [imageTracking, setImageTracking] = useState("");
  const [mapType, setMapType] = useState("standard");

  //Thêm position vào danh sách tracking
  const getLocationOption = async (type: any,source:any) => {
    const hasPermission = await hasLocationPermission();

    if (!hasPermission) {
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        setLocation(position);

        let item = {
          latitude: position?.coords?.latitude,
          longitude: position?.coords?.longitude,
          icon: type,
          uri: source,
          timestamp: position?.timestamp,
          title: "",
        };
        listPosition.push(item);
      },
      (error) => {
        Alert.alert(`Code ${error.code}`, error.message);
        setLocation(null);
        console.log(error);
      },
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
        enableHighAccuracy: true,
        timeout: 5 * 1000,
        maximumAge: 1000,
        distanceFilter: 0,
        forceRequestLocation: forceLocation,
        forceLocationManager: useLocationManager,
        showLocationDialog: locationDialog,
      }
    );
  };

  //Dùng để cấp quyền truyên cập khi lần đầu chạy ừng dụng
  // useEffect(() => {
  //   getLocation();
  // }, []);

  // Dừng tracking
  const stopLocationUpdates = () => {
    if (isStartTracking) {
      if (Platform.OS === "android") {
        VIForegroundService.getInstance()
          .stopService()
          .catch((err: any) => err);

        getLocationOption("stop", "")

        saveHistory();

        // listPosition.forEach((index) => {
        //   listPosition.pop()
        // })

        Alert.alert("Stop Tracking");
        setIsStartTracking(false);
      }
      if (watchId.current !== null) {
        Geolocation.clearWatch(watchId.current);
        watchId.current = null;
        setObserving(false);

        getLocationOption("stop", "")

        saveHistory();

        // listPosition.forEach((index) => {
        //   listPosition.pop()
        // })

        Alert.alert("Stop Tracking");
        setIsStartTracking(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopLocationUpdates();
    };
  }, []);

  const hasPermissionIOS = async () => {
    const openSetting = () => {
      Linking.openSettings().catch(() => {
        Alert.alert("Unable to open settings");
      });
    };
    const status = await Geolocation.requestAuthorization("whenInUse");

    if (status === "granted") {
      return true;
    }

    if (status === "denied") {
      Alert.alert("Location permission denied");
    }

    if (status === "disabled") {
      Alert.alert(
        `Turn on Location Services to allow "${appConfig.displayName}" to determine your location.`,
        "",
        [
          { text: "Go to Settings", onPress: openSetting },
          { text: "Don't Use Location", onPress: () => {} },
        ]
      );
    }

    return false;
  };

  const hasLocationPermission = async () => {
    if (Platform.OS === "ios") {
      const hasPermission = await hasPermissionIOS();
      return hasPermission;
    }

    if (Platform.OS === "android" && Platform.Version < 23) {
      return true;
    }

    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (hasPermission) {
      return true;
    }

    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
    );

    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }

    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        "Location permission denied by user.",
        ToastAndroid.LONG
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        "Location permission revoked by user.",
        ToastAndroid.LONG
      );
    }
    return false;
  };

  // Update location realtime
  const getLocationUpdates = async () => {
    const hasPermission = await hasLocationPermission();

    listPosition.forEach((index) => {
      listPosition.pop();
    });

    if (!hasPermission) {
      return;
    }

    if (Platform.OS === "android" && foregroundService) {
      await startForegroundService();
    }

    setObserving(true);

    watchId.current = Geolocation.watchPosition(
      (position) => {
        setLocation(position);
        setIsStartTracking(true);

        let item = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          icon: listPosition.length == 0 ? "gps" : "current",
          uri: "",
          timestamp: position.timestamp,
          title: "",
        };
        listPosition.push(item);
      },
      (error) => {
        setLocation(null);
        console.log(error);
      },
      {
        accuracy: {
          android: "high",
          ios: "best",
        },
        enableHighAccuracy: true,
        distanceFilter: 20,
        interval: 20 * 1000,
        fastestInterval: 2000,
        forceRequestLocation: forceLocation,
        forceLocationManager: useLocationManager,
        showLocationDialog: locationDialog,
        useSignificantChanges: significantChanges,
      }
    );
  };

  //   start foreground service
  const startForegroundService = async () => {
    if (Platform.Version >= "26") {
      await VIForegroundService.getInstance().createNotificationChannel({
        id: "locationChannel",
        name: "Location Tracking Channel",
        description: "Tracks location of user",
        enableVibration: false,
      });
    }

    return VIForegroundService.getInstance().startService({
      channelId: "locationChannel",
      id: 420,
      title: appConfig.displayName,
      text: "Tracking location updates",
      icon: "ic_launcher",
    });
  };

  interface ObjectJson {
    [key: string]: any;
  }

  const displayTracking = () => {
    // Storages.get(KeyStorage.Tracking).then((value) =>{
    //   console.log("Tracking",value);
    // })

    // Get history checking
    // Storages.get(KeyStorage.History).then((value) =>{
    //   console.log("History",value);
    // })

    setModalListTracking(true);
    Storages.get(KeyStorage.History).then((value: any) => {
      let currentList = JSON.parse(value);

      setListHistoryTracking(currentList);
    });
  };

  // remove all history tracking
  const removeAllTracking = () => {
    listPosition.forEach((index) => {
      listPosition.pop();
    });

    Storages.remove(KeyStorage.History);
    Storages.remove(KeyStorage.Tracking);
  };

  // set data history
  const setHistory = () => {
    let obj: ObjectJson = {};
    let key = fileName.trim();
    obj[key] = listPosition;

    // Save tracking
    Storages.set(KeyStorage.Tracking, [obj]);
  };

  const saveHistory = () => {
    // Remove all history trackings
    // Storages.remove(KeyStorage.History)

    let obj: ObjectJson = {};
    let key = formatDate(new Date());
    obj[key] = listPosition;

    Storages.get(KeyStorage.History).then((value: any) => {
      if (value == null) {
        Storages.set(KeyStorage.History, [obj]);

        // get History checking
        displayTracking();
      } else {
        let currentList = JSON.parse(value);
        currentList.push([obj][0]);
        Storages.set(KeyStorage.History, currentList);

        // get History checking
        displayTracking();
      }
    });

    Storages.remove(KeyStorage.Tracking);
  };

  // Start tracking
  const startTracking = () => {
    listPosition.forEach((index) => {
      listPosition.pop();
    });

    Storages.remove(KeyStorage.Tracking);

    getLocationUpdates();
    setModalTracking(!modalTracking);
  };

  // Start tracking
  const startTrackingApp = () => {
    startTracking();
  };

  // Pause tracking
  const PauseTrackingApp = () => {
    setHistory();
    displayTracking();
  };

  // Stop tracking
  const StopTrackingApp = () => {
    setModalTracking(!modalTracking);
    setDialogTracking(!dialogTracking);
  };

  // Accept stop tracking
  const AcceptStopTrackingApp = () => {
    stopLocationUpdates();
    setDialogTracking(!dialogTracking);
  };

  // reView history tracking
  const reViewHistory = (item: any) => {
   
    setModalListTracking(!modalListTracking);
    getLocationOption("current","")

    listPosition.forEach((index) => {
          listPosition.pop()
    })

    item.forEach((element:any) => {
      listPosition.push(element)
    });

  } 

  // view item history tracking
  const viewListHistoryTracking = () => {
    return (
      <>
        {listHistoryTracking && listHistoryTracking.reverse().map((item: any, index: any) => {          
          
          const startTime = item[Object.keys(item)[0]][0]["timestamp"];

          const startEnd = item[Object.keys(item)[0]][item[Object.keys(item)[0]].length - 1]["timestamp"];

          return (
            <TouchableOpacity key={index} onPress={() => reViewHistory(item[Object.keys(item)[0]])}>
              <Text style={{ color: '#000000'}}>Name: {Object.keys(item)[0]}</Text>
              <Text style={{ color: '#000000'}}>- Start Time: {formatDateHour(startTime)}</Text>
              <Text style={{ color: '#000000'}}>- End time: {formatDateHour(startEnd)}</Text>
              <View style={styles.line}></View>
            </TouchableOpacity>
          );
        })}
      </>
    );
  };

  useEffect(() => {
    return () => {
      viewListHistoryTracking();
    };
  }, []);

  // Render modal
  const renderModel = () => {
    return (
      <View>
        {/* Modal  hiển thị tracking */}
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
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setModalTracking(!modalTracking)}
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("./src/assets/close.png")}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.modalText}>Start Tracking?</Text>
                </View>
              </View>

              <View style={{ minWidth: 150 }}>
                <TouchableOpacity
                  style={[
                    styles.btnTracking,
                    {
                      backgroundColor: isStartTracking ? "#cccccc" : "#2196F3",
                    },
                  ]}
                  disabled={isStartTracking}
                  onPress={() => startTrackingApp()}
                >
                  <Text style={styles.textTracking}>Start</Text>
                </TouchableOpacity>

                {/* <TouchableOpacity style={styles.btnTracking}>
                  <Text
                    style={styles.textTracking}
                    onPress={() => PauseTrackingApp()}
                  >
                    Pause
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.btnTracking}>
                  <Text style={styles.textTracking}>Resume</Text>
                </TouchableOpacity> */}

                <TouchableOpacity style={styles.btnTracking}>
                  <Text
                    style={styles.textTracking}
                    onPress={() => StopTrackingApp()}
                  >
                    Stop
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Dialog display history tracking*/}
        <Modal
          animationType="slide"
          transparent={true}
          visible={dialogTracking}
          onRequestClose={() => {
            setDialogTracking(!dialogTracking);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setDialogTracking(!dialogTracking)}
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("./src/assets/close.png")}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.modalText}>
                    Please set the name file!
                  </Text>
                </View>
              </View>
              <View>
                <TextInput
                  placeholder="Enter file name"
                  style={{
                    backgroundColor: "#ccc",
                    width: 200,
                    marginBottom: 15,
                    borderRadius: 20,
                    paddingHorizontal: 15,
                  }}
                  value={formatDate(new Date())}
                  onChangeText={(text) => setFileName(text)}
                ></TextInput>
              </View>

              <View
                style={{
                  minWidth: 150,
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity style={styles.btnTracking}>
                  <Text
                    style={styles.textTracking}
                    onPress={() => AcceptStopTrackingApp()}
                  >
                    Oke
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnTracking}
                  onPress={() => setDialogTracking(!dialogTracking)}
                >
                  <Text style={styles.textTracking}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* <Modal display list tracking */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalListTracking}
          onRequestClose={() => {
            setModalListTracking(!modalListTracking);
          }}
        >
          <View style={styles.centeredView}>
            <View style={[styles.modalView, { width: "85%" }]}>
              <View style={{ flexDirection: "row", marginBottom: 20 }}>
                <TouchableOpacity
                  onPress={() => setModalListTracking(!modalListTracking)}
                >
                  <Image
                    style={{ width: 30, height: 30 }}
                    source={require("./src/assets/close.png")}
                  />
                </TouchableOpacity>

                <View
                  style={{
                    marginLeft: 15,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={styles.modalText}>Tracking List</Text>
                </View>
              </View>
              <View>
                {
                  listHistoryTracking ?
                  viewListHistoryTracking(): <Text>No Data</Text>
                  }
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  };

  useEffect(() => {
    return () => {
      viewListHistoryTracking();
    };
  }, []);

  const onButtonPress = React.useCallback((type: any, options: any) => {
    if (type === "capture") {
      ImagePicker.launchCamera(options, (res) => setImage(res));
    } else {
      ImagePicker.launchImageLibrary(options, (res) => setImage(res));
    }
  }, []);

  const setImage = (response: any) => {
    if (response.didCancel) {
      console.log("User cancelled image picker");
    } else if (response.error) {
      console.log("ImagePicker Error: ", response.error);
    } else {
      try {
        const source = response?.assets[0]?.uri;
        setImageTracking(source);

        getLocationOption("camera",source)
      } catch (error) {}
    }
  };

  const requestCameraPermission = async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: "Cool Photo App Camera Permission",
            message:
              "Cool Photo App needs access to your camera " +
              "so you can take awesome pictures.",
            buttonNeutral: "Ask Me Later",
            buttonNegative: "Cancel",
            buttonPositive: "OK",
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log("You can use the camera");
        } else {
          console.log("Camera permission denied");
        }
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
      requestCameraPermission();
  }, []);

  const renderOptionTracking = () => {
    return (
      <View style={styles.optionTrack}>
        <TouchableOpacity
          onPress={() =>
            onButtonPress("capture", { mediaType: "photo", includeExtra: true })
          }
        >
          <Image
            style={{ width: 40, height: 40 }}
            source={require("./src/assets/camera.png")}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMapType = () =>{
    return(
      <View style={styles.optionMapType}>
      <TouchableOpacity style={[{ marginRight: 5, borderWidth: 1, borderColor: mapType == "standard"?'red':"transparent"}]} onPress={() => setMapType("standard")}>
        <Image
          style={{ width: 40, height: 40 }}
          source={require("./src/assets/standard.jpeg")}
        />
      </TouchableOpacity >
      <TouchableOpacity style={{ marginRight: 5, borderWidth: 1, borderColor: mapType == "hybrid"?'red':"transparent"}} onPress={() => setMapType("hybrid")}>
        <Image
          style={{ width: 40, height: 40 }}
          source={require("./src/assets/hybrid_map.png")}
        />
      </TouchableOpacity>
      <TouchableOpacity style={{borderWidth: 1, borderColor: mapType == "satellite"?'red':"transparent"}} onPress={() => setMapType("satellite")}>
        <Image
          style={{ width: 40, height: 40 }}
          source={require("./src/assets/satellite_map.jpeg")}
        />
      </TouchableOpacity>
    </View>
    )
  }
  

  return (
    <View style={styles.mainContainer}>
      <MapView coords={location?.coords || null} listPosition={listPosition} mapT={mapType} />
      <View>
        <View style={styles.buttonContainer}>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={() => setModalTracking(true)}>
              <Image
                style={{ width: 40, height: 40 }}
                source={require("./src/assets/smiling-face.png")}
              />
              <Text style={{ color: '#000000'}}>Tracking</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity>
              <Image
                style={{ width: 40, height: 40 }}
                source={require("./src/assets/analysis.png")}
              />
              <Text style={{ color: '#000000'}}>Status</Text>
            </TouchableOpacity> */}

            <TouchableOpacity onPress={() => displayTracking()}>
              <Image
                style={{ width: 40, height: 40 }}
                source={require("./src/assets/list.png")}
              />
              <Text style={{ color: '#000000'}}>List</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={() => removeAllTracking()}>
              <Text>RemoveAll</Text>
            </TouchableOpacity> */}
          </View>
        </View>
      </View>
      {renderOptionTracking()}
      {renderMapType()}
      {renderModel()}
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    flex: 0.1,
    backgroundColor: "#F5FCFF",
  },
  contentContainer: {
    padding: 12,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
  },
  buttonContainer: {
    // alignItems: 'center',
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginVertical: 12,
    width: "100%",
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalView: {
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
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2,
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  btnDisable: {
    backgroundColor: "#cccccc",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    textAlign: "center",
    fontWeight: "800",
    color: "#000000",
  },
  btnTracking: {
    backgroundColor: "#2196F3",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  textTracking: {
    textAlign: "center",
    color: "#ffffff",
    fontWeight: "500",
    fontSize: 15,
  },
  optionTrack: {
    flexDirection: "row",
    position: "absolute",
    bottom: 100,
    left: "47%",
  },

  optionMapType: {
    flexDirection: "row",
    position: "absolute",
    bottom: 120,
    left: "2%",
  },

  line:{
    width: '100%',
    height: 3,
    backgroundColor: '#cccccc',
    marginTop: 5
  }
});
