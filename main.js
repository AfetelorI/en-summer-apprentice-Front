//import {kebabCase, addPurchase} from  './src/utils';
// Navigate to a specific URL
function navigateTo(url) {
  history.pushState(null, null, url);
  renderContent(url);
}

// HTML templates
function getHomePageTemplate() {
  return `
    <div id="content" >
      <img src="./src/assets/Endava.png" alt="summer">
      <div class="events flex items-center justify-center flex-wrap">
      </div>
    </div>
  `;
}

function getOrdersPageTemplate() {
  return `
    <div id="content">
      <h1 class="text-2xl mb-4 mt-8 text-center">Purchased Tickets</h1>
    </div>
  `;
}

function setupNavigationEvents() {
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const href = link.getAttribute('href');
      navigateTo(href);
    });
  });
}

function setupMobileMenuEvent() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupPopstateEvent() {
  window.addEventListener('popstate', () => {
    const currentUrl = window.location.pathname;
    renderContent(currentUrl);
  });
}

function setupInitialPage() {
  const initialUrl = window.location.pathname;
  renderContent(initialUrl);
}

async function fetchTicketEvents() {
  const response = await fetch('https://localhost:7108/api/Event/GetAll');
  const data = await response.json();
  return data;
}

// 
// const createEvent = (eventData) => {
//   const title = kebabCase(eventData.eventType.name);
//   const eventElement = createEventElement(eventData,title);
//   return eventElement;
// };

// const createEventElement = (eventData, title) =>{
//   const {eventID, eventDescription, eventName, startDate, endDate } = eventData;
//   const eventDiv = document.createElement('div');
//   const eventWrapperClasses = useStyle('eventWrapper');
//   const actionWrapperClasses = useStyle('actionWrapper');
//   const quantityClasses = useStyle('quantity');
//   const inputClasses = useStyle('input');
//   const quantityActionsClasses = useStyle('quantityActions');
//   const increaseBtnClasses = useStyle('increaseBtn');
//   const decreaseBtnClasses = useStyle('decreaseBtn');
//   const addToCartBtnClasses = useStyle('addToCartBtn');



// eventDiv.classList.add(...eventWrapperClasses);
// }



function renderHomePage(eventsData) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getHomePageTemplate();

  const eventsContainer = document.querySelector('.events');

  eventsData.forEach(eventData => {
    const eventCard = document.createElement('div');
    eventCard.classList.add('event-card');

    const contentMarkup = `
    <header>
    <h2 class="event-title text-2xl font-bold">${eventData.eventName}</h2>
  </header>
  <div class="content">
    <div class="info-column">
      <p class="description text-gray-700">${eventData.eventDescription}</p>
      <button class="buy-button bg-blue-500 text-white px-4 py-2 rounded mt-4">Buy Tickets</button>
    </div>
  </div>
    `;

    eventCard.innerHTML = contentMarkup;
    eventsContainer.appendChild(eventCard);
  });
}






function renderOrdersPage() {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = getOrdersPageTemplate();
}

// Render content based on URL
async function renderContent(url) {
  const mainContentDiv = document.querySelector('.main-content-component');
  mainContentDiv.innerHTML = '';

  if (url === '/') {
    const eventsData = await fetchTicketEvents();
    renderHomePage(eventsData);
  } else if (url === '/orders') {
    renderOrdersPage();
  }
}


// Call the setup functions
setupNavigationEvents();
setupMobileMenuEvent();
setupPopstateEvent();
setupInitialPage();