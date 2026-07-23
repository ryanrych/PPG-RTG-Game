import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Modal, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { ScreenRenderer } from './src/components/ScreenRenderer';
import { useRoadToGloryGame } from './src/hooks/useRoadToGloryGame';
import { styles } from './src/styles/appStyles';

export default function App() {
  const { viewModel, goBack, restart, step, continueFromSummary, startNewSave, createSave, setNameInput, loadSave } = useRoadToGloryGame();
  const [aboutVisible, setAboutVisible] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.phoneFrame}>
        <View style={styles.aboutButtonWrap}>
          <TouchableOpacity activeOpacity={0.9} style={styles.aboutButton} onPress={() => setAboutVisible(true)}>
            <Text style={styles.aboutButtonText}>How This Works</Text>
          </TouchableOpacity>
        </View>
        <ScreenRenderer
          viewModel={viewModel}
          styles={styles}
          actions={{ restart, step, continueFromSummary, startNewSave, createSave, setNameInput, loadSave }}
        />
        <Modal transparent visible={aboutVisible} animationType="fade" onRequestClose={() => setAboutVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>How Road to Glory works</Text>
              <Text style={styles.modalText}>This is not a standalone game. This app is a companion to Pixel Pro Golf by Pixamo.</Text>
              <Text style={styles.modalText}>It adds story, progression, and a replayable single-player experience, but the actual golf rounds and gameplay happen inside Pixel Pro Golf.</Text>
              <Text style={styles.modalText}>Use this app to choose a school, follow your season, and build your career. Then play the rounds in Pixel Pro Golf to advance the story.</Text>
              <TouchableOpacity activeOpacity={0.9} style={styles.modalCloseButton} onPress={() => setAboutVisible(false)}>
                <Text style={styles.modalCloseButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
