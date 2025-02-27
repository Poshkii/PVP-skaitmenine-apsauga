import { useState} from 'react';
import './App.css';
import PasswordStrength from './passwordStrength';

const slides = [
  { id: 1, content: "Slaptažodžio ilgis ženkliai svarbiau nei simbolių sudėtingumas." },
  { id: 2, content: "Slaptažodžiai turėtų būti minimaliai 8 simbolių ilgio." },
  { id: 3, content: "Pakartoninai nevartoti slaptažodžių kurie buvo kompromituoti." },
  { id: 4, content: "Vengti slaptažodyje vartoti įprastus žodyno žodžius." },
  { id: 5, content: "Vengti slaptažodyje vartoti pasikartojančias ar nuspėjamas simbolių sekas ('aaaa' arba '1234' ir pan.)." },
  { id: 6, content: "Vengti slaptaždoyje naudoti asmeninę informaciją (gimimo data, artimųjų vardai ir pan.)." },
  { id: 7, content: "Saugoti slaptažodžius specializuotoje tvarkyklėje (password manager)." },
  { id: 8, content: "Įvykus duomenų nutekėjimui nedelsiant keisti savo slaptažodį." },
  { id: 9, content: "Nenaudoti identiškų slaptažodžių keliose skirtingose sistemose." },
  { id: 10, content: "Nenaudoti slaptažodžio priminimo klausimų arba užuominų." },
  { id: 11, content: "Apsaugoti savo prisijungimus 2FA." }
];

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
  }
  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
  }

  return (
    <>
      <PasswordStrength />
      <div>
        <div style={{paddingBottom: '0.5rem'}}>
          <h2>Patarimai slaptažodžiui</h2>
          {slides.map((slide, index) => (
            <div key={slide.id} style={{ display: index === currentIndex ? "block" : "none" }}>
              <div style={{textAlign: 'left', fontSize: "0.9rem"}}>{slide.content}</div>
              <br></br>
              <div>{slide.id} / {slides.length}</div>
            </div>
          ))}
        </div>
        <button style={{marginRight:'0.5rem'}} onClick={prevSlide}>❮</button>
        <button onClick={nextSlide}>❯</button>
      </div>
    </>
  );
}

