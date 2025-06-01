const seatMap = document.getElementById('seat-map');
const bookBtn = document.getElementById('book-btn');
const totalSeats = 34;

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

async function loadBookedSeats() {
  const date = document.getElementById('date').value;
  const shift = document.getElementById('shift').value;
  if (!date || !shift) return;

  try {
    const res = await fetch(`https://library-backend-r2qu.onrender.com/api/bookings?date=${date}&shift=${shift}`);
    const data = await res.json();
    renderSeats(data);
  } catch (err) {
    console.error('Failed to load booked seats', err);
    alert('Error loading seat availability.');
  }
}

bookBtn.addEventListener('click', async () => {
  const selectedSeats = [...document.querySelectorAll('.seat.selected')].map(seat => seat.dataset.seatId);
  const date = document.getElementById('date').value;
  const shift = document.getElementById('shift').value;

  if (!date || !shift || selectedSeats.length === 0) {
    alert('Please select date, shift, and at least one seat.');
    return;
  }

  try {
    const res = await fetch('https://library-backend-r2qu.onrender.com/api/book', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date, shift, seats: selectedSeats })
    });

    const result = await res.json();

    if (res.ok) {
      alert('✅ Seats booked successfully!');
      loadBookedSeats();
    } else {
      alert('❌ ' + result.message + ': ' + result.alreadyBooked.join(', '));
      loadBookedSeats();
    }
  } catch (err) {
    console.error('Booking failed:', err);
    alert('Failed to book seats.');
  }
});

document.getElementById('date').addEventListener('change', () => {
  loadBookedSeats();
  updateEndDate();
});

document.getElementById('shift').addEventListener('change', loadBookedSeats);

// Membership end date auto-calculate
const membership = document.getElementById('membership');
const startDate = document.getElementById('date');
const endDate = document.getElementById('end-date');

function updateEndDate() {
  const start = new Date(startDate.value);
  const months = parseInt(membership.value);
  if (!isNaN(start.getTime()) && months) {
    const end = new Date(start);
    end.setMonth(end.getMonth() + months);
    endDate.value = end.toISOString().split('T')[0];
  }
}

membership.addEventListener('change', updateEndDate);
