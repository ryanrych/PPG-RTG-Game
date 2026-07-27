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
  challengeAdjustment,
  spotFromRankScore,
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

const RECRUIT_REACH_DISPLAY_CAP = 20;
const WALK_ON_RESULTS_CAP = 8;

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
      showBack: current.screen === 'confirm' || current.screen === 'event',
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
      const exposure = Math.max(0, Math.min(100, Math.round(current.exposureRaw)));
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
      };

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

  async function createSave() {
    const name = (state.nameInput || '').trim() || 'Player';
    const hometown = (state.hometownInput || '').trim();
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

    // Step 2 — challenge-fail cut (risk schools only).
    const failedCount = entries.filter((entry) => entry.val < entry.target).length;
    if (item.risk && cfg.cutThreshold != null && failedCount >= cfg.cutThreshold) {
      setState((prev) => ({ ...prev, screen: 'tryout', tryStep: 3, tryResult: { made: false, cut: true } }));
      return;
    }

    // Step 3 — starting spot from the player's own numbers.
    const strokesUnderBar = cfg.bar - score;
    const challengeTotal = entries.reduce((sum, entry) => sum + challengeAdjustment(entry.val, entry.target), 0);
    const rankScore = strokesUnderBar + challengeTotal;
    const spot = spotFromRankScore(rankScore, item.roster);

    const r = rng(hash(`${item.id}mates`));
    const mates = [];
    for (let k = 0; k < item.roster - 1; k += 1) {
      const str = Math.max(30, Math.min(99, Math.round(item.team + gauss(r) * 6)));
      const cons = Math.max(35, Math.min(95, Math.round(50 + str * 0.25 + gauss(r) * 14)));
      mates.push({ name: MATE_NAMES[k], str, cons });
    }
    const events = opponents(item).map(() => ({ done: false, result: null })).concat([{ done: false, result: null }]);
    setState((prev) => ({ ...prev, screen: 'tryout', tryStep: 3, spot, teammates: mates, events, eventIndex: 0, exposureRaw: 0, tryResult: { made: true, spot, rankScore, total9: score } }));
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
      const oppTot = score9(pb, rv.str, rv.cons, r);
      const oppHoles = distribute(oppTot, [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
      const mateScores = state.teammates.map((mate) => score9(pb, mate.str, mate.cons, r));
      const oppTeam = [{ name: rv.golfer, toPar: oppTot, lead: true }];
      for (let k = 0; k < state.teammates.length; k += 1) {
        const ostr = Math.max(30, Math.min(99, Math.round(rv.str + gauss(r) * 6)));
        const ocons = Math.max(35, Math.min(95, Math.round(50 + ostr * 0.25 + gauss(r) * 14)));
        oppTeam.push({ name: OPP_NAMES[k], toPar: score9(pb, ostr, ocons, r) });
      }
      setState((prev) => ({ ...prev, screen: 'event', ev: { idx: index, isChamp: false, pb, pars: [4, 5, 3, 4, 4, 3, 5, 4, 4], oppHoles, oppName: rv.golfer, oppSchool: rv.school, yourSchool: school.name, flagged: !!rv.flagged, playerHoles: [], holeIndex: 0, mateScores, oppTeam, courseName: rv.course.name }, curStrokes: [4, 5, 3, 4, 4, 3, 5, 4, 4][0] }));
    } else {
      const pb = school.champ.course.pb9;
      const field = [];
      state.teammates.forEach((mate) => field.push({ name: mate.name, str: mate.str, cons: mate.cons, you: false }));
      opps.forEach((rv) => field.push({ name: rv.golfer, str: rv.str, cons: rv.cons, you: false }));
      ['A. Whitfield', 'J. Castellano'].forEach((name, i) => field.push({ name, str: school.team + (i ? -4 : 4), cons: 60, you: false }));
      field.forEach((item) => {
        const h1 = distribute(score9(pb, item.str, item.cons, r), [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
        const h2 = distribute(score9(pb, item.str, item.cons, r), [4, 5, 3, 4, 4, 3, 5, 4, 4], r);
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

  function startRecruiting() {
    setState((prev) => ({
      ...prev,
      screen: 'recruiting',
      recruitPhase: 'board',
      recruitPinnedIds: [],
      recruitOffers: null,
      recruitSelectedId: null,
      recruitWalkOnQuery: '',
    }));
  }

  function toggleReachPin(schoolId) {
    const exposure = Math.max(0, Math.min(100, Math.round(state.exposureRaw)));
    setState((prev) => {
      const pinned = prev.recruitPinnedIds.includes(schoolId);
      const nextPinnedIds = pinned
        ? unpinSchool(prev.recruitPinnedIds, schoolId)
        : pinSchool(prev.recruitPinnedIds, schoolId, { exposure });
      return { ...prev, recruitPinnedIds: nextPinnedIds };
    });
  }

  function lockInRecruiting() {
    const exposure = Math.max(0, Math.min(100, Math.round(state.exposureRaw)));
    const offers = resolveOffers({ exposure, pinnedIds: state.recruitPinnedIds, seed: `${state.saveId}recruit` });
    setState((prev) => ({ ...prev, recruitOffers: offers, recruitPhase: 'offers' }));
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
    startNewSave,
    createSave,
    setNameInput,
    setHometownInput,
    loadSave,
    setTab,
    school,
  };
}
