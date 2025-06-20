/// <reference types="cypress" />

describe('Gestión de Administradores (Admicrud)', () => {
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

    // Mock de todas las rutas API necesarias
    cy.intercept('GET', '/api/obtener/administrador', {
      statusCode: 200,
      body: [
        {
          ID_Usuario: "1",
          nombre: "Admin",
          apellido: "Principal",
          correo: "admin@correo.com",
          nombre_usuario: "admin",
          contrasena_usuario: "123456",
          fecha_registro: "2025-03-22T05:00:00.000Z",
          ROLID_ROL: 1
        },
        {
          ID_Usuario: "2",
          nombre: "Juan",
          apellido: "Perez",
          correo: "juan@correo.com",
          nombre_usuario: "juanp",
          contrasena_usuario: "654321",
          fecha_registro: "2025-03-15T05:00:00.000Z",
          ROLID_ROL: 1
        }
      ]
    }).as('getAdmins');

    // Mock para creación de administrador
    cy.intercept('POST', '/api/registrar/administrador', {
      statusCode: 200,
      body: { 
        message: 'Administrador creado exitosamente',
        data: {
          ID_Usuario: "3",
          nombre: "Nuevo",
          apellido: "Administrador",
          correo: "nuevo@correo.com",
          nombre_usuario: "nuevoadmin",
          ROLID_ROL: 1
        }
      }
    }).as('createAdmin');

    // Mock para eliminación
    cy.intercept('DELETE', '/api/eliminar/administrador/*', {
      statusCode: 200,
      body: { message: 'Administrador eliminado exitosamente' }
    }).as('deleteAdmin');

    cy.visit('/user_crud');
    cy.wait('@getAdmins');
  });

  it('Debe mostrar correctamente la lista de administradores', () => {
    cy.get('tbody tr').should('have.length', 2);
    
    // Verificar la primera fila con búsqueda dinámica de la fecha
    cy.get('tbody tr').first().within(() => {
      cy.get('td').should('have.length.at.least', 6);
      
      // Verificar campos conocidos para confirmar la fila correcta
      cy.get('td').eq(1).should('contain', 'Admin');
      cy.get('td').eq(2).should('contain', 'Principal');
      
      // Buscar la celda que contiene la fecha
      cy.get('td').each(($cell) => {
        const text = $cell.text().trim();
        if (text.match(/\d{2}\/\d{2}\/\d{4}/)) { // Busca formato de fecha
          expect(text).to.equal('22/03/2025');
        }
      });
    });
  });

  it('Debe permitir crear un nuevo administrador', () => {
    cy.contains('button', 'Añadir Administrador').click();
    
    cy.get('#nombre').clear().type('Nuevo');
    cy.get('#nombre').should('have.value', 'Nuevo');
    
    cy.get('#apellido').type('Administrador');
    cy.get('#correo').type('nuevo@correo.com');
    cy.get('#nombre_usuario').type('nuevoadmin');
    cy.get('#contrasena_usuario').type('password123');
    cy.get('#ROLID_ROL').select('1');
    
    cy.contains('button', 'Guardar').click();
    
    cy.wait('@createAdmin').then((interception) => {
      expect(interception.request.body.nombre).to.equal('Nuevo');
      expect(interception.response.body.data.nombre).to.equal('Nuevo');
    });
    
    cy.contains('Éxito').should('be.visible');
  });

  it('Debe mostrar confirmación al eliminar un administrador', () => {
    // Verificar que hay al menos 2 filas
    cy.get('tbody tr').should('have.length.at.least', 2);
    
    // Hacer clic en el segundo botón de eliminar
    cy.get('tbody tr').eq(1).find('.btn-danger').click();
    
    // Verificar diálogo de confirmación
    cy.contains('¿Estás seguro de eliminar a Juan?').should('be.visible');
    
    // Confirmar eliminación
    cy.contains('Sí, eliminar').click();
    
    cy.wait('@deleteAdmin');
    cy.contains('Eliminado').should('be.visible');
  });

  it('Debe permitir navegar hacia atrás', () => {
    cy.get('.fle_atras').click();
    cy.url().should('not.include', '/user_crud');
  });

  it('Debe cerrar sesión correctamente', () => {
    cy.get('img[alt="Cerrar sesión"]').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verificar que se eliminó el token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });
});