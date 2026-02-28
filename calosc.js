window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.body.style.setProperty('--bg-offset', y * 0.15 + 'px');
  document.body.style.setProperty('--hero-offset', y * 0.08 + 'px');
  document.body.style.setProperty('--visual-offset', y * -0.06 + 'px');
  document.body.style.setProperty('--card-offset', y * -0.03 + 'px');
});

const audienceItems = document.querySelectorAll('.audience-item');

audienceItems.forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.classList.add('active');
  });

  item.addEventListener('mouseleave', () => {
    item.classList.remove('active');
  });
});

const CART_KEY = 'nj-cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY)) || [];
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(id) {
  const cart = getCart();

  if (!cart.includes(id)) {
    cart.push(id);
    saveCart(cart);
    updateCartCount();
    alert('Trasa dodana do koszyka');
  } else {
    alert('Ta trasa jest już w koszyku');
  }
}

document.addEventListener('DOMContentLoaded', () => {


  const toggle = document.getElementById('themeToggle');
  if (toggle) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (localStorage.theme === 'dark' || (!localStorage.theme && prefersDark)) {
      document.body.classList.add('dark');
    }

    toggle.addEventListener('click', () => {
      document.body.classList.toggle('dark');
      localStorage.theme =
        document.body.classList.contains('dark') ? 'dark' : 'light';
    });
  }

const cartList = document.getElementById('cartList');

if (cartList) {
  fetch('data/cities.json')
    .then(res => res.json())
    .then(data => {

      const cart = getCart();
      let totalDays = 0;
      let totalPrice = 0;

      cartList.innerHTML = '';

      cart.forEach(item => {

        let title = '';
        let days = 0;
        let price = 0;

        if (typeof item === 'string') {
          const route = data.routes.find(r => r.id === item);
          if (!route) return;

          title = route.title;
          route.cities.forEach(c => {
            days += data.cities[c].days;
            price += data.cities[c].days * data.cities[c].price;
          });
        } else {
          title = 'Trasa indywidualna';
          item.cities.forEach(c => {
            days += data.cities[c].days;
            price += data.cities[c].days * data.cities[c].price;
          });
        }

        totalDays += days;
        totalPrice += price;

        const card = document.createElement('div');
        card.className = 'route-card';
        card.innerHTML = `
          <div class="route-title">${title}</div>
          <div class="route-desc">${days} dni · ${price} PLN</div>
          <div class="route-actions">
            <button class="btn-cart">Usuń</button>
          </div>
        `;

        card.querySelector('button').onclick = () => {
          const updated = cart.filter(i => i !== item);
          saveCart(updated);
          location.reload();
        };

        cartList.appendChild(card);
      });

      document.getElementById('cartDays').textContent = totalDays + ' dni';
      document.getElementById('cartPrice').textContent = totalPrice + ' PLN';
    });
}

const startDateInput = document.getElementById('startDate');
const endDateEl = document.getElementById('endDate');

if (startDateInput) {
  const today = new Date().toISOString().split('T')[0];
  startDateInput.min = today;

  startDateInput.addEventListener('change', () => {
    const start = new Date(startDateInput.value);
    if (isNaN(start)) return;

    const end = new Date(start);
    end.setDate(end.getDate() + totalDays - 1);

    endDateEl.textContent = end.toLocaleDateString('pl-PL');
  });
}

  const seasons = {
    winter: {
      text: "Onseny, śnieg, cisza i zimowe świątynie.",
      image: "images/winter.webp"
    },
    spring: {
      text: "Sakura, klasyczna Japonia i idealny balans.",
      image: "images/spring.webp"
    },
    summer: {
      text: "Festiwale, energia i natura.",
      image: "images/summer.webp"
    },
    autumn: {
      text: "Momiji i kolory gór.",
      image: "images/autumn.webp"
    }
  };

  const seasonBox = document.getElementById('seasonBox');
  const overlay = document.getElementById('seasonOverlay');

  function selectSeason(key) {
    if (!seasons[key]) return;

    document.querySelectorAll('.month').forEach(m => {
      m.classList.toggle('active', m.dataset.season === key);
    });

    if (overlay) {
      overlay.className = 'season-overlay active overlay-' + key;
    }

    if (seasonBox) {
      seasonBox.innerHTML = `
        <p>${seasons[key].text}</p>
        <div class="season-image"
             style="background-image:url('${seasons[key].image}')">
        </div>
      `;
    }
  }

  document.querySelectorAll('.month').forEach(m => {
    m.addEventListener('click', () => {
      selectSeason(m.dataset.season);
    });
  });

  if (document.querySelector('.month')) {
    selectSeason('spring');
  }

  const routesList = document.getElementById('routesList');

  if (routesList) {
    fetch('data/cities.json')
      .then(res => res.json())
      .then(data => {

        routesList.innerHTML = '';

        data.routes.forEach(route => {

          const card = document.createElement('div');
          card.className = 'route-card';
          card.dataset.id = route.id;

          card.innerHTML = `
            <div class="route-city">${route.citySymbol || '旅'}</div>
            <div class="route-title">${route.title}</div>
            <div class="route-desc">${route.desc}</div>
            <div class="route-actions">
              <button class="btn-details">Szczegóły</button>
              <button class="btn-cart">Dodaj do koszyka</button>
            </div>
          `;

          card.querySelector('.btn-details').addEventListener('click', e => {
            e.stopPropagation();
            location.href = `trasa.html?id=${route.id}`;
          });

          card.querySelector('.btn-cart').addEventListener('click', e => {
            e.stopPropagation();
            addToCart(route.id);
          });

          card.addEventListener('click', () => {
            location.href = `trasa.html?id=${route.id}`;
          });

          routesList.appendChild(card);
        });

      })
      .catch(err => {
        console.error(err);
        alert('Błąd ładowania tras');
      });
  }

document.querySelectorAll('.route-card[data-id]').forEach(card => {
  const id = card.dataset.id;

  const detailsBtn = card.querySelector('.btn-details');
  if (detailsBtn) {
    detailsBtn.addEventListener('click', e => {
      e.stopPropagation();
      location.href = `trasa.html?id=${id}`;
    });
  }

  card.addEventListener('click', () => {
    location.href = `trasa.html?id=${id}`;
  });
});

  const routeTitle = document.getElementById('routeTitle');

  if (routeTitle) {
    const routeId = new URLSearchParams(window.location.search).get('id');

    if (!routeId) {
      alert('Nie wybrano trasy');
      return;
    }

    fetch('data/cities.json')
      .then(res => res.json())
      .then(data => {

        const route = data.routes.find(r => r.id === routeId);
        if (!route) {
          alert('Trasa nie istnieje');
          return;
        }

        document.getElementById('routeTitle').textContent = route.title;
        document.getElementById('routeDesc').textContent = route.desc;

        let totalDays = 0;
        let totalPrice = 0;

        const citiesList = document.getElementById('citiesList');
        citiesList.innerHTML = '';

        route.cities.forEach(key => {
          const c = data.cities[key];

          totalDays += c.days;
          totalPrice += c.days * c.price;

          citiesList.innerHTML += `
            <div class="route-card">
              <h3>${c.name}</h3>
              <p>${c.days} dni</p>
              <div class="route-meta">
                💰 ${c.price} PLN / dzień
              </div>
            </div>
          `;
        });

        document.getElementById('sumDays').textContent =
          totalDays + ' dni';

        document.getElementById('sumPrice').textContent =
          totalPrice + ' PLN';

        document.getElementById('addToCartBtn')
          .addEventListener('click', () => {
            addToCart(routeId);
          });

      })
      .catch(err => {
        console.error(err);
        alert('Błąd ładowania danych');
      });
  }

  const citiesList = document.getElementById('citiesList');
  const sumDaysEl = document.getElementById('sumDays');
  const sumPriceEl = document.getElementById('sumPrice');
  const addBtn = document.getElementById('builderAddToCart');

  if (citiesList && addBtn && !routeTitle) {

    let selectedCities = [];

    fetch('data/cities.json')
      .then(res => res.json())
      .then(data => {

        const cities = data.cities;

        Object.keys(cities).forEach(key => {

          const el = document.createElement('div');
          el.className = 'city';
          el.textContent = cities[key].name;

          el.addEventListener('click', () => {
            el.classList.toggle('active');

            if (selectedCities.includes(key)) {
              selectedCities = selectedCities.filter(c => c !== key);
            } else {
              selectedCities.push(key);
            }

            updateSummary();
          });

          citiesList.appendChild(el);
        });

        function updateSummary() {
          let days = 0;
          let price = 0;

          selectedCities.forEach(key => {
            days += cities[key].days;
            price += cities[key].days * cities[key].price;
          });

          sumDaysEl.textContent = days + ' dni';
          sumPriceEl.textContent = price + ' PLN';
        }

        addBtn.addEventListener('click', () => {
          if (selectedCities.length === 0) {
            alert('Wybierz przynajmniej jedno miasto');
            return;
          }

          const cart = getCart();
          cart.push({
            id: 'custom-' + Date.now(),
            type: 'custom',
            cities: selectedCities
          });

          saveCart(cart);
          alert('Twoja trasa została dodana do koszyka');
        });

      })
      .catch(err => {
        console.error(err);
      });
  }
  
  document.querySelectorAll('.faq-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('open');
    });
  });

});

const observer = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });

document.querySelectorAll('.form-card').forEach(el => {
  observer.observe(el);
});

function closeModal() {
  document.getElementById('successModal')?.classList.remove('show');
  document.getElementById('modalBackdrop')?.classList.remove('show');
}


function updateCartCount() {
  const countEl = document.getElementById('cartCount');
  if (!countEl) return;

  const cart = getCart();
  countEl.textContent = cart.length;
}

document.getElementById('checkoutForm').addEventListener('submit', e => {
  e.preventDefault();

  const name  = document.getElementById('clientName').value;
  const email = document.getElementById('clientEmail').value;
  const phone = document.getElementById('clientPhone').value;
  const date  = document.getElementById('departureDate').value;

  if (!date) {
    alert('Wybierz datę wyjazdu');
    return;
  }

  const orderId = 'NJ-' + Date.now();
  const orderDate = new Date().toLocaleDateString('pl-PL');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(192,57,43);
  doc.rect(0,0,210,30,'F');

  doc.setTextColor(255,255,255);
  doc.setFontSize(16);
  doc.text('NIPPON JOURNEYS', 14, 18);

  doc.setFontSize(10);
  doc.text('Autorskie podróże po Japonii', 14, 24);

  let y = 46;
  doc.setTextColor(0,0,0);

  doc.setFontSize(14);
  doc.text('Zamówienie podróży', 14, y);

  y += 12;
  doc.setFontSize(10);
  doc.text(`Numer zamówienia: ${orderId}`, 14, y);
  y += 6;
  doc.text(`Data zamówienia: ${orderDate}`, 14, y);

  y += 12;
  doc.text(`Imię i nazwisko: ${name}`, 14, y);
  y += 6;
  doc.text(`E-mail: ${email}`, 14, y);
  y += 6;
  doc.text(`Telefon: ${phone}`, 14, y);

  y += 10;
  doc.text(`Data wyjazdu: ${date}`, 14, y);

  y += 14;
  doc.setFontSize(12);
  doc.text('Wybrane trasy:', 14, y);

  y += 8;
  doc.setFontSize(10);

  const cart = JSON.parse(localStorage.getItem('nj-cart')) || [];
  cart.forEach((item, i) => {
    doc.text(`• ${item.title || 'Trasa'} (${item.days || ''} dni, ${item.price || ''} PLN)`, 16, y);
    y += 6;
  });

  y += 8;
  doc.setFontSize(12);
  doc.text(`Łącznie dni: ${document.getElementById('cartDays').textContent}`, 14, y);
  y += 6;
  doc.text(`Łączna cena: ${document.getElementById('cartPrice').textContent}`, 14, y);

  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text('Dziękujemy za zaufanie — skontaktujemy się z Tobą wkrótce.', 14, 285);

  doc.save(`Nippon_Journeys_${orderId}.pdf`);
});

document.addEventListener('DOMContentLoaded', () => {

  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('clientName').value.trim();
    const email = document.getElementById('clientEmail').value.trim();
    const phone = document.getElementById('clientPhone').value.trim();
    const startDate = document.getElementById('startDate')?.value;

    if (!name || !email || !phone || !startDate) {
      alert('Uzupełnij wszystkie pola');
      return;
    }

    const cart = getCart();
    if (cart.length === 0) {
      alert('Koszyk jest pusty');
      return;
    }

    const orderNumber = 'NJ-' + Date.now();
    const orderDate = new Date().toLocaleDateString('pl-PL');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    let y = 20;

    doc.setFontSize(16);
    doc.text('Nippon Journeys — Zamówienie', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.text(`Numer zamówienia: ${orderNumber}`, 20, y); y += 6;
    doc.text(`Data zamówienia: ${orderDate}`, 20, y); y += 10;

    doc.text(`Imię i nazwisko: ${name}`, 20, y); y += 6;
    doc.text(`E-mail: ${email}`, 20, y); y += 6;
    doc.text(`Telefon: ${phone}`, 20, y); y += 10;

    doc.text(`Data wyjazdu: ${startDate}`, 20, y); y += 10;

    doc.text('Wybrane trasy:', 20, y); y += 8;

    fetch('data/cities.json')
      .then(res => res.json())
      .then(data => {

        let totalDays = 0;
        let totalPrice = 0;

        cart.forEach(item => {
          if (typeof item === 'string') {
            const route = data.routes.find(r => r.id === item);
            if (!route) return;

            let days = 0;
            let price = 0;

            route.cities.forEach(c => {
              days += data.cities[c].days;
              price += data.cities[c].days * data.cities[c].price;
            });

            totalDays += days;
            totalPrice += price;

            doc.text(`• ${route.title} (${days} dni, ${price} PLN)`, 24, y);
            y += 6;
          }
        });

        y += 8;
        doc.text(`Łącznie dni: ${totalDays}`, 20, y); y += 6;
        doc.text(`Łączna cena: ${totalPrice} PLN`, 20, y);

        doc.save(`zamowienie-${orderNumber}.pdf`);

        localStorage.removeItem('nj-cart');
        alert('Zamówienie zapisane. PDF został pobrany.');
        location.reload();
      });
  });

});
