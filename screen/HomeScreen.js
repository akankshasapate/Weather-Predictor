import React, { useState, useCallback, useEffect } from "react";
import { View, Image, StyleSheet, SafeAreaView, TextInput, Text, TouchableOpacity, ScrollView } from "react-native";
import { StatusBar } from "expo-status-bar";
import { theme } from "../theam/index";
import { debounce } from 'lodash'

import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import { CalendarDaysIcon, MapPinIcon } from 'react-native-heroicons/solid';
import { fetchLocations, fetchWeatherForecast } from "../api/weather";
import { weatherImages } from "../constant/index";
import * as Progress from 'react-native-progress';
import { storeData } from "../utils/asyncStorage";

export default function HomeScreen() {
    const [showSearch, toggleSearch] = useState(false);
    const [locations, setLocation] = useState([]);
    const [weather, setWeather] = useState({});
    const [loading, setLoading] = useState(true);

    const handleLocation = (loc) => {
        console.log('location', loc);
        setLocation([]);
        toggleSearch(false);
        setLoading(true);
        fetchWeatherForecast({
            cityName: loc.name,
            days: '7'
        }).then(data => {
            setWeather(data);
            setLoading(false);
            storeData('city', loc.name);
            console.log('got forcastdata: ', data);
        })
    };

    const toggleSearchBar = () => {
        toggleSearch(!showSearch);
    };

    const handleSearch = value => {
        if (value.length > 2) {
            fetchLocations({ cityName: value }).then(data => {
                setLocation(data);
            })
        }
    };

    useEffect(() => {
        fetchMyWeatherData();
    }, []);

    const fetchMyWeatherData = async () => {
        setLoading(true);
        try {
            const data = await fetchWeatherForecast({
                cityName: 'Karnataka',
                days: '7',
            });
            setWeather(data);
        } catch (error) {
            console.error('Error fetching weather:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleTextDebounce = useCallback(debounce(handleSearch, 1000), []);
    const { current, location } = weather;

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Image
                source={require('../assets/images/bg.png')}
                style={styles.backgroundImage}
                blurRadius={70}
            />

            {loading ? (
                <View style={styles.loading}>
                    <Progress.CircleSnail thickness={10} size={110} color="#0bb3b2" />
                </View>
            ) : (
                <SafeAreaView style={styles.safeArea}>
                    <View style={styles.searchSection}>
                        <View style={[
                            styles.searchBox,
                            { backgroundColor: showSearch ? theme.bgWhite(0.2) : 'transparent' }
                        ]}>
                            {showSearch && (
                                <TextInput
                                    onChangeText={handleTextDebounce}
                                    placeholder="Search city"
                                    placeholderTextColor={'rgba(255, 255, 255, 0.7)'}
                                    style={styles.textInput}
                                    selectionColor={'white'}
                                    autoFocus={true}
                                    autoCorrect={false}
                                />
                            )}
                            <TouchableOpacity
                                onPress={toggleSearchBar}
                                style={[styles.iconButton, { backgroundColor: theme.bgWhite(0.3) }]}
                            >
                                <MagnifyingGlassIcon size={25} color={'white'} />
                            </TouchableOpacity>
                        </View>

                        {locations.length > 1 && showSearch && (
                            <View style={styles.locationList}>
                                {locations.map((loc, index) => (
                                    <TouchableOpacity
                                        key={loc.id}
                                        style={[styles.locationItem, index + 1 !== locations.length && styles.borderBottom]}
                                        onPress={() => handleLocation(loc)}
                                    >
                                        <MapPinIcon size={20} color={'gray'} />
                                        <Text style={styles.locationText}>{loc?.name}, {loc?.country}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    <View style={styles.forecastSection}>
                        <View style={styles.locationContainer}>
                            <Text style={styles.cityText}>
                                {location?.name},
                                <Text style={styles.subCityText}>
                                    {" " + location?.country}
                                </Text>
                            </Text>
                        </View>

                        <View style={styles.weatherImageContainer}>
                            <Image
                                source={weatherImages[current?.condition.text]}
                                style={styles.weatherImage}
                            />
                        </View>

                        <View style={styles.temperatureContainer}>
                            <Text style={styles.temperatureText}>
                                {current?.temp_c}&#176;
                            </Text>
                            <Text style={styles.weatherConditionText}>
                                {current?.condition?.text}
                            </Text>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Image source={require('../assets/icons/wind.png')} style={styles.statIcon} />
                                <Text style={styles.statText}>
                                    {current?.wind_kph}km
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Image source={require('../assets/icons/drop.png')} style={styles.statIcon} />
                                <Text style={styles.statText}>
                                    {current?.humidity}%
                                </Text>
                            </View>
                            <View style={styles.statItem}>
                                <Image source={require('../assets/icons/sun.png')} style={styles.statIcon} />
                                <Text style={styles.statText}>
                                    {weather?.forecast?.forecastday[0]?.astro?.sunrise}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.dailyForecastContainer}>
                        <View style={styles.forecastHeaderContainer}>
                            <CalendarDaysIcon size={22} color={'white'} />
                            <Text style={styles.forecastHeaderText}>Daily forecast</Text>
                        </View>
                        <ScrollView
                            horizontal
                            contentContainerStyle={styles.forecastScrollView}
                            showsHorizontalScrollIndicator={false}
                        >
                            {weather?.forecast?.forecastday?.map((item, index) => {
                                const date = new Date(item.date);
                                let options = { weekday: 'long' }
                                const dayName = date.toLocaleDateString('en-US', options);

                                return (
                                    <View
                                        key={index}
                                        style={[
                                            styles.forecastCard,
                                            { backgroundColor: theme.bgWhite(0.15) }
                                        ]}
                                    >
                                        <Image
                                            source={weatherImages[item?.day.condition?.text]}
                                            style={styles.forecastImage}
                                        />
                                        <Text style={styles.forecastDay}>{dayName}</Text>
                                        <Text style={styles.forecastTemp}>
                                            {item?.day?.avgtemp_c}&#176;
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </SafeAreaView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width:'100%',
        height:'100%',
        position: 'absolute',
        backgroundColor: '#000',
    },
    backgroundImage: {
        flex: 1,
        position: 'absolute',
        height: '100%',
        width: '100%',
        opacity: 0.8,
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 20,
    },
    searchSection: {
        marginTop: 60,
        marginBottom: 10,
        alignItems: "center",
        width: '100%',
        zIndex: 50,
    },
    searchBox: {
        flexDirection: "row",
        justifyContent: 'space-between',
        alignItems: "center",
        borderRadius: 30,
        width: "100%",
        height: 50,
        paddingHorizontal: 15,
        overflow: 'hidden',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    textInput: {
        flex: 1,
        color: 'white',
        fontSize: 16,
        fontWeight: '500',
        paddingHorizontal: 16,
        height: '100%',
        fontFamily: 'System',
    },
    iconButton: {
        borderRadius: 25,
        padding: 12,
        margin: 0,
    },
    locationList: {
        position: 'absolute',
        top: 120,
        left: '5%',
        right: '5%',
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: 15,
        padding: 5,
        maxHeight: 200,
        width: "90%",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
        zIndex: 50,
    },
    locationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        paddingHorizontal: 16,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    },
    locationText: {
        color: '#333',
        fontSize: 16,
        marginLeft: 12,
        fontWeight: '500',
    },
    forecastSection: {
        marginHorizontal: 16,
        flex: 1,
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    locationContainer: {
        alignItems: 'center',
    },
    cityText: {
        color: 'white',
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subCityText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#D1D5DB',
    },
    weatherImageContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    weatherImage: {
        width: 170,
        height: 170,
    },
    temperatureContainer: {
        alignItems: 'center',
    },
    temperatureText: {
        color: 'white',
        fontSize: 60,
        fontWeight: 'bold',
        marginLeft: 20,
        textAlign: 'center',
    },
    weatherConditionText: {
        color: 'white',
        fontSize: 20,
        letterSpacing: 2,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: 16,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statIcon: {
        width: 24,
        height: 24,
    },
    statText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 16,
    },
    dailyForecastContainer: {
        marginBottom: 12,
        marginTop: 8,
    },
    forecastHeaderContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 20,
        gap: 8,
        marginBottom: 12,
    },
    forecastHeaderText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    forecastScrollView: {
        paddingHorizontal: 15,
    },
    forecastCard: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 96,
        borderRadius: 24,
        paddingVertical: 12,
        marginRight: 16,
        gap: 4,
    },
    forecastImage: {
        width: 44,
        height: 44,
    },
    forecastDay: {
        color: 'white',
        fontSize: 14,
        fontWeight: '500',
    },
    forecastTemp: {
        color: 'white',
        fontSize: 20,
        fontWeight: '600',
    },
    loading: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
    }
});