// src/components/Header.jsx

import '../styles/Header.css';
import logo from '../assets/waterdrop.png';

export default function Header() {
  return (
    <header className="header">
      <img src={logo} alt="AquaMind logo" className="logo" />
      <h1>AquaMind</h1>
    </header>
  );
}
