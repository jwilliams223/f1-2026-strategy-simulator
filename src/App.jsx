import { Activity, ChevronsRight, Flag, Gauge, Radio, Trophy, Wrench, Zap } from "lucide-react";
import { useMemo, useState } from "react";
import { circuits } from "./data/circuits";
import { teams } from "./data/teams";
import { simulateRace } from "./utils/simulation";

const tyres = ["Soft", "Medium", "Hard", "Intermediate", "Wet"];
const weatherOptions = ["Dry", "Light Rain", "Heavy Rain", "Mixed Conditions"];
const raceModes = ["Realistic", "Chaotic", "Ferrari Strategy Disaster", "Safety Car Madness", "Haas Masterclass"];
const startPositions = Array.from({ length: 22 }, (_, index) => index + 1);

function formatCircuit(circuit) {
  return `${circuit.country} - ${circuit.circuit}`;
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="metric-card">
      <div className="metric-icon">
        <Icon size={18} aria-hidden="true" />
      </div>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail && <span>{detail}</span>}
      </div>
    </article>
  );
}

function App() {
  const [selectedCircuitId, setSelectedCircuitId] = useState(circuits[0].id);
  const [selectedTeamId, setSelectedTeamId] = useState(teams[0].id);
  const [driver, setDriver] = useState(teams[0].drivers[0]);
  const [tyre, setTyre] = useState("Medium");
  const [weather, setWeather] = useState("Dry");
  const [startPosition, setStartPosition] = useState(8);
  const [raceMode, setRaceMode] = useState("Realistic");
  const [result, setResult] = useState(null);

  const selectedCircuit = useMemo(
    () => circuits.find((circuit) => circuit.id === selectedCircuitId),
    [selectedCircuitId]
  );

  const selectedTeam = useMemo(
    () => teams.find((team) => team.id === selectedTeamId),
    [selectedTeamId]
  );

  function handleTeamChange(teamId) {
    const nextTeam = teams.find((team) => team.id === teamId);
    setSelectedTeamId(teamId);
    setDriver(nextTeam.drivers[0]);
  }

  function handleSimulation() {
    setResult(
      simulateRace({
        circuit: selectedCircuit,
        team: selectedTeam,
        driver,
        tyre,
        weather,
        startPosition: Number(startPosition),
        raceMode
      })
    );
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">FIA-ish Broadcast Feed / Entertainment Mode</p>
          <h1>F1 2026 Race Strategy Simulator</h1>
          <p className="hero-copy">
            Pick a Grand Prix, gamble on tyres, trust the pit wall, and discover whether your Sunday becomes a masterclass or a meme.
          </p>
        </div>
        <div className="hero-badge">
          <Flag size={28} aria-hidden="true" />
          <span>2026</span>
          <strong>24 GP / 11 Teams</strong>
        </div>
      </section>

      <section className="race-grid">
        <aside className="panel control-panel">
          <div className="panel-heading">
            <Wrench size={20} aria-hidden="true" />
            <h2>Strategy Setup</h2>
          </div>

          <label>
            Grand Prix / Circuit
            <select value={selectedCircuitId} onChange={(event) => setSelectedCircuitId(event.target.value)}>
              {circuits.map((circuit) => (
                <option key={circuit.id} value={circuit.id}>
                  {formatCircuit(circuit)}
                </option>
              ))}
            </select>
          </label>

          <label>
            Team
            <select value={selectedTeamId} onChange={(event) => handleTeamChange(event.target.value)}>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Driver
            <select value={driver} onChange={(event) => setDriver(event.target.value)}>
              {selectedTeam.drivers.map((teamDriver) => (
                <option key={teamDriver} value={teamDriver}>
                  {teamDriver}
                </option>
              ))}
            </select>
          </label>

          <div className="two-column">
            <label>
              Starting Tyre
              <select value={tyre} onChange={(event) => setTyre(event.target.value)}>
                {tyres.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Weather
              <select value={weather} onChange={(event) => setWeather(event.target.value)}>
                {weatherOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="two-column">
            <label>
              Starting Position
              <select value={startPosition} onChange={(event) => setStartPosition(Number(event.target.value))}>
                {startPositions.map((position) => (
                  <option key={position} value={position}>
                    P{position}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Race Mode
              <select value={raceMode} onChange={(event) => setRaceMode(event.target.value)}>
                {raceModes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <button className="simulate-button" type="button" onClick={handleSimulation}>
            <ChevronsRight size={20} aria-hidden="true" />
            Start Race Simulation
          </button>

          <div className="team-strip">
            <h3>{selectedTeam.name}</h3>
            <p>{selectedTeam.traits.join(" / ")}</p>
          </div>

          <div className="circuit-strip">
            <span>{selectedCircuit.type}</span>
            <strong>{selectedCircuit.laps} laps</strong>
            <p>{selectedCircuit.traits.join(" / ")}</p>
          </div>
        </aside>

        <section className="panel result-panel">
          <div className="panel-heading">
            <Trophy size={20} aria-hidden="true" />
            <h2>Simulation Result</h2>
          </div>

          {!result && (
            <div className="empty-state">
              <Gauge size={42} aria-hidden="true" />
              <h3>Awaiting lights out</h3>
              <p>Select your setup and start the race simulation.</p>
            </div>
          )}

          {result && (
            <>
              <div className="position-board">
                <span>Final Position</span>
                <strong>P{result.finalPosition}</strong>
                <p>
                  {driver} / {selectedTeam.name} / {formatCircuit(selectedCircuit)}
                </p>
              </div>

              <div className="metric-grid">
                <MetricCard label="Recommended Pit Stop Lap" value={`Lap ${result.pitStopLap}`} detail="pit wall says probably" icon={Wrench} />
                <MetricCard label="Tyre Degradation Risk" value={result.tyreDegradationRisk} detail={`${result.tyreDegradationScore}/100`} icon={Gauge} />
                <MetricCard label="Undercut Risk" value={result.undercutRisk} detail={`${result.undercutScore}/100`} icon={Activity} />
                <MetricCard label="Safety Car Probability" value={`${result.safetyCarProbability}%`} detail="yellow flags loading" icon={Flag} />
                <MetricCard label="Reliability Risk" value={result.reliabilityRisk} detail={`${result.reliabilityScore}/100`} icon={Wrench} />
                <MetricCard label="Strategy Rating" value={result.strategyRating} detail={`${result.strategyScore}/100`} icon={Radio} />
                <MetricCard label="Driver Performance Rating" value={result.driverPerformanceRating} detail={`${result.driverScore}/100`} icon={Trophy} />
                <MetricCard label="Race Chaos Level" value={`${result.raceChaosLevel}%`} detail="broadcast panic index" icon={Activity} />
              </div>

              <div className="regulation-panel">
                <div className="regulation-heading">
                  <Zap size={18} aria-hidden="true" />
                  <h3>2026 Regulation Chaos</h3>
                </div>
                {result.regulationChaosEvents.length === 0 ? (
                  <p className="regulation-clear">No major new-rule weirdness this time. Suspiciously normal.</p>
                ) : (
                  <div className="regulation-events">
                    {result.regulationChaosEvents.map((event) => (
                      <article key={`${event.type}-${event.severity}`} className="regulation-event">
                        <div>
                          <strong>{event.type}</strong>
                          <span>Severity {event.severity}/100</span>
                        </div>
                        <p>{event.effect}</p>
                      </article>
                    ))}
                  </div>
                )}
              </div>

              <blockquote className="quote">{result.quote}</blockquote>
            </>
          )}
        </section>
      </section>

      <section className="panel log-panel">
        <div className="panel-heading">
          <Radio size={20} aria-hidden="true" />
          <h2>Race Log</h2>
        </div>
        <div className="log-feed">
          {(result?.raceLog || ["No race log yet. The cars are still on the grid."]).map((entry, index) => (
            <p key={`${entry}-${index}`}>{entry}</p>
          ))}
        </div>
      </section>
    </main>
  );
}

export default App;
