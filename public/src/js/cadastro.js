document.getElementById('cadastro-form').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const endereco = document.getElementById('endereco').value;
    const sexo = document.getElementById('sexo').value;
  
    const guestData = { name, age, telefone, email, endereco, sexo };
  
    try {
      const response = await fetch('/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestData),
      });
  
      if (response.ok) {
        document.querySelector('.overlay').style.display = 'block';
        document.querySelector('.modal-sucess').style.display = 'flex';
        
        // Opcional: Fechar o modal após 3 segundos
        setTimeout(() => {
          document.querySelector('.modal-sucess').style.display = 'none';
          window.location.href = '/'; // Redireciona para a página principal após o cadastro
        }, 3000);
        
      } else {
        document.querySelector('.modal-error').style.display = 'flex';
        document.querySelector('.overlay').style.display = 'block';

        setTimeout(() => {
            document.querySelector('.modal-error').style.display = 'none';
            window.location.href = '/cadastro'; // Redireciona para a página principal após o cadastro
          }, 3000);
      }
    } catch (error) {
      console.error('Erro ao enviar os dados:', error);
      alert('Erro ao cadastrar convidado. Verifique a conexão.');
    }
});

  
  // Função para alternar o menu mobile
  function toggleMenu() {
    const menu = document.querySelector('.navbar .menu ul');
    menu.classList.toggle('show');
  }
  
  // Função para rolar até o topo
  function scrollUp() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  
  // Exibir o botão de scroll up ao rolar a página
  window.onscroll = function() {
    const scrollUpBtn = document.getElementById('scrollUpBtn');
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
      scrollUpBtn.style.display = 'block';
    } else {
      scrollUpBtn.style.display = 'none';
    }
  };
  
  // Inicializar VLibras
  new window.VLibras.Widget('vlibras-container');
  
  