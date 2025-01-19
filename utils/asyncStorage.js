import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeData = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.log("Error storing value: ", error);
    }
};


export const getData = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key);
        return value; // Add this line to return the value
    } catch (error) {
        console.log("Error retrieving value: ", error);
        return null; // Add this to handle errors gracefully
    }
};