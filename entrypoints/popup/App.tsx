import { useState } from 'react';
import './App.css';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h2>Slaptažodžio saugumo <br></br>bendri patarimai</h2>
      <ul>
        <li>Slaptažodžio ilgis ženkliai svarbiau nei simbolių sudėtingumas.</li>
        <li>Slaptažodžiai turėtų būti minimaliai 8 simbolių ilgio.</li>
        <li>Pakartoninai nevartoti slaptažodžių kurie buvo kompromituoti.</li>
        <li>Vengti slaptažodyje vartoti įprastus žodyno žodžius.</li>
        <li>Vengti slaptažodyje vartoti pasikartojančias ar nuspėjamas simbolių sekas ('aaaa' arba '1234' ir pan.)</li>
        <li>Vengti slaptaždoyje naudoti asmeninę informaciją (gimimo data, artimųjų vardai ir pan.)</li>
        <li>Saugoti slaptažodžius specializuotoje tvarkyklėje (password manager).</li>
        <li>Įvykus duomenų nutekėjimui nedelsiant keisti savo slaptažodį.</li>
        <li>Nenaudoti identiškų slaptažodžių keliose skirtingose sistemose.</li>
        <li>Nenaudoti slaptažodžio priminimo klausimų arba užuominų.</li>
        <li>Apsaugoti savo prisijungimus 2FA.</li>
      </ul>
    </>
  );
}

export default App;
