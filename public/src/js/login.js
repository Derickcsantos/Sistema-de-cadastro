document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o envio do formulário padrão
  
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Login bem-sucedido
        showModal(data.message); // Exibe o modal com a mensagem de sucesso
        setTimeout(() => {
          window.location.href = '/admin'; // Redireciona para a página admin
        }, 2000); // Atraso para o usuário ver a mensagem de sucesso
      } else {
        // Se o login falhar, exibe a mensagem de erro
        showModal(data.error); // Exibe o modal com a mensagem de erro
      }
    } catch (err) {
      showModal('Erro ao tentar fazer login!'); // Exibe o modal de erro genérico
      console.error(err);
    }
  });
  
  // Função para exibir o modal com uma mensagem personalizada
  function showModal(message) {
    const modal = document.getElementById('modal');
    const modalMessage = document.getElementById('modalMessage');
    modalMessage.textContent = message; // Atualiza a mensagem do modal
    modal.style.display = 'flex'; // Exibe o modal
  }
  
  // Função para fechar o modal
  function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none'; // Fecha o modal
  }
  