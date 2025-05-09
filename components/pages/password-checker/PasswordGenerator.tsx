import { useState, useEffect,  } from "react";
import { RotateCcw, KeyRound, Check } from "lucide-react";
import Select, { StylesConfig } from "react-select";
import { useTranslation } from "react-i18next";

type PasswordMode = "random" | "memorable";
type OptionType = { value: PasswordMode; label: string };

const customSelectStyles: StylesConfig<OptionType, false> = {
  control: (base) => ({
    ...base,
    backgroundColor: "transparent",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "none",
    color: "var(--text-primary)",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "rgba(15, 23, 42, 0.99)",
    zIndex: 10,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "rgba(255, 255, 255, 0.05)" : "transparent",
    color: "var(--text-primary)",
    cursor: "pointer",
    padding: "12px 24px",
    fontWeight: 600,
  }),
  indicatorSeparator: () => ({ display: "none" }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--text-primary)",
  }),
};

function PasswordGenerator() {
  const { t } = useTranslation("passwords");
  const [mode, setMode] = useState<PasswordMode>("random");
  const [length, setLength] = useState(12);
  const [wordCount, setWordCount] = useState(4);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(false);
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const modeOptions: OptionType[] = [
    { value: "random", label: t('randomCharacters') },
    { value: "memorable", label: t('memorableWords') },
  ];

  const wordList = [
    "apple", "sun", "mountain", "river", "storm", "cloud", "stone", "light", "forest", "echo",
    "wind", "tree", "sky", "fire", "ocean", "bird", "star", "dream", "wave", "field",
  ];

  const generatePassword = () => {
    if (mode === "random") {
      const lower = "abcdefghijklmnopqrstuvwxyz";
      const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const numbers = "0123456789";
      const symbols = "!@#$%^&*()_+-=[]{}|;:,.<>?";
      let chars = lower;

      if (includeUppercase) chars += upper;
      if (includeNumbers) chars += numbers;
      if (includeSymbols) chars += symbols;

      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      setPassword(result);
    } else {
      const words = Array.from({ length: wordCount }, () => {
        return wordList[Math.floor(Math.random() * wordList.length)];
      });
      setPassword(words.join("-"));
    }
    setCopied(false);
  };

  useEffect(() => {
    generatePassword();
    setCopied(false); // reset on new password
  }, [length, wordCount, mode, includeUppercase, includeNumbers, includeSymbols]);
  

  return (
      <div className="security-check-container glassmorphism">
        <div className="security-status">
          <div className="status-icon">
            <KeyRound size={32} />
          </div>
          <div className="status-text">
            <h3 className="status-title">{t("generateSecurePassword")}</h3>
            <p className="status-description">{t("customizePreferences")}</p>
          </div>
        </div>

        {/* Mode selection */}
        <div style={{ marginTop: "10px" }}>
          <label style={{ color: "var(--text-primary)", marginBottom: "8px", fontWeight: "bold" }}>
            {t("passwordType")}:
          </label>
          <Select
            options={modeOptions}
            value={modeOptions.find((opt) => opt.value === mode)}
            onChange={(selected) => selected && setMode(selected.value)}
            styles={customSelectStyles}
            menuPortalTarget={document.body}
          />
        </div>

        {/* Length slider (random mode) */}
        {mode === "random" && (
        <>
            {/* Add styles for the white thumb */}
            <style>
            {`
                .length-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white; /* White bubble */
                cursor: pointer;
                }
                
                .length-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white; /* White bubble */
                border: none;
                cursor: pointer;
                }
            `}
            </style>
            
            <div style={{ marginTop: "10px", color: "var(--text-primary)" }}>
            <label>
                {t("length")}: <strong>{length}</strong>
            </label>
            <input
                type="range"
                min={8}
                max={20}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="length-slider" /* Added class for targeting the thumbs */
                style={{
                width: "100%",
                height: "8px",
                borderRadius: "999px",
                background: "var(--accent-gradient)",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                outline: "none",
                WebkitAppearance: "none",
                appearance: "none",
                cursor: "pointer",
                marginTop: "12px",
                }}
            />
            </div>
        </>
        )}

        {/* Word count slider (memorable mode) */}
        {mode === "memorable" && (
        <>
            <style>
            {`
                .word-count-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white; /* White bubble */
                cursor: pointer;
                }
                
                .word-count-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white; /* White bubble */
                border: none;
                cursor: pointer;
                }
            `}
            </style>
            
            <div style={{ marginTop: "10px", color: "var(--text-primary)" }}>
            <label>
                {t("wordCount")}: <strong>{wordCount}</strong>
            </label>
            <input
                type="range"
                min={3}
                max={8}
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className="word-count-slider" /* Added class for targeting the thumbs */
                style={{
                width: "100%",
                height: "8px",
                borderRadius: "999px",
                background: "var(--accent-gradient)",
                boxShadow: "0 4px 12px rgba(14, 165, 233, 0.25)",
                outline: "none",
                WebkitAppearance: "none",
                appearance: "none",
                cursor: "pointer",
                marginTop: "12px",
                }}
            />
            </div>
        </>
        )}

        {/* Checkboxes for character options */}
        {mode === "random" && (
          <div style={{ marginTop: "24px", color: "var(--text-primary)", display: "flex", flexDirection: "column", gap: "12px" }}>
          {[{
            checked: includeUppercase,
            onChange: setIncludeUppercase,
            label: t("includeUppercase")
          }, {
            checked: includeNumbers,
            onChange: setIncludeNumbers,
            label: t("includeNumbers")
          }, {
            checked: includeSymbols,
            onChange: setIncludeSymbols,
            label: t("includeSymbols")
          }].map((item, idx) => (
            <label key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="switch-toggle">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => item.onChange(e.target.checked)}
                />
                <span className="slider"></span>
              </div>
              <span>{item.label}</span>
            </label>
          ))}
        </div>
        
        
        )}        

        {password && (
          <div
            className=""
            style={{
              marginTop: "20px",
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "bold",
              fontSize: "16px",
              color: "var(--accent-primary)",
              textAlign: "center",
              backgroundColor: "rgba(30,41,59,0.8)",
              wordBreak: "break-word",
            }}
          >
            {password}
          </div>
        )}
        {password && (
            <div className="action-buttons">
                <button
                    type="button"
                    className="btn btn-primary"
                    style={{ 
                    width: "200px",
                    marginTop: "16px"
                    }}
                    onClick={generatePassword}
                    >
                    <RotateCcw size={16} style={{ marginRight: "6px", verticalAlign: "middle" }} />
                    {t('regenerate')}
                </button>                            
                <button
                    className="btn btn-secondary"
                    style={{ width: "200px", marginTop: "16px" }}
                    onClick={() => {
                        navigator.clipboard.writeText(password);
                        setCopied(true);
                    }}
                    type="button"
                    >
                    {copied ? <Check size={16}/> : t("copy")}
                </button>
            </div>         
            
            )}

      </div>
  );
}

export default PasswordGenerator;
