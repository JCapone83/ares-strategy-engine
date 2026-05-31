// ColonyTelemetry component
// Displays real-time indicators for O2, Water, Food, Energy, Morale, and Structural Integrity.
import { Wind, Droplet, Sprout, Zap, Heart, Shield, Users } from 'lucide-react';
import { TOTAL_SOLS } from '../game/simulationEngine';

export default function ColonyTelemetry({ resources, population, sol }) {
  const getResourceColor = (value, isPercentage = false) => {
    const limit = isPercentage ? 40 : 30;
    const criticalLimit = isPercentage ? 20 : 15;
    if (value <= criticalLimit) return 'var(--accent-red)';
    if (value <= limit) return 'var(--accent-amber)';
    return 'var(--accent-cyan)';
  };

  const getIndicatorStatus = (resources) => {
    if (resources.oxygen < 30 || resources.morale < 25 || resources.integrity < 30) return 'critical';
    if (resources.oxygen < 50 || resources.morale < 40 || resources.integrity < 50) return 'warning';
    return 'normal';
  };

  return (
    <div className="cyber-card">
      <div className="card-header">
        <span>🛰️ Core Telemetry</span>
        <div className={`pulse-indicator ${getIndicatorStatus(resources)}`} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>COLONY AGE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--accent-amber)' }}>SOL {sol} / {TOTAL_SOLS}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem' }}>
            <Users size={12} /> POPULATION
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--text-primary)' }}>{population}</div>
        </div>
      </div>

      <div className="telemetry-grid">
        {/* Oxygen Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Wind size={14} style={{ color: 'var(--accent-cyan)' }} /> Oxygen
            </span>
            <span style={{ color: getResourceColor(resources.oxygen, true), fontWeight: 'bold' }}>{resources.oxygen}%</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${resources.oxygen}%`, 
                backgroundColor: getResourceColor(resources.oxygen, true),
                boxShadow: `0 0 8px ${getResourceColor(resources.oxygen, true)}`
              }} 
            />
          </div>
        </div>

        {/* Water Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Droplet size={14} style={{ color: 'var(--accent-cyan)' }} /> Water
            </span>
            <span style={{ color: getResourceColor(resources.water), fontWeight: 'bold' }}>{resources.water} u</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${Math.min(100, (resources.water / 150) * 100)}%`, 
                backgroundColor: getResourceColor(resources.water),
                boxShadow: `0 0 8px ${getResourceColor(resources.water)}`
              }} 
            />
          </div>
        </div>

        {/* Food Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Sprout size={14} style={{ color: 'var(--accent-cyan)' }} /> Hydro Food
            </span>
            <span style={{ color: getResourceColor(resources.food), fontWeight: 'bold' }}>{resources.food} u</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${Math.min(100, (resources.food / 150) * 100)}%`, 
                backgroundColor: getResourceColor(resources.food),
                boxShadow: `0 0 8px ${getResourceColor(resources.food)}`
              }} 
            />
          </div>
        </div>

        {/* Energy Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Zap size={14} style={{ color: 'var(--accent-amber)' }} /> Grid Energy
            </span>
            <span style={{ color: getResourceColor(resources.energy), fontWeight: 'bold' }}>{resources.energy} MW</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${Math.min(100, (resources.energy / 180) * 100)}%`, 
                backgroundColor: getResourceColor(resources.energy),
                boxShadow: `0 0 8px ${getResourceColor(resources.energy)}`
              }} 
            />
          </div>
        </div>

        {/* Morale Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Heart size={14} style={{ color: 'var(--accent-pink)' }} /> Morale
            </span>
            <span style={{ color: getResourceColor(resources.morale, true), fontWeight: 'bold' }}>{resources.morale}%</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${resources.morale}%`, 
                backgroundColor: getResourceColor(resources.morale, true),
                boxShadow: `0 0 8px ${getResourceColor(resources.morale, true)}`
              }} 
            />
          </div>
        </div>

        {/* Structural Integrity Indicator */}
        <div className="metric-bar-container">
          <div className="metric-label-row">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-primary)' }}>
              <Shield size={14} style={{ color: 'var(--accent-cyan)' }} /> Dome Integrity
            </span>
            <span style={{ color: getResourceColor(resources.integrity, true), fontWeight: 'bold' }}>{resources.integrity}%</span>
          </div>
          <div className="metric-progress-track">
            <div 
              className="metric-progress-fill" 
              style={{ 
                width: `${resources.integrity}%`, 
                backgroundColor: getResourceColor(resources.integrity, true),
                boxShadow: `0 0 8px ${getResourceColor(resources.integrity, true)}`
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
