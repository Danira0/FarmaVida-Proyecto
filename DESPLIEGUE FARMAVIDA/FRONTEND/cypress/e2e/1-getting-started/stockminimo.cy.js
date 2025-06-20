/// <reference types="cypress" />

describe('Página de Stock Mínimo', () => {
  const mockProductos = [
    {
      ID_PRODUCTO: 1,
      nombre: 'Paracetamol',
      PresentacionID_Presentacion: 2,
      stock_minimo: 100,
      stock_actual: 50
    },
    {
      ID_PRODUCTO: 2,
      nombre: 'Amoxicilina',
      PresentacionID_Presentacion: 1,
      stock_minimo: 80,
      stock_actual: 30
    },
    {
      ID_PRODUCTO: 3,
      nombre: 'Jarabe para la tos',
      PresentacionID_Presentacion: 3,
      stock_minimo: 50,
      stock_actual: 60
    }
  ];

  beforeEach(() => {
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
      }
    });

    // Mock de la API
    cy.intercept('GET', '**/verificar/stock', {
      statusCode: 200,
      body: {
        productosBajoStock: mockProductos
      }
    }).as('getStockMinimo');

    cy.visit('/stockMinimo');
    cy.wait('@getStockMinimo', { timeout: 10000 });
  });

  it('Debe mostrar la estructura básica de la página', () => {
    // Verificar elementos del encabezado
    cy.get('nav').should('exist');
    cy.get('img[alt="Logo de la farmacia"]').should('be.visible');
    cy.get('img[alt="Cerrar sesión"]').should('be.visible');
    
    // Verificar botón de atrás
    cy.get('button.fle_atras').should('exist');
    cy.get('img[alt="flecha_a"]').should('be.visible');
    
    // Verificar título de la tabla
    cy.get('thead th').contains('ID').should('be.visible');
    cy.get('thead th').contains('Producto (Presentación)').should('be.visible');
    cy.get('thead th').contains('Stock Mínimo').should('be.visible');
    cy.get('thead th').contains('Stock Actual').should('be.visible');
    cy.get('thead th').contains('Faltante').should('be.visible');
  });

  it('Debe mostrar los productos con stock mínimo correctamente', () => {
    cy.get('table.table-bordered').should('exist');
    cy.get('tbody tr').should('have.length', mockProductos.length);
    
    // Verificar primer producto (Tabletas)
    cy.get('tbody tr').first().within(() => {
      cy.get('td').eq(0).should('contain', '1');
      cy.get('td').eq(1).should('contain', 'Paracetamol (Tabletas)');
      cy.get('td').eq(2).should('contain', '100 unidades');
      cy.get('td').eq(3).should('contain', '50 unidades');
      cy.get('td').eq(4).should('contain', '50 unidades');
      
      // Verificar que el stock actual está en negrita por estar bajo mínimo
      cy.get('td').eq(3).should('have.css', 'font-weight', '700');
    });
    
    // Verificar segundo producto (Cápsulas)
    cy.get('tbody tr').eq(1).within(() => {
      cy.get('td').eq(0).should('contain', '2');
      cy.get('td').eq(1).should('contain', 'Amoxicilina (Cápsulas)');
      cy.get('td').eq(2).should('contain', '80 unidades');
      cy.get('td').eq(3).should('contain', '30 unidades');
      cy.get('td').eq(4).should('contain', '50 unidades');
    });
    
    // Verificar tercer producto (Jarabe - no está bajo mínimo)
    cy.get('tbody tr').last().within(() => {
      cy.get('td').eq(0).should('contain', '3');
      cy.get('td').eq(1).should('contain', 'Jarabe para la tos (Jarabe)');
      cy.get('td').eq(2).should('contain', '50 frascos');
      cy.get('td').eq(3).should('contain', '60 frascos');
      cy.get('td').eq(4).should('contain', '0 frascos');
      
      // Verificar que el stock actual NO está en negrita
      cy.get('td').eq(3).should('not.have.css', 'font-weight', '700');
    });
  });

  it('Debe manejar correctamente la navegación', () => {
    // Prueba del botón de atrás
    cy.get('button.fle_atras').click();
    cy.url().should('not.include', '/stock-minimo');
    
    // Volver a la página para continuar con otras pruebas
    cy.go('forward');
    
    // Prueba del botón de cerrar sesión
    cy.get('img[alt="Cerrar sesión"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('Debe mostrar un mensaje de error cuando falla la API', () => {
    // Interceptamos la llamada con un error
    cy.intercept('GET', '**/verificar/stock', {
      statusCode: 500,
      body: { message: 'Error del servidor' }
    }).as('getStockError');
    
    // Recargamos la página para forzar el error
    cy.reload();
    cy.wait('@getStockError', { timeout: 10000 });
    
    // Verificamos que se muestre el mensaje de error
    cy.get('.swal2-popup').should('be.visible');
    cy.get('.swal2-title').should('contain', 'Error');
    cy.get('.swal2-html-container').should('contain', 'No se pudieron obtener los productos con stock mínimo');
    cy.get('.swal2-confirm').click();
  });

  it('Debe mostrar la tabla vacía cuando no hay productos con stock mínimo', () => {
    // Interceptamos la llamada con un array vacío
    cy.intercept('GET', '**/verificar/stock', {
      statusCode: 200,
      body: { productosBajoStock: [] }
    }).as('getStockVacio');
    
    // Recargamos la página
    cy.reload();
    cy.wait('@getStockVacio', { timeout: 10000 });
    
    // Verificamos que la tabla esté vacía (solo el encabezado)
    cy.get('tbody tr').should('have.length', 0);
  });

  it('Debe mostrar correctamente las diferentes presentaciones y unidades de medida', () => {
    // Verificar presentación de cápsulas
    cy.get('tbody tr').eq(1).within(() => {
      cy.get('td').eq(1).should('contain', 'Cápsulas');
      cy.get('td').eq(2).should('contain', 'unidades');
    });
    
    // Verificar presentación de jarabe
    cy.get('tbody tr').last().within(() => {
      cy.get('td').eq(1).should('contain', 'Jarabe');
      cy.get('td').eq(2).should('contain', 'frascos');
    });
  });
});