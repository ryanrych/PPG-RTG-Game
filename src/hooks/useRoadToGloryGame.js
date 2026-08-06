import { useEffect, useMemo, useState } from 'react';
import { createSaveFile, listSaveFiles, loadSaveFile, saveCareerState } from '../data/repository';
import {
  KHA,
  CONFERENCES,
  rivalConsistency,
  MATE_NAMES,
  OPP_NAMES,
  SCHOOLS,
  NINE_PARS,
  tryoutSpot,
  depthChartSeeding,
  DEPTH_CHART_MOVE_CLAMP,
  initialState,
  initials,
  ord,
  score9,
  stars,
  toPar,
  hash,
  distribute,
  rng,
  gauss,
} from '../data/gameData';
import { computeExposure } from '../data/exposure';
import { COLLEGES, evaluateAllSchools, pinSchool, unpinSchool, resolveOffers, sortOffers, walkOnOffer, MAX_PINS } from '../data/recruiting';
import {
  ROSTER_SIZE as COLLEGE_ROSTER_SIZE,
  LINEUP_SIZE as COLLEGE_LINEUP_SIZE,
  travelingTeammates,
  isBenched,
  buildCollegeSchedule,
  collegeCoursePb9,
  generateCollegeTeammates,
  generateEventField,
  generatePracticeChallenge,
  PRACTICE_PARS,
  PRACTICE_MOVE_CLAMP,
  computeSeasonPerformance,
  ageAndGraduate,
  recruitFreshmen,
  resolveOffseasonSpotChange,
  developPlayerStrength,
} from '../data/collegeSeason';

const RECRUIT_REACH_DISPLAY_CAP = 20;
const OUT_OF_RANGE_LABEL = {
  'above-window': 'Below your level',
  'below-reach': 'Too far out of reach',
  'guaranteed-cap': 'Offer went elsewhere',
};
const WALK_ON_RESULTS_CAP = 8;
const COLLEGE_PARS = NINE_PARS.concat(NINE_PARS);

// Same wording as the high school tryout challenges — practice reuses them verbatim.
const PRACTICE_LABELS = {
  gir: { label: 'Greens in Regulation', holePrompt: 'Did you hit the green in regulation (2 under par)?', cta: 'Log Hole →' },
  fair: { label: 'Fairways Hit', holePrompt: 'Did you hit the fairway or green off the tee?', cta: 'Log Hole →' },
  putt: { label: 'Putts (2 or Fewer)', holePrompt: 'Two putts or fewer?', cta: 'Log Hole →' },
};

const CLASS_YEAR_LABELS = { 1: 'Freshman', 2: 'Sophomore', 3: 'Junior', 4: 'Senior' };
const MAX_COLLEGE_YEARS = 4; // NCAA eligibility — senior season is the last one

// [DEV] Scout exposure for recruiting: the real season-computed number,
// unless a dev override slider value is set on the save.
function resolvedExposure(s) {
  const real = Math.max(0, Math.min(100, Math.round(s.exposureRaw)));
  return s.devExposureOverride == null ? real : s.devExposureOverride;
}

export function useRoadToGloryGame() {
  const [state, setState] = useState({ ...initialState, saves: [] });

  useEffect(() => {
    let active = true;
    async function hydrate() {
      try {
        const saves = await listSaveFiles();
        if (active) {
          setState((prev) => ({ ...prev, saves }));
        }
      } catch {
        // ignore load issues and fall back to the default screen
      }
    }

    hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (state.saveId && state.screen !== 'welcome' && state.screen !== 'new-save') {
      saveCareerState(state).catch(() => {});
    }
  }, [state]);

  const school = useMemo(() => SCHOOLS.find((item) => item.id === state.schoolId) ?? null, [state.schoolId]);

  const viewModel = useMemo(() => {
    const current = { ...state };
    const base = {
      isWelcome: current.screen === 'welcome',
      isNewSave: current.screen === 'new-save',
      isSelect: current.screen === 'select',
      isConfirm: current.screen === 'confirm',
      isTryout: current.screen === 'tryout',
      isHub: current.screen === 'hub',
      isEvent: current.screen === 'event',
      isEnd: current.screen === 'end',
      isSummary: current.screen === 'summary',
      isRecruiting: current.screen === 'recruiting',
      isCommitted: current.screen === 'committed',
      isCollegeHub: current.screen === 'college-hub',
      isCollegeEvent: current.screen === 'college-event',
      isCollegeSummary: current.screen === 'college-summary',
      isCollegeEnd: current.screen === 'college-end',
      isCollegePractice: current.screen === 'college-practice',
      isCollegeOffseason: current.screen === 'college-offseason',
      showBack: current.screen === 'confirm' || current.screen === 'event' || current.screen === 'college-event' || current.screen === 'college-practice',
      playerName: current.playerName || 'Player',
      nameInput: current.nameInput || '',
      hometownInput: current.hometownInput || current.hometown || '',
      hometown: current.hometown || '',
      saves: current.saves || [],
      exposureLive: Math.max(0, Math.min(100, Math.round(current.exposureRaw))),
      exposurePct: `${Math.max(0, Math.min(100, Math.round(current.exposureRaw)))}%`,
      depthSpot: current.spot,
      schools: SCHOOLS.map((item) => ({
        ...item,
        stars: stars(item.prestige),
        borderCol: item.risk ? 'rgba(232,80,42,.4)' : '#262a33',
        hatCol: item.hat,
        shirtCol: item.shirt,
        pantsCol: KHA,
        homeName: item.home.name,
        warning: item.prestige >= 4,
        onSelect: () => selectSchool(item.id),
      })),
    };

    if (base.isWelcome) {
      base.eyebrow = 'Road to Glory';
      base.title = 'Welcome';
      base.barBg = 'transparent';
    } else if (base.isNewSave) {
      base.eyebrow = 'New Save';
      base.title = 'Create your career';
      base.barBg = 'transparent';
    } else if (base.isSelect) {
      base.eyebrow = '';
      base.title = '';
      base.barBg = 'transparent';
    } else if (base.isConfirm && school) {
      base.eyebrow = '';
      base.title = '';
      base.barBg = 'transparent';
      base.pick = {
        name: school.name,
        mascot: school.mascot,
        hatCol: school.hat,
        shirtCol: school.shirt,
        stars: stars(school.prestige),
        conf: school.conf,
        blurb: school.blurb,
        homeName: school.home.name,
        homeDesc: school.home.desc,
        risk: school.risk,
        outlook: [
          { label: 'Scout attention', desc: 'How often scouts show up', pct: `${Math.max(6, Math.min(100, school.scout))}%`, tag: school.scout < 25 ? 'Very low' : school.scout < 45 ? 'Low' : school.scout < 65 ? 'Medium' : school.scout < 82 ? 'High' : 'Very high' },
          { label: 'Making the team', desc: 'Odds you survive the tryout', pct: `${Math.max(6, Math.min(100, 125 - school.prestige * 13))}%`, tag: 125 - school.prestige * 13 < 25 ? 'Very low' : 125 - school.prestige * 13 < 45 ? 'Low' : 125 - school.prestige * 13 < 65 ? 'Medium' : 125 - school.prestige * 13 < 82 ? 'High' : 'Very high' },
          { label: 'Reaching Varsity 1', desc: 'Climbing to the top depth spot', pct: `${Math.max(6, Math.min(100, 100 - school.prestige * 15 - (school.roster - 5) * 4))}%`, tag: 100 - school.prestige * 15 - (school.roster - 5) * 4 < 25 ? 'Very low' : 100 - school.prestige * 15 - (school.roster - 5) * 4 < 45 ? 'Low' : 100 - school.prestige * 15 - (school.roster - 5) * 4 < 65 ? 'Medium' : 100 - school.prestige * 15 - (school.roster - 5) * 4 < 82 ? 'High' : 'Very high' },
        ],
      };
      base.startTryout = () => startTryout();
    } else if (base.isTryout && school) {
      base.eyebrow = school.name;
      base.title = 'Varsity Tryout';
      base.barBg = 'transparent';
      base.tryoutActive = current.tryStep < 3;
      base.tryoutDone = current.tryStep === 3;
      base.pick = { homeName: school.home.name };
      base.tryoutProgress = [0, 1, 2].map((i) => ({
        col: i < current.tryStep ? '#2f80ff' : i === current.tryStep && current.tryStep < 3 ? '#2f80ff' : '#262b34',
      }));
      if (base.tryoutActive) {
        const specs = [
          { label: 'Greens in Regulation', holes: '1–3', targetText: `${school.tryout.gir} of 3 greens`, holePrompt: 'Did you hit the green in regulation (2 under par)?', cta: 'Log Hole →' },
          { label: 'Fairways Hit', holes: '4–6', targetText: `${school.tryout.fair} of 3 fairways`, holePrompt: 'Did you hit the fairway or green off the tee?', cta: 'Log Hole →' },
          { label: 'Putts (2 or Fewer)', holes: '7–9', targetText: `${school.tryout.putt} of 3 holes at 2-putts or fewer`, holePrompt: 'Two putts or fewer?', cta: 'Log Hole →' },
        ];
        const challenge = specs[current.tryStep];
        base.tryBrief = (current.tryPhase || 'brief') === 'brief';
        base.tryEnter = !base.tryBrief;
        base.beginEntry = () => beginEntry();
        base.ch = {
          num: current.tryStep + 1,
          ...challenge,
        };
        const holePar = NINE_PARS[current.tryHoleIndex];
        const isLastHole = current.tryHoleIndex === 8;
        base.hole = {
          num: current.tryHoleIndex + 1,
          par: holePar,
          posInSegment: (current.tryHoleIndex % 3) + 1,
          holePrompt: challenge.holePrompt,
          strokesLabel: current.tryHoleStrokes,
          toParLabel: toPar(current.tryHoleStrokes - holePar),
          hit: current.tryHoleHit,
          cta: isLastHole ? 'Finish Tryout →' : 'Log Hole →',
        };
        base.setHoleHit = (value) => setHoleHit(value);
        base.submitHole = () => submitHole();
      }
      if (base.tryoutDone) {
        const result = current.tryResult;
        if (result.cut) {
          base.tryoutResult = {
            made: false,
            cut: true,
            emoji: '✂️',
            col: '#e0484d',
            headline: 'Cut From the Team',
            sub: 'You missed the marks at an elite program and didn’t make varsity.',
          };
        } else {
          const flavor = result.spot <= 2
            ? 'Coach slots you near the top of the depth chart. Big expectations.'
            : result.spot <= 4
              ? 'A solid varsity spot with room to climb all season.'
              : 'You made the team by a hair — every good round moves you up.';
          base.tryoutResult = {
            made: true,
            spot: result.spot,
            total9: toPar(result.total9 || 0),
            emoji: '✅',
            col: '#43b581',
            headline: 'You Made Varsity',
            sub: flavor,
          };
          base.enterSeason = () => enterSeason();
        }
        base.restart = () => restart();
      }
    } else if (base.isHub && school) {
      base.eyebrow = `${school.name} ${school.mascot}`;
      base.title = 'The Season';
      base.barBg = 'transparent';
      base.showExposure = true;
      base.recordLabel = record();
      base.tabs = [
        { label: 'Schedule', key: 'schedule' },
        { label: 'Depth Chart', key: 'depth' },
        { label: 'Scouting', key: 'scout' },
      ].map((tab) => ({
        ...tab,
        onClick: () => setTab(tab.key),
        col: current.hubTab === tab.key ? '#f2f3f5' : '#7f8792',
        underline: current.hubTab === tab.key ? '#2f80ff' : 'transparent',
      }));
      base.hubSchedule = current.hubTab === 'schedule';
      base.hubDepth = current.hubTab === 'depth';
      base.hubScout = current.hubTab === 'scout';
      if (base.hubSchedule) {
        const opps = opponents(school);
        base.scheduleRows = opps.map((item, index) => {
          const event = current.events[index];
          const next = index === current.eventIndex;
          const baseRow = {
            title: `vs ${item.school}`,
            sub: `${item.golfer} · ${item.course.name}`,
            flagged: !!item.flagged,
            badge: `M${index + 1}`,
            badgeBg: 'rgba(47,128,255,.14)',
            badgeCol: '#4d92ff',
          };
          if (event && event.done) {
            const outcome = event.result.outcome;
            const label = outcome === 'win' ? `W ${Math.abs(event.result.margin)}up` : outcome === 'loss' ? `L ${Math.abs(event.result.margin)}dn` : 'HALVED';
            const resultCol = outcome === 'win' ? '#43b581' : outcome === 'loss' ? '#e0484d' : '#e8a33c';
            return { ...baseRow, bg: '#161920', border: '#242833', opacity: 0.75, cursor: 'default', onClick: () => {}, resultLabel: label, resultCol };
          }
          if (next) {
            return {
              ...baseRow,
              bg: '#181b21',
              border: '#2f80ff',
              opacity: 1,
              cursor: 'pointer',
              onClick: () => openEvent(index),
              resultLabel: 'PLAY ›',
              resultCol: '#4d92ff',
            };
          }
          return { ...baseRow, bg: '#141619', border: '#20232b', opacity: 0.5, cursor: 'default', onClick: () => {}, resultLabel: '', resultCol: '#7f8792' };
        });
        const champIndex = opps.length;
        const champEvent = current.events[champIndex];
        const champNext = champIndex === current.eventIndex;
        const champRow = { title: school.champ.name, sub: `Full field · ${school.champ.course.name} · 18 holes`, flagged: false, badge: '🏆', badgeBg: 'rgba(232,163,60,.16)', badgeCol: '#e8a33c' };
        if (champEvent && champEvent.done) {
          base.scheduleRows.push({ ...champRow, bg: '#161920', border: '#242833', opacity: 0.75, cursor: 'default', onClick: () => {}, resultLabel: `T${champEvent.result.rank}`, resultCol: champEvent.result.rank <= 3 ? '#e8a33c' : '#9aa0ab' });
        } else if (champNext) {
          base.scheduleRows.push({ ...champRow, bg: '#1b1712', border: '#e8a33c', opacity: 1, cursor: 'pointer', onClick: () => openEvent(champIndex), resultLabel: 'PLAY ›', resultCol: '#e8a33c' });
        } else {
          base.scheduleRows.push({ ...champRow, bg: '#141619', border: '#20232b', opacity: 0.5, cursor: 'default', onClick: () => {}, resultLabel: '', resultCol: '#7f8792' });
        }
      }
      if (base.hubDepth) {
        const rows = [];
        const positions = depthChartSeeding(current.teammates, current.spot, school.roster);
        const bySpot = new Array(school.roster + 1);
        current.teammates.forEach((mate, index) => { bySpot[positions[index]] = mate; });
        for (let pos = 1; pos <= school.roster; pos += 1) {
          if (pos === current.spot) {
            rows.push({ you: true, name: 'You', tag: `${school.mascot} · varsity` });
          } else {
            const mate = bySpot[pos];
            rows.push({ you: false, name: mate.name, tag: `Strength ${mate.str}` });
          }
        }
        base.depthRows = rows.map((item, index) => ({
          pos: index + 1,
          name: item.name,
          tag: item.tag,
          initials: item.you ? 'YOU' : initials(item.name),
          bg: item.you ? 'rgba(232,80,42,.14)' : '#181b21',
          border: item.you ? '#e8502a' : '#242833',
          numCol: item.you ? '#f08464' : '#7f8792',
          nameCol: item.you ? '#ffb59e' : '#e5e8ed',
          avatarBg: item.you ? '#e8502a' : '#262b34',
          avatarCol: item.you ? '#fff' : '#9aa0ab',
          move: '',
          moveCol: '#7f8792',
        }));
      }
      if (base.hubScout) {
        base.scoutBreakdown = [
          { label: 'Positional baseline', desc: `Prestige ${school.prestige}★ × depth spot #${current.spot}`, val: 'floor', col: '#4d92ff' },
          { label: 'Performance', desc: 'Your scores & match margins', val: 'lead', col: '#43b581' },
          { label: 'Events played', desc: `of ${current.events.length} this season`, val: current.events.filter((event) => event.done).length, col: '#e8a33c' },
        ];
      }
    } else if (base.isEvent && school && current.ev) {
      const event = current.ev;
      const total = event.isChamp ? 18 : 9;
      const done = event.holeIndex >= total;
      const par = event.pars.reduce((sum, value) => sum + value, 0);
      const playerToPar = event.playerHoles.reduce((sum, value) => sum + value, 0) - event.pars.slice(0, event.holeIndex).reduce((sum, value) => sum + value, 0);
      base.ev = {
        isMatch: !event.isChamp,
        isStroke: event.isChamp,
        playing: !done,
        finished: done,
        thru: `${event.holeIndex} / ${total}`,
        holeNum: Math.min(event.holeIndex + 1, total),
        holePar: event.pars[Math.min(event.holeIndex, total - 1)],
        curStrokes: current.curStrokes,
        curToPar: toPar(current.curStrokes - event.pars[Math.min(event.holeIndex, total - 1)]),
        curCol: current.curStrokes - event.pars[Math.min(event.holeIndex, total - 1)] < 0 ? '#43b581' : current.curStrokes - event.pars[Math.min(event.holeIndex, total - 1)] > 0 ? '#e0484d' : '#9aa0ab',
        enterHole: () => enterHole(),
        finishEvent: () => finishEvent(),
      };
      if (!event.isChamp) {
        let won = 0;
        let lost = 0;
        for (let i = 0; i < event.holeIndex; i += 1) {
          const a = event.playerHoles[i] - event.pars[i];
          const b = event.oppHoles[i] - event.pars[i];
          if (a < b) won += 1;
          else if (a > b) lost += 1;
        }
        const diff = won - lost;
        const statusBig = diff === 0 ? 'ALL SQ' : `${Math.abs(diff)} ${diff > 0 ? 'UP' : 'DN'}`;
        base.ev.statusEyebrow = 'MATCH STATUS';
        base.ev.statusBig = statusBig;
        base.ev.statusCol = diff > 0 ? '#43b581' : diff < 0 ? '#e0484d' : '#dfe3e9';
        base.ev.bannerBg = diff > 0 ? 'rgba(67,181,129,.1)' : diff < 0 ? 'rgba(224,72,77,.1)' : '#181b21';
        base.ev.bannerBorder = diff > 0 ? 'rgba(67,181,129,.4)' : diff < 0 ? 'rgba(224,72,77,.4)' : '#262a33';
        base.ev.oppName = event.oppName;
        if (done) {
          const m = diff > 0 ? 'WON' : diff < 0 ? 'LOST' : 'HALVED';
          base.ev.finishCta = m === 'WON' ? `Won ${Math.abs(diff)} UP` : m === 'LOST' ? `Lost ${Math.abs(diff)} DN` : 'Match Halved';
          base.ev.statusBig = m;
          base.ev.statusCol = diff > 0 ? '#43b581' : diff < 0 ? '#e0484d' : '#e8a33c';
        }
        base.ev.holeCells = event.pars.map((parValue, index) => {
          const played = index < event.holeIndex;
          const you = played ? event.playerHoles[index] : '·';
          const opp = played ? event.oppHoles[index] : '·';
          const win = played && event.playerHoles[index] - parValue < event.oppHoles[index] - parValue;
          const loss = played && event.playerHoles[index] - parValue > event.oppHoles[index] - parValue;
          return {
            num: index + 1,
            you: played ? you : '·',
            opp: played ? opp : '·',
            youBg: !played ? '#181b21' : win ? 'rgba(67,181,129,.9)' : loss ? '#262b34' : '#31363f',
            youCol: !played ? '#3a3f49' : win ? '#0b0d10' : '#e5e8ed',
            oppBg: !played ? '#141619' : '#20242c',
            oppCol: !played ? '#3a3f49' : loss ? '#f0a48f' : '#9aa0ab',
          };
        });
      } else {
        base.ev.statusEyebrow = 'YOUR SCORE';
        base.ev.statusBig = toPar(playerToPar);
        base.ev.statusCol = playerToPar < 0 ? '#43b581' : playerToPar > 0 ? '#e0484d' : '#dfe3e9';
        base.ev.bannerBg = '#181b21';
        base.ev.bannerBorder = '#262a33';
        const board = event.field.map((f) => ({ name: f.name, tot: f.holes.slice(0, event.holeIndex).reduce((sum, value) => sum + value, 0) - event.pars.slice(0, event.holeIndex).reduce((sum, value) => sum + value, 0), you: false }));
        board.push({ name: 'You', tot: playerToPar, you: true });
        board.sort((a, b) => a.tot - b.tot);
        base.ev.leaderboard = board.map((item, index) => ({
          pos: index + 1,
          name: item.name,
          thru: `${event.holeIndex} thru`,
          score: toPar(item.tot),
          bg: item.you ? 'rgba(232,80,42,.16)' : '#161920',
          border: item.you ? '#e8502a' : '#20232b',
          posCol: item.you ? '#f08464' : '#7f8792',
          nameCol: item.you ? '#ffb59e' : '#e5e8ed',
          scoreCol: item.tot < 0 ? '#43b581' : item.tot > 0 ? '#e0484d' : '#9aa0ab',
        }));
        if (done) {
          const rank = board.findIndex((item) => item.you) + 1;
          base.ev.finishCta = `Finished ${rank === 1 ? '1st — Champion!' : ord(rank)}`;
          base.ev.statusCol = '#e8a33c';
        }
      }
    } else if (base.isEnd && school) {
      base.eyebrow = school.name;
      base.title = 'Season Report';
      base.barBg = 'transparent';
      base.recordLabel = record();
      let champ = current.events.find((event) => event.done && event.result.type === 'champ');
      let rank = champ ? champ.result.rank : '—';
      base.champFinish = champ ? (rank === 1 ? '1st' : ord(rank)) : '—';
      base.champCol = champ && rank <= 3 ? '#e8a33c' : '#dfe3e9';
      const exp = Math.max(0, Math.min(100, Math.round(current.exposureRaw)));
      base.endTitle = exp >= 70 ? 'A Season That Turned Heads' : exp >= 45 ? 'A Solid Freshman Campaign' : 'Room to Grow';
      base.endSummary = `You finished ${base.recordLabel} in conference play at #${current.spot} on the ${school.mascot} depth chart, capped by a ${base.champFinish} at the ${school.champ.name}.`;
      base.exposureVerdict = exp >= 70 ? 'Big programs are watching. You enter recruiting with real leverage.' : exp >= 45 ? 'You’re on the radar of mid-tier programs.' : 'A few local scouts noticed. Next season is the one that matters.';
      base.startRecruiting = () => startRecruiting();
    } else if (base.isRecruiting) {
      const exposure = resolvedExposure(current);
      const evaluations = evaluateAllSchools(exposure);
      const byProgramRank = (a, b) => a.school.prestigeRank - b.school.prestigeRank;

      const guaranteed = evaluations.filter((item) => item.band === 'guaranteed').sort(byProgramRank);
      const reachAll = evaluations.filter((item) => item.band === 'reach').sort(byProgramRank);
      const reachShown = reachAll.slice(0, RECRUIT_REACH_DISPLAY_CAP);

      base.recruit = {
        exposure,
        phase: current.recruitPhase,
        pinnedCount: current.recruitPinnedIds.length,
        maxPins: MAX_PINS,
        // [DEV] Slider state — devExposureValue is what the slider shows
        // (falls back to the real exposure until the dev drags it); actual is
        // the real season-computed number, for reference next to the slider.
        devExposureValue: current.devExposureOverride == null ? exposure : current.devExposureOverride,
        devExposureActual: Math.max(0, Math.min(100, Math.round(current.exposureRaw))),
        setDevExposure: (value) => setDevExposureOverride(value),
        clearDevExposure: () => setDevExposureOverride(null),
        devExposureOverridden: current.devExposureOverride != null,
        guaranteedCount: guaranteed.length,
        guaranteedRows: guaranteed.map((item) => ({
          id: item.school.id,
          name: item.school.name,
          conf: item.school.conf,
          prestigeRank: item.school.prestigeRank,
          slotLabel: `Roster Spot #${item.rosterRole.spot}`,
        })),
        reachTotalCount: reachAll.length,
        reachShownCount: reachShown.length,
        reachRows: reachShown.map((item) => {
          const pinned = current.recruitPinnedIds.includes(item.school.id);
          return {
            id: item.school.id,
            name: item.school.name,
            conf: item.school.conf,
            prestigeRank: item.school.prestigeRank,
            oddsPct: Math.round(item.conversionChance * 100),
            pinned,
            onToggle: () => toggleReachPin(item.school.id),
          };
        }),
        lockIn: () => lockInRecruiting(),
        allCount: evaluations.length,
        allRows: evaluations.slice().sort(byProgramRank).map((item) => {
          if (item.band === 'guaranteed') {
            return {
              id: item.school.id,
              name: item.school.name,
              conf: item.school.conf,
              prestigeRank: item.school.prestigeRank,
              band: 'guaranteed',
              statusText: `Roster Spot #${item.rosterRole.spot}`,
              active: false,
              onPress: null,
            };
          }
          if (item.band === 'reach') {
            const pinned = current.recruitPinnedIds.includes(item.school.id);
            return {
              id: item.school.id,
              name: item.school.name,
              conf: item.school.conf,
              prestigeRank: item.school.prestigeRank,
              band: 'reach',
              statusText: pinned ? 'PINNED' : `${Math.round(item.conversionChance * 100)}% chance`,
              active: pinned,
              onPress: () => toggleReachPin(item.school.id),
            };
          }
          // Cleared the bar but lost the guaranteed slot to competition, too
          // far below your level to interest a program, or too far above it
          // to be a realistic reach — none of that stops you from walking on.
          // Tapping targets it for the "Walk On" commit below, same as
          // searching for it by name on the post-lock-in offer sheet.
          const selected = current.recruitSelectedId === item.school.id;
          return {
            id: item.school.id,
            name: item.school.name,
            conf: item.school.conf,
            prestigeRank: item.school.prestigeRank,
            band: 'out-of-range',
            statusText: selected ? 'WALK-ON TARGET' : (OUT_OF_RANGE_LABEL[item.reason] || 'Out of range'),
            active: selected,
            onPress: () => selectOffer(item.school.id),
          };
        }),
      };

      const walkOnTarget = current.recruitSelectedId
        ? COLLEGES.find((college) => college.id === current.recruitSelectedId)
        : null;
      base.recruit.walkOnSelectedId = current.recruitSelectedId;
      base.recruit.walkOnSelectedName = walkOnTarget ? walkOnTarget.name : null;
      base.recruit.commitWalkOn = () => commitToSelection();

      if (current.recruitPhase === 'offers' && current.recruitOffers) {
        const sorted = sortOffers(current.recruitOffers, current.recruitSort);
        const offeredIds = new Set(current.recruitOffers.map((offer) => offer.school.id));
        base.recruit.sort = current.recruitSort;
        base.recruit.setSort = (key) => setRecruitSort(key);
        base.recruit.offerCount = sorted.length;
        base.recruit.offerRows = sorted.map((offer) => ({
          id: offer.school.id,
          name: offer.school.name,
          conf: offer.school.conf,
          prestigeRank: offer.school.prestigeRank,
          slotLabel: `Roster Spot #${offer.rosterRole.spot}`,
          roleTag: offer.rosterRole.tag,
          badge: offer.band === 'guaranteed' ? 'OFFER' : 'EARNED',
          badgeBg: offer.band === 'guaranteed' ? 'rgba(47,128,255,.14)' : 'rgba(67,181,129,.16)',
          badgeCol: offer.band === 'guaranteed' ? '#4d92ff' : '#43b581',
          selected: current.recruitSelectedId === offer.school.id,
          onSelect: () => selectOffer(offer.school.id),
        }));

        const query = (current.recruitWalkOnQuery || '').trim().toLowerCase();
        const walkOnResults = query.length < 2 ? [] : COLLEGES
          .filter((college) => !offeredIds.has(college.id) && college.name.toLowerCase().includes(query))
          .slice(0, WALK_ON_RESULTS_CAP)
          .map((college) => ({
            id: college.id,
            name: college.name,
            conf: college.conf,
            prestigeRank: college.prestigeRank,
            selected: current.recruitSelectedId === college.id,
            onSelect: () => selectOffer(college.id),
          }));
        base.recruit.walkOnQuery = current.recruitWalkOnQuery || '';
        base.recruit.setWalkOnQuery = (text) => setWalkOnQuery(text);
        base.recruit.walkOnResults = walkOnResults;

        const selected = base.recruit.offerRows.find((row) => row.id === current.recruitSelectedId)
          || walkOnResults.find((row) => row.id === current.recruitSelectedId);
        base.recruit.selectedId = current.recruitSelectedId;
        base.recruit.selectedName = selected ? selected.name : null;
        base.recruit.commit = () => commitToSelection();
      }
    } else if (base.isCommitted && current.committedTeam) {
      const team = current.committedTeam;
      base.committed = {
        name: team.school.name,
        conf: team.school.conf,
        prestigeRank: team.school.prestigeRank,
        slotLabel: `Roster Spot #${team.rosterRole.spot}`,
        roleTag: team.rosterRole.tag,
        isWalkOn: team.band === 'walk-on',
        headline: team.band === 'walk-on' ? 'Walking On' : team.band === 'guaranteed' ? 'Signed & Committed' : 'Earned Your Shot',
      };
      base.startCollegeCareer = () => startCollegeCareer();
    } else if (base.isCollegeHub && current.committedTeam) {
      const team = current.committedTeam;
      const benched = isBenched(current.collegeSpot, COLLEGE_LINEUP_SIZE);
      base.college = {
        teamName: team.school.name,
        conf: team.school.conf,
        prestigeRank: team.school.prestigeRank,
        spot: current.collegeSpot,
        roster: COLLEGE_ROSTER_SIZE,
        benched,
        record: collegeRecordLabel(),
      };
      base.college.tabs = [
        { key: 'schedule', label: 'Schedule' },
        { key: 'roster', label: 'Roster' },
      ].map((tab) => ({
        ...tab,
        onClick: () => setCollegeTab(tab.key),
        col: current.collegeHubTab === tab.key ? '#f2f3f5' : '#7f8792',
        underline: current.collegeHubTab === tab.key ? '#2f80ff' : 'transparent',
      }));
      if (current.collegePracticeAvailable && current.collegePracticeChallenge) {
        const info = PRACTICE_LABELS[current.collegePracticeChallenge.type];
        base.college.practice = {
          label: info.label,
          targetText: `${current.collegePracticeChallenge.target} of 3 holes`,
          play: () => startCollegePractice(),
          sim: () => simCollegePractice(),
        };
      }
      base.college.showSchedule = current.collegeHubTab === 'schedule';
      base.college.showRoster = current.collegeHubTab === 'roster';
      base.college.schedule = current.collegeSchedule.map((tournament, index) => {
        const entry = current.collegeEvents[index];
        const isNext = index === current.collegeEventIndex;
        const row = {
          id: tournament.id,
          name: tournament.name,
          location: tournament.location,
          course: tournament.course || 'Course TBD',
        };
        if (entry && entry.done) {
          if (entry.result.benched) {
            return { ...row, resultLabel: 'DNP · BENCHED', resultCol: '#7f8792', bg: '#161920', border: '#242833', opacity: 0.75, onClick: () => {} };
          }
          return { ...row, resultLabel: `T${entry.result.rank} of ${entry.result.fieldSize}`, resultCol: entry.result.rank <= 5 ? '#e8a33c' : '#9aa0ab', bg: '#161920', border: '#242833', opacity: 0.75, onClick: () => {} };
        }
        if (isNext) {
          return benched
            ? { ...row, resultLabel: 'BENCHED ›', resultCol: '#e0484d', bg: '#181b21', border: '#5a2f2f', opacity: 1, onClick: () => openCollegeEvent(index) }
            : { ...row, resultLabel: 'PLAY ›', resultCol: '#4d92ff', bg: '#181b21', border: '#2f80ff', opacity: 1, onClick: () => openCollegeEvent(index) };
        }
        return { ...row, resultLabel: '', resultCol: '#7f8792', bg: '#141619', border: '#20232b', opacity: 0.5, onClick: () => {} };
      });

      const positions = depthChartSeeding(current.collegeTeammates, current.collegeSpot, COLLEGE_ROSTER_SIZE);
      const bySpot = new Array(COLLEGE_ROSTER_SIZE + 1);
      current.collegeTeammates.forEach((mate, index) => { bySpot[positions[index]] = mate; });
      base.college.rosterRows = [];
      for (let pos = 1; pos <= COLLEGE_ROSTER_SIZE; pos += 1) {
        const isYou = pos === current.collegeSpot;
        const mate = isYou ? null : bySpot[pos];
        const traveling = pos <= COLLEGE_LINEUP_SIZE;
        base.college.rosterRows.push({
          pos,
          name: isYou ? 'You' : mate.name,
          tag: isYou ? `${team.school.name} · ${traveling ? 'starting five' : 'bench'}` : `Strength ${mate.str}${traveling ? '' : ' · bench'}`,
          initials: isYou ? 'YOU' : initials(mate.name),
          bg: isYou ? 'rgba(232,80,42,.14)' : '#181b21',
          border: isYou ? '#e8502a' : '#242833',
          numCol: isYou ? '#f08464' : '#7f8792',
          nameCol: isYou ? '#ffb59e' : '#e5e8ed',
          avatarBg: isYou ? '#e8502a' : '#262b34',
          avatarCol: isYou ? '#fff' : '#9aa0ab',
        });
      }
    } else if (base.isCollegeEvent && current.collegeEv && current.committedTeam) {
      const event = current.collegeEv;
      const total = COLLEGE_PARS.length;
      const done = event.holeIndex >= total;
      const holePar = event.pars[Math.min(event.holeIndex, total - 1)];
      const curToParVal = current.collegeCurStrokes - holePar;
      base.collegeEvView = {
        tournamentName: event.tournament.name,
        location: event.tournament.location,
        courseName: event.courseName,
        playing: !done,
        finished: done,
        thru: `${event.holeIndex} / ${total}`,
        holeNum: Math.min(event.holeIndex + 1, total),
        holePar,
        curStrokes: current.collegeCurStrokes,
        curToPar: toPar(curToParVal),
        curCol: curToParVal < 0 ? '#43b581' : curToParVal > 0 ? '#e0484d' : '#9aa0ab',
        enterHole: () => enterCollegeHole(),
        finishEvent: () => finishCollegeEvent(),
      };
    } else if (base.isCollegeSummary && current.collegeSummary) {
      const summary = current.collegeSummary;
      if (summary.benched) {
        base.collegeSummaryView = {
          benched: true,
          tournamentName: summary.tournamentName,
          location: summary.location,
          hint: summary.bestName
            ? `You didn't crack this week's traveling five. ${summary.bestName} led the team, finishing ${ord(summary.bestRank)} of ${summary.fieldSize}.`
            : "You didn't crack this week's traveling five.",
          board: summary.board.map((entry, index) => ({
            pos: index + 1,
            name: entry.name,
            mine: entry.mine,
            score: toPar(entry.toPar),
          })),
        };
      } else {
        base.collegeSummaryView = {
          benched: false,
          tournamentName: summary.tournamentName,
          location: summary.location,
          toPar: toPar(summary.toPar),
          rank: ord(summary.rank),
          fieldSize: summary.fieldSize,
          madeTop5: summary.rank <= 5,
          board: summary.board.map((entry, index) => ({
            pos: index + 1,
            name: entry.name,
            you: entry.you,
            score: toPar(entry.toPar),
          })),
        };
      }
    } else if (base.isCollegeEnd && current.committedTeam) {
      const team = current.committedTeam;
      const finishes = current.collegeEvents.filter((event) => event.done);
      const played = finishes.filter((event) => !event.result.benched);
      const best = played.reduce((best, event) => (best === null || event.result.rank < best ? event.result.rank : best), null);
      const isFinalSeason = current.collegeYear >= MAX_COLLEGE_YEARS;
      base.collegeEndView = {
        teamName: team.school.name,
        yearLabel: CLASS_YEAR_LABELS[current.collegeYear] || `Year ${current.collegeYear}`,
        record: collegeRecordLabel(),
        finalSpot: current.collegeSpot,
        roster: COLLEGE_ROSTER_SIZE,
        benched: isBenched(current.collegeSpot, COLLEGE_LINEUP_SIZE),
        bestFinish: best !== null ? ord(best) : '—',
        isFinalSeason,
        subtitle: isFinalSeason ? 'Senior season complete — your college career is over.' : `${CLASS_YEAR_LABELS[current.collegeYear] || `Year ${current.collegeYear}`} season in the books`,
        results: finishes.map((event) => (event.result.benched
          ? {
            name: event.result.tournamentName,
            location: event.result.location,
            benched: true,
            fieldSize: event.result.fieldSize,
            bestName: event.result.bestName,
            bestRank: event.result.bestRank,
          }
          : {
            name: event.result.tournamentName,
            location: event.result.location,
            benched: false,
            rank: `T${event.result.rank}`,
            fieldSize: event.result.fieldSize,
            toPar: toPar(event.result.toPar),
          })),
      };
      if (!isFinalSeason) base.enterOffseason = () => enterOffseason();
    } else if (base.isCollegeOffseason && current.collegeOffseasonReport) {
      const report = current.collegeOffseasonReport;
      const strengthDelta = report.playerStrengthAfter - report.playerStrengthBefore;
      base.offseason = {
        year: report.year,
        performancePct: Math.round(report.performanceScore * 100),
        graduated: report.graduated.map((mate) => ({ name: mate.name, tag: `Senior · Strength ${mate.str}` })),
        freshmen: report.freshmen.map((mate) => ({
          name: mate.name,
          tag: `Freshman · Strength ${mate.str}`,
          beatYou: mate.str > report.playerStrengthBefore,
        })),
        overtakers: report.overtakers,
        spotBefore: report.spotBefore,
        spotAfter: report.spotAfter,
        spotChanged: report.spotAfter !== report.spotBefore,
        strengthDelta,
        strengthLabel: strengthDelta > 0 ? `+${strengthDelta}` : `${strengthDelta}`,
        continue: () => continueFromCollegeOffseason(),
      };
    } else if (base.isCollegePractice && current.collegePracticeChallenge) {
      const challenge = current.collegePracticeChallenge;
      const info = PRACTICE_LABELS[challenge.type];
      base.practice = {
        phase: current.collegePracticePhase,
        label: info.label,
        targetText: `${challenge.target} of 3 holes`,
      };
      if (current.collegePracticePhase === 'enter') {
        const holePar = PRACTICE_PARS[current.collegePracticeHoleIndex];
        base.practice.hole = {
          num: current.collegePracticeHoleIndex + 1,
          par: holePar,
          holePrompt: info.holePrompt,
          strokesLabel: current.collegePracticeStrokes,
          toParLabel: toPar(current.collegePracticeStrokes - holePar),
          hit: current.collegePracticeHit,
          cta: current.collegePracticeHoleIndex === 2 ? 'Log Hole & Finish →' : info.cta,
        };
        base.practice.setHit = (value) => setCollegePracticeHit(value);
        base.practice.submitHole = () => submitPracticeHole();
      } else if (current.collegePracticeResult) {
        const result = current.collegePracticeResult;
        base.practice.result = {
          count: result.count,
          target: result.target,
          passed: result.count >= result.target,
          score: toPar(result.score),
          simmed: result.simmed,
          moveLabel: result.move > 0 ? `Up ${result.move} spot${result.move === 1 ? '' : 's'}` : result.move < 0 ? `Down ${Math.abs(result.move)} spot${Math.abs(result.move) === 1 ? '' : 's'}` : 'No change',
        };
        base.practice.continue = () => continueFromCollegePractice();
      }
    } else if (base.isSummary && current.matchSummary) {
      const match = current.matchSummary;
      const cols = { win: '#43b581', loss: '#e0484d', halve: '#e8a33c' };
      base.sum = {
        courseName: match.courseName,
        teamHeadline: match.teamOutcome === 'win' ? 'Team Win' : match.teamOutcome === 'loss' ? 'Team Loss' : 'Team Halved',
        teamCol: cols[match.teamOutcome],
        teamBg: match.teamOutcome === 'win' ? 'rgba(67,181,129,.12)' : match.teamOutcome === 'loss' ? 'rgba(224,72,77,.12)' : 'rgba(232,163,60,.12)',
        yourSchool: match.yourSchool,
        oppSchool: match.oppSchool,
        yourPts: match.yourPts % 1 ? match.yourPts.toFixed(1) : match.yourPts,
        oppPts: match.oppPts % 1 ? match.oppPts.toFixed(1) : match.oppPts,
        tieNote: match.yourPts === match.oppPts ? `Tied on points — decided by team score (${toPar(match.yourTeamTot)} to ${toPar(match.oppTeamTot)})` : '',
      };
      base.sum.pairings = match.pairings.map((item) => ({
        you: item.you,
        opp: item.opp,
        badge: item.res === 'win' ? 'W' : item.res === 'loss' ? 'L' : 'H',
        badgeBg: item.res === 'win' ? '#43b581' : item.res === 'loss' ? '#e0484d' : '#e8a33c',
        yourToPar: toPar(item.yourToPar),
        oppToPar: toPar(item.oppToPar),
      }));
      base.sum.board = match.board.map((item, index) => ({
        pos: index + 1,
        name: item.name,
        school: item.school,
        score: toPar(item.toPar),
        bg: item.you ? 'rgba(232,80,42,.16)' : item.mine ? '#171b22' : '#141519',
        border: item.you ? '#e8502a' : item.mine ? '#2a3340' : '#20232b',
        nameCol: item.you ? '#ff8a5c' : '#e5e8ed',
        schoolCol: item.mine ? '#7fa8d6' : '#7f8792',
        scoreCol: item.toPar < 0 ? '#43b581' : item.toPar > 0 ? '#cf7076' : '#9aa0ab',
      }));
    }

    return base;
  }, [state, school]);

  function selectSchool(id) {
    setState((prev) => ({ ...prev, schoolId: id, screen: 'confirm' }));
  }

  function startNewSave() {
    setState((prev) => ({ ...prev, screen: 'new-save', nameInput: '', hometownInput: '', hometown: '' }));
  }

  function setNameInput(value) {
    setState((prev) => ({ ...prev, nameInput: value }));
  }

  function setHometownInput(value) {
    setState((prev) => ({ ...prev, hometownInput: value }));
  }

  // TEMPORARY DEV SHORTCUT — creates a throwaway save and jumps straight to
  // college (recruiting) selection with a fake exposure score, skipping the
  // whole high school career. Remove when no longer needed.
  async function devSkipToCollegeSelect() {
    const created = await createSaveFile('Dev Player');
    if (!created) return;
    setState((prev) => ({
      ...prev,
      ...created.state,
      saveId: created.id,
      playerName: 'Dev Player',
      hometown: 'Metro',
      hometownInput: 'Metro',
      nameInput: '',
      saves: prev.saves,
      exposureRaw: 65,
      screen: 'recruiting',
      recruitPhase: 'board',
      recruitPinnedIds: [],
      recruitOffers: null,
      recruitSelectedId: null,
      recruitWalkOnQuery: '',
      committedTeam: null,
    }));
  }

  async function createSave() {
    const hometown = (state.hometownInput || '').trim();
    const name = (state.nameInput || '').trim();
    if (!hometown || !name) return;
    const created = await createSaveFile(name);
    if (!created) return;
    setState((prev) => ({
      ...prev,
      ...created.state,
      saveId: created.id,
      playerName: name,
      hometown,
      hometownInput: hometown,
      screen: 'select',
      nameInput: '',
      saves: prev.saves,
    }));
  }

  async function loadSave(id) {
    const loaded = await loadSaveFile(id);
    if (!loaded) return;
    setState((prev) => ({
      ...prev,
      ...loaded,
      saveId: id,
      playerName: loaded.playerName || prev.playerName || 'Player',
      screen: loaded.screen || 'select',
      saves: prev.saves,
    }));
  }

  function startTryout() {
    setState((prev) => ({
      ...prev,
      screen: 'tryout',
      tryStep: 0,
      tryEntries: [],
      tryHoleIndex: 0,
      tryHoleStrokes: NINE_PARS[0],
      tryHoleHit: false,
      tryHoleAcc: [],
      tryPhase: 'brief',
    }));
  }

  function beginEntry() {
    setState((prev) => ({ ...prev, tryPhase: 'enter' }));
  }

  function setHoleHit(value) {
    setState((prev) => ({ ...prev, tryHoleHit: value }));
  }

  function step(dir) {
    if (state.screen === 'tryout') {
      const value = Math.max(1, Math.min(12, state.tryHoleStrokes + dir));
      setState((prev) => ({ ...prev, tryHoleStrokes: value }));
    } else if (state.screen === 'event') {
      const value = Math.max(1, Math.min(12, state.curStrokes + dir));
      setState((prev) => ({ ...prev, curStrokes: value }));
    } else if (state.screen === 'college-event') {
      const value = Math.max(1, Math.min(12, state.collegeCurStrokes + dir));
      setState((prev) => ({ ...prev, collegeCurStrokes: value }));
    } else if (state.screen === 'college-practice') {
      const value = Math.max(1, Math.min(12, state.collegePracticeStrokes + dir));
      setState((prev) => ({ ...prev, collegePracticeStrokes: value }));
    }
  }

  function chSpec(index) {
    const item = school?.tryout;
    if (!item) return { type: 'gir', target: 2 };
    if (index === 0) return { type: 'gir', target: item.gir };
    if (index === 1) return { type: 'fair', target: item.fair };
    return { type: 'putt', target: item.putt };
  }

  function submitHole() {
    const item = school;
    if (!item) return;
    const holeEntry = { strokes: state.tryHoleStrokes, par: NINE_PARS[state.tryHoleIndex], hit: state.tryHoleHit };
    const acc = [...state.tryHoleAcc, holeEntry];
    const nextHoleIndex = state.tryHoleIndex + 1;

    if (acc.length < 3) {
      setState((prev) => ({
        ...prev,
        tryHoleAcc: acc,
        tryHoleIndex: nextHoleIndex,
        tryHoleStrokes: NINE_PARS[nextHoleIndex],
        tryHoleHit: false,
      }));
      return;
    }

    const spec = chSpec(state.tryStep);
    const count = acc.filter((hole) => hole.hit).length;
    const segScore = acc.reduce((sum, hole) => sum + (hole.strokes - hole.par), 0);
    const entry = { type: spec.type, val: count, target: spec.target, score: segScore };
    const entries = [...state.tryEntries, entry];

    if (state.tryStep < 2) {
      setState((prev) => ({
        ...prev,
        tryStep: state.tryStep + 1,
        tryEntries: entries,
        tryHoleAcc: [],
        tryHoleIndex: nextHoleIndex,
        tryHoleStrokes: NINE_PARS[nextHoleIndex],
        tryHoleHit: false,
        tryPhase: 'brief',
      }));
    } else {
      resolveTryout(entries);
    }
  }

  function resolveTryout(entries) {
    const item = school;
    if (!item) return;
    const cfg = item.tryout;

    // Step 1 — make the team (score gate): sum of the three 3-hole
    // score-to-par entries gives the 9-hole score, compared against the bar.
    const score = entries.reduce((sum, entry) => sum + entry.score, 0);
    const beatBar = score <= cfg.bar;
    if (!beatBar && item.risk) {
      setState((prev) => ({ ...prev, screen: 'tryout', tryStep: 3, tryResult: { made: false, cut: true } }));
      return;
    }

    // Step 2 — challenge cut. At the elite programs the challenges are a gate
    // rather than a bonus: miss one at a 5-star, two at a 4-star, and you're
    // gone regardless of what you shot.
    const challengeGate = cfg.cutThreshold != null;
    const failedCount = entries.filter((entry) => entry.val < entry.target).length;
    if (challengeGate && failedCount >= cfg.cutThreshold) {
      setState((prev) => ({ ...prev, screen: 'tryout', tryStep: 3, tryResult: { made: false, cut: true } }));
      return;
    }

    // Step 3 — starting spot. Score does the work; at the programs where the
    // challenges aren't a gate, each one you complete is worth half a spot.
    const challengesMade = challengeGate ? 0 : entries.filter((entry) => entry.val >= entry.target).length;
    const spot = tryoutSpot({ score, prestige: item.prestige, roster: item.roster, challengesMade });

    const r = rng(hash(`${item.id}mates`));
    const mates = [];
    for (let k = 0; k < item.roster - 1; k += 1) {
      const str = Math.max(30, Math.min(99, Math.round(item.team + gauss(r) * 6)));
      const cons = Math.max(35, Math.min(95, Math.round(50 + str * 0.25 + gauss(r) * 14)));
      mates.push({ name: MATE_NAMES[k], str, cons });
    }
    const events = opponents(item).map(() => ({ done: false, result: null })).concat([{ done: false, result: null }]);
    setState((prev) => ({ ...prev, screen: 'tryout', tryStep: 3, spot, teammates: mates, events, eventIndex: 0, exposureRaw: 0, tryResult: { made: true, spot, challengesMade, total9: score } }));
  }

  function enterSeason() {
    setState((prev) => ({ ...prev, screen: 'hub', hubTab: 'schedule' }));
  }

  function opponents(schoolItem) {
    if (!schoolItem) return [];
    const conference = CONFERENCES[schoolItem.id] || [];
    return conference.map((rival) => ({
      school: rival.name,
      golfer: rival.golfer,
      str: rival.strength,
      cons: rivalConsistency(rival.strength),
      course: { name: rival.course, pb9: schoolItem.home.pb9 },
      flagged: !!rival.coachRival,
    }));
  }

  function openEvent(index) {
    if (!school) return;
    const opps = opponents(school);
    const isChamp = index === opps.length;
    const seed = hash(`${school.id}ev${index}`);
    const r = rng(seed);
    if (!isChamp) {
      const rv = opps[index];
      const pb = rv.course.pb9;
      const oppTot = score9(pb, rv.str, rv.cons, r, school.team);
      const oppHoles = distribute(oppTot, [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
      const mateScores = state.teammates.map((mate) => score9(pb, mate.str, mate.cons, r, school.team));
      const oppTeam = [{ name: rv.golfer, toPar: oppTot, lead: true }];
      for (let k = 0; k < state.teammates.length; k += 1) {
        const ostr = Math.max(30, Math.min(99, Math.round(rv.str + gauss(r) * 6)));
        const ocons = Math.max(35, Math.min(95, Math.round(50 + ostr * 0.25 + gauss(r) * 14)));
        oppTeam.push({ name: OPP_NAMES[k], toPar: score9(pb, ostr, ocons, r, school.team) });
      }
      setState((prev) => ({ ...prev, screen: 'event', ev: { idx: index, isChamp: false, pb, pars: [4, 5, 3, 4, 4, 3, 5, 4, 4], oppHoles, oppName: rv.golfer, oppSchool: rv.school, yourSchool: school.name, flagged: !!rv.flagged, playerHoles: [], holeIndex: 0, mateScores, oppTeam, courseName: rv.course.name }, curStrokes: [4, 5, 3, 4, 4, 3, 5, 4, 4][0] }));
    } else {
      const pb = school.champ.course.pb9;
      const field = [];
      state.teammates.forEach((mate) => field.push({ name: mate.name, str: mate.str, cons: mate.cons, you: false }));
      opps.forEach((rv) => field.push({ name: rv.golfer, str: rv.str, cons: rv.cons, you: false }));
      ['A. Whitfield', 'J. Castellano'].forEach((name, i) => field.push({ name, str: school.team + (i ? -4 : 4), cons: 60, you: false }));
      field.forEach((item) => {
        const h1 = distribute(score9(pb, item.str, item.cons, r, school.team), [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
        const h2 = distribute(score9(pb, item.str, item.cons, r, school.team), [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
        item.holes = h1.concat(h2);
      });
      setState((prev) => ({ ...prev, screen: 'event', ev: { idx: index, isChamp: true, pb, pars: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4], field, playerHoles: [], holeIndex: 0, courseName: school.champ.course.name }, curStrokes: [4, 5, 3, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 3, 5, 4][0] }));
    }
  }

  function enterHole() {
    const event = state.ev;
    if (!event) return;
    const holes = [...event.playerHoles, state.curStrokes];
    const next = { ...event, playerHoles: holes, holeIndex: event.holeIndex + 1 };
    const total = event.isChamp ? 18 : 9;
    setState((prev) => ({ ...prev, ev: next, curStrokes: prev.ev.holeIndex + 1 < total ? prev.ev.pars[prev.ev.holeIndex + 1] : prev.curStrokes }));
  }

  function finishEvent() {
    const event = state.ev;
    const item = school;
    if (!event || !item) return;
    const events = [...state.events];
    let spot = state.spot;
    let raw = state.exposureRaw;
    const par = event.pars.reduce((sum, value) => sum + value, 0);
    const playerToPar = event.playerHoles.reduce((sum, value) => sum + value, 0) - par;
    if (!event.isChamp) {
      let won = 0;
      let lost = 0;
      for (let i = 0; i < 9; i += 1) {
        const a = event.playerHoles[i] - event.pars[i];
        const b = event.oppHoles[i] - event.pars[i];
        if (a < b) won += 1;
        else if (a > b) lost += 1;
      }
      const outcome = won > lost ? 'win' : won < lost ? 'loss' : 'halve';
      const yourTeam = [{ name: 'You', toPar: playerToPar, you: true }].concat(state.teammates.map((mate, index) => ({ name: mate.name, toPar: event.mateScores[index] })));
      const oppTeam = event.oppTeam.map((opp) => ({ name: opp.name, toPar: opp.toPar }));
      const pairings = [];
      let yourPts = outcome === 'win' ? 1 : outcome === 'halve' ? 0.5 : 0;
      pairings.push({ you: 'You', opp: oppTeam[0].name, res: outcome, yourToPar: playerToPar, oppToPar: oppTeam[0].toPar });
      for (let i = 1; i < yourTeam.length; i += 1) {
        const a = yourTeam[i].toPar;
        const b = (oppTeam[i] || oppTeam[oppTeam.length - 1]).toPar;
        const res = a < b ? 'win' : a > b ? 'loss' : 'halve';
        yourPts += res === 'win' ? 1 : res === 'halve' ? 0.5 : 0;
        pairings.push({ you: yourTeam[i].name, opp: (oppTeam[i] || {}).name, res, yourToPar: a, oppToPar: b });
      }
      const total = pairings.length;
      const oppPts = total - yourPts;
      const yourTeamTot = yourTeam.reduce((sum, p) => sum + p.toPar, 0);
      const oppTeamTot = oppTeam.reduce((sum, p) => sum + p.toPar, 0);
      const teamOutcome = yourPts > oppPts ? 'win' : yourPts < oppPts ? 'loss' : (yourTeamTot < oppTeamTot ? 'win' : yourTeamTot > oppTeamTot ? 'loss' : 'halve');
      const rv = opponents(item)[event.idx];
      const board = yourTeam.map((p) => ({ name: p.you ? 'You' : p.name, school: item.name, mine: !!p.you, you: !!p.you, toPar: p.toPar })).concat(oppTeam.map((p) => ({ name: p.name, school: rv.school, mine: false, you: false, toPar: p.toPar })));
      board.sort((a, b) => a.toPar - b.toPar);
      // Depth-chart movement is pure displacement against the current seed:
      // did you outscore teammates seeded above you, or lose to teammates
      // seeded below you? The player's own match result never enters this.
      const seeding = depthChartSeeding(state.teammates, spot, item.roster);
      let beatAbove = 0;
      let lostBelow = 0;
      state.teammates.forEach((_, index) => {
        const mateScore = event.mateScores[index];
        if (mateScore === playerToPar) return; // tie: no displacement
        const beatMate = playerToPar < mateScore;
        const mateSpot = seeding[index];
        if (mateSpot < spot && beatMate) beatAbove += 1;
        else if (mateSpot > spot && !beatMate) lostBelow += 1;
      });
      let move = beatAbove - lostBelow;
      move = Math.max(-DEPTH_CHART_MOVE_CLAMP, Math.min(DEPTH_CHART_MOVE_CLAMP, move));
      spot = Math.max(1, Math.min(item.roster, spot - move));
      raw += item.prestige * (item.roster + 1 - spot) * 0.6;
      raw += Math.max(-6, (event.oppHoles.reduce((sum, value) => sum + value, 0) - 36 - playerToPar)) * (rv.str / 100) * 1.6;
      if (outcome === 'win') raw += 7;
      else if (outcome === 'halve') raw += 3;
      if (teamOutcome === 'win') raw += 4;
      events[event.idx] = { done: true, result: { type: 'match', outcome, won, lost, toPar: playerToPar, margin: won - lost, opp: rv.golfer, teamOutcome, pb: event.pb } };
      const nextIndex = state.eventIndex + 1;
      const allDone = events.every((entry) => entry.done);
      setState((prev) => ({ ...prev, events, spot, exposureRaw: raw, eventIndex: nextIndex, ev: null, screen: 'summary', pendingScreen: allDone ? 'end' : 'hub', matchSummary: { outcome, won, lost, toPar: playerToPar, oppName: rv.golfer, oppSchool: rv.school, yourSchool: item.name, teamOutcome, yourPts, oppPts, pairings, board, yourTeamTot, oppTeamTot, courseName: event.courseName } }));
      return;
    }
    const field = event.field.map((entry) => ({ name: entry.name, tot: entry.holes.reduce((sum, value) => sum + value, 0) - par }));
    field.push({ name: 'You', tot: playerToPar, you: true });
    field.sort((a, b) => a.tot - b.tot);
    const rank = field.findIndex((entry) => entry.you) + 1;
    raw += ((field.length - rank) / field.length) * 34 * (item.prestige / 5);
    raw += item.prestige * (item.roster + 1 - spot) * 0.6;
    if (rank === 1) raw += 10;
    events[event.idx] = { done: true, result: { type: 'champ', rank, field: field.length, toPar: playerToPar, pb: event.pb } };
    const nextIndex = state.eventIndex + 1;
    const allDone = events.every((entry) => entry.done);
    if (allDone) {
      // Season's over: replace the incremental live estimate with the real,
      // difficulty-adjusted exposure formula — this is the number that
      // carries into recruiting.
      const matchEvents = events.slice(0, -1);
      const champEvent = events[events.length - 1];
      const matchRecord = matchEvents.reduce((acc, entry) => {
        if (entry.result.outcome === 'win') acc.wins += 1;
        else if (entry.result.outcome === 'loss') acc.losses += 1;
        else acc.halves += 1;
        return acc;
      }, { wins: 0, losses: 0, halves: 0 });
      const champFinish = { rank: champEvent.result.rank, fieldSize: champEvent.result.field };
      const exposureEvents = events.map((entry) => ({
        toPar: entry.result.toPar,
        pb9: entry.result.pb,
        holes: entry.result.type === 'champ' ? 18 : 9,
      }));
      raw = computeExposure({ scoutBaseline: item.scout, spot, events: exposureEvents, matchRecord, champFinish });
    }
    setState((prev) => ({ ...prev, events, spot, exposureRaw: raw, eventIndex: nextIndex, ev: null, screen: allDone ? 'end' : 'hub', hubTab: 'schedule' }));
  }

  function goBack() {
    if (state.screen === 'confirm') {
      setState((prev) => ({ ...prev, screen: 'select' }));
    } else if (state.screen === 'event') {
      setState((prev) => ({ ...prev, screen: 'hub', ev: null }));
    } else if (state.screen === 'college-event') {
      setState((prev) => ({ ...prev, screen: 'college-hub', collegeEv: null }));
    } else if (state.screen === 'college-practice') {
      setState((prev) => ({ ...prev, screen: 'college-hub' }));
    }
  }

  function restart() {
    setState((prev) => ({ ...prev, ...initialState, screen: 'select', saveId: prev.saveId, playerName: prev.playerName, saves: prev.saves, nameInput: '' }));
  }

  function continueFromSummary() {
    setState((prev) => ({ ...prev, screen: prev.pendingScreen || 'hub', hubTab: 'schedule', matchSummary: null }));
  }

  function setTab(tab) {
    setState((prev) => ({ ...prev, hubTab: tab }));
  }

  function setCollegeTab(tab) {
    setState((prev) => ({ ...prev, collegeHubTab: tab }));
  }

  function startRecruiting() {
    setState((prev) => ({
      ...prev,
      screen: 'recruiting',
      recruitPhase: 'board',
      recruitPinnedIds: [],
      recruitOffers: null,
      recruitSelectedId: null,
      recruitWalkOnQuery: '',
      devExposureOverride: null,
    }));
  }

  function setDevExposureOverride(value) {
    setState((prev) => ({ ...prev, devExposureOverride: value == null ? null : Math.max(0, Math.min(100, Math.round(value))) }));
  }

  function toggleReachPin(schoolId) {
    const exposure = resolvedExposure(state);
    setState((prev) => {
      const pinned = prev.recruitPinnedIds.includes(schoolId);
      const nextPinnedIds = pinned
        ? unpinSchool(prev.recruitPinnedIds, schoolId)
        : pinSchool(prev.recruitPinnedIds, schoolId, { exposure });
      return { ...prev, recruitPinnedIds: nextPinnedIds };
    });
  }

  function lockInRecruiting() {
    const exposure = resolvedExposure(state);
    const offers = resolveOffers({ exposure, pinnedIds: state.recruitPinnedIds, seed: `${state.saveId}recruit` });
    setState((prev) => ({ ...prev, recruitOffers: offers, recruitPhase: 'offers', recruitSelectedId: null }));
  }

  function setRecruitSort(sortKey) {
    setState((prev) => ({ ...prev, recruitSort: sortKey }));
  }

  function selectOffer(collegeId) {
    setState((prev) => ({ ...prev, recruitSelectedId: prev.recruitSelectedId === collegeId ? null : collegeId }));
  }

  function setWalkOnQuery(text) {
    setState((prev) => ({ ...prev, recruitWalkOnQuery: text }));
  }

  // Committing works for a real offer (guaranteed or a converted reach) or
  // a walk-on to any school that never offered — there's never a dead end.
  function commitToSelection() {
    const id = state.recruitSelectedId;
    if (!id) return;
    const offer = (state.recruitOffers || []).find((entry) => entry.school.id === id);
    const committed = offer || (() => {
      const collegeSchool = COLLEGES.find((college) => college.id === id);
      return collegeSchool ? walkOnOffer(collegeSchool) : null;
    })();
    if (!committed) return;
    setState((prev) => ({ ...prev, committedTeam: committed, screen: 'committed' }));
  }

  // --- College career -------------------------------------------------------
  // Same shape as the high school career (hub -> event -> summary -> hub),
  // rebuilt on real tournaments (tournaments.js) instead of invented
  // conference rivals. See collegeSeason.js for the schedule/field/course
  // logic and its documented simplifications.

  function startCollegeCareer() {
    const team = state.committedTeam;
    if (!team) return;
    const college = team.school;
    const schedule = buildCollegeSchedule(college, 1);
    const teammates = generateCollegeTeammates(college, COLLEGE_ROSTER_SIZE);
    setState((prev) => ({
      ...prev,
      screen: 'college-hub',
      collegeYear: 1,
      collegePlayerStrength: college.strength,
      collegeSchedule: schedule,
      collegeTeammates: teammates,
      collegeSpot: team.rosterRole.spot,
      collegeEvents: schedule.map(() => ({ done: false, result: null })),
      collegeEventIndex: 0,
      collegeEv: null,
      collegeSummary: null,
      collegePendingScreen: null,
      collegeOffseasonReport: null,
      collegePracticeAvailable: true,
      collegePracticeChallenge: generatePracticeChallenge(`${college.id}-practice-1-0`),
      collegePracticeResult: null,
    }));
  }

  // Any teammate outside this week's traveling five doesn't get a score at
  // all (null) — they didn't play, so they can neither be beaten nor lose
  // ground this week. Kept index-aligned with collegeTeammates so movement
  // math (finishCollegeEvent) can look scores up by the same index as
  // depthChartSeeding.
  function collegeMateScores(pb, r, college, spot) {
    const seeding = depthChartSeeding(state.collegeTeammates, spot, COLLEGE_ROSTER_SIZE);
    return state.collegeTeammates.map((mate, index) => {
      if (seeding[index] > COLLEGE_LINEUP_SIZE) return null;
      return score9(pb, mate.str, mate.cons, r, college.strength) + score9(pb, mate.str, mate.cons, r, college.strength);
    });
  }

  function openCollegeEvent(index) {
    const team = state.committedTeam;
    const tournament = state.collegeSchedule[index];
    if (!team || !tournament) return;
    const college = team.school;

    if (isBenched(state.collegeSpot, COLLEGE_LINEUP_SIZE)) {
      resolveBenchedEvent(index, tournament, college);
      return;
    }

    const pb = collegeCoursePb9(college.strength);
    const r = rng(hash(`${college.id}-college-event-${tournament.id}`));
    const field = generateEventField(college, `${college.id}-college-event-${tournament.id}-field`);
    const mateScores = collegeMateScores(pb, r, college, state.collegeSpot);
    const fieldScores = field.map((entry) => ({ name: entry.name, toPar: score9(pb, entry.str, entry.cons, r, college.strength) + score9(pb, entry.str, entry.cons, r, college.strength) }));
    setState((prev) => ({
      ...prev,
      screen: 'college-event',
      collegeEv: {
        idx: index,
        tournament,
        pb,
        pars: COLLEGE_PARS,
        playerHoles: [],
        holeIndex: 0,
        mateScores,
        fieldScores,
        courseName: tournament.course || tournament.location,
      },
      collegeCurStrokes: COLLEGE_PARS[0],
    }));
  }

  // You're on the roster but not this week's traveling five — the team plays
  // on without you and your spot doesn't move (there's nothing to compare
  // your play against when you didn't play). The only way onto the travel
  // squad is a practice challenge between tournaments.
  function resolveBenchedEvent(index, tournament, college) {
    const pb = collegeCoursePb9(college.strength);
    const r = rng(hash(`${college.id}-college-event-${tournament.id}`));
    const field = generateEventField(college, `${college.id}-college-event-${tournament.id}-field`);
    const traveling = travelingTeammates(state.collegeTeammates, state.collegeSpot, COLLEGE_ROSTER_SIZE, COLLEGE_LINEUP_SIZE);
    const mateScores = traveling.map((mate) => score9(pb, mate.str, mate.cons, r, college.strength) + score9(pb, mate.str, mate.cons, r, college.strength));
    const fieldScores = field.map((entry) => ({ name: entry.name, toPar: score9(pb, entry.str, entry.cons, r, college.strength) + score9(pb, entry.str, entry.cons, r, college.strength) }));

    const board = traveling
      .map((mate, i) => ({ name: mate.name, toPar: mateScores[i], mine: true }))
      .concat(fieldScores.map((entry) => ({ name: entry.name, toPar: entry.toPar, mine: false })));
    board.sort((a, b) => a.toPar - b.toPar);
    const bestIndex = board.findIndex((entry) => entry.mine);
    const bestRank = bestIndex + 1;
    const bestName = bestIndex >= 0 ? board[bestIndex].name : null;

    const events = [...state.collegeEvents];
    events[index] = {
      done: true,
      result: { tournamentName: tournament.name, location: tournament.location, benched: true, fieldSize: board.length, bestRank, bestName },
    };
    const nextIndex = state.collegeEventIndex + 1;
    const allDone = events.every((entry) => entry.done);

    setState((prev) => ({
      ...prev,
      collegeEvents: events,
      collegeEventIndex: nextIndex,
      collegeEv: null,
      screen: 'college-summary',
      collegePendingScreen: allDone ? 'college-end' : 'college-hub',
      collegePracticeAvailable: !allDone,
      collegePracticeChallenge: allDone ? null : generatePracticeChallenge(`${college.id}-practice-${state.collegeYear}-${nextIndex}`),
      collegePracticeResult: null,
      collegeSummary: {
        tournamentName: tournament.name,
        location: tournament.location,
        benched: true,
        fieldSize: board.length,
        bestRank,
        bestName,
        board,
      },
    }));
  }

  function enterCollegeHole() {
    const event = state.collegeEv;
    if (!event) return;
    const holes = [...event.playerHoles, state.collegeCurStrokes];
    const next = { ...event, playerHoles: holes, holeIndex: event.holeIndex + 1 };
    const total = COLLEGE_PARS.length;
    setState((prev) => ({
      ...prev,
      collegeEv: next,
      collegeCurStrokes: prev.collegeEv.holeIndex + 1 < total ? prev.collegeEv.pars[prev.collegeEv.holeIndex + 1] : prev.collegeCurStrokes,
    }));
  }

  function finishCollegeEvent() {
    const event = state.collegeEv;
    const team = state.committedTeam;
    if (!event || !team) return;
    const par = event.pars.reduce((sum, value) => sum + value, 0);
    const playerToPar = event.playerHoles.reduce((sum, value) => sum + value, 0) - par;

    // Depth-chart movement: identical pure-displacement rule to the high
    // school career (see gameData.js's depthChartSeeding) — outscoring
    // teammates seeded above you moves you up, losing to ones seeded below
    // you moves you down. Your field rank doesn't directly factor in.
    let spot = state.collegeSpot;
    const seeding = depthChartSeeding(state.collegeTeammates, spot, COLLEGE_ROSTER_SIZE);
    let beatAbove = 0;
    let lostBelow = 0;
    state.collegeTeammates.forEach((_, index) => {
      const mateScore = event.mateScores[index];
      if (mateScore == null || mateScore === playerToPar) return; // didn't travel this week — nothing to compare
      const beatMate = playerToPar < mateScore;
      const mateSpot = seeding[index];
      if (mateSpot < spot && beatMate) beatAbove += 1;
      else if (mateSpot > spot && !beatMate) lostBelow += 1;
    });
    const move = Math.max(-DEPTH_CHART_MOVE_CLAMP, Math.min(DEPTH_CHART_MOVE_CLAMP, beatAbove - lostBelow));
    spot = Math.max(1, Math.min(COLLEGE_ROSTER_SIZE, spot - move));

    const board = [{ name: 'You', toPar: playerToPar, you: true }]
      .concat(state.collegeTeammates
        .map((mate, index) => ({ name: mate.name, toPar: event.mateScores[index], you: false }))
        .filter((entry) => entry.toPar != null))
      .concat(event.fieldScores.map((entry) => ({ name: entry.name, toPar: entry.toPar, you: false })));
    board.sort((a, b) => a.toPar - b.toPar);
    const rank = board.findIndex((entry) => entry.you) + 1;

    const events = [...state.collegeEvents];
    events[event.idx] = {
      done: true,
      result: { tournamentName: event.tournament.name, location: event.tournament.location, toPar: playerToPar, rank, fieldSize: board.length },
    };
    const nextIndex = state.collegeEventIndex + 1;
    const allDone = events.every((entry) => entry.done);

    setState((prev) => ({
      ...prev,
      collegeEvents: events,
      collegeSpot: spot,
      collegeEventIndex: nextIndex,
      collegeEv: null,
      screen: 'college-summary',
      collegePendingScreen: allDone ? 'college-end' : 'college-hub',
      // A fresh practice challenge for the next gap — none left once the
      // season's over.
      collegePracticeAvailable: !allDone,
      collegePracticeChallenge: allDone ? null : generatePracticeChallenge(`${team.school.id}-practice-${state.collegeYear}-${nextIndex}`),
      collegePracticeResult: null,
      collegeSummary: {
        tournamentName: event.tournament.name,
        location: event.tournament.location,
        toPar: playerToPar,
        rank,
        fieldSize: board.length,
        board,
      },
    }));
  }

  function continueFromCollegeSummary() {
    setState((prev) => ({ ...prev, screen: prev.collegePendingScreen || 'college-hub', collegeSummary: null }));
  }

  // --- Between-round practice -------------------------------------------
  // A 3-hole challenge reusing the exact high-school tryout challenge types.
  // Playing it is hole-by-hole, same as the tryout; simming it always
  // resolves to exactly meeting the target with zero score — a flat
  // "average" result, no dice roll — so simming is a neutral time-skip,
  // not a way to gamble for a free boost.

  function startCollegePractice() {
    if (!state.collegePracticeChallenge) return;
    setState((prev) => ({
      ...prev,
      screen: 'college-practice',
      collegePracticePhase: 'enter',
      collegePracticeHoleIndex: 0,
      collegePracticeStrokes: PRACTICE_PARS[0],
      collegePracticeHit: false,
      collegePracticeAcc: [],
      collegePracticeResult: null,
    }));
  }

  function setCollegePracticeHit(value) {
    setState((prev) => ({ ...prev, collegePracticeHit: value }));
  }

  function resolvePracticeMove(count, target) {
    const move = Math.max(-PRACTICE_MOVE_CLAMP, Math.min(PRACTICE_MOVE_CLAMP, count - target));
    const spot = Math.max(1, Math.min(COLLEGE_ROSTER_SIZE, state.collegeSpot - move));
    return { spot, move };
  }

  function submitPracticeHole() {
    const challenge = state.collegePracticeChallenge;
    if (!challenge) return;
    const holeEntry = { strokes: state.collegePracticeStrokes, par: PRACTICE_PARS[state.collegePracticeHoleIndex], hit: state.collegePracticeHit };
    const acc = [...state.collegePracticeAcc, holeEntry];
    const nextHoleIndex = state.collegePracticeHoleIndex + 1;

    if (acc.length < 3) {
      setState((prev) => ({
        ...prev,
        collegePracticeAcc: acc,
        collegePracticeHoleIndex: nextHoleIndex,
        collegePracticeStrokes: PRACTICE_PARS[nextHoleIndex],
        collegePracticeHit: false,
      }));
      return;
    }

    const count = acc.filter((hole) => hole.hit).length;
    const score = acc.reduce((sum, hole) => sum + (hole.strokes - hole.par), 0);
    const { spot, move } = resolvePracticeMove(count, challenge.target);

    setState((prev) => ({
      ...prev,
      collegeSpot: spot,
      collegePracticeAvailable: false,
      collegePracticePhase: 'result',
      collegePracticeResult: { type: challenge.type, count, target: challenge.target, score, move, simmed: false },
    }));
  }

  function simCollegePractice() {
    const challenge = state.collegePracticeChallenge;
    if (!challenge) return;
    const count = challenge.target; // average = exactly meets the target
    const score = 0;
    const { spot, move } = resolvePracticeMove(count, challenge.target);
    setState((prev) => ({
      ...prev,
      collegeSpot: spot,
      collegePracticeAvailable: false,
      screen: 'college-practice',
      collegePracticePhase: 'result',
      collegePracticeResult: { type: challenge.type, count, target: challenge.target, score, move, simmed: true },
    }));
  }

  function continueFromCollegePractice() {
    setState((prev) => ({ ...prev, screen: 'college-hub', collegePracticeResult: null }));
  }

  function collegeRecordLabel() {
    const finishes = state.collegeEvents.filter((event) => event.done && !event.result.benched);
    const top5 = finishes.filter((event) => event.result.rank <= 5).length;
    return `${top5} top-5${finishes.length ? ` of ${finishes.length}` : ''}`;
  }

  // --- Offseason: graduation + recruiting, then straight into next season ---
  function enterOffseason() {
    const team = state.committedTeam;
    if (!team || state.collegeYear >= MAX_COLLEGE_YEARS) return; // seniors don't get another offseason
    const college = team.school;
    const performanceScore = computeSeasonPerformance(state.collegeEvents);
    const { staying, graduated } = ageAndGraduate(state.collegeTeammates);
    const nextYear = state.collegeYear + 1;
    // Exclude graduating names too, not just staying ones, so a freshman
    // never gets handed the exact name of the senior they're replacing.
    const freshmen = recruitFreshmen(graduated.length, [...staying, ...graduated], college, performanceScore, `${college.id}-recruits-${nextYear}`);
    const newTeammates = [...staying, ...freshmen];
    const { newSpot, overtakers } = resolveOffseasonSpotChange(freshmen, state.collegePlayerStrength, state.collegeSpot, COLLEGE_ROSTER_SIZE);
    const newPlayerStrength = developPlayerStrength(state.collegePlayerStrength, performanceScore);
    const schedule = buildCollegeSchedule(college, nextYear);

    setState((prev) => ({
      ...prev,
      screen: 'college-offseason',
      collegeYear: nextYear,
      collegeTeammates: newTeammates,
      collegeSpot: newSpot,
      collegePlayerStrength: newPlayerStrength,
      collegeSchedule: schedule,
      collegeEvents: schedule.map(() => ({ done: false, result: null })),
      collegeEventIndex: 0,
      collegeEv: null,
      collegePracticeAvailable: true,
      collegePracticeChallenge: generatePracticeChallenge(`${college.id}-practice-${nextYear}-0`),
      collegePracticeResult: null,
      collegeOffseasonReport: {
        year: nextYear,
        performanceScore,
        graduated,
        freshmen,
        overtakers,
        spotBefore: state.collegeSpot,
        spotAfter: newSpot,
        playerStrengthBefore: state.collegePlayerStrength,
        playerStrengthAfter: newPlayerStrength,
      },
    }));
  }

  function continueFromCollegeOffseason() {
    setState((prev) => ({ ...prev, screen: 'college-hub', collegeOffseasonReport: null }));
  }

  function record() {
    const matches = state.events.filter((event) => event.done && event.result.type === 'match');
    const wins = matches.filter((event) => event.result.outcome === 'win').length;
    const losses = matches.filter((event) => event.result.outcome === 'loss').length;
    const halves = matches.filter((event) => event.result.outcome === 'halve').length;
    return `${wins}–${losses}${halves ? `–${halves}` : ''}`;
  }

  return {
    viewModel,
    goBack,
    restart,
    step,
    continueFromSummary,
    continueFromCollegeSummary,
    startNewSave,
    createSave,
    devSkipToCollegeSelect,
    setNameInput,
    setHometownInput,
    loadSave,
    setTab,
    school,
  };
}
