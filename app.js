const edit = document.getElementsByClassName("edit")[0]
const opacity = document.getElementsByClassName("opacity")[0]

document.getElementById('presenca-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;
    const photoInput = document.getElementById('photo');
    const photo = await convertImageToBase64(photoInput.files[0]);

    navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };

        try {
            const response = await fetch('http://127.0.0.1:3000/api/presencas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, location, photo })
            });

            if (response.ok) {
                document.getElementById('presenca-form').reset();
                fetchPresencas();
            } else {
                console.error('Erro ao adicionar presença:', response.statusText);
            }
        } catch (error) {
            console.error('Erro ao conectar com a API:', error);
        }
    });
});

const submit = document.getElementById("submit-edit")
submit.addEventListener("click", async (e) => {
    const name = document.getElementById("name-edit")
    const description = document.getElementById("description-edit")
    const photoInput = document.getElementById("photo-edit")
    let photo = undefined
    try {
        photo = await convertImageToBase64(photoInput.files[0]);
    } catch (error) {}
    navigator.geolocation.getCurrentPosition(async (position) => {
        const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        };
        
        await fetch(`http://127.0.0.1:3000/api/presencas/${edit.getAttribute("data-id")}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({name: name.value, description: description.value, photo: photo, location})
        })


        fetchPresencas()
    })
})

async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

const createDeleteButton = (presenca) => {
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Deletar"
    deleteButton.style = `
        background-color: red;
        border: none;
        border-radius: 5px;
        padding: 10px;
        color: white;
        font-family: Inter;
        font-weight: 600;
    `

    deleteButton.addEventListener("click", async (e) => {
        await fetch(`http://127.0.0.1:3000/api/presencas/${presenca._id}`, {
            method:"DELETE",
        })
        fetchPresencas()
    })
    return deleteButton
}

const createEditButton = (item, presenca) => {
    const editButton = document.createElement("button");
    editButton.innerText = "Editar"
    editButton.style = `
        background-color: #03fc17;
        border: none;
        border-radius: 5px;
        padding: 10px;
        color: white;
        font-family: Inter;
        font-weight: 600;
    `


    editButton.addEventListener("click", (e) => {
        const name = document.getElementById("name-edit")
        const description = document.getElementById("description-edit")
        edit.setAttribute("data-id", presenca._id)
        name.value = presenca.name
        description.value = presenca.description
        opacity.style.visibility = "visible";
        edit.style.visibility = "visible";

    })


        opacity.addEventListener("click", (e) => {
            edit.style.visibility = "hidden";
            opacity.style.visibility = "hidden";
        })

    return editButton
}

async function fetchPresencas() {
    try {
        const response = await fetch('http://127.0.0.1:3000/api/presencas');
        if (!response.ok) {
            throw new Error('Erro ao buscar presenças');
        }
        const presencas = await response.json();
        const list = document.getElementById('presencas-list');
        list.innerHTML = '';
        presencas.forEach(p => {
            const item = document.createElement('div');
            item.innerHTML = `
                <h3>${p.name}</h3>
                <p>${p.description}</p>
                <img src="${p.photo}" alt="${p.name}" style="max-width: 100%; height: auto;">
            `;
            list.appendChild(item);
            const buttons = document.createElement("div")
            buttons.style = `display: flex; gap: 8px;`

            const deleteButton = createDeleteButton(p)
            const editButton = createEditButton(item, p)

            buttons.appendChild(deleteButton)
            buttons.appendChild(editButton)
            item.appendChild(buttons)

        });
    } catch (error) {
        console.error('Erro ao carregar presenças:', error);
    }
}

fetchPresencas();
