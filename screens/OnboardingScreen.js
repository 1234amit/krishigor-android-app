import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, Dimensions, StatusBar } from 'react-native';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    title: 'Empowering Farmers with Smart Solutions',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard.',
    image: require('../assets/images/onboard1.jpg'),
    button: 'Next',
  },
  {
    key: '2',
    title: 'One App, Endless Farming Possibilities',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard.',
    image: require('../assets/images/onboard1.jpg'),
    button: 'Next',
  },
  {
    key: '3',
    title: 'The Future of Farming at Your Fingertips',
    description: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard.',
    image: require('../assets/images/onboard3.jpg'),
    button: 'Get Started',
  },
];

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      navigation.replace('Login'); // Navigate to LoginScreen
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressBarContainer}>
      {slides.map((_, idx) => (
        <View
          key={idx}
          style={[
            styles.progressBar,
            { backgroundColor: idx === currentIndex ? '#1CA15F' : '#fff', borderColor: '#1CA15F' }
          ]}
        />
      ))}
    </View>
  );

  const renderItem = ({ item }) => (
    <View style={styles.slide}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.curveSheet}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <TouchableOpacity style={styles.button} onPress={handleNext}>
          <Text style={styles.buttonText}>{item.button}</Text>
        </TouchableOpacity>
      </View>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ position: 'absolute', top: 50, left: 0, right: 0, zIndex: 2 }}>
        {renderProgressBar()}
      </View>
      <FlatList
        data={slides}
        renderItem={renderItem}
        keyExtractor={item => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        onMomentumScrollEnd={e => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    height,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  image: {
    width,
    height: height * 0.65,
    resizeMode: 'cover',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  curveSheet: {
    width: width,
    backgroundColor: '#fff',
    borderTopLeftRadius: 70,   // Gentle curve
    borderTopRightRadius: 70,  // Gentle curve
    paddingTop: 40,
    paddingHorizontal: 28,
    paddingBottom: 40,
    minHeight: height * 0.38,  // Adjust as needed
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    backgroundColor: '#1CA15F',
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  progressBarContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
    gap: 8,
  },
  progressBar: {
    height: 6,
    width: width * 0.22,
    borderRadius: 3,
    marginHorizontal: 4,
    borderWidth: 1.5,
  },
});