/// <reference types="cypress" />

describe('Página de Entradas', () => {
  const mockEntradas = [
    {
      ID_PRODUCTO: 1,
      producto: 'Paracetamol',
      presentacion_nombre: 'Tabletas',
      cantidad: 100,
      usuario: 'admin',
      fecha_hora_movimiento: '2023-05-15T10:30:00Z'
    },
    {
      ID_PRODUCTO: 2,
      producto: 'Amoxicilina',
      presentacion_nombre: 'Cápsulas',
      cantidad: 50,
      usuario: 'farmacia1',
      fecha_hora_movimiento: '2023-05-14T15:45:00Z'
    }
  ];

  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    cy.clearLocalStorage();

    // Configurar el estado inicial
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'token-valido');
        win.localStorage.setItem('user', JSON.stringify({
          rolId: 1,
          rol: "Administrador",
          nombre: "Admin",
          email: "admin@correo.com"
        }));
      },
      timeout: 10000 // Aumentar tiempo de espera para la carga inicial
    });

    // Mock de la API con retraso simulado
    cy.intercept('GET', '**/obtener/entradas', (req) => {
      req.reply({
        delay: 1000, // Simular retraso de red
        statusCode: 200,
        body: {
          success: true,
          data: mockEntradas
        }
      });
    }).as('getEntradas');

    // Visitar la página con manejo de errores
    cy.visit('/filtroEntradas', { timeout: 15000 })
      .then(() => {
        // Verificar que la carga se completó
        cy.get('body').should('not.contain', 'Cargando...');
      });
    
    // Esperar a la llamada API con timeout extendido
    cy.wait('@getEntradas', { timeout: 20000 });
  });

  it('Debe cargar la página correctamente', () => {
    // Verificación básica de que la página se cargó
    cy.url().should('include', '/filtroEntradas');
    cy.get('body').should('be.visible');
  });

  it('Debe mostrar la estructura básica de la página', () => {
    // Verificar elementos principales con retrys y timeouts extendidos
    cy.get('nav', { timeout: 10000 }).should('exist');
    cy.get('img[alt="Logo de la farmacia"]', { timeout: 10000 }).should('be.visible');
    
    // Verificar tabla y sus elementos
    cy.get('table.table-bordered', { timeout: 15000 }).should('exist').and('be.visible');
    cy.get('thead th', { timeout: 10000 }).should('have.length.at.least', 5);
  });

  it('Debe mostrar los datos de entradas correctamente', () => {
    // Primero verificar que la tabla existe y es visible
    cy.get('table.table-bordered', { timeout: 15000 })
      .should('exist')
      .find('tbody tr')
      .should('have.length', mockEntradas.length);

    // Función para verificar una fila de la tabla
    const verificarFila = (index, expectedData) => {
      cy.get('tbody tr').eq(index).within(() => {
        cy.get('td').eq(0).should('contain', expectedData.ID_PRODUCTO);
        cy.get('td').eq(1).should('contain', expectedData.producto);
        cy.get('td').eq(2).should('contain', expectedData.presentacion_nombre);
        cy.get('td').eq(3).should('contain', expectedData.cantidad);
        cy.get('td').eq(4).should('contain', expectedData.usuario);
        
        // Verificación más flexible para la fecha
        cy.get('td').eq(5).invoke('text').then((text) => {
          const fechaFormateada = formatearFechaParaTest(expectedData.fecha_hora_movimiento);
          expect(text.trim()).to.include(fechaFormateada);
        });
      });
    };

    // Verificar todas las filas
    mockEntradas.forEach((entrada, index) => {
      verificarFila(index, entrada);
    });
  });

  // ... (resto de las pruebas se mantienen igual)

  // Función auxiliar mejorada para formateo de fechas
  function formatearFechaParaTest(fechaISO) {
    try {
      const fecha = new Date(fechaISO);
      if (isNaN(fecha.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      const dia = String(fecha.getDate()).padStart(2, "0");
      const mes = String(fecha.getMonth() + 1).padStart(2, "0");
      const año = fecha.getFullYear();
      const horas = String(fecha.getHours()).padStart(2, "0");
      const minutos = String(fecha.getMinutes()).padStart(2, "0");
      
      return `${dia}/${mes}/${año} ${horas}:${minutos}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return 'Fecha inválida';
    }
  }
});