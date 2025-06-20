/// <reference types="cypress" />

describe('MedicaVencimiento Page', () => {
  const mockMedicamentos = [
    {
      ID_PRODUCTO: 1,
      nombre: 'Paracetamol',
      fecha_vencimiento: '2023-12-31T00:00:00.000Z'
    },
    {
      ID_PRODUCTO: 2,
      nombre: 'Ibuprofeno',
      fecha_vencimiento: '2023-11-15T00:00:00.000Z'
    },
    {
      ID_PRODUCTO: 3,
      nombre: 'Amoxicilina',
      fecha_vencimiento: '2022-10-01T00:00:00.000Z' // Caducado
    }
  ];

  beforeEach(() => {
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'token-falso-valido');
        win.localStorage.setItem('user', JSON.stringify({
          rolId: 1,
          rol: "Administrador",
          nombre: "Admin",
          email: "admin@correo.com"
        }));
      }
    });

    // Intercepta la llamada a la API de medicamentos próximos a vencer
    cy.intercept('GET', '**/caducidad/productos', {
      statusCode: 200,
      body: {
        expiringMedicines: mockMedicamentos
      }
    }).as('getMedicamentosVencimiento');

    cy.visit('/caducidad');
    cy.wait('@getMedicamentosVencimiento', { timeout: 10000 });
  });

  it('Debe mostrar la página correctamente con los elementos principales', () => {
    // Verificar elementos del encabezado
    cy.get('nav').should('exist');
    cy.get('img[alt="Logo de la farmacia"]').should('be.visible');
    cy.get('img[alt="Cerrar sesión"]').should('be.visible');
    
    // Verificar botón de atrás
    cy.get('button.fle_atras').should('exist');
    cy.get('img[alt="flecha_a"]').should('be.visible');
    
    // Verificar título de la tabla
    cy.contains('Dias Restantes').should('be.visible');
  });

  it('Debe mostrar la tabla de medicamentos con los datos correctos', () => {
    cy.get('table.table-bordered').should('exist');
    
    // Verificar encabezados de la tabla
    cy.get('thead th').contains('#').should('be.visible');
    cy.get('thead th').contains('Nombre').should('be.visible');
    cy.get('thead th').contains('Fecha de Vencimiento').should('be.visible');
    cy.get('thead th').contains('Dias Restantes').should('be.visible');
    
    // Verificar datos de los medicamentos
    cy.get('tbody tr').should('have.length', mockMedicamentos.length);
    
    // Verificar primer medicamento
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'Paracetamol');
      
      // Verificación flexible del formato de fecha (DD/MM/YYYY o MM/DD/YYYY)
      cy.get('td').eq(2).invoke('text').then((dateText) => {
        expect(dateText).to.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/);
      });
      
      // Verificación de días restantes (número o "Caducado")
      cy.get('td').eq(3).then(($el) => {
        const text = $el.text().trim();
        expect(text === 'Caducado' || !isNaN(parseInt(text))).to.be.true;
      });
    });
    
    // Verificar medicamento caducado
    cy.get('tbody tr').last().within(() => {
      cy.get('td').eq(0).should('contain', '3');
      cy.get('td').eq(1).should('contain', 'Amoxicilina');
      cy.get('td').eq(3).should('contain', 'Caducado');
    });
  });

  it('Debe navegar hacia atrás al hacer clic en el botón de atrás', () => {
    cy.get('button.fle_atras').click();
    cy.url().should('not.include', '/caducidad');
  });

  it('Debe cerrar sesión al hacer clic en el botón de salir', () => {
    cy.get('img[alt="Cerrar sesión"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('Debe manejar el error cuando falla la API', () => {
    // Interceptamos la llamada con un error
    cy.intercept('GET', '**/caducidad/productos', {
      statusCode: 500,
      body: { message: 'Error del servidor' }
    }).as('getMedicamentosError');
    
    // Recargamos la página para forzar el error
    cy.reload();
    cy.wait('@getMedicamentosError', { timeout: 10000 });
    
    // Verificamos que se muestre el mensaje de error
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'No se pudieron obtener los medicamentos próximos a vencer');
    cy.get('.swal2-confirm').click();
  });

  it('Debe mostrar mensaje cuando no hay medicamentos próximos a vencer', () => {
    // Interceptamos la llamada con un array vacío
    cy.intercept('GET', '**/caducidad/productos', {
      statusCode: 200,
      body: { expiringMedicines: [] }
    }).as('getMedicamentosVacios');
    
    // Recargamos la página
    cy.reload();
    cy.wait('@getMedicamentosVacios', { timeout: 10000 });
    
    // Verificamos que la tabla esté vacía (solo el encabezado)
    cy.get('tbody tr').should('have.length', 0);
  });
});