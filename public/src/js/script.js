document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM que são utilizados
  const modal = document.getElementById("guest-modal"); // Modal de adicionar/editar convidado
  const closeModal = document.querySelector('.close'); // Botão para fechar o modal
  const form = document.getElementById('guest-form'); // Formulário para adicionar/editar convidado
  const addGuestButton = document.getElementById('add-guest'); // Botão para abrir o modal e adicionar um convidado
  const guestList = document.getElementById('guest-list'); // Lista de convidados exibida na tela
  const searchInput = document.getElementById('search-bar'); // Campo de pesquisa
  const chartsSection = document.getElementById('charts-section'); // Seção com gráficos
  const guestsSection = document.getElementById('guests-section'); // Seção com a lista de convidados
  const viewGuestsBtn = document.getElementById('viewGuestsBtn'); // Botão para alternar para a lista de convidados
  const backToChartsBtn = document.getElementById('backToChartsBtn'); // Botão para voltar para a seção de gráficos
  let isEditing = false; // Flag que indica se estamos editando um convidado
  let guests = []; // Lista de convidados

  // Função para carregar e exibir convidados
  async function loadGuests(searchTerm = '') {
    try {
      const response = await fetch('/guests'); // Requisição para buscar todos os convidados
      if (response.ok) {
        guests = await response.json(); // Converte a resposta para um objeto JSON
        guestList.innerHTML = ''; // Limpa a lista de convidados exibida

        // Filtra os convidados pelo nome com base no termo de busca
        const filteredGuests = guests.filter(guest =>
          guest.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Exibe os convidados filtrados
        filteredGuests.forEach((guest, index) => {
          const guestBox = document.createElement('div');
          guestBox.className = 'guest-box'; // Adiciona a classe para cada convidado
          guestBox.innerHTML = `
            <div class="info-user">
              <span><strong>${index + 1}:</strong></span>
              <span><strong>Nome:</strong> ${guest.name}</span>
              <span><strong>Idade:</strong> ${guest.age}</span>
              <span><strong>Sexo:</strong> ${guest.sexo || 'N/A'}</span> <!-- Exibe o sexo (se houver) -->
              <span><strong>Telefone:</strong> ${guest.telefone || 'N/A'}</span> <!-- Exibe telefone (se houver) -->
              <span><strong>Email:</strong> ${guest.email || 'N/A'}</span> <!-- Exibe email (se houver) -->
              <span><strong>Endereço:</strong> ${guest.endereco || 'N/A'}</span> <!-- Exibe endereço (se houver) -->
            </div>
            <div class="icons">
              <button class="edit" data-id="${guest._id}">Editar</button> <!-- Botão para editar -->
              <button class="delete" data-id="${guest._id}">Excluir</button> <!-- Botão para excluir -->
            </div>
          `;
          guestList.appendChild(guestBox);// Adiciona o convidado à lista

          // Evento para deletar o convidado
          guestBox.querySelector('.delete').addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            await fetch(`/guests/${id}`, { method: 'DELETE' }); // Deleta o convidado no servidor
            loadGuests(); // Recarrega a lista de convidados
          });

          // Evento para editar o convidado
          guestBox.querySelector('.edit').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const guestToEdit = guests.find(g => g._id === id); // Encontra o convidado a ser editado
            // Preenche o formulário com os dados do convidado a ser editado
            document.getElementById('name').value = guestToEdit.name;
            document.getElementById('age').value = guestToEdit.age;
            document.getElementById('telefone').value = guestToEdit.telefone || '';
            document.getElementById('email').value = guestToEdit.email || '';
            document.getElementById('endereco').value = guestToEdit.endereco || '';
            document.getElementById('guest-id').value = guestToEdit._id;
            modal.style.display = 'flex'; // Exibe o modal
            isEditing = true; // Define que estamos editando
          });
        });
      } else {
        console.error('Erro ao carregar convidados.'); // Caso ocorra algum erro na requisição
      }
    } catch (error) {
      console.error('Erro ao carregar convidados:', error); // Log de erro caso o fetch falhe
    }
  }

  // Função para gerar gráficos
  async function generateCharts() {
    try {
      const response = await fetch('/guest-stats'); // Fazendo requisição para pegar as estatísticas dos convidados
      if (response.ok) {
        const stats = await response.json(); // A variável stats contém as estatísticas

        // Desestrutura as estatísticas
        const totalGuests = stats.totalGuests;
        const adults = stats.adults;
        const minors = stats.minors;
        const maleGuests = stats.maleGuests;
        const femaleGuests = stats.femaleGuests;
        const monthlyData = stats.monthlyData;

        // Geração dos gráficos
        new Chart(document.getElementById('totalGuestsChart'), {
          type: 'pie',
          data: {
            labels: ['Quantidade de usuários'],
            datasets: [{
              data: [totalGuests],
              backgroundColor: ['#661b04'],
            }]
          },
          options: { responsive: true }
        });

        // Gráfico de divisão por idade
        new Chart(document.getElementById('ageGroupChart'), {
          type: 'bar',
          data: {
            labels: ['Maiores de 18', 'Menores de 18'],
            datasets: [{
              data: [adults, minors],
              backgroundColor: ['#e5d29c', '#661b04'],
            }]
          },
          options: { responsive: true }
        });

        // Gráfico de Gênero
        new Chart(document.getElementById('genderStatsChart'), {
          type: 'pie',
          data: {
            labels: ['Masculino', 'Feminino'],
            datasets: [{
              data: [maleGuests || 0, femaleGuests || 0], // Caso não tenha dados, define como 0
              backgroundColor: ['#661b04', '#e5d29c'],
            }]
          },
          options: { responsive: true }
        });

        // Gráfico de usuários cadastrados por mês (barra)
        new Chart(document.getElementById('monthlyStatsChart'), {
          type: 'bar',
          data: {
            labels: monthlyData.labels,
            datasets: [{
              label: 'Usuários Cadastrados',
              data: monthlyData.data,
              backgroundColor: '#661b04',
            }]
          },
          options: { responsive: true }
        });

        // Para debug: Mostra estatísticas no console
        console.log('Estatísticas:', stats);
      } else {
        console.error('Erro ao obter estatísticas dos convidados.'); // Caso haja erro ao pegar estatísticas
      }
    } catch (error) {
      console.error('Erro ao gerar gráficos:', error); // Log de erro
    }
  }

  // Evento para alternar para a lista de convidados
  viewGuestsBtn.addEventListener('click', () => {
    chartsSection.style.display = 'none'; // Oculta os gráficos
    guestsSection.style.display = 'block'; // Exibe a lista de convidados
  });

  // Evento para voltar para a seção de gráficos
  backToChartsBtn.addEventListener('click', () => {
    guestsSection.style.display = 'none'; // Oculta a lista de convidados
    chartsSection.style.display = 'block'; // Exibe os gráficos
  });

  // Adiciona evento de entrada para a barra de pesquisa
  searchInput.addEventListener('input', () => {
    loadGuests(searchInput.value); // Atualiza a lista de convidados com base no termo de pesquisa
  });

  // Abre o modal para adicionar um convidado
  addGuestButton.addEventListener('click', () => {
    form.reset(); // Reseta o formulário
    modal.style.display = "flex"; // Exibe o modal
    isEditing = false; // Define que não estamos editando
  });

  // Fecha o modal
  closeModal.addEventListener('click', () => {
    modal.style.display = "none"; // Oculta o modal
  });

  // Adiciona ou edita um convidado
  form.addEventListener('submit', async (e) => {
    e.preventDefault(); // Impede o comportamento padrão de envio do formulário
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const telefone = document.getElementById('telefone').value;
    const email = document.getElementById('email').value;
    const endereco = document.getElementById('endereco').value;
    const guestId = document.getElementById('guest-id').value;

    if (!name || !age) { // Valida se os campos obrigatórios estão preenchidos
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const guestData = {
      name,
      age,
      telefone,
      email,
      endereco,
      sexo: document.getElementById('sexo').value // Adicionando o campo sexo
    };
    
    try {
      let response;
      // Se estamos editando, faz a requisição PUT, caso contrário faz um POST
      if (isEditing) {
        response = await fetch(`/guests/${guestId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(guestData)
        });
      } else {
        response = await fetch('/guests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(guestData)
        });
      }

      // Caso a requisição seja bem-sucedida
      if (response.ok) {
        alert(isEditing ? 'Convidado atualizado com sucesso!' : 'Convidado adicionado com sucesso!');
        modal.style.display = "none"; // Fecha o modal
        loadGuests(); // Recarrega a lista de convidados
      } else {
        alert('Erro ao salvar convidado. Tente novamente.'); // Caso ocorra erro na requisição
      }
    } catch (error) {
      console.error('Erro ao salvar convidado:', error); // Erro no fetch
      alert('Erro ao salvar convidado. Verifique a conexão com o servidor.');
    }
  });

  // Função para gerar CSV
  function downloadCSV(guests) {
    // Cabeçalhos do CSV
    const headers = ['Nome', 'Idade', 'Sexo', 'Telefone', 'Email', 'Endereço'];
    
    // Mapeia os dados dos convidados para o formato CSV
    const rows = guests.map(guest => [
      guest.name, 
      guest.age, 
      guest.sexo, 
      guest.telefone || '', 
      guest.email || '', 
      guest.endereco || ''
    ]);
    
    // Adiciona os cabeçalhos
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    
    // Cria um link temporário para fazer o download
    const link = document.createElement('a');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'lista_de_convidados.csv');
    link.click();
  }

  // Evento do botão de download
  document.getElementById('downloadBtnCSV').addEventListener('click', () => {
    downloadCSV(guests); // Passa a lista de convidados para gerar o CSV
  });

  // Função para gerar o PDF
  function gerarPDF(guests) {
    const { jsPDF } = window.jspdf; // Acessa o jsPDF

    // Cria uma nova instância do jsPDF
    const doc = new jsPDF();
    
    // Cabeçalhos da tabela
    const headers = ['Nome', 'Idade', 'Sexo', 'Telefone', 'Email', 'Endereço'];

    // Mapeia os dados dos convidados para as linhas da tabela
    const rows = guests.map(guest => [
      guest.name, 
      guest.age, 
      guest.sexo, 
      guest.telefone || '', 
      guest.email || '', 
      guest.endereco || ''
    ]);

    // Adiciona o título ao PDF
    doc.setFontSize(18);
    doc.text('Lista de Convidados', 14, 20);

    // Adiciona a tabela ao PDF
    doc.autoTable({
      head: [headers], // Cabeçalhos da tabela
      body: rows, // Dados da tabela
      startY: 30, // Posição de início da tabela
      margin: { horizontal: 10 }, // Margem horizontal
      theme: 'grid', // Tema da tabela
    });

    // Gera o PDF e faz o download
    doc.save('lista_de_convidados.pdf');
  }

  // Evento do botão de download para gerar o PDF
  document.getElementById('downloadBtnPDF').addEventListener('click', () => {
    gerarPDF(guests); // Passa a lista de convidados para gerar o PDF
  });


  loadGuests(); // Carrega os convidados ao carregar a página
  generateCharts(); // Gera os gráficos
});

  // Função para alternar o menu mobile
  function toggleMenu() {
    const menu = document.querySelector('.navbar .menu ul');
    menu.classList.toggle('show');
  }
  