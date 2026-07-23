import React from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ScreenRenderer({ viewModel, styles, actions }) {
  const { restart, step, continueFromSummary } = actions;

  function renderScreen() {
    if (viewModel.isWelcome) {
      return (
        <View style={styles.screenContent}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>ROAD TO GLORY</Text>
            <Text style={styles.title}>Welcome to your career</Text>
            <Text style={styles.subtitle}>Create a new save file or continue from an earlier one.</Text>
          </View>
          <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={actions.startNewSave}>
            <Text style={styles.primaryButtonText}>Create New Save</Text>
          </TouchableOpacity>
          {viewModel.saves.length > 0 ? (
            <View style={styles.saveList}>
              {viewModel.saves.map((item) => (
                <TouchableOpacity key={item.id} activeOpacity={0.9} style={styles.saveItem} onPress={() => actions.loadSave(item.id)}>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{item.name}</Text>
                    <Text style={styles.rowSub}>Last updated {new Date(item.updatedAt).toLocaleDateString()}</Text>
                  </View>
                  <Text style={styles.blueText}>Open →</Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.centerCard}>
              <Text style={styles.challengeSub}>No saves yet. Start a new one to begin your Road to Glory journey.</Text>
            </View>
          )}
        </View>
      );
    }

    if (viewModel.isNewSave) {
      return (
        <View style={styles.screenContent}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>NEW SAVE</Text>
            <Text style={styles.title}>What should we call you?</Text>
            <Text style={styles.subtitle}>This is the only choice you make before heading to the school screen.</Text>
          </View>
          <View style={styles.centerCard}>
            <Text style={styles.entryLabel}>PLAYER NAME</Text>
            <TextInput
              style={styles.input}
              value={viewModel.nameInput}
              onChangeText={actions.setNameInput}
              placeholder="Enter your name"
              placeholderTextColor="#6f7682"
              autoCapitalize="words"
              autoCorrect={false}
            />
            <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={actions.createSave}>
              <Text style={styles.primaryButtonText}>Start My Career</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (viewModel.isSelect) {
      return (
        <View style={styles.screenContent}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>ROAD TO GLORY</Text>
            <Text style={styles.title}>Choose Your High School</Text>
            <Text style={styles.subtitle}>Pick the program that fits your game. Your school sets the competition, the home course, and the stakes.</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {viewModel.schools.map((item) => (
              <TouchableOpacity key={item.id} activeOpacity={0.9} onPress={item.onSelect} style={styles.schoolCard}>
                <View style={styles.schoolColorBar} backgroundColor={item.hatCol} />
                <View style={styles.schoolCardBody}>
                  <View style={styles.schoolSwatchRow}>
                    <View style={styles.swatchStack}>
                      <View style={[styles.swatchTop, { backgroundColor: item.hatCol }]} />
                      <View style={[styles.swatchMiddle, { backgroundColor: item.shirtCol }]} />
                      <View style={[styles.swatchBottom, { backgroundColor: item.pantsCol }]} />
                    </View>
                    <View style={styles.schoolMeta}>
                      <Text style={styles.schoolName}>{item.name}</Text>
                      <Text style={styles.schoolMascot}>{item.mascot}</Text>
                      <Text style={styles.schoolBlurb}>{item.blurb}</Text>
                      <Text style={styles.schoolStars}>{item.stars}</Text>
                    </View>
                  </View>
                  <View style={styles.schoolFooter}>
                    <Text style={styles.schoolHome}>{item.homeName}</Text>
                    <Text style={styles.schoolPb}>{item.pbLabel}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isConfirm) {
      return (
        <View style={styles.screenContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.confirmCard}>
              <View style={[styles.confirmHero, { backgroundColor: viewModel.pick.hatCol }]}> 
                <Text style={styles.confirmTitle}>{viewModel.pick.name}</Text>
                <Text style={styles.confirmMascot}>{viewModel.pick.mascot}</Text>
              </View>
              <View style={styles.confirmBody}>
                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>PRESTIGE</Text>
                    <Text style={styles.statValue}>{viewModel.pick.stars}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>LEAGUE</Text>
                    <Text style={styles.statValue}>{viewModel.pick.conf}</Text>
                  </View>
                </View>
                <Text style={styles.sectionTitle}>THE SCHOOL</Text>
                <Text style={styles.sectionBody}>{viewModel.pick.blurb}</Text>
                <Text style={styles.sectionTitle}>HOME COURSE</Text>
                <Text style={styles.sectionBody}>{viewModel.pick.homeDesc}</Text>
                {viewModel.pick.outlook.map((item) => (
                  <View key={item.label} style={styles.outlookRow}>
                    <View style={styles.outlookTextWrap}>
                      <Text style={styles.outlookLabel}>{item.label}</Text>
                      <Text style={styles.outlookDesc}>{item.desc}</Text>
                    </View>
                    <Text style={styles.outlookTag}>{item.tag}</Text>
                  </View>
                ))}
              </View>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.startTryout}>
              <Text style={styles.primaryButtonText}>Begin Tryout →</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isTryout) {
      return (
        <View style={styles.screenContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.progressRow}>
              {viewModel.tryoutProgress.map((item, index) => (
                <View key={index} style={[styles.progressBar, { backgroundColor: item.col }]} />
              ))}
            </View>
            {viewModel.tryoutActive ? (
              <View>
                {viewModel.tryBrief ? (
                  <View style={styles.centerCard}>
                    <Text style={styles.challengeEyebrow}>CHALLENGE {viewModel.ch.num} OF 3</Text>
                    <Text style={styles.challengeTitle}>{viewModel.ch.label}</Text>
                    <Text style={styles.challengeSub}>{viewModel.ch.holes} · {viewModel.pick.homeName}</Text>
                    <View style={styles.challengePanel}>
                      <Text style={styles.challengePanelLabel}>COACH'S TARGET</Text>
                      <Text style={styles.challengeTarget}>{viewModel.ch.targetText}</Text>
                    </View>
                    <Text style={styles.challengeHint}>Play these 3 holes in Pixel Pro Golf, then come back to report your result.</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.beginEntry}>
                      <Text style={styles.primaryButtonText}>Report My Result →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.centerCard}>
                    <Text style={styles.challengeEyebrow}>CHALLENGE {viewModel.ch.num} OF 3 · REPORT</Text>
                    <Text style={styles.challengeTitle}>{viewModel.ch.label}</Text>
                    <Text style={styles.challengeSub}>Enter your result for holes {viewModel.ch.holes}. Coach wants {viewModel.ch.targetText}.</Text>
                    <View style={styles.entryPanel}>
                      <Text style={styles.entryLabel}>{viewModel.ch.entryLabel}</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(-1)}>
                          <Text style={styles.circleButtonText}>−</Text>
                        </TouchableOpacity>
                        <Text style={styles.scoreValue}>{viewModel.ch.valLabel}</Text>
                        <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(1)}>
                          <Text style={styles.circleButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={styles.entryHint}>{viewModel.ch.valHint}</Text>
                    </View>
                    {viewModel.ch.showScore ? (
                      <View style={styles.entryPanel}>
                        <Text style={styles.entryLabel}>YOUR SCORE TO PAR</Text>
                        <View style={styles.stepperRow}>
                          <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={viewModel.scoreDown}>
                            <Text style={styles.circleButtonText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.scoreValue}>{viewModel.ch.scoreLabel}</Text>
                          <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={viewModel.scoreUp}>
                            <Text style={styles.circleButtonText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.entryHint}>Counts toward your tryout total</Text>
                      </View>
                    ) : null}
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.submitChallenge}>
                      <Text style={styles.primaryButtonText}>{viewModel.ch.cta}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.centerCard}>
                <Text style={styles.resultEmoji}>{viewModel.tryoutResult.emoji}</Text>
                <Text style={[styles.resultHeadline, { color: viewModel.tryoutResult.col }]}>{viewModel.tryoutResult.headline}</Text>
                <Text style={styles.challengeSub}>{viewModel.tryoutResult.sub}</Text>
                {viewModel.tryoutResult.made ? (
                  <View style={styles.challengePanel}>
                    <Text style={styles.challengePanelLabel}>STARTING VARSITY SPOT</Text>
                    <Text style={styles.challengeTarget}>#{viewModel.tryoutResult.spot}</Text>
                    <Text style={styles.challengeHint}>Tryout score {viewModel.tryoutResult.total9}</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.enterSeason}>
                      <Text style={styles.primaryButtonText}>Enter the Season →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity activeOpacity={0.9} style={styles.ghostButton} onPress={viewModel.restart}>
                    <Text style={styles.ghostButtonText}>Try a different school</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isHub) {
      return (
        <View style={styles.screenContent}>
          <View style={styles.tabRow}>
            {viewModel.tabs.map((tab) => (
              <TouchableOpacity key={tab.key} activeOpacity={0.9} onPress={tab.onClick} style={[styles.tabButton, { borderBottomColor: tab.underline }]}> 
                <Text style={[styles.tabText, { color: tab.col }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {viewModel.hubSchedule ? (
              <View>
                <View style={styles.statRow}>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>RECORD</Text>
                    <Text style={styles.statValue}>{viewModel.recordLabel}</Text>
                  </View>
                  <View style={styles.statBox}>
                    <Text style={styles.statLabel}>DEPTH SPOT</Text>
                    <Text style={[styles.statValue, styles.blueText]}>#{viewModel.depthSpot}</Text>
                  </View>
                </View>
                {viewModel.scheduleRows.map((item, index) => (
                  <TouchableOpacity key={`${item.title}-${index}`} activeOpacity={0.9} onPress={item.onClick} style={[styles.scheduleRow, { backgroundColor: item.bg, borderColor: item.border, opacity: item.opacity }]}> 
                    <View style={[styles.badge, { backgroundColor: item.badgeBg }]}> 
                      <Text style={[styles.badgeText, { color: item.badgeCol }]}>{item.badge}</Text>
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSub}>{item.sub}</Text>
                    </View>
                    <Text style={[styles.scheduleResult, { color: item.resultCol }]}>{item.resultLabel}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : null}
            {viewModel.hubDepth ? (
              <View style={styles.depthList}>
                {viewModel.depthRows.map((item) => (
                  <View key={item.pos} style={[styles.depthItem, { backgroundColor: item.bg, borderColor: item.border }]}> 
                    <Text style={[styles.depthPos, { color: item.numCol }]}>{item.pos}</Text>
                    <View style={[styles.avatar, { backgroundColor: item.avatarBg }]}> 
                      <Text style={[styles.avatarText, { color: item.avatarCol }]}>{item.initials}</Text>
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={[styles.rowTitle, { color: item.nameCol }]}>{item.name}</Text>
                      <Text style={styles.rowSub}>{item.tag}</Text>
                    </View>
                    <Text style={[styles.depthMove, { color: item.moveCol }]}>{item.move}</Text>
                  </View>
                ))}
              </View>
            ) : null}
            {viewModel.hubScout ? (
              <View>
                <View style={styles.scoutPanel}>
                  <Text style={styles.scoutEyebrow}>SEASON SCOUT EXPOSURE</Text>
                  <Text style={styles.scoutLarge}>{viewModel.exposureLive}</Text>
                  <Text style={styles.rowSub}>out of 100 — the value that carries into recruiting</Text>
                </View>
                {viewModel.scoutBreakdown.map((item) => (
                  <View key={item.label} style={styles.scoutRow}>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{item.label}</Text>
                      <Text style={styles.rowSub}>{item.desc}</Text>
                    </View>
                    <Text style={[styles.scoutVal, { color: item.col }]}>{item.val}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isEvent) {
      return (
        <View style={styles.screenContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.eventBanner, { backgroundColor: viewModel.ev.bannerBg, borderColor: viewModel.ev.bannerBorder }]}> 
              <View>
                <Text style={styles.eventEyebrow}>{viewModel.ev.statusEyebrow}</Text>
                <Text style={[styles.eventStatus, { color: viewModel.ev.statusCol }]}>{viewModel.ev.statusBig}</Text>
              </View>
              <View>
                <Text style={styles.eventEyebrow}>THRU</Text>
                <Text style={styles.eventStatus}>{viewModel.ev.thru}</Text>
              </View>
            </View>
            {viewModel.ev.playing ? (
              <View style={styles.centerCard}>
                <Text style={styles.challengeEyebrow}>HOLE {viewModel.ev.holeNum}</Text>
                <Text style={styles.challengeTitle}>Par {viewModel.ev.holePar}</Text>
                <Text style={styles.challengeHint}>Your strokes</Text>
                <View style={styles.stepperRow}>
                  <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(-1)}>
                    <Text style={styles.circleButtonText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.scoreStack}>
                    <Text style={styles.scoreValue}>{viewModel.ev.curStrokes}</Text>
                    <Text style={[styles.entryHint, { color: viewModel.ev.curCol }]}>{viewModel.ev.curToPar}</Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(1)}>
                    <Text style={styles.circleButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.ev.enterHole}>
                  <Text style={styles.primaryButtonText}>Enter Hole {viewModel.ev.holeNum}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.ev.finishEvent}>
                <Text style={styles.primaryButtonText}>{viewModel.ev.finishCta} →</Text>
              </TouchableOpacity>
            )}
            {viewModel.ev.isMatch ? (
              <View style={styles.matchCard}>
                <Text style={styles.sectionTitle}>You vs {viewModel.ev.oppName}</Text>
                <View style={styles.holeGrid}>
                  {viewModel.ev.holeCells.map((item) => (
                    <View key={item.num} style={styles.holeCell}>
                      <Text style={styles.holeCellNumber}>{item.num}</Text>
                      <View style={[styles.holeCellValue, { backgroundColor: item.youBg }]}> 
                        <Text style={[styles.holeCellText, { color: item.youCol }]}>{item.you}</Text>
                      </View>
                      <View style={[styles.holeCellValueSmall, { backgroundColor: item.oppBg }]}> 
                        <Text style={[styles.holeCellTextSmall, { color: item.oppCol }]}>{item.opp}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
            {viewModel.ev.isStroke ? (
              <View style={styles.matchCard}>
                <Text style={styles.sectionTitle}>LIVE LEADERBOARD</Text>
                {viewModel.ev.leaderboard.map((item) => (
                  <View key={`${item.name}-${item.pos}`} style={[styles.leaderRow, { backgroundColor: item.bg, borderColor: item.border }]}> 
                    <Text style={[styles.leaderPos, { color: item.posCol }]}>{item.pos}</Text>
                    <Text style={[styles.leaderName, { color: item.nameCol }]}>{item.name}</Text>
                    <Text style={styles.rowSub}>{item.thru}</Text>
                    <Text style={[styles.leaderScore, { color: item.scoreCol }]}>{item.score}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isSummary) {
      return (
        <View style={styles.screenContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={[styles.summaryCard, { backgroundColor: viewModel.sum.teamBg, borderColor: viewModel.sum.teamCol }]}> 
              <Text style={styles.summaryEyebrow}>TEAM RESULT · {viewModel.sum.courseName}</Text>
              <Text style={[styles.summaryHeadline, { color: viewModel.sum.teamCol }]}>{viewModel.sum.teamHeadline}</Text>
              <View style={styles.summaryScores}>
                <View style={styles.summarySide}>
                  <Text style={styles.summarySchool}>{viewModel.sum.yourSchool}</Text>
                  <Text style={[styles.summaryScore, { color: viewModel.sum.teamCol }]}>{viewModel.sum.yourPts}</Text>
                </View>
                <Text style={styles.summaryDash}>–</Text>
                <View style={styles.summarySide}>
                  <Text style={styles.summarySchool}>{viewModel.sum.oppSchool}</Text>
                  <Text style={styles.summaryScore}>{viewModel.sum.oppPts}</Text>
                </View>
              </View>
              <Text style={styles.summaryHint}>{viewModel.sum.tieNote}</Text>
            </View>
            <View style={styles.matchCard}>
              <Text style={styles.sectionTitle}>INDIVIDUAL MATCHES</Text>
              {viewModel.sum.pairings.map((item) => (
                <View key={`${item.you}-${item.opp}`} style={styles.pairingRow}>
                  <View style={[styles.badge, { backgroundColor: item.badgeBg }]}> 
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                  <View style={styles.rowTextWrap}>
                    <Text style={styles.rowTitle}>{item.you}</Text>
                    <Text style={styles.rowSub}>vs {item.opp}</Text>
                  </View>
                  <Text style={styles.scheduleResult}>{item.yourToPar} · {item.oppToPar}</Text>
                </View>
              ))}
            </View>
            <View style={styles.matchCard}>
              <Text style={styles.sectionTitle}>INDIVIDUAL LEADERBOARD</Text>
              {viewModel.sum.board.map((item) => (
                <View key={`${item.name}-${item.pos}`} style={[styles.leaderRow, { backgroundColor: item.bg, borderColor: item.border }]}> 
                  <Text style={styles.leaderPos}>{item.pos}</Text>
                  <View style={styles.rowTextWrap}>
                    <Text style={[styles.rowTitle, { color: item.nameCol }]}>{item.name}</Text>
                    <Text style={[styles.rowSub, { color: item.schoolCol }]}>{item.school}</Text>
                  </View>
                  <Text style={[styles.leaderScore, { color: item.scoreCol }]}>{item.score}</Text>
                </View>
              ))}
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={continueFromSummary}>
              <Text style={styles.primaryButtonText}>Continue →</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      );
    }

    return (
      <View style={styles.screenContent}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.centerCard}>
            <Text style={styles.resultEmoji}>🏆</Text>
            <Text style={styles.sectionTitle}>SEASON COMPLETE</Text>
            <Text style={styles.challengeTitle}>{viewModel.endTitle}</Text>
            <Text style={styles.challengeSub}>{viewModel.endSummary}</Text>
            <View style={styles.statRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>RECORD</Text>
                <Text style={styles.statValue}>{viewModel.recordLabel}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>FINAL SPOT</Text>
                <Text style={[styles.statValue, styles.blueText]}>#{viewModel.depthSpot}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>CHAMPS</Text>
                <Text style={[styles.statValue, { color: viewModel.champCol }]}>{viewModel.champFinish}</Text>
              </View>
            </View>
            <View style={styles.scoutPanel}>
              <Text style={styles.scoutEyebrow}>FINAL SCOUT EXPOSURE</Text>
              <Text style={styles.scoutLarge}>{viewModel.exposureLive}</Text>
              <Text style={styles.rowSub}>{viewModel.exposureVerdict}</Text>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.ghostButton} onPress={restart}>
              <Text style={styles.ghostButtonText}>Start a new career</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return renderScreen();
}
