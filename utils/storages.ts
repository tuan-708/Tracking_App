import AsyncStorage from "@react-native-async-storage/async-storage";


export enum KeyStorage {
    Tracking = 'tracking',
    History = 'history'
}

const get = async (key: string) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value;
    }catch (e) {
        // saving error
      }
}

const set = async (key: KeyStorage, value: any) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    }
    catch (e) {
        // saving error
      }
}

const remove = async (key: KeyStorage) => {
    try {
        await AsyncStorage.removeItem(key);
    }
    catch (e) {
        // saving error
      }
}

const Storages = {
    get,
    set,
    remove
};

export default Storages;
