/// <reference types="cypress" />

describe('Página de Gestión de Usuarios', () => {
  beforeEach(() => {
    // Configurar el estado inicial con usuario administrador
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

    cy.visit('/gestion_usuario');
  });

  it('Debe mostrar la estructura básica de la página', () => {
    // Verificar elementos del encabezado
    cy.get('nav').should('exist');
    cy.get('img[alt="Logo de la farmacia"]').should('be.visible');
    cy.get('img[alt="Cerrar sesión"]').should('be.visible');
    
    // Verificar que el menú lateral está presente - CORRECCIÓN PRINCIPAL
    cy.get('.op').should('exist');
      cy.get(".op").find(".mlat").should("exist");
  });

  it('Debe mostrar los botones de gestión correctamente', () => {
    // Verificar contenedor principal
    cy.get('.mainContainer').should('exist');
    
    // Verificar botón de administradores
    cy.get('.botones').first().within(() => {
      cy.get('button').should('have.class', 'botones1');
      cy.get('img[alt="Gestionar perfil administrador"]').should('be.visible');
      cy.contains('p', 'Administrador').should('be.visible');
      
      // Verificar que el botón lleva a la ruta correcta
      cy.get('a').should('have.attr', 'href', '/user_crud');
    });
    
    // Verificar botón de empleados
    cy.get('.botones').eq(1).within(() => {
      cy.get('button').should('have.class', 'botones1');
      cy.get('img[alt="Gestionar perfiles de empleados"]').should('be.visible');
      cy.contains('p', 'Empleados').should('be.visible');
      
      // Verificar que el botón lleva a la ruta correcta
      cy.get('a').should('have.attr', 'href', '/empleado_crud');
    });
  });

  it('Debe permitir navegar a la gestión de administradores', () => {
    cy.get('.botones').first().find('a').click();
    cy.url().should('include', '/user_crud');
    cy.go('back');
  });

  it('Debe permitir navegar a la gestión de empleados', () => {
    cy.get('.botones').eq(1).find('a').click();
    cy.url().should('include', '/empleado_crud');
    cy.go('back');
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.get('img[alt="Cerrar sesión"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verificar que se eliminó el token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

  it('No debe permitir acceso sin autenticación', () => {
    // Visitar la página sin token
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.removeItem('token');
        win.localStorage.removeItem('user');
      }
    });
    
    cy.visit('/gestion_usuario');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('No debe permitir acceso a usuarios no administradores', () => {
    // Visitar la página como empleado
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'token-valido');
        win.localStorage.setItem('user', JSON.stringify({
          rolId: 2,
          rol: "Empleado",
          nombre: "Juan",
          email: "juan@correo.com"
        }));
      }
    });
    
    cy.visit('/gestion_usuario');
    
    // Verificar que redirige a la página de empleado
    cy.url().should('include', '/homeemple');
  });
});