const tyreProfiles = {
  Soft: { pace: 8, deg: 26, idealStop: 0.3 },
  Medium: { pace: 4, deg: 15, idealStop: 0.45 },
  Hard: { pace: 0, deg: 8, idealStop: 0.62 },
  Intermediate: { pace: -4, deg: 12, idealStop: 0.48 },
  Wet: { pace: -8, deg: 10, idealStop: 0.55 }
};

const weatherProfiles = {
  Dry: { chaos: 0, safetyCar: 0, mistake: 0, reliability: 0, tyre: 0 },
  "Light Rain": { chaos: 14, safetyCar: 13, mistake: 12, reliability: 5, tyre: -2 },
  "Heavy Rain": { chaos: 28, safetyCar: 26, mistake: 25, reliability: 12, tyre: 3 },
  "Mixed Conditions": { chaos: 23, safetyCar: 20, mistake: 20, reliability: 8, tyre: 8 }
};

const modeProfiles = {
  Realistic: { chaos: 0, safetyCar: 0, reliability: 0, strategy: 0 },
  Chaotic: { chaos: 28, safetyCar: 18, reliability: 8, strategy: -6 },
  "Ferrari Strategy Disaster": { chaos: 16, safetyCar: 6, reliability: 4, strategy: -10 },
  "Safety Car Madness": { chaos: 24, safetyCar: 35, reliability: 6, strategy: 2 },
  "Haas Masterclass": { chaos: 35, safetyCar: 10, reliability: 8, strategy: -4 }
};

const hardToPass = new Set(["monaco", "hungary", "netherlands"]);
const lowDragTracks = new Set(["italy", "azerbaijan", "las-vegas", "mexico"]);
const fastCornerTracks = new Set(["japan", "great-britain", "qatar", "belgium"]);
const safetyCarTracks = new Set(["singapore", "saudi-arabia", "azerbaijan", "canada", "brazil"]);
const tyreStressTracks = new Set(["bahrain", "spain-barcelona", "qatar", "great-britain"]);

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function labelRisk(score) {
  if (score >= 75) return "Extreme";
  if (score >= 55) return "High";
  if (score >= 35) return "Medium";
  return "Low";
}

function labelRating(score) {
  if (score >= 90) return "S+";
  if (score >= 82) return "A";
  if (score >= 72) return "B";
  if (score >= 60) return "C";
  return "D";
}

function getDriverBonus(driver, team, raceMode) {
  let bonus = 0;
  if (driver === "Max Verstappen") bonus += 8;
  if (driver === "Lewis Hamilton" || driver === "Fernando Alonso") bonus += 4;
  if (driver === "Charles Leclerc") bonus += 3;
  if (driver === "Lando Norris" || driver === "Oscar Piastri") bonus += 3;
  if (driver === "Carlos Sainz" || driver === "Alexander Albon") bonus += 2;
  if (driver === "Fernando Alonso" && raceMode === "Chaotic") bonus += 7;
  if (team.id === "red-bull" && driver === "Max Verstappen") bonus += 5;
  return bonus;
}

function getTrackFit(team, circuit) {
  const stats = team.stats;
  const weights = circuit.weights;
  // Start with general pace, then add circuit-specific strengths.
  let fit = stats.racePace * 0.34 + stats.strategy * 0.12 + stats.qualifying * 0.12;

  fit += (stats.topSpeed - 75) * (weights.topSpeed || 0.75) * 0.35;
  fit += (stats.highSpeedCorners - 75) * (weights.highSpeedCorners || 0.75) * 0.35;
  fit += (stats.tyreManagement - 75) * (weights.tyreWear || 0.75) * 0.28;
  fit += (stats.strategy - 75) * (weights.strategy || 0.75) * 0.2;

  if (weights.balanced) {
    const balancedAverage = (stats.racePace + stats.topSpeed + stats.highSpeedCorners + stats.tyreManagement) / 4;
    fit += (balancedAverage - 75) * weights.balanced * 0.24;
  }

  if (lowDragTracks.has(circuit.id) && team.id === "williams") fit += 10;
  if (fastCornerTracks.has(circuit.id) && team.id === "mclaren") fit += 8;
  if (tyreStressTracks.has(circuit.id) && team.id === "mclaren") fit += 6;
  if (team.id === "mercedes") fit += 2;

  return fit;
}

function buildRaceLog({ circuit, team, driver, raceMode, weather, laps, chaosLevel, safetyCarProbability }) {
  const genericLogs = [
    "The tyres are already questioning your life choices.",
    "Your engineer says Plan B. Nobody knows what Plan A was.",
    "A rival behind is within DRS and making it everyone else's problem.",
    "The pit wall is staring at timing screens with theatrical concern.",
    "Brake temperatures are spicy, but the vibes remain operational.",
    "The broadcast graphic says strategy is critical, which is never comforting.",
    "Clean air unlocked. The car suddenly remembers it is expensive.",
    "Someone ahead is saving tyres. Or losing pace. Or both.",
    "The race director is pretending this is under control."
  ];

  const specialLogs = [];
  if (team.id === "ferrari" || raceMode === "Ferrari Strategy Disaster") {
    specialLogs.push("Ferrari pit wall is calculating something suspicious.");
    specialLogs.push("A strategy window appears. It immediately becomes a strategy door.");
  }
  if (team.id === "haas" || raceMode === "Haas Masterclass") {
    specialLogs.push("Haas radio traffic has entered cinematic mode.");
    specialLogs.push("Somehow this is either genius or tomorrow's meme template.");
  }
  if (driver === "Fernando Alonso") specialLogs.push("Alonso has gained places through pure tactical sorcery.");
  if (circuit.id === "austria") specialLogs.push("Track limits warning. Austria moment.");
  if (hardToPass.has(circuit.id)) specialLogs.push("Overtaking attempt cancelled by geography.");
  if (lowDragTracks.has(circuit.id)) specialLogs.push("Slipstream train forming at deeply inconvenient speed.");
  if (weather !== "Dry") specialLogs.push("Rain radar says maybe. Everyone panics like definitely.");
  if (safetyCarProbability > 55) specialLogs.push("Safety Car deployed because someone parked creatively.");
  if (chaosLevel > 75) specialLogs.push("The timing tower has stopped making emotional sense.");

  const pool = [...specialLogs, ...genericLogs];
  const logs = [];
  for (let lap = 5; lap < laps; lap += 5) {
    logs.push(`Lap ${lap}: ${pool[Math.floor(Math.random() * pool.length)]}`);
  }
  logs.push("Final Lap: The race director is sweating.");
  return logs;
}

function buildInterviewQuote({ team, driver, raceMode, finalPosition, startPosition }) {
  const gained = startPosition - finalPosition;
  if (raceMode === "Ferrari Strategy Disaster" && team.id === "ferrari") return `${driver}: "We will discuss it internally. Very internally. Maybe underground."`;
  if (raceMode === "Haas Masterclass" && team.id === "haas" && gained > 6) return `${driver}: "I don't know what happened, but please keep doing exactly that."`;
  if (driver === "Fernando Alonso" && gained > 0) return `${driver}: "Experience is not magic. But today it was close enough."`;
  if (finalPosition <= 3) return `${driver}: "Mega result. The strategy team can have dessert tonight."`;
  if (finalPosition > 18) return `${driver}: "Difficult race. The car had character, mostly in the wrong places."`;
  if (gained > 4) return `${driver}: "We maximized the chaos. That is technically a strategy."`;
  return `${driver}: "Solid race. We learned things, including several things we did not request."`;
}

export function simulateRace({ circuit, team, driver, tyre, weather, startPosition, raceMode }) {
  const tyreProfile = tyreProfiles[tyre];
  const weatherProfile = weatherProfiles[weather];
  const modeProfile = modeProfiles[raceMode];
  const trackFit = getTrackFit(team, circuit);
  const driverBonus = getDriverBonus(driver, team, raceMode);
  const startPenalty = (startPosition - 1) * (hardToPass.has(circuit.id) ? 2.25 : 1.25);
  const overtakingBoost = (circuit.weights.overtaking || 1) * 7;

  // Chaos drives the entertainment layer: mistakes, wild swings, and strange logs.
  let chaosLevel = 25 + team.stats.chaos * 0.28 + weatherProfile.chaos + modeProfile.chaos;
  if (circuit.weights.chaos) chaosLevel += circuit.weights.chaos * 8;
  if (raceMode === "Haas Masterclass" && team.id === "haas") chaosLevel += 18;
  chaosLevel = clamp(Math.round(chaosLevel + randomBetween(-8, 10)), 0, 100);

  let safetyCarProbability = 16 + weatherProfile.safetyCar + modeProfile.safetyCar;
  if (safetyCarTracks.has(circuit.id)) safetyCarProbability += 25;
  if (circuit.weights.safetyCar) safetyCarProbability += circuit.weights.safetyCar * 10;
  safetyCarProbability = clamp(Math.round(safetyCarProbability + randomBetween(-6, 10)), 0, 100);

  let tyreDegRisk = tyreProfile.deg + weatherProfile.tyre + (circuit.weights.tyreWear || 0.9) * 18 - (team.stats.tyreManagement - 70) * 0.42;
  if (tyreStressTracks.has(circuit.id)) tyreDegRisk += 14;
  tyreDegRisk = clamp(Math.round(tyreDegRisk + randomBetween(-7, 8)), 0, 100);

  let reliabilityRisk = 100 - team.stats.reliability + weatherProfile.reliability + modeProfile.reliability;
  if (team.id === "cadillac") reliabilityRisk += 16;
  if (team.id === "audi") reliabilityRisk += 10;
  if (circuit.weights.reliability) reliabilityRisk += circuit.weights.reliability * 5;
  reliabilityRisk = clamp(Math.round(reliabilityRisk + randomBetween(-5, 9)), 0, 100);

  let strategyScore = team.stats.strategy + modeProfile.strategy - tyreDegRisk * 0.18 + safetyCarProbability * 0.08;
  if (raceMode === "Ferrari Strategy Disaster" && team.id === "ferrari") strategyScore -= randomBetween(18, 35);
  if (raceMode === "Safety Car Madness") strategyScore += randomBetween(-8, 14);
  if (team.id === "mercedes") strategyScore += 5;
  strategyScore = clamp(Math.round(strategyScore), 0, 100);

  const randomness = randomBetween(-10, 10) + (chaosLevel / 100) * randomBetween(-14, 14);
  let performanceScore = trackFit + driverBonus + tyreProfile.pace + overtakingBoost - startPenalty + strategyScore * 0.15 - reliabilityRisk * 0.18 + randomness;
  if (raceMode === "Haas Masterclass" && team.id === "haas") performanceScore += Math.random() > 0.52 ? randomBetween(18, 34) : randomBetween(-22, -8);
  if (raceMode === "Ferrari Strategy Disaster" && team.id === "ferrari") performanceScore -= randomBetween(8, 22);
  if (team.id === "mercedes") performanceScore += randomBetween(-4, 5);

  const projectedGain = Math.round((performanceScore - 72) / (hardToPass.has(circuit.id) ? 7 : 5));
  const incidentLoss = Math.random() * 100 < reliabilityRisk * 0.25 ? Math.ceil(randomBetween(2, 8)) : 0;
  const chaosSwing = Math.round((chaosLevel / 100) * randomBetween(-4, 5));
  // Final position is clamped because this simulator always has a 22-car grid.
  const finalPosition = clamp(startPosition - projectedGain + incidentLoss - chaosSwing, 1, 22);

  const baseStopLap = Math.round(circuit.laps * tyreProfile.idealStop);
  const pitStopLap = clamp(baseStopLap - Math.round(tyreDegRisk / 14) + Math.round(strategyScore / 28), 4, circuit.laps - 4);
  const undercutRisk = clamp(Math.round(55 + (circuit.weights.overtaking || 1) * 10 - strategyScore * 0.32 + randomBetween(-10, 12)), 0, 100);
  const driverRating = clamp(Math.round(62 + driverBonus * 2.2 + (startPosition - finalPosition) * 3 + randomBetween(-6, 7)), 0, 100);

  return {
    finalPosition,
    pitStopLap,
    tyreDegradationRisk: labelRisk(tyreDegRisk),
    tyreDegradationScore: tyreDegRisk,
    undercutRisk: labelRisk(undercutRisk),
    undercutScore: undercutRisk,
    safetyCarProbability,
    reliabilityRisk: labelRisk(reliabilityRisk),
    reliabilityScore: reliabilityRisk,
    strategyRating: labelRating(strategyScore),
    strategyScore,
    driverPerformanceRating: labelRating(driverRating),
    driverScore: driverRating,
    raceChaosLevel: chaosLevel,
    quote: buildInterviewQuote({ team, driver, raceMode, finalPosition, startPosition }),
    raceLog: buildRaceLog({ circuit, team, driver, raceMode, weather, laps: circuit.laps, chaosLevel, safetyCarProbability })
  };
}
