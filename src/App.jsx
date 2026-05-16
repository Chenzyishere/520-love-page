import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Check,
  Copy,
  Download,
  Gift,
  Heart,
  Link2,
  Lock,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from 'lz-string';
import { loveConfig } from './love.config';

const steps = ['hero', 'memories', 'collect', 'letter'];
const storageKey = 'love-page-config-v2';
const shareParam = 'c';
const viewParam = 'view';

const text = {
  openPanel: '\u6253\u5f00\u914d\u7f6e\u9762\u677f',
  closePanel: '\u5173\u95ed\u914d\u7f6e\u9762\u677f',
  configPanel: '\u914d\u7f6e\u9762\u677f',
  exportJson: '\u5bfc\u51fa JSON',
  reset: '\u91cd\u7f6e',
  share: '\u751f\u6210\u5206\u4eab\u94fe\u63a5',
  copied: '\u5df2\u590d\u5236',
  copy: '\u590d\u5236',
  savedLocal: '\u5df2\u81ea\u52a8\u4fdd\u5b58\u5230\u672c\u673a',
  baseInfo: '\u57fa\u7840\u4fe1\u606f',
  pageTitle: '\u9875\u9762\u6807\u9898',
  dateLabel: '\u65e5\u671f\u6807\u7b7e',
  receiverName: '\u6536\u4ef6\u4eba\u6635\u79f0',
  heroCopy: '\u9996\u9875\u6587\u6848',
  eyebrow: '\u7709\u6807',
  headline: '\u4e3b\u6807\u9898',
  description: '\u63cf\u8ff0',
  themeColors: '\u4e3b\u9898\u989c\u8272',
  words: '\u5fc3\u52a8\u788e\u7247',
  wordsHelp: '\u8bcd\u8bed\uff0c\u7528\u9017\u53f7\u6216\u6362\u884c\u5206\u9694',
  memories: '\u56de\u5fc6\u5361\u7247',
  date: '\u65e5\u671f',
  title: '\u6807\u9898',
  body: '\u6b63\u6587',
  deleteMemory: '\u5220\u9664\u5f53\u524d\u56de\u5fc6',
  finalLetter: '\u6700\u540e\u4e00\u5c01\u4fe1',
  paragraphHelp: '\u6b63\u6587\uff0c\u6bcf\u884c\u4e00\u6bb5',
  signature: '\u843d\u6b3e\u91cd\u70b9\u53e5',
  progress: '\u60ca\u559c\u8fdb\u5ea6',
  viewMemory: '\u67e5\u770b',
  watchAgain: '\u518d\u770b\u4e00\u6b21',
  newMemory: '\u65b0\u56de\u5fc6',
  newMemoryTitle: '\u5199\u4e0b\u4e00\u4e2a\u65b0\u7684\u5fc3\u52a8\u77ac\u95f4',
  newMemoryBody: '\u8fd9\u91cc\u53ef\u4ee5\u653e\u5ba2\u6237\u4e13\u5c5e\u7684\u6545\u4e8b\u3002',
};

const themePresets = {
  rose: {
    name: '\u7c89\u6a58\u5fc3\u52a8',
    colors: {
      text: '#34251f',
      primary: '#d93268',
      primarySoft: '#ff9fb6',
      accent: '#ff8a4a',
      secondary: '#b44a73',
      secondaryDark: '#7f2f55',
      paper: '#fffaf7',
      backgroundTop: '#fff8f3',
      backgroundMiddle: '#f6fff7',
      backgroundBottom: '#fff6fb',
    },
  },
  moon: {
    name: '\u6708\u5149\u84dd\u767d',
    colors: {
      text: '#243047',
      primary: '#3b82f6',
      primarySoft: '#b9dcff',
      accent: '#7c3aed',
      secondary: '#5b7cfa',
      secondaryDark: '#2f4db8',
      paper: '#f8fbff',
      backgroundTop: '#f7fbff',
      backgroundMiddle: '#eef8ff',
      backgroundBottom: '#f8f3ff',
    },
  },
  noir: {
    name: '\u9ed1\u91d1\u7535\u5f71',
    colors: {
      text: '#f7ead2',
      primary: '#d9a441',
      primarySoft: '#ffe2a3',
      accent: '#d85f57',
      secondary: '#f1c86a',
      secondaryDark: '#a87924',
      paper: '#211d1b',
      backgroundTop: '#161312',
      backgroundMiddle: '#211b19',
      backgroundBottom: '#31241d',
    },
  },
};

const mergeConfig = (baseConfig, overrideConfig = {}) => ({
  ...baseConfig,
  ...overrideConfig,
  site: { ...baseConfig.site, ...overrideConfig.site },
  themePreset: overrideConfig.themePreset ?? baseConfig.themePreset ?? 'rose',
  theme: { ...baseConfig.theme, ...overrideConfig.theme },
  hero: { ...baseConfig.hero, ...overrideConfig.hero },
  memoriesSection: {
    ...baseConfig.memoriesSection,
    ...overrideConfig.memoriesSection,
    memories: overrideConfig.memoriesSection?.memories?.length
      ? overrideConfig.memoriesSection.memories
      : baseConfig.memoriesSection.memories,
  },
  collectSection: {
    ...baseConfig.collectSection,
    ...overrideConfig.collectSection,
    words: overrideConfig.collectSection?.words?.length
      ? overrideConfig.collectSection.words
      : baseConfig.collectSection.words,
  },
  finalSection: { ...baseConfig.finalSection, ...overrideConfig.finalSection },
  letter: {
    ...baseConfig.letter,
    ...overrideConfig.letter,
    paragraphs: overrideConfig.letter?.paragraphs ?? baseConfig.letter.paragraphs,
  },
});

const splitWords = (value) =>
  value
    .split(/[,\uFF0C\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

const splitLines = (value) =>
  value
    .split(/\n/)
    .map((item) => item.trim())
    .filter(Boolean);

const base64ToBytes = (value) => {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const getConfigDiff = (baseValue, nextValue) => {
  if (JSON.stringify(baseValue) === JSON.stringify(nextValue)) {
    return undefined;
  }

  if (isPlainObject(baseValue) && isPlainObject(nextValue)) {
    const diff = {};
    Object.keys(nextValue).forEach((key) => {
      const childDiff = getConfigDiff(baseValue[key], nextValue[key]);
      if (childDiff !== undefined) {
        diff[key] = childDiff;
      }
    });
    return Object.keys(diff).length ? diff : undefined;
  }

  return nextValue;
};

const getPortableConfig = (config) => {
  const { theme, ...portableConfig } = config;
  return portableConfig;
};

const encodeConfig = (config) => {
  const payload = {
    v: 2,
    d: getConfigDiff(getPortableConfig(loveConfig), getPortableConfig(config)) ?? {},
  };
  return compressToEncodedURIComponent(JSON.stringify(payload));
};

const decodeConfig = (value) => {
  const decompressed = decompressFromEncodedURIComponent(value);
  const parsed = decompressed
    ? JSON.parse(decompressed)
    : JSON.parse(new TextDecoder().decode(base64ToBytes(value)));
  return parsed?.d && (parsed.v === 1 || parsed.v === 2) ? parsed.d : parsed;
};

function App() {
  const [isShareView] = useState(() => new URLSearchParams(window.location.search).has(shareParam));
  const [config, setConfig] = useState(loveConfig);
  const [currentStep, setCurrentStep] = useState('hero');
  const [activeMemory, setActiveMemory] = useState(0);
  const [collected, setCollected] = useState([]);
  const [configPanelOpen, setConfigPanelOpen] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareCopied, setShareCopied] = useState(false);

  const memories = config.memoriesSection.memories;
  const floatingNotes = config.collectSection.words;
  const currentStepIndex = steps.indexOf(currentStep);
  const activeTheme = themePresets[config.themePreset]?.colors ?? config.theme ?? themePresets.rose.colors;
  const progress = useMemo(
    () => (floatingNotes.length ? collected.length / floatingNotes.length : 0),
    [collected, floatingNotes.length]
  );
  const allNotesCollected = floatingNotes.length > 0 && collected.length >= floatingNotes.length;
  const themeStyle = useMemo(
    () => ({
      '--text': activeTheme.text,
      '--primary': activeTheme.primary,
      '--primary-soft': activeTheme.primarySoft,
      '--accent': activeTheme.accent,
      '--secondary': activeTheme.secondary,
      '--secondary-dark': activeTheme.secondaryDark,
      '--paper': activeTheme.paper,
      '--background-top': activeTheme.backgroundTop,
      '--background-middle': activeTheme.backgroundMiddle,
      '--background-bottom': activeTheme.backgroundBottom,
    }),
    [activeTheme]
  );

  const collectNote = (note) => {
    if (!collected.includes(note)) {
      setCollected((items) => [...items, note]);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateSection = (section, key, value) => {
    if (key === undefined) {
      setConfig((current) => ({
        ...current,
        [section]: value,
      }));
      return;
    }

    setConfig((current) => ({
      ...current,
      [section]: {
        ...current[section],
        [key]: value,
      },
    }));
  };

  const updateMemory = (index, key, value) => {
    setConfig((current) => ({
      ...current,
      memoriesSection: {
        ...current.memoriesSection,
        memories: current.memoriesSection.memories.map((memory, memoryIndex) =>
          memoryIndex === index ? { ...memory, [key]: value } : memory
        ),
      },
    }));
  };

  const addMemory = () => {
    setConfig((current) => ({
      ...current,
      memoriesSection: {
        ...current.memoriesSection,
        memories: [
          ...current.memoriesSection.memories,
          {
            date: text.newMemory,
            title: text.newMemoryTitle,
            text: text.newMemoryBody,
          },
        ],
      },
    }));
    setActiveMemory(memories.length);
  };

  const removeMemory = (index) => {
    setConfig((current) => {
      if (current.memoriesSection.memories.length <= 1) {
        return current;
      }
      return {
        ...current,
        memoriesSection: {
          ...current.memoriesSection,
          memories: current.memoriesSection.memories.filter((_, memoryIndex) => memoryIndex !== index),
        },
      };
    });
  };

  const exportConfig = () => {
    const file = new Blob([JSON.stringify(getPortableConfig(config), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'love.config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyShareUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1600);
    } catch {
      setShareCopied(false);
    }
  };

  const createShareUrl = () => {
    const url = new URL(window.location.href);
    url.searchParams.set(shareParam, encodeConfig(config));
    url.searchParams.set(viewParam, '1');
    const nextUrl = url.toString();
    setShareUrl(nextUrl);
    copyShareUrl(nextUrl);
  };

  const resetConfig = () => {
    localStorage.removeItem(storageKey);
    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete(shareParam);
    cleanUrl.searchParams.delete(viewParam);
    window.history.replaceState({}, '', cleanUrl);
    setConfig(loveConfig);
    setCollected([]);
    setActiveMemory(0);
    setCurrentStep('hero');
    setShareUrl('');
  };

  useEffect(() => {
    let ignore = false;

    const loadConfig = async () => {
      const queryConfig = new URLSearchParams(window.location.search).get(shareParam);
      if (queryConfig) {
        try {
          const decodedConfig = decodeConfig(queryConfig);
          if (!ignore) {
            setConfig(mergeConfig(loveConfig, decodedConfig));
            setHasHydrated(true);
          }
          return;
        } catch {
          // Fall through to local/runtime config.
        }
      }

      const savedConfig = localStorage.getItem(storageKey);
      if (savedConfig) {
        try {
          if (!ignore) {
            setConfig(mergeConfig(loveConfig, JSON.parse(savedConfig)));
            setHasHydrated(true);
          }
          return;
        } catch {
          localStorage.removeItem(storageKey);
        }
      }

      try {
        const response = await fetch('/love.config.json');
        if (!response.ok) {
          throw new Error('Runtime config not found');
        }
        const runtimeConfig = await response.json();
        if (!ignore) {
          setConfig(mergeConfig(loveConfig, runtimeConfig));
        }
      } catch {
        if (!ignore) {
          setConfig(loveConfig);
        }
      } finally {
        if (!ignore) {
          setHasHydrated(true);
        }
      }
    };

    loadConfig();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    document.title = config.site.title;
  }, [config.site.title]);

  useEffect(() => {
    if (hasHydrated && !isShareView) {
      localStorage.setItem(storageKey, JSON.stringify(config));
    }
  }, [config, hasHydrated, isShareView]);

  useEffect(() => {
    setShareUrl('');
    setShareCopied(false);
  }, [config]);

  useEffect(() => {
    if (activeMemory >= memories.length) {
      setActiveMemory(0);
    }
  }, [activeMemory, memories.length]);

  return (
    <main className="page-shell" style={themeStyle}>
      {!isShareView && (
        <>
          <button
            className="config-toggle"
            type="button"
            aria-label={configPanelOpen ? text.closePanel : text.openPanel}
            onClick={() => setConfigPanelOpen((value) => !value)}
          >
            {configPanelOpen ? <X size={18} /> : <Settings size={18} />}
          </button>

          <ConfigSidebar
            activeMemory={activeMemory}
            config={config}
            floatingNotes={floatingNotes}
            isOpen={configPanelOpen}
            memories={memories}
            shareCopied={shareCopied}
            shareUrl={shareUrl}
            onAddMemory={addMemory}
            onClose={() => setConfigPanelOpen(false)}
            onCopyShareUrl={() => copyShareUrl(shareUrl)}
            onCreateShareUrl={createShareUrl}
            onExport={exportConfig}
            onRemoveMemory={removeMemory}
            onReset={resetConfig}
            onSelectMemory={setActiveMemory}
            onUpdateMemory={updateMemory}
            onUpdateSection={updateSection}
            onUpdateWords={(value) => {
              updateSection('collectSection', 'words', splitWords(value));
              setCollected([]);
              setCurrentStep('collect');
            }}
          />

          {configPanelOpen && (
            <button className="config-scrim" type="button" aria-label={text.closePanel} onClick={() => setConfigPanelOpen(false)} />
          )}
        </>
      )}

      <div className="step-progress" aria-label={text.progress}>
        {steps.map((step, index) => (
          <span key={step} className={index <= currentStepIndex ? 'active' : ''} />
        ))}
      </div>

      <div className="experience-stage">
        {currentStep === 'hero' && (
          <section className="flow-step hero">
            <div className="ambient ambient-one" />
            <div className="ambient ambient-two" />
            <div className="hero-content">
              <div className="date-pill">
                <Heart size={14} fill="currentColor" />
                {config.site.dateText}
              </div>
              <p className="kicker">{config.hero.eyebrow}</p>
              <h1>{config.hero.headline}</h1>
              <p className="hero-copy">{config.hero.description}</p>
              <button className="unlock-button" type="button" onClick={() => goToStep('memories')}>
                <Lock size={18} />
                {config.hero.lockedButtonText}
              </button>
            </div>
          </section>
        )}

        {currentStep === 'memories' && (
          <section className="flow-step memory-section" id="memories">
            <div className="section-heading">
              <p>{config.memoriesSection.eyebrow}</p>
              <h2>{config.memoriesSection.title}</h2>
            </div>
            <div className="memory-card">
              <div className="memory-date">{memories[activeMemory].date}</div>
              <h3>{memories[activeMemory].title}</h3>
              <p>{memories[activeMemory].text}</p>
            </div>
            <div className="memory-tabs" aria-label={config.memoriesSection.tabLabel}>
              {memories.map((memory, index) => (
                <button
                  key={`${memory.title}-${index}`}
                  className={activeMemory === index ? 'active' : ''}
                  type="button"
                  aria-label={`${text.viewMemory}${memory.date}`}
                  onClick={() => setActiveMemory(index)}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button className="step-next-button" type="button" onClick={() => goToStep('collect')}>
              <Gift size={18} />
              {config.hero.unlockedButtonText}
            </button>
          </section>
        )}

        {currentStep === 'collect' && (
          <section className="flow-step collect-section">
            <div className="section-heading">
              <p>{config.collectSection.eyebrow}</p>
              <h2>
                {config.collectSection.titlePrefix} {floatingNotes.length} {config.collectSection.titleSuffix}
              </h2>
            </div>
            <div className="progress-wrap">
              <div className="progress-bar" style={{ transform: `scaleX(${progress})` }} />
            </div>
            <p className="progress-text">
              {collected.length} / {floatingNotes.length}
            </p>
            <div className="notes-field">
              {floatingNotes.map((note, index) => (
                <button
                  key={`${note}-${index}`}
                  className={`note note-${(index % 6) + 1} ${collected.includes(note) ? 'collected' : ''}`}
                  type="button"
                  onClick={() => collectNote(note)}
                >
                  {collected.includes(note) ? <Heart size={16} fill="currentColor" /> : <Sparkles size={16} />}
                  {note}
                </button>
              ))}
            </div>
            <button
              className="step-next-button"
              type="button"
              disabled={!allNotesCollected}
              onClick={() => goToStep('letter')}
            >
              <Gift size={18} />
              {config.finalSection.buttonText}
              <ArrowRight size={18} />
            </button>
            <p className="hint">{!allNotesCollected ? config.finalSection.lockedHint : config.finalSection.unlockedHint}</p>
          </section>
        )}

        {currentStep === 'letter' && (
          <section className="flow-step letter-section">
            <div className="fireworks final-fireworks">
              <span />
              <span />
              <span />
              <span />
            </div>
            <div className="final-letter">
              <p className="letter-label">{config.letter.eyebrow}</p>
              <h2>{config.letter.title}</h2>
              {config.letter.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              <strong>{config.letter.signature}</strong>
            </div>
            <button className="step-next-button ghost" type="button" onClick={() => goToStep('hero')}>
              <Heart size={18} fill="currentColor" />
              {text.watchAgain}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}

function ConfigSidebar({
  activeMemory,
  config,
  floatingNotes,
  isOpen,
  memories,
  shareCopied,
  shareUrl,
  onAddMemory,
  onClose,
  onCopyShareUrl,
  onCreateShareUrl,
  onExport,
  onRemoveMemory,
  onReset,
  onSelectMemory,
  onUpdateMemory,
  onUpdateSection,
  onUpdateWords,
}) {
  return (
    <aside className={`config-sidebar ${isOpen ? 'is-open' : ''}`} aria-label={text.configPanel}>
      <div className="config-header">
        <div>
          <p>Template Config</p>
          <h2>{text.configPanel}</h2>
        </div>
        <button type="button" aria-label={text.closePanel} onClick={onClose}>
          <X size={18} />
        </button>
      </div>
      <div className="config-actions">
        <button type="button" onClick={onExport}>
          <Download size={16} />
          {text.exportJson}
        </button>
        <button type="button" onClick={onCreateShareUrl}>
          <Link2 size={16} />
          {text.share}
        </button>
        <button type="button" onClick={onReset}>
          <RotateCcw size={16} />
          {text.reset}
        </button>
      </div>
      {shareUrl && (
        <div className="share-box">
          <input readOnly value={shareUrl} aria-label={text.share} />
          <button type="button" onClick={onCopyShareUrl}>
            {shareCopied ? <Check size={16} /> : <Copy size={16} />}
            {shareCopied ? text.copied : text.copy}
          </button>
        </div>
      )}
      <p className="save-status">{text.savedLocal}</p>

      <div className="config-scroll">
        <ConfigGroup title={text.baseInfo}>
          <ConfigInput label={text.pageTitle} value={config.site.title} onChange={(value) => onUpdateSection('site', 'title', value)} />
          <ConfigInput label={text.dateLabel} value={config.site.dateText} onChange={(value) => onUpdateSection('site', 'dateText', value)} />
          <ConfigInput label={text.receiverName} value={config.site.receiverName} onChange={(value) => onUpdateSection('site', 'receiverName', value)} />
        </ConfigGroup>
        <ConfigGroup title={text.heroCopy}>
          <ConfigInput label={text.eyebrow} value={config.hero.eyebrow} onChange={(value) => onUpdateSection('hero', 'eyebrow', value)} />
          <ConfigTextarea label={text.headline} value={config.hero.headline} onChange={(value) => onUpdateSection('hero', 'headline', value)} />
          <ConfigTextarea label={text.description} value={config.hero.description} onChange={(value) => onUpdateSection('hero', 'description', value)} />
        </ConfigGroup>
        <ConfigGroup title={text.themeColors}>
          <ThemePresetPicker
            selected={config.themePreset ?? 'rose'}
            onChange={(value) => onUpdateSection('themePreset', undefined, value)}
          />
        </ConfigGroup>
        <ConfigGroup title={text.words}>
          <ConfigTextarea label={text.wordsHelp} value={floatingNotes.join('\uFF0C')} onChange={onUpdateWords} />
        </ConfigGroup>
        <ConfigGroup title={text.memories}>
          <div className="memory-editor-tabs">
            {memories.map((memory, index) => (
              <button
                key={`${memory.title}-${index}`}
                className={activeMemory === index ? 'active' : ''}
                type="button"
                onClick={() => onSelectMemory(index)}
              >
                {index + 1}
              </button>
            ))}
            <button type="button" onClick={onAddMemory}>
              <Plus size={15} />
            </button>
          </div>
          <ConfigInput label={text.date} value={memories[activeMemory]?.date ?? ''} onChange={(value) => onUpdateMemory(activeMemory, 'date', value)} />
          <ConfigInput label={text.title} value={memories[activeMemory]?.title ?? ''} onChange={(value) => onUpdateMemory(activeMemory, 'title', value)} />
          <ConfigTextarea label={text.body} value={memories[activeMemory]?.text ?? ''} onChange={(value) => onUpdateMemory(activeMemory, 'text', value)} />
          <button className="danger-action" type="button" onClick={() => onRemoveMemory(activeMemory)}>
            <Trash2 size={15} />
            {text.deleteMemory}
          </button>
        </ConfigGroup>
        <ConfigGroup title={text.finalLetter}>
          <ConfigInput label={text.title} value={config.letter.title} onChange={(value) => onUpdateSection('letter', 'title', value)} />
          <ConfigTextarea
            label={text.paragraphHelp}
            value={config.letter.paragraphs.join('\n')}
            onChange={(value) => onUpdateSection('letter', 'paragraphs', splitLines(value))}
          />
          <ConfigTextarea label={text.signature} value={config.letter.signature} onChange={(value) => onUpdateSection('letter', 'signature', value)} />
        </ConfigGroup>
      </div>
    </aside>
  );
}

function ConfigGroup({ title, children }) {
  return (
    <section className="config-group">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function ConfigInput({ label, value, onChange }) {
  return (
    <label className="config-field">
      <span>{label}</span>
      <input type="text" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ConfigTextarea({ label, value, onChange }) {
  return (
    <label className="config-field">
      <span>{label}</span>
      <textarea value={value} rows={3} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ThemePresetPicker({ selected, onChange }) {
  return (
    <div className="theme-preset-list">
      {Object.entries(themePresets).map(([key, preset]) => (
        <button
          key={key}
          className={selected === key ? 'active' : ''}
          type="button"
          onClick={() => onChange(key)}
        >
          <span className="theme-swatch-row" aria-hidden="true">
            <i style={{ background: preset.colors.primary }} />
            <i style={{ background: preset.colors.accent }} />
            <i style={{ background: preset.colors.secondary }} />
          </span>
          {preset.name}
        </button>
      ))}
    </div>
  );
}

export default App;
