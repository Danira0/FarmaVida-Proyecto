/// <reference types="cypress" />

describe('Página de Salidas', () => {
  const mockSalidas = [
    {
      ID_STOCK: 1,
      producto: 'Paracetamol',
      presentacion_nombre: 'Tabletas',
      cantidad: 5,
      usuario: 'admin',
      iva_aplicado: 950,
      subtotal: 5000,
      total_venta: 5950,
      valor_unitario_movimiento: 1000,
      fecha_hora_movimiento: '2023-05-15T10:30:00Z'
    },
    {
      ID_STOCK: 2,
      producto: 'Amoxicilina',
      presentacion_nombre: 'Cápsulas',
      cantidad: 3,
      usuario: 'farmacia1',
      iva_aplicado: 570,
      subtotal: 3000,
      total_venta: 3570,
      valor_unitario_movimiento: 1000,
      fecha_hora_movimiento: '2023-05-14T15:45:00Z'
    }
  ];

  before(() => {
    cy.clearLocalStorage();
  });

  beforeEach(() => {
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
      timeout: 30000
    });

    cy.intercept('GET', '**/obtener/salidas', (req) => {
      req.reply({
        delay: 1000,
        statusCode: 200,
        body: { data: mockSalidas }
      });
    }).as('getSalidas');

    cy.visit('/filtroSalidas', { timeout: 30000 });
    cy.wait('@getSalidas', { timeout: 15000 }).its('response.statusCode').should('eq', 200);
  });

  it('Debe mostrar la estructura básica de la página', () => {
    cy.url().should('include', '/filtroSalidas');
    cy.get('nav').should('exist');
    cy.get('table.table-bordered').should('exist');
  });


  it('Debe manejar correctamente la navegación', () => {
    cy.get('button.fle_atras').click({ force: true });
    cy.url().should('not.include', '/filtroSalidas');
    cy.go('forward');
    cy.get('img[alt="Cerrar sesión"]').click({ force: true });
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('Debe mostrar un mensaje de error cuando falla la API', () => {
    cy.intercept('GET', '**/obtener/salidas', {
      statusCode: 500,
      body: { message: 'Error del servidor' }
    }).as('getSalidasError');
    
    cy.reload();
    cy.wait('@getSalidasError', { timeout: 15000 });
    cy.get('.alert-danger').should('be.visible');
  });

  it('Debe mostrar un mensaje cuando no hay salidas', () => {
    cy.intercept('GET', '**/obtener/salidas', {
      statusCode: 200,
      body: { data: [] }
    }).as('getSalidasVacio');
    
    cy.reload();
    cy.wait('@getSalidasVacio', { timeout: 15000 });
    cy.get('.alert-info').should('contain', 'No hay registros de salidas disponibles');
  });

  // Función auxiliar para formatear fechas
  const formatearFechaParaTest = (fechaISO) => {
    if (!fechaISO) return '';
    const fecha = new Date(fechaISO);
    return `${String(fecha.getDate()).padStart(2, "0")}/${String(fecha.getMonth() + 1).padStart(2, "0")}/${fecha.getFullYear()} ${String(fecha.getHours()).padStart(2, "0")}:${String(fecha.getMinutes()).padStart(2, "0")}`;
  };
});