const seatMap = document.getElementById('seat-map');
const bookBtn = document.getElementById('book-btn');
const totalSeats = 34;
const apiBase = 'https://library-backend-r2qu.onrender.com'; // ✅ Your deployed backend

function renderSeats(bookedSeats) {
  seatMap.innerHTML = '';
  for (let i = 1; i <= totalSeats; i++) {
    const seat = document.createElement('div');
    seat.classList.add('seat');

    const seatId = `S${i}`;
    seat.dataset.seatId = seatId;

    if (bookedSeats.includes(seatId)) {
      seat.classList.add('booked');
    } else {
      seat.classList.add('available');
      seat.addEventListener('click', () => {
        seat.classList.toggle('selected');
      });
    }

    seat.innerText = i;
    seatMap.appendChild(seat);
  }
}

// Load booked seats from backend
async function loadBookedSeats() {
  const date = document.getElementById('date').value;
  const shift = document.getElementById('shift').value;
  if (!date || !shift) return;

  try {
    const res = await fetch(`${apiBase}/api/bookings?date=${date}&shift=${shift}`);
    const data = await res.json();
    renderSeats(data);
  } catch (err) {
    console.error('Failed to load booked seats', err);
    alert('Error loading seat availability.');
  }
}

// Handle booking
bookBtn.addEventListener('click', async () => {
  const selectedSeats = [...document.querySelectorAll('.seat.selected')].map(seat => seat.dataset.seatId);
  const date = document.getElementById('date').value;
  const shift = document.getElementById('shift').value;

  if (!date || !shift || selectedSeats.length === 0) {
    alert('Please select date, shift, and at least one seat.');
    return;
  }

  try {
    const res = await fetch(`${apiBase}/api/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date, shift, seats: selectedSeats })
    });

    const result = await res.json();

    if (res.ok) {
      alert('✅ Seats booked successfully!');
      loadBookedSeats(); // Refresh UI
    } else {
      alert('❌ Some seats already booked: ' + result.alreadyBooked.join(', '));
      loadBookedSeats();
    }
  } catch (err) {
    console.error('Booking failed:', err);
    alert('Failed to book seats.');
  }
});

// Reload seats when date or shift changes
document.getElementById('date').addEventListener('change', loadBookedSeats);
document.getElementById('shift').addEventListener('change', loadBookedSeats);
