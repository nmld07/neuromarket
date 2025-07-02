document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    const registerMessage = document.getElementById('registerMessage');
    const loginMessage = document.getElementById('loginMessage');

    // Функция для отображения сообщений
    const showMessage = (element, message, type) => {
        element.textContent = message;
        element.className = `message ${type}`;
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
        }, 5000);
    };

    // Проверяем, авторизован ли пользователь. Если да, перенаправляем на store.html
    const checkAuthAndRedirect = () => {
        const userId = localStorage.getItem('userId');
        if (userId) {
            window.location.href = '/store.html'; // Перенаправляем на главную витрину
        }
    };

    // Вызываем проверку при загрузке страницы
    checkAuthAndRedirect();

    // Обработчик формы регистрации
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Предотвращаем стандартную отправку формы

            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(registerMessage, data.message + ' Теперь вы можете войти.', 'success');
                    registerForm.reset(); // Очистить форму
                } else {
                    showMessage(registerMessage, data.message || 'Ошибка регистрации.', 'error');
                }
            } catch (error) {
                console.error('Ошибка при отправке запроса на регистрацию:', error);
                showMessage(registerMessage, 'Произошла ошибка сети. Попробуйте позже.', 'error');
            }
        });
    }

    // Обработчик формы входа
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Предотвращаем стандартную отправку формы

            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    showMessage(loginMessage, data.message, 'success');
                    // Сохраняем имя пользователя и ID в localStorage
                    localStorage.setItem('username', data.user.username);
                    localStorage.setItem('userId', data.user.id); // <--- ВАЖНО: сохраняем ID пользователя
                    loginForm.reset(); // Очистить форму
                    // Перенаправляем на основную страницу витрины
                    window.location.href = '/store.html'; // <--- ПЕРЕНАПРАВЛЕНИЕ
                } else {
                    showMessage(loginMessage, data.message || 'Ошибка входа.', 'error');
                }
            } catch (error) {
                console.error('Ошибка при отправке запроса на вход:', error);
                showMessage(loginMessage, 'Произошла ошибка сети. Попробуйте позже.', 'error');
            }
        });
    }
});