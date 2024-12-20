document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById("guest-modal");
  const closeModal = document.querySelector('.close');
  const form = document.getElementById('guest-form');
  const addGuestButton = document.getElementById('add-guest');
  const guestList = document.getElementById('guest-list');
  const searchInput = document.getElementById('search-bar');
  let isEditing = false;
  let guests = []; // Declare a variável guests aqui

  // Função para carregar e exibir convidados
  async function loadGuests(searchTerm = '') {
    try {
      const response = await fetch('/guests'); // Ajuste aqui para seu endpoint
      if (response.ok) {
        guests = await response.json(); // Armazena os convidados
        guestList.innerHTML = ''; // Limpa a lista de convidados

        const filteredGuests = guests.filter(guest =>
          guest.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        filteredGuests.forEach((guest, index) => {
          const guestBox = document.createElement('div');
          guestBox.className = 'guest-box';
          guestBox.innerHTML = `
            <div>
              <span><strong>${index + 1}:</strong></span>
              <span><strong>Nome:</strong> ${guest.name}</span>
              <span><strong>Idade:</strong> ${guest.age}</span>
            </div>
            <div>
              <i class="fas fa-edit"><button class="edit" data-id="${guest._id}">Editar</button></i>
              <i class="fas fa-trash"><button class="delete" data-id="${guest._id}">Excluir</button></i>
            </div>
          `;
          guestList.appendChild(guestBox);

          // Remove um convidado
          guestBox.querySelector('.delete').addEventListener('click', async (e) => {
            const id = e.target.getAttribute('data-id');
            await fetch(`/guests/${id}`, { method: 'DELETE' });
            loadGuests(); // Recarrega a lista de convidados
          });

          // Edita um convidado
          guestBox.querySelector('.edit').addEventListener('click', (e) => {
            const id = e.target.getAttribute('data-id');
            const guestToEdit = guests.find(g => g._id === id);
            document.getElementById('name').value = guestToEdit.name;
            document.getElementById('age').value = guestToEdit.age;
            document.getElementById('guest-id').value = guestToEdit._id; // Preenche o campo oculto
            modal.style.display = 'flex'; // Exibe o modal
            isEditing = true;  // Define o modo como editar
          });
        });
      } else {
        console.error('Erro ao carregar convidados.');
      }
    } catch (error) {
      console.error('Erro ao carregar convidados:', error);
    }
  }

  // Adiciona evento de entrada para a barra de pesquisa
  searchInput.addEventListener('input', () => {
    loadGuests(searchInput.value); // Atualiza a lista conforme o input
  });

  // Abre o modal para adicionar um convidado
  addGuestButton.addEventListener('click', () => {
    form.reset();
    modal.style.display = "flex";
    isEditing = false;
  });

  // Fecha o modal
  closeModal.addEventListener('click', () => {
    modal.style.display = "none";
  });

  // Adiciona ou edita um convidado
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const age = document.getElementById('age').value;
    const guestId = document.getElementById('guest-id').value;

    if (!name || !age) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    const guestData = {
      name: name,
      age: age
    };

    try {
      let response;
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

      if (response.ok) {
        alert(isEditing ? 'Convidado atualizado com sucesso!' : 'Convidado adicionado com sucesso!');
        modal.style.display = "none";
        loadGuests(); // Recarrega a lista de convidados
      } else {
        alert('Erro ao salvar convidado. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao salvar convidado:', error);
      alert('Erro ao salvar convidado. Verifique a conexão com o servidor.');
    }
  });

  loadGuests(); // Carrega os convidados ao carregar a página
});
