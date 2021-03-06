import React from 'react';
import {
  Animated,
  Linking,
  Platform,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  View
} from 'react-native';
import { Asset, LinearGradient, WebBrowser, Video } from 'expo';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { NavigationActions } from 'react-navigation';
import FadeIn from 'react-native-fade-in-image';
import { View as AnimatableView } from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { withNavigation } from 'react-navigation';

import AnimatedScrollView from '../components/AnimatedScrollView';
import NavigationBar from '../components/NavigationBar';
import TalksUpNext from '../components/TalksUpNext';
import MenuButton from '../components/MenuButton';
import VideoBackground from '../components/VideoBackground';
import { BoldText, SemiBoldText } from '../components/StyledText';
import { connectDrawerButton } from '../Navigation';
import { Colors, FontSizes, Layout } from '../constants';
import { Speakers, Talks } from '../data';
import {
  HideWhenConferenceHasStarted,
  HideWhenConferenceHasEnded,
  ShowWhenConferenceHasEnded
} from '../utils';

import appParams from '../../app.json';

class Home extends React.Component {
  state = {
    scrollY: new Animated.Value(0)
  };

  render() {
    const { scrollY } = this.state;
    const headerOpacity = scrollY.interpolate({
      inputRange: [0, 150],
      outputRange: [0, 1],
      extrapolate: 'clamp'
    });

    return (
      <View style={{ flex: 1 }}>
        <AnimatedScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 20 + Layout.notchHeight / 2 }}
          scrollEventThrottle={1}
          onScroll={Animated.event(
            [
              {
                nativeEvent: { contentOffset: { y: scrollY } }
              }
            ],
            { useNativeDriver: true }
          )}
        >
          <View
            style={{
              backgroundColor: '#187f65',
              padding: 10,
              paddingTop: Layout.headerHeight - 10,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <View style={styles.headerVideoLayer}>
              <VideoBackground />
              <View style={styles.headerVideoOverlay} />
              <LinearGradient
                colors={[Colors.green, 'transparent']}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0
                }}
              />
            </View>
            <Image
              source={require('../assets/home-logo.png')}
              style={{ height: 60, resizeMode: 'contain' }}
              tintColor="#fff"
            />
            <View style={styles.headerContent}>
              <SemiBoldText style={styles.headerText}>{appParams.expo.version}</SemiBoldText>
            </View>
          </View>

          <DeferredHomeContent />
          <OverscrollView />
        </AnimatedScrollView>

        <NavigationBar
          renderLeftButton={() => <MenuButton />}
          animatedBackgroundOpacity={headerOpacity}
        />
      </View>
    );
  }
}

@withNavigation
class DeferredHomeContent extends React.Component {
  state = {
    ready: Platform.OS === 'android' ? false : true
  };

  componentDidMount() {
    if (this.state.ready) {
      return;
    }

    setTimeout(() => {
      this.setState({ ready: true });
    }, 200);
  }

  render() {
    if (!this.state.ready) {
      return null;
    }
    return (
      <AnimatableView animation="fadeIn" useNativeDriver duration={800}>
        <TalksUpNext
          style={{ marginTop: 20, marginHorizontal: 15, marginBottom: 2 }}
        />
        <View style={{ marginHorizontal: 15, marginBottom: 20 }}>
          <TouchableOpacity onPress={this._handlePressAllSongs}>
            <SemiBoldText style={styles.seeAllTalks}>
              See all songs →
            </SemiBoldText>
          </TouchableOpacity>
        </View>
        <View style={{ marginHorizontal: 15, flex: 1 }}>
          <SemiBoldText>Follow us</SemiBoldText>
        </View>        
        <View flexDirection="row" style={{ alignItems: 'center', justifyContent: 'center'}}>
          <ClipBorderRadius>
            <RectButton
              style={styles.bigButton}
              onPress={this._handlePressTwitterButton}
              underlayColor="#fff"
            >
              <Ionicons
                name="logo-twitter"
                size={23}
                style={{
                  color: '#fff',
                  marginTop: 3,
                  marginBottom: 3,
                  marginLeft: 5,
                  marginRight: 5,
                  backgroundColor: 'transparent'
                }}
              />
            </RectButton>
          </ClipBorderRadius>
          <ClipBorderRadius>
            <RectButton
              style={styles.bigButton}
              onPress={this._handlePressFacebookButton}
              underlayColor="#fff"
            >
              <Ionicons
                name="logo-facebook"
                size={23}
                style={{
                  color: '#fff',
                  marginTop: 3,
                  marginBottom: 3,
                  marginLeft: 5,
                  marginRight: 5,
                  backgroundColor: 'transparent'
                }}
              />
            </RectButton>
          </ClipBorderRadius>
          <ClipBorderRadius>
            <RectButton
              style={styles.bigButton}
              onPress={this._handlePressInstagramButton}
              underlayColor="#fff"
            >
              <Ionicons
                name="logo-instagram"
                size={23}
                style={{
                  color: '#fff',
                  marginTop: 3,
                  marginBottom: 3,
                  marginLeft: 5,
                  marginRight: 5,
                  backgroundColor: 'transparent'
                }}
              />
            </RectButton>
          </ClipBorderRadius>
          <ClipBorderRadius>
            <RectButton
              style={styles.bigButton}
              onPress={this._handlePressWebButton}
              underlayColor="#fff"
            >
              <Ionicons
                name="md-browsers"
                size={23}
                style={{
                  color: '#fff',
                  marginTop: 3,
                  marginBottom: 3,
                  marginLeft: 5,
                  marginRight: 5,
                  backgroundColor: 'transparent'
                }}
              />
            </RectButton>
          </ClipBorderRadius>
        </View>
      </AnimatableView>
    );
  }

  _handlePressAllSongs = () => {
    this.props.navigation.dispatch(
      NavigationActions.navigate({
        routeName: 'Songbook'
      })
    );
  };

  _handlePressTwitterButton = async () => {
    try {
      await Linking.openURL(`twitter://user?screen_name=chattahooligan`);
    } catch (e) {
      WebBrowser.openBrowserAsync('https://twitter.com/chattahooligan');
    }
  };
  _handlePressFacebookButton = async () => {
    WebBrowser.openBrowserAsync('https://www.facebook.com/TheChattahooligans/');
  };
  _handlePressInstagramButton = async () => {
    WebBrowser.openBrowserAsync('https://instagram.com/thechattahooligans');
  };
  _handlePressWebButton = async () => {
    WebBrowser.openBrowserAsync('http://thechattahooligans.com');
  };
}

const OverscrollView = () => (
  <View
    style={{
      position: 'absolute',
      top: -400,
      height: 400,
      left: 0,
      right: 0,
      backgroundColor: '#032E55'
    }}
  />
);

const ClipBorderRadius = ({ children, style }) => {
  return (
    <View
      style={[
        { borderRadius: BORDER_RADIUS, overflow: 'hidden', marginTop: 10 },
        style
      ]}
    >
      {children}
    </View>
  );
};

const BORDER_RADIUS = 3;

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    marginTop: 5,
    paddingVertical: 10
  },
  headerVideoLayer: {
    ...StyleSheet.absoluteFillObject
  },
  headerVideoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.green,
    opacity: 0.8
  },
  headerText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 17,
    lineHeight: 17 * 1.5
  },
  buyButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS
  },
  buyButtonText: {
    backgroundColor: 'transparent',
    color: 'rgba(0,0,0,0.9)',
    fontSize: FontSizes.normalButton
  },
  bigButton: {
    backgroundColor: Colors.green,
    paddingHorizontal: 15,
    height: 50,
    marginHorizontal: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
    flexDirection: 'row'
  },
  bigButtonText: {
    fontSize: FontSizes.normalButton,
    color: '#fff',
    textAlign: 'center'
  },
  seeAllTalks: {
    fontSize: FontSizes.normalButton,
    color: Colors.green
  }
});

export default Home;
