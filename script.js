// !!! ОБЯЗАТЕЛЬНО ЗАМЕНИ ЭТОТ URL НА ТОЧНЫЙ URL ТВОЕГО БЭКЕНДА НА RAILWAY.APP !!!
// Например: 'https://web-production-2fdfd.up.railway.app'
const BACKEND_URL = 'web-production-2fdfd.up.railway.app';


document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const userDisplay = document.getElementById('user-display');
    const logoutButton = document.getElementById('logout-button');
    const createShopButton = document.getElementById('create-shop-button');
    const shopFormContainer = document.getElementById('shop-form-container');
    const createShopForm = document.getElementById('create-shop-form');
    const messageDiv = document.getElementById('message');
    const marketplaceContent = document.getElementById('marketplace-content');
    const myShopsContent = document.getElementById('my-shops-content');
    const viewMyShopsButton = document.getElementById('view-my-shops-button');
    const backToMarketplaceButton = document.getElementById('back-to-marketplace-button');

    // Проверка наличия токена пользователя при загрузке страницы
    checkUserLoggedIn();
    loadAllShops(); // Загружаем все магазины при загрузке главной страницы

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = registerForm.username.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();
                showMessage(data.message, response.ok ? 'success' : 'error');

                if (response.ok) {
                    registerForm.reset();
                    // Возможно, сразу войти после регистрации
                    // loginForm.email.value = email;
                    // loginForm.password.value = password;
                    // loginForm.requestSubmit();
                }
            } catch (error) {
                console.error('Error during registration:', error);
                showMessage('Ошибка при подключении к серверу.', 'error');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                showMessage(data.message, response.ok ? 'success' : 'error');

                if (response.ok && data.user) {
                    // Сохраняем информацию о пользователе в localStorage
                    localStorage.setItem('user', JSON.stringify(data.user));
                    checkUserLoggedIn(); // Обновляем UI
                    loginForm.reset();
                    document.getElementById('auth-section').style.display = 'none'; // Скрываем формы входа/регистрации
                    document.getElementById('main-content').style.display = 'block'; // Показываем основной контент
                    loadAllShops(); // Перезагружаем магазины
                }
            } catch (error) {
                console.error('Error during login:', error);
                showMessage('Ошибка при подключении к серверу.', 'error');
            }
        });
    }
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('user'); // Удаляем информацию о пользователе
            checkUserLoggedIn(); // Обновляем UI
            document.getElementById('auth-section').style.display = 'block'; // Показываем формы входа/регистрации
            document.getElementById('main-content').style.display = 'none'; // Скрываем основной контент
            marketplaceContent.style.display = 'block';
            myShopsContent.style.display = 'none';
        });
    }

    if (createShopButton) {
        createShopButton.addEventListener('click', () => {
            shopFormContainer.style.display = 'block';
            createShopButton.style.display = 'none';
        });
    }

    if (createShopForm) {
        createShopForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || !user.id) {
                showMessage('Вы должны быть авторизованы для создания витрины.', 'error');
                return;
            }

            const name = createShopForm.shop_name.value;
            const description = createShopForm.shop_description.value;
            const logo_url = createShopForm.shop_logo_url.value;

            try {
                const response = await fetch(`${BACKEND_URL}/api/shops`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ user_id: user.id, name, description, logo_url })
                });

                const data = await response.json();
                showMessage(data.message, response.ok ? 'success' : 'error');

                if (response.ok) {
                    createShopForm.reset();
                    shopFormContainer.style.display = 'none';
                    createShopButton.style.display = 'block';
                    loadAllShops(); // Обновить список магазинов
                }
            } catch (error) {
                console.error('Error creating shop:', error);
                showMessage('Ошибка при подключении к серверу.', 'error');
            }
        });
    }

    if (viewMyShopsButton) {
        viewMyShopsButton.addEventListener('click', () => {
            loadMyShops();
            marketplaceContent.style.display = 'none';
            myShopsContent.style.display = 'block';
        });
    }

    if (backToMarketplaceButton) {
        backToMarketplaceButton.addEventListener('click', () => {
            marketplaceContent.style.display = 'block';
            myShopsContent.style.display = 'none';
            loadAllShops(); // Обновить список всех магазинов
        });
    }

    function checkUserLoggedIn() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.username) {
            userDisplay.textContent = `Добро пожаловать, ${user.username}!`;
            document.getElementById('auth-section').style.display = 'none';
            document.getElementById('main-content').style.display = 'block';
            createShopButton.style.display = 'inline-block';
            logoutButton.style.display = 'inline-block';
            viewMyShopsButton.style.display = 'inline-block';
        } else {
            userDisplay.textContent = '';
            document.getElementById('auth-section').style.display = 'block';
            document.getElementById('main-content').style.display = 'none';
            createShopButton.style.display = 'none';
            logoutButton.style.display = 'none';
            viewMyShopsButton.style.display = 'none';
        }
    }

    async function loadAllShops() {
        try {
            const response = await fetch(`${BACKEND_URL}/api/shops`);
            const shops = await response.json();
            const shopsList = document.getElementById('shops-list');
            shopsList.innerHTML = ''; // Очищаем список перед загрузкой
            if (shops.length === 0) {
                shopsList.innerHTML = '<p>Пока нет доступных витрин.</p>';
                return;
            }

            shops.forEach(shop => {
                const shopCard = document.createElement('div');
                shopCard.className = 'shop-card';
                shopCard.innerHTML = `
                    <img src="${shop.logo_url || 'placeholder.png'}" alt="${shop.name}" class="shop-logo">
                    <h3>${shop.name}</h3>
                    <p>${shop.description}</p>
                    <p>Владелец: ${shop.owner_username}</p>
                    <button data-shop-id="${shop.id}" class="view-shop-btn">Перейти к витрине</button>
                `;
                shopsList.appendChild(shopCard);
            });

            // Добавляем обработчики событий для кнопок "Перейти к витрине"
            document.querySelectorAll('.view-shop-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const shopId = e.target.dataset.shopId;
                    window.location.href = `store.html?shopId=${shopId}`; // Переходим на страницу магазина
                });
            });

        } catch (error) {
            console.error('Error loading all shops:', error);
            showMessage('Ошибка при загрузке витрин.', 'error');
        }
    }

    async function loadMyShops() {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            showMessage('Вы должны быть авторизованы для просмотра своих витрин.', 'error');
            return;
        }

        try {
            const response = await fetch(`${BACKEND_URL}/api/shops/user/${user.id}`);
            const myShops = await response.json();
            const myShopsList = document.getElementById('my-shops-list');
            myShopsList.innerHTML = '';

            if (myShops.length === 0) {
                myShopsList.innerHTML = '<p>У вас пока нет своих витрин.</p>';
                return;
            }

            myShops.forEach(shop => {
                const shopCard = document.createElement('div');
                shopCard.className = 'shop-card';
                shopCard.innerHTML = `
                    <img src="${shop.logo_url || 'placeholder.png'}" alt="${shop.name}" class="shop-logo">
                    <h3>${shop.name}</h3>
                    <p>${shop.description}</p>
                    <button data-shop-id="${shop.id}" class="manage-shop-btn">Управление витриной</button>
                `;
                myShopsList.appendChild(shopCard);
            });

            document.querySelectorAll('.manage-shop-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const shopId = e.target.dataset.shopId;
                    // Здесь можно реализовать модальное окно или переход на страницу управления
                    alert(`Функция управления витриной ID: ${shopId} пока не реализована.`);
                });
            });

        } catch (error) {
            console.error('Error loading my shops:', error);
            showMessage('Ошибка при загрузке ваших витрин.', 'error');
        }
    }

    function showMessage(message, type) {
        if (messageDiv) {
            messageDiv.textContent = message;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }
    }
});