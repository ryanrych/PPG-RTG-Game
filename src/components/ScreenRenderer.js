import React from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function ScreenRenderer({ viewModel, styles, actions }) {
  const { restart, step, continueFromSummary, goBack } = actions;
  const [regionMenuOpen, setRegionMenuOpen] = React.useState(false);
  const regions = [
    'Great Lakes',
    'Metro',
    'Mid-Atlantic',
    'Midwest',
    'Mountain',
    'New England',
    'Northwest',
    'Southeast',
    'Southwest',
    'West',
  ];

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
            <Text style={styles.title}>Welcome to Road to Glory</Text>
            <Text style={styles.subtitle}>Name your player, then choose a school and compete through a high school golf season to build your career.</Text>
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
            <Text style={[styles.entryLabel, styles.regionLabel]}>HOMETOWN / REGION</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.dropdownField}
              onPress={() => setRegionMenuOpen((open) => !open)}
            >
              <Text style={viewModel.hometownInput ? styles.dropdownValue : styles.dropdownPlaceholder}>
                {viewModel.hometownInput || 'Select a region'}
              </Text>
              <Text style={styles.dropdownChevron}>{regionMenuOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
            <Modal transparent visible={regionMenuOpen} animationType="fade" onRequestClose={() => setRegionMenuOpen(false)}>
              <Pressable style={styles.dropdownBackdrop} onPress={() => setRegionMenuOpen(false)}>
                <Pressable style={styles.dropdownSheet} onPress={() => {}}>
                  <Text style={styles.dropdownSheetTitle}>Select a region</Text>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    {regions.map((region) => {
                      const selected = viewModel.hometownInput === region;
                      return (
                        <TouchableOpacity
                          key={region}
                          activeOpacity={0.8}
                          style={[styles.dropdownItem, selected ? styles.dropdownItemActive : null]}
                          onPress={() => {
                            actions.setHometownInput(region);
                            setRegionMenuOpen(false);
                          }}
                        >
                          <Text style={[styles.dropdownItemText, selected ? styles.dropdownItemTextActive : null]}>{region}</Text>
                          {selected ? <Text style={styles.dropdownCheck}>✓</Text> : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </Pressable>
              </Pressable>
            </Modal>
            <Text style={styles.entryHint}>Required — saved for future regional recruiting and player profile.</Text>
            {(() => {
              const canStart = !!viewModel.nameInput?.trim() && !!viewModel.hometownInput;
              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={!canStart}
                  style={[styles.primaryButton, !canStart ? styles.primaryButtonDisabled : null]}
                  onPress={actions.createSave}
                >
                  <Text style={[styles.primaryButtonText, !canStart ? styles.disabledText : null]}>Start My Career</Text>
                </TouchableOpacity>
              );
            })()}
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
                    <Text style={styles.schoolHomeLabel}>HOME COURSE: {item.homeName}</Text>
                  </View>
                  {item.warning ? (
                    <Text style={styles.schoolWarning}>Warning: making the team at this program is not guaranteed.</Text>
                  ) : null}
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
          <TouchableOpacity activeOpacity={0.8} style={[styles.backButton, styles.backButtonSpacing]} onPress={goBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.confirmCard}>
              <View style={[styles.confirmHero, { backgroundColor: viewModel.pick.shirtCol }]}>
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
                    <Text style={styles.challengeHint}>Play these 3 holes in Pixel Pro Golf, then come back to report each hole.</Text>
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.beginEntry}>
                      <Text style={styles.primaryButtonText}>Start Reporting →</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.centerCard}>
                    <Text style={styles.challengeEyebrow}>CHALLENGE {viewModel.ch.num} OF 3 · HOLE {viewModel.hole.posInSegment} OF 3</Text>
                    <Text style={styles.challengeTitle}>Hole {viewModel.hole.num}</Text>
                    <Text style={styles.challengeSub}>Par {viewModel.hole.par} · {viewModel.ch.label}</Text>
                    <View style={styles.entryPanel}>
                      <Text style={styles.entryLabel}>YOUR STROKES</Text>
                      <View style={styles.stepperRow}>
                        <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(-1)}>
                          <Text style={styles.circleButtonText}>−</Text>
                        </TouchableOpacity>
                        <View style={styles.scoreStack}>
                          <Text style={styles.scoreValue}>{viewModel.hole.strokesLabel}</Text>
                          <Text style={styles.entryHint}>{viewModel.hole.toParLabel}</Text>
                        </View>
                        <TouchableOpacity activeOpacity={0.8} style={styles.circleButton} onPress={() => step(1)}>
                          <Text style={styles.circleButtonText}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View style={styles.entryPanel}>
                      <Text style={styles.entryLabel}>{viewModel.hole.holePrompt}</Text>
                      <View style={styles.toggleRow}>
                        <TouchableOpacity activeOpacity={0.8} style={[styles.toggleButton, !viewModel.hole.hit && styles.toggleButtonActive]} onPress={() => viewModel.setHoleHit(false)}>
                          <Text style={[styles.toggleButtonText, !viewModel.hole.hit && styles.toggleButtonTextActive]}>No</Text>
                        </TouchableOpacity>
                        <TouchableOpacity activeOpacity={0.8} style={[styles.toggleButton, viewModel.hole.hit && styles.toggleButtonActive]} onPress={() => viewModel.setHoleHit(true)}>
                          <Text style={[styles.toggleButtonText, viewModel.hole.hit && styles.toggleButtonTextActive]}>Yes</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.submitHole}>
                      <Text style={styles.primaryButtonText}>{viewModel.hole.cta}</Text>
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
          <TouchableOpacity activeOpacity={0.8} style={[styles.backButton, styles.backButtonSpacing]} onPress={goBack}>
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
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
                <Text style={[styles.challengeEyebrow, { color: '#fff' }]}>HOLE {viewModel.ev.holeNum}</Text>
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

    if (viewModel.isRecruiting) {
      const r = viewModel.recruit;
      return (
        <View style={styles.screenContent}>
          <View style={styles.heroCard}>
            <Text style={styles.eyebrow}>RECRUITING</Text>
            <Text style={styles.title}>{r.phase === 'board' ? 'Build Your Board' : 'Your Offers'}</Text>
            <Text style={styles.subtitle}>Scout exposure: {r.exposure} / 100</Text>
          </View>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {r.phase === 'board' ? (
              <View>
                <Text style={styles.sectionTitle}>GUARANTEED OFFERS ({r.guaranteedCount})</Text>
                {r.guaranteedRows.length === 0 ? (
                  <Text style={styles.challengeSub}>No guaranteed offers yet — pin some reach schools below to gamble on one.</Text>
                ) : (
                  r.guaranteedRows.map((row) => (
                    <View key={row.id} style={[styles.scheduleRow, { backgroundColor: '#181b21', borderColor: '#242833' }]}>
                      <View style={styles.rowTextWrap}>
                        <Text style={styles.rowTitle}>{row.name}</Text>
                        <Text style={styles.rowSub}>{row.conf} · #{row.prestigeRank} nationally</Text>
                      </View>
                      <Text style={styles.blueText}>{row.slotLabel}</Text>
                    </View>
                  ))
                )}

                <Text style={styles.sectionTitle}>REACH SCHOOLS · PIN {r.pinnedCount}/{r.maxPins}</Text>
                <Text style={styles.entryHint}>Top {r.reachShownCount} of {r.reachTotalCount} programs within reach, by odds of turning into an offer. Pin up to {r.maxPins} to gamble on them.</Text>
                {r.reachRows.map((row) => (
                  <TouchableOpacity
                    key={row.id}
                    activeOpacity={0.8}
                    onPress={row.onToggle}
                    style={[styles.scheduleRow, row.pinned ? { backgroundColor: 'rgba(232,80,42,.14)', borderColor: '#e8502a' } : { backgroundColor: '#181b21', borderColor: '#242833' }]}
                  >
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{row.name}</Text>
                      <Text style={styles.rowSub}>{row.conf} · #{row.prestigeRank} nationally</Text>
                    </View>
                    <Text style={[styles.scheduleResult, row.pinned && styles.blueText]}>{row.pinned ? 'PINNED' : `${row.oddsPct}%`}</Text>
                  </TouchableOpacity>
                ))}

                <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={r.lockIn}>
                  <Text style={styles.primaryButtonText}>Lock In Recruiting Board →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <View style={styles.tabRow}>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => r.setSort('prestige')} style={[styles.tabButton, { borderBottomColor: r.sort === 'prestige' ? '#2f80ff' : 'transparent' }]}>
                    <Text style={[styles.tabText, { color: r.sort === 'prestige' ? '#f2f3f5' : '#7f8792' }]}>By Prestige</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.9} onPress={() => r.setSort('slot')} style={[styles.tabButton, { borderBottomColor: r.sort === 'slot' ? '#2f80ff' : 'transparent' }]}>
                    <Text style={[styles.tabText, { color: r.sort === 'slot' ? '#f2f3f5' : '#7f8792' }]}>By Starting Slot</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.entryHint}>{r.offerCount} offer{r.offerCount === 1 ? '' : 's'} · tap one to select it</Text>
                {r.offerRows.map((row) => (
                  <TouchableOpacity
                    key={row.id}
                    activeOpacity={0.8}
                    onPress={row.onSelect}
                    style={[styles.scheduleRow, row.selected ? { backgroundColor: 'rgba(232,80,42,.14)', borderColor: '#e8502a' } : { backgroundColor: '#181b21', borderColor: '#242833' }]}
                  >
                    <View style={[styles.badge, { backgroundColor: row.badgeBg }]}>
                      <Text style={[styles.badgeText, { color: row.badgeCol }]}>{row.badge === 'OFFER' ? '✓' : '★'}</Text>
                    </View>
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{row.name}</Text>
                      <Text style={styles.rowSub}>{row.conf} · #{row.prestigeRank} · {row.roleTag}</Text>
                    </View>
                    <Text style={styles.blueText}>{row.slotLabel}</Text>
                  </TouchableOpacity>
                ))}

                <Text style={styles.sectionTitle}>WALK ON SOMEWHERE ELSE</Text>
                <Text style={styles.entryHint}>No offer needed — walk on to any program and climb the roster from the bottom.</Text>
                <TextInput
                  style={styles.input}
                  value={r.walkOnQuery}
                  onChangeText={r.setWalkOnQuery}
                  placeholder="Search any program by name"
                  placeholderTextColor="#6f7682"
                  autoCapitalize="words"
                  autoCorrect={false}
                />
                {r.walkOnResults.map((row) => (
                  <TouchableOpacity
                    key={row.id}
                    activeOpacity={0.8}
                    onPress={row.onSelect}
                    style={[styles.scheduleRow, row.selected ? { backgroundColor: 'rgba(232,80,42,.14)', borderColor: '#e8502a' } : { backgroundColor: '#181b21', borderColor: '#242833' }]}
                  >
                    <View style={styles.rowTextWrap}>
                      <Text style={styles.rowTitle}>{row.name}</Text>
                      <Text style={styles.rowSub}>{row.conf} · #{row.prestigeRank} nationally</Text>
                    </View>
                    <Text style={styles.rowSub}>WALK ON</Text>
                  </TouchableOpacity>
                ))}

                {r.selectedId ? (
                  <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={r.commit}>
                    <Text style={styles.primaryButtonText}>Commit to {r.selectedName} →</Text>
                  </TouchableOpacity>
                ) : null}
                <TouchableOpacity activeOpacity={0.9} style={styles.ghostButton} onPress={restart}>
                  <Text style={styles.ghostButtonText}>Start a New Career</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      );
    }

    if (viewModel.isCommitted) {
      const c = viewModel.committed;
      return (
        <View style={styles.screenContent}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <View style={styles.centerCard}>
              <Text style={styles.resultEmoji}>{c.isWalkOn ? '🥾' : '🖊️'}</Text>
              <Text style={styles.sectionTitle}>{c.headline}</Text>
              <Text style={styles.challengeTitle}>{c.name}</Text>
              <Text style={styles.challengeSub}>{c.conf} · #{c.prestigeRank} nationally</Text>
              <View style={styles.challengePanel}>
                <Text style={styles.challengePanelLabel}>STARTING ROSTER SPOT</Text>
                <Text style={styles.challengeTarget}>{c.slotLabel}</Text>
                <Text style={styles.challengeHint}>{c.roleTag}{c.isWalkOn ? ' — no offer, but a real shot to climb the roster.' : ''}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.9} style={styles.ghostButton} onPress={restart}>
                <Text style={styles.ghostButtonText}>Start a New Career</Text>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity activeOpacity={0.9} style={styles.primaryButton} onPress={viewModel.startRecruiting}>
              <Text style={styles.primaryButtonText}>See Recruiting Offers →</Text>
            </TouchableOpacity>
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
