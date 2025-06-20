/// <reference types="cypress" />

describe('Gestión de Empleados (Empleadocrud)', () => {
  beforeEach(() => {
    // Configurar el estado inicial con usuario administrador
    cy.visit('/', {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', 'token-valido-simulado');
        win.localStorage.setItem('user', JSON.stringify({
          rolId: 1,
          rol: "Administrador",
          nombre: "Admin",
          email: "admin@correo.com"
        }));
      }
    });

    // Mock de datos de empleados
    cy.intercept('GET', '/api/obtener/empleado', {
      statusCode: 200,
      body: [
        {
          ID_Usuario: "1",
          nombre: "Empleado1",
          apellido: "Apellido1",
          correo: "empleado1@correo.com",
          nombre_usuario: "emp1",
          contrasena_usuario: "123456",
          fecha_registro: "2025-03-22T05:00:00.000Z",
          ROLID_ROL: 2
        },
        {
          ID_Usuario: "2",
          nombre: "Empleado2",
          apellido: "Apellido2",
          correo: "empleado2@correo.com",
          nombre_usuario: "emp2",
          contrasena_usuario: "654321",
          fecha_registro: "2025-03-15T05:00:00.000Z",
          ROLID_ROL: 2
        }
      ]
    }).as('getEmpleados');

    // Mock para otras operaciones CRUD
    cy.intercept('POST', '/api/registrar/empleado', {
      statusCode: 200,
      body: { 
        message: 'Empleado creado exitosamente',
        data: {
          ID_Usuario: "3",
          nombre: "NuevoEmpleado",
          apellido: "NuevoApellido",
          correo: "nuevo@correo.com",
          nombre_usuario: "nuevoemp",
          ROLID_ROL: 2
        }
      }
    }).as('createEmpleado');

    cy.intercept('PUT', '/api/actualizar/empleado/*', {
      statusCode: 200,
      body: { message: 'Empleado actualizado exitosamente' }
    }).as('updateEmpleado');

    cy.intercept('DELETE', '/api/eliminar/empleado/*', {
      statusCode: 200,
      body: { message: 'Empleado eliminado exitosamente' }
    }).as('deleteEmpleado');

    cy.visit('/empleado_crud');
    cy.wait('@getEmpleados');
  });

it('Debe mostrar confirmación al eliminar un empleado', () => {
  cy.get('tbody tr').eq(1).find('.btn-danger').click();

  cy.get('.swal2-popup', { timeout: 15000 })
    .should('be.visible')
    .within(() => {
      // ✅ CORREGIDO: usar texto con mayúsculas o expresión regular
      cy.contains(/empleado2 apellido2/i, { timeout: 10000 }).should('be.visible');

      cy.get('.swal2-confirm')
        .should('be.visible')
        .click();
    });

  cy.wait('@deleteEmpleado');
  cy.contains(/empleado eliminado|éxito/i).should('be.visible');
});



  it('Debe permitir navegar hacia atrás', () => {
    cy.get('.fle_atras').click();
    cy.url().should('not.include', '/empleado_crud');
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.get('img[alt="Cerrar sesión"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verificar que se eliminó el token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

  it('Debe abrir el formulario para añadir nuevo empleado', () => {
    cy.get('button.btn-dark').contains('Añadir Empleado').click();
    cy.get('#modalEmpleado').should('be.visible');
    cy.get('#modalEmpleado .modal-header label').should('contain', 'Registrar nuevo Empleado');
  });
});