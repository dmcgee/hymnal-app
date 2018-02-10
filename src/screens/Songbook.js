import React from 'react';
import {
  ViewPagerAndroid,
  Image,
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
  ScrollView, Dimensions
} from 'react-native';
import SongView from '../components/SongView';
//import { ScrollView } from 'react-native-gesture-handler';

import NavigationOptions from '../config/NavigationOptions';
import { Ionicons } from '@expo/vector-icons';
import { NavigationActions } from 'react-navigation';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Colors, FontSizes, Layout } from '../constants';
import MenuButton from '../components/MenuButton';
import { BoldText, SemiBoldText, RegularText } from '../components/StyledText';
import LoadingPlaceholder from '../components/LoadingPlaceholder';
import TableOfContents from './TableOfContents';
import TableOfContentsInline from './TableOfContentsInline';

import Songs from '../data/songs.json';
import SongbookManifest from '../data/songbook.json';

import state from '../state';

const screenWidth = Dimensions.get('window').width;
const firstValidPageIndex = 2;

const styles = StyleSheet.create({
  sectionHeader: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#eee'
  },
  chapterText: {
    textAlign: 'center',
    fontFamily: 'open-sans'
  },
  tocButtonStyle: {
    backgroundColor: Colors.green,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginHorizontal: 0,
    width: 100 + '%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexDirection: 'row'
  },
  tocButtonText: {
    fontSize: FontSizes.normalButton,
    color: '#fff',
    textAlign: 'center'
  },
  container: {
    flex: 1,
    width: 100 + '%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#A5D8F6'
  },
  chapterTitle: {
    paddingHorizontal: 10,
    paddingTop: 7,
    paddingBottom: 5,
    backgroundColor: '#eee',
    borderWidth: 1,
    borderColor: '#eee'
  }
});

let songViews = [];
let songs = [];
let pageCount = 0;
SongbookManifest.chapters.forEach(chapterChild => {
  //console.log(chapterChild.chapter_title);
  chapterChild.songs.forEach(songChild => {
    try {
      let item = Songs.filter(song => song._id === songChild._id)[0];
      item.chapter_title = chapterChild.chapter_title;
      pageCount++;
      songs.push({ index: pageCount, song: item });
      songViews.push(
        <View key={item._id} chapter_title={chapterChild.chapter_title} style={{flex: 1, width: screenWidth}}>
          <SongView song={item} pageCount={pageCount} />
        </View>
      );
    } catch (err) {
      console.log(songChild._id + ' not found in songs database');
    }
  });
});

// Android uses ViewPagerAndroid
// iOS uses ScrollView with pagingEnabled and horizontal properties
export default class Songbook extends React.Component {
  static navigationOptions = {
    title: 'Songbook',
    ...NavigationOptions
  };

  state = {
    chapter_title: "Hooligan Hymnal",
    tocButtonDisplay: false
  };

  update() {
    console.log('update');
  };

  render() {

    let tocButton = null;

    if (this.state.tocButtonDisplay) {
      tocButton = <RectButton
          style={styles.tocButtonStyle}
          onPress={this._handlePressTOCButton}
          underlayColor="#fff"
        >
          <Ionicons
              name="md-list"
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
          <RegularText style={styles.tocButtonText}>
            Table of Contents
          </RegularText>
        </RectButton>
    }

    return (
      <LoadingPlaceholder>
        <View style={styles.sectionHeader}>
          <Text style={styles.chapterText}>{this.state.chapter_title}</Text>
        </View>
        <View style={styles.container}>
        <ScrollView
          ref={view => this._scrollView = view}
          contentContainerStyle={{flexGrow: 1,  alignItems: 'center', justifyContent: 'center'}}
          horizontal={true}
          pagingEnabled={true}
          onMomentumScrollEnd={this._onSongbookMomentumScrollEnd}
        >
          <View style={{alignItems: 'center', justifyContent: 'center'}}>
            <View style={{ flex: 1 }} />
            <Image
              style={{ width: screenWidth, height: screenWidth }}
              source={require('../assets/songbook-front-cover.png')}
            />
            <View style={{ flex: 1 }} />
            <Text style={styles.welcome}>
              Swipe Left/Right to View Songs
            </Text>
            <View style={{ flex: 1 }} />
          </View>
          <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', width: screenWidth}}>
            <TableOfContentsInline style={{width: screenWidth}} scrollToSong={this.scrollToSong} />
          </View>
          {songViews}
        </ScrollView>
        {tocButton}
        </View>
      </LoadingPlaceholder>
    );
  };

  _currentSong = () => {
    return state.currentSong
      ? songs.filter(song => song.song._id === state.currentSong._id)[0]
      : undefined;
  };

  _currentPage = () => {
    return state.currentSong
      ? songs.filter(song => song.song._id === state.currentSong._id)[0].index
      : 0;
  };

  _renderSong = ({ item }) => {
    return <SongView song={item} />;
  };

  _handlePressTOCButton = () => {
    this.scrollToToC();
    //this.props.navigation.navigate('TableOfContents');
    /*
    // attempt at in-page ToC

              <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', width: screenWidth}}>
            <TableOfContents style={{width: screenWidth}} />
          </View>

    */
  };

  _onSongbookMomentumScrollEnd = ({nativeEvent}) => {
    const pageIndex = Math.round(nativeEvent.contentOffset.x/screenWidth);

    if (firstValidPageIndex <= pageIndex) {
      this.showToCButton();
      this.setState(previousState => {
        return { chapter_title: songs[pageIndex-firstValidPageIndex].song.chapter_title };
      });
    } else if (1 === pageIndex) {
      this.hideToCButton();
      this.setState(previousState => {
        return { chapter_title: "Table of Contents" };
      });
    } else {
      this.hideToCButton();
      this.setState(previousState => {
        return { chapter_title: "Hooligan Hymnal" };
      });
    }
  };

  showToCButton = () => {
    this.setState({ tocButtonDisplay: true });
  };

  hideToCButton = () => {
    this.setState({ tocButtonDisplay: false });
  };

  scrollToToC = () => {
    this.hideToCButton();
    this._scrollView.scrollTo({x: screenWidth, y:0, animated:true});
  };

  scrollToSong = () => {
    this.showToCButton();
    this._scrollView.scrollTo({x: (state.currentSong._id - 1 + firstValidPageIndex) * screenWidth, y:0, animated:true});
  };

}