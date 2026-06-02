/**
 * Local storage
 */
let transacciones = JSON.parse(localStorage.getItem("transacciones")) || [];

/**
 * Elementos de la maqueta HTML.
 */
const listaTransacciones = document.getElementById("listaTransacciones");
const totalIngresos = document.getElementById("totalIngresos");
const totalGastos = document.getElementById("totalGastos");
const saldoFinal = document.getElementById("saldoFinal");
const ingresoForm = document.getElementById("ingresoForm");
const gastoForm = document.getElementById("gastoForm");
let ingresoFecha = document.getElementById("ingresoFecha");
let gastoFecha = document.getElementById("gastoFecha");

/**
 * Variables
 */
let chart;
const coloresCategory = {
    "Arriendo": "#FFCE56",
    "Comida": "#FF6384",
    "Transporte": "#36A2EB",
    "Salud": "#4BC0C0",
    "Entretención": "#9966FF",
    "Servicios": "#FF9F40",
    "Devolución Préstamo": "#42f867",
    "Otros": "#8D99AE"
};

/**
 * Fecha Actual formato Chile
 */
ingresoFecha = new Date().toLocaleDateString('es-CL');
gastoFecha = new Date().toLocaleDateString('es-CL');

/**
 * FORMULARIO DE INGRESOS
 */
ingresoForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const transaccion = {

        id: Date.now(),
        type: "income",
        category: document.getElementById("ingresoCategoria").value,
        description: document.getElementById("ingresoDescripcion").value,
        amount: Number(document.getElementById("ingresoMonto").value),
        date: document.getElementById("ingresoFecha").value

    };

    transacciones.push(transaccion);

    guardarTransaccion();

    ingresoForm.reset();

    // document.getElementById("ingresoFecha").valueAsDate = new Date();

    render();

});

/**
 * FORMULARIO DE GASTOS
 */
gastoForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const transaccion = {

        id: Date.now(),
        type: "expense",
        category: document.getElementById("gastoCategoria").value,
        description: document.getElementById("gastoDescripcion").value,
        amount: Number(document.getElementById("gastoMonto").value),
        date: document.getElementById("gastoFecha").value

    };

    transacciones.push(transaccion);

    guardarTransaccion();

    gastoForm.reset();

    // document.getElementById("gastoFecha").valueAsDate = new Date();

    render();

});

function guardarTransaccion() {

    localStorage.setItem(
        "transacciones",
        JSON.stringify(transacciones)
    );

}

function render() {

    modelarTransacciones();

    modelarTotales();

    modelarGrafico();

}

function modelarTransacciones() {

    listaTransacciones.innerHTML = "";

    transacciones
        .sort((a, b) =>
            new Date(b.date) - new Date(a.date)
        )
        .forEach(transaction => {

            const tr = document.createElement("tr");

            tr.innerHTML = `

                <td>
                    ${transaction.type === "income"
                        ?`<span class="badge badge-income">Ingreso</span>`
                        :`<span class="badge badge-expense">Gasto</span>`
                    }
                </td>

                <td>${transaction.category}</td>

                <td>${transaction.description}</td>

                <td class="${transaction.type === "income" ? "money-positive" : "money-negative"}">

                    ${transaction.type === "income" ? "+" : "-"}

                    ${formatoDinero(transaction.amount)}
                </td>

                <td>${transaction.date}</td>

                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="eliminarTransaccion(${transaction.id})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>

            `;

            listaTransacciones.appendChild(tr);

        });

}

function modelarTotales() {

    let ingresos = 0;
    let gastos = 0;

    for(const t of transacciones){
        if(t.type === "income"){
            ingresos += t.amount;
        }
    }

    for(const t of transacciones){
        if(t.type === "expense"){
            gastos += t.amount;
        }
    }

    // Otra forma de hacerlo.
    /*
    const ingresos = transacciones
        .filter(t => t.type === "income")
        .reduce((acc, t) => acc + t.amount, 0);

    const gastos = transacciones
        .filter(t => t.type === "expense")
        .reduce((acc, t) => acc + t.amount, 0);
    */

    const total = ingresos - gastos;

    totalIngresos.textContent = formatoDinero(ingresos);

    totalGastos.textContent = formatoDinero(gastos);

    saldoFinal.textContent = formatoDinero(total);

    saldoFinal.className = total >= 0 ? "money-positive" : "money-negative";

}

function modelarGrafico() {

    const gastos = transacciones.filter(
        t => t.type === "expense"
    );

    const grouped = {};

    gastos.forEach(expense => {

        if (!grouped[expense.category]) {
            grouped[expense.category] = 0;
        }

        grouped[expense.category] += expense.amount;

    });

    const labels = Object.keys(grouped);

    const data = Object.values(grouped);

    const ctx = document.getElementById("expenseChart");

    if (chart) {
        chart.destroy();
    }

    /**
     * Definir colores de cada categoría
     */
    const colors = labels.map(label =>
        coloresCategory[label] || "#6C757D"
    );

    chart = new Chart(ctx, {

        type: "bar", //pie

        data: {
            labels: labels,
            datasets: [{
                label: "Categorías",
                data: data,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                }
            },
        }

    });

}

function eliminarTransaccion(id) {

    transacciones = transacciones.filter(
        t => t.id !== id
    );

    guardarTransaccion();

    render();

}

function eliminarTodo() {

    if (confirm("¿Desea eliminar todos los movimientos?")) {
        transacciones = [];

        guardarTransaccion();
        
        render();
    }

}

/**
 * Formatear valores números a dinero en formato Chile
 */
function formatoDinero(value) {

    return new Intl.NumberFormat("es-CL", {
        style: "currency",
        currency: "CLP"
    }).format(value);

}

/**
 * Inicializar el programa.
 */
render();