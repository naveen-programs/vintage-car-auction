import React, { useState, useEffect, useRef } from "react";

// ✅ Make sure filenames are correct in ./src/assets/
import mercedesImg from "./assets/Mercedes.webp";
import jaguarImg from "./assets/jaguar.jpeg";
import dodgeImg from "./assets/Dodge.jpeg";
import fordImg from "./assets/Ford-Mustang.webp";

import "./App.css";

const CarCard = ({ car, onPlaceBid, isHighest }) => (
  <div className={`car-card ${isHighest ? "highlight" : ""}`}>
    <img src={car.image} alt={car.name} className="car-image" />
    <h3>{car.name}</h3>
    <div className="highest-bid">
      Highest Bid: <strong>{car.currency} {car.highestBid.toLocaleString()}</strong>
      {car.lastBid && (
        <span className="recent-bid animate-flash">
          +{car.lastBid.name} bid!
        </span>
      )}
    </div>
    <div className="timer">Time Left: {car.timeLeft}s</div>
    <button onClick={() => onPlaceBid(car)} disabled={car.timeLeft <= 0}>
      {car.timeLeft > 0 ? "Place Bid" : "Auction Ended"}
    </button>
  </div>
);

export default function App() {
  const [cars, setCars] = useState([
    { id: 1, name: "1967 Ford Mustang", highestBid: 2500000, currency: "INR", image: fordImg, timeLeft: 60, history: [], lastBid: null },
    { id: 2, name: "1955 Mercedes-Benz 300SL", highestBid: 7500000, currency: "INR", image: mercedesImg, timeLeft: 60, history: [], lastBid: null },
    { id: 3, name: "1961 Jaguar E-Type", highestBid: 3500000, currency: "INR", image: jaguarImg, timeLeft: 60, history: [], lastBid: null },
    { id: 4, name: "1970 Dodge Charger", highestBid: 2800000, currency: "INR", image: dodgeImg, timeLeft: 60, history: [], lastBid: null },
  ]);

  const [selectedCar, setSelectedCar] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidderName, setBidderName] = useState("You");
  const timerRef = useRef(null);

  // ⏳ Timer + Random bids
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCars(prev =>
        prev.map(car => {
          const newTime = car.timeLeft > 0 ? car.timeLeft - 1 : 0;

          if (Math.random() < 0.2 && newTime > 0) {
            const increase = Math.floor(Math.random() * 100000) + 50000;
            const newBid = car.highestBid + increase;
            return {
              ...car,
              highestBid: newBid,
              timeLeft: newTime,
              lastBid: { name: "Random Bidder", amount: newBid },
              history: [
                { name: "Random Bidder", amount: newBid },
                ...car.history.slice(0, 4),
              ],
            };
          }

          return { ...car, timeLeft: newTime, lastBid: null };
        })
      );
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const openBid = (car) => {
    setSelectedCar(car);
    setBidAmount((car.highestBid + 50000).toString());
  };

  const placeBid = (e) => {
    e.preventDefault();
    if (!selectedCar) return;

    const amount = Number(bidAmount);
    if (isNaN(amount) || amount <= selectedCar.highestBid) {
      alert(`Bid must be higher than current highest bid (${selectedCar.highestBid})`);
      return;
    }

    setCars(prev =>
      prev.map(c =>
        c.id === selectedCar.id
          ? {
              ...c,
              highestBid: amount,
              lastBid: { name: bidderName, amount },
              history: [
                { name: bidderName, amount },
                ...c.history.slice(0, 4),
              ],
            }
          : c
      )
    );

    setSelectedCar(null);
    setBidAmount("");
  };

  const leaderboard = [...cars].sort((a, b) => b.highestBid - a.highestBid);
  const highestBidAmount = Math.max(...cars.map(c => c.highestBid));

  return (
    <div className="container">
      <h1>Vintage Car Auction — Live Leaderboard</h1>
      <p className="subtitle">Simulated updates every second. Place your bids!</p>

      <div className="main-content">
        <div className="car-list">
          <h2>Cars</h2>
          <div className="car-grid">
            {cars.map(car => (
              <CarCard
                key={car.id}
                car={car}
                onPlaceBid={openBid}
                isHighest={car.highestBid === highestBidAmount}
              />
            ))}
          </div>
        </div>

        <div className="leaderboard">
          <h2>Leaderboard</h2>
          <ol>
            {leaderboard.map(car => (
              <li key={car.id}>
                <strong>{car.name}</strong> — {car.currency} {car.highestBid.toLocaleString()}
              </li>
            ))}
          </ol>
        </div>
      </div>

      {selectedCar && (
        <div className="popup-backdrop" onClick={() => setSelectedCar(null)}>
          <form className="popup-form" onSubmit={placeBid} onClick={e => e.stopPropagation()}>
            <h3>Place bid on: {selectedCar.name}</h3>

            <label>Your Name</label>
            <input value={bidderName} onChange={e => setBidderName(e.target.value)} />

            <label>Amount ({selectedCar.currency})</label>
            <input type="number" value={bidAmount} onChange={e => setBidAmount(e.target.value)} />
            <button type="button" onClick={() => setBidAmount(Number(bidAmount) + 50000)}>+50,000</button>

            <h4>Recent Bids:</h4>
            <ul>
              {selectedCar.history.map((h, i) => (
                <li key={i}>
                  {h.name}: {selectedCar.currency} {h.amount.toLocaleString()}
                </li>
              ))}
            </ul>

            <div className="popup-buttons">
              <button type="button" onClick={() => setSelectedCar(null)}>Cancel</button>
              <button type="submit">Submit Bid</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
